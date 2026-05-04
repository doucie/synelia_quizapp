import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';
import { PermissionService } from '../services/permission.service';
import { CampaignService } from '../services/campaign.service';
import { EntityPermissionService } from '../services/entity-permission.service';

const CAMPAIGN_GLOBAL_VIEW_PERMISSIONS = ['VIEW_CAMPAIGNS', 'UPDATE_CAMPAIGNS', 'DELETE_CAMPAIGNS'];
const CAMPAIGN_ENTITY_ACCESS_KEYS = new Set(['ADMIN', 'CREATOR', 'UPDATE', 'DELETE', 'EVALUATE', 'PLANIFY', 'ADVANCE_PIPELINE', 'FOLLOW']);

function redirectToAccessDenied(router: Router, message: string): false {
  router.navigate(['/dashboard'], {
    queryParams: {
      error: 'access_denied',
      message
    }
  });
  return false;
}

function redirectToCampaign(router: Router, campaignId: number, message: string): false {
  router.navigate(['/dashboard/campaigns', campaignId], {
    queryParams: {
      error: 'access_denied',
      message
    }
  });
  return false;
}

function getCampaignId(route: ActivatedRouteSnapshot): number | null {
  const rawId = route.paramMap.get('id');
  if (!rawId) {
    return null;
  }

  const campaignId = Number(rawId);
  return Number.isInteger(campaignId) && campaignId > 0 ? campaignId : null;
}

function getQueryCampaignId(route: ActivatedRouteSnapshot): number | null {
  const rawId = route.queryParamMap.get('campaignId');
  if (!rawId) {
    return null;
  }

  const campaignId = Number(rawId);
  return Number.isInteger(campaignId) && campaignId > 0 ? campaignId : null;
}

/**
 * Factory : crée un guard qui vérifie si l'utilisateur a AU MOINS UNE
 * des permissions listées.  SUPER_ADMIN → bypass complet.
 */
export function permissionGuard(requiredPermissions: string[]): CanActivateFn {
  return async (_route, _state) => {
    const authService = inject(AuthService);
    const router      = inject(Router);
    const permService = inject(PermissionService);

    if (!authService.isAuthenticated() || !authService.getCurrentUser()) {
      router.navigate(['/connexion']);
      return false;
    }

    // Attendre que les permissions soient chargées (résout immédiatement si déjà prêtes)
    await permService.waitUntilLoaded();

    if (permService.hasAnyPermission(requiredPermissions)) {
      return true;
    }

    router.navigate(['/dashboard'], {
      queryParams: {
        error: 'access_denied',
        message: 'Vous n\'avez pas les permissions nécessaires pour accéder à cette page.'
      }
    });
    return false;
  };
}

export const campaignViewGuard: CanActivateFn = async (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const permService = inject(PermissionService);
  const entityPermissionService = inject(EntityPermissionService);

  const currentUser = authService.getCurrentUser();
  if (!authService.isAuthenticated() || !currentUser) {
    router.navigate(['/connexion']);
    return false;
  }

  await permService.waitUntilLoaded();

  if (permService.hasAnyPermission(CAMPAIGN_GLOBAL_VIEW_PERMISSIONS)) {
    return true;
  }

  const campaignId = getCampaignId(route);
  const currentUserId = Number(currentUser.id);
  if (!campaignId || !Number.isInteger(currentUserId) || currentUserId <= 0) {
    return redirectToAccessDenied(router, 'Impossible de verifier l\'acces a cette campagne.');
  }

  try {
    const response = await firstValueFrom(entityPermissionService.getForEntity('CAMPAIGN', campaignId));
    const hasEntityAccess = (response.items || []).some(permission =>
      permission.userId === currentUserId
      && permission.granted
      && CAMPAIGN_ENTITY_ACCESS_KEYS.has((permission.permissionKey || '').toUpperCase())
    );

    if (hasEntityAccess) {
      return true;
    }
  } catch {
    return redirectToAccessDenied(router, 'Impossible de verifier l\'acces a cette campagne.');
  }

  return redirectToAccessDenied(router, 'Vous n\'avez pas les droits necessaires pour acceder a cette campagne.');
};

export const campaignEditGuard: CanActivateFn = async (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const permService = inject(PermissionService);
  const campaignService = inject(CampaignService);

  const currentUser = authService.getCurrentUser();
  if (!authService.isAuthenticated() || !currentUser) {
    router.navigate(['/connexion']);
    return false;
  }

  const campaignId = getCampaignId(route);
  if (!campaignId) {
    return redirectToAccessDenied(router, 'Impossible de verifier l\'edition de cette campagne.');
  }

  await permService.waitUntilLoaded();

  if (permService.hasPermission('UPDATE_CAMPAIGNS') && currentUser.adminMode) {
    return true;
  }

  try {
    const result = await firstValueFrom(campaignService.checkEditPermission(campaignId));

    if (result.status === 'CAN_EDIT') {
      return true;
    }

    if (result.status === 'REQUIRES_ADMIN_MODE') {
      return redirectToCampaign(router, campaignId, 'Activez le mode administrateur depuis la campagne pour acceder a l\'edition.');
    }
  } catch {
    return redirectToCampaign(router, campaignId, 'Impossible de verifier l\'edition de cette campagne.');
  }

  return redirectToCampaign(router, campaignId, 'Vous n\'avez pas les droits necessaires pour modifier cette campagne.');
};

export const interviewCreateGuard: CanActivateFn = async (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const permService = inject(PermissionService);
  const campaignService = inject(CampaignService);

  const currentUser = authService.getCurrentUser();
  if (!authService.isAuthenticated() || !currentUser) {
    router.navigate(['/connexion']);
    return false;
  }

  await permService.waitUntilLoaded();

  if (permService.hasAnyPermission(['CREATE_INTERVIEWS', 'UPDATE_INTERVIEWS'])) {
    return true;
  }

  const currentUserId = Number(currentUser.id);
  if (!Number.isInteger(currentUserId) || currentUserId <= 0) {
    return redirectToAccessDenied(router, 'Impossible de verifier vos droits de planification.');
  }

  const routeCampaignId = getQueryCampaignId(route);

  try {
    const accesses = await firstValueFrom(campaignService.getCampaignAccessesByUser(currentUserId));
    const hasPlanifyAccess = accesses.some((access: any) => {
      const campaignId = Number(access.campaignId || access.campaigns_id || 0);
      if (routeCampaignId && campaignId !== routeCampaignId) {
        return false;
      }

      return Boolean(access.canPlanify || access.isAdmin);
    });

    if (hasPlanifyAccess) {
      return true;
    }
  } catch {
    return redirectToAccessDenied(router, 'Impossible de verifier vos droits de planification.');
  }

  return redirectToAccessDenied(router, 'Vous n\'avez pas les droits necessaires pour planifier un entretien.');
};

/**
 * Guard générique par données de route : route.data['roles']
 */
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getCurrentUser();
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated || !user) {
    router.navigate(['/connexion']);
    return false;
  }

  const requiredRoles: string[] = route.data?.['roles'] || [];
  if (requiredRoles.length === 0) return true;

  if (requiredRoles.includes(user.role)) {
    return true;
  }

  router.navigate(['/dashboard'], {
    queryParams: {
      error: 'access_denied',
      message: 'Vous n\'avez pas les permissions nécessaires pour accéder à cette page.'
    }
  });
  return false;
};
