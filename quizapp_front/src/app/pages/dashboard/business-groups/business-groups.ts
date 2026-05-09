import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth/auth.service';
import { FilterCheckboxComponent } from '../../../shared/filter-checkbox/filter-checkbox';
import { PERMISSION_CATEGORIES } from '../../../core/constants/permissions.constants';
import { SpringBootRequest, SpringBootResponse } from '../../../core/models/spring-boot.interfaces';
import { GroupChangeRequestService, GroupChangeRequest } from '../../../core/services/group-change-request.service';

interface BusinessGroupItem {
  id?: number;
  groupName?: string;
  groupDesc?: string;
  createdAt?: string;
  userCount?: number;
  permissionCount?: number;
}

interface GroupPermission {
  id?: number;
  businessGroupId?: number;
  functionality?: string;
}

interface GroupUser {
  id?: number;
  userId?: number;
  businessGroupId?: number;
  userFirstName?: string;
  userLastName?: string;
  userEmail?: string;
  isModerator?: boolean;
}

type ViewMode = 'list' | 'edit';
type EditTab = 'info' | 'permissions' | 'members' | 'requests';

@Component({
  selector: 'app-business-groups',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterCheckboxComponent],
  templateUrl: './business-groups.html',
  styleUrls: ['./business-groups.scss']
})
export class BusinessGroupsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  viewMode = signal<ViewMode>('list');
  isLoading = signal(false);
  saving = signal(false);
  categories = PERMISSION_CATEGORIES;

  // Liste
  groups = signal<BusinessGroupItem[]>([]);

  // Édition
  editTab = signal<EditTab>('info');
  editingGroup = signal<Partial<BusinessGroupItem>>({});
  isNew = signal(false);

  // Permissions du groupe en cours d'édition
  groupPermissions = signal<Set<string>>(new Set());

  // Membres du groupe en cours d'édition
  groupMembers = signal<GroupUser[]>([]);
  newMemberUserId = signal('');

  // Demandes de changement de groupe
  pendingRequests = signal<GroupChangeRequest[]>([]);
  requestsLoading = signal(false);
  processingRequestId = signal<number | null>(null);

  constructor(private http: HttpClient, private authService: AuthService, private groupChangeRequestService: GroupChangeRequestService) {}

  ngOnInit(): void {
    this.loadGroups();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─── Liste ─────────────────────────────────

  loadGroups(): void {
    this.isLoading.set(true);
    const userId = parseInt(this.authService.getCurrentUserId());
    const request: SpringBootRequest<any> = { data: {}, user: userId };

    this.http.post<SpringBootResponse<BusinessGroupItem>>(
      '/businessGroup/getByCriteria', request
    ).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        this.groups.set(res.items || []);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  createGroup(): void {
    this.editingGroup.set({});
    this.groupPermissions.set(new Set());
    this.groupMembers.set([]);
    this.isNew.set(true);
    this.editTab.set('info');
    this.viewMode.set('edit');
  }

  editGroup(group: BusinessGroupItem): void {
    this.editingGroup.set({ ...group });
    this.isNew.set(false);
    this.editTab.set('info');
    this.viewMode.set('edit');
    this.loadGroupPermissions(group.id!);
    this.loadGroupMembers(group.id!);
    this.loadGroupRequests(group.id!);
  }

  deleteGroup(group: BusinessGroupItem): void {
    if (!confirm(`Supprimer le groupe "${group.groupName}" ?`)) return;

    const userId = parseInt(this.authService.getCurrentUserId());
    const request: SpringBootRequest<any> = {
      data: [{ id: group.id }],
      user: userId
    };

    this.http.post<SpringBootResponse<any>>(
      '/businessGroup/delete', request
    ).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        if (!res.hasError) this.loadGroups();
      }
    });
  }

  backToList(): void {
    this.viewMode.set('list');
    this.loadGroups();
  }

  // ─── Édition Info ──────────────────────────

  saveGroup(): void {
    this.saving.set(true);
    const userId = parseInt(this.authService.getCurrentUserId());
    const data = this.editingGroup();
    const endpoint = this.isNew() ? '/businessGroup/create' : '/businessGroup/update';
    const request: SpringBootRequest<any> = {
      data: [data],
      user: userId
    };

    this.http.post<SpringBootResponse<BusinessGroupItem>>(
      endpoint, request
    ).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        if (!res.hasError && res.items && res.items.length > 0) {
          const saved = res.items[0];
          this.editingGroup.set(saved);
          if (this.isNew()) {
            this.isNew.set(false);
          }
        }
        this.saving.set(false);
      },
      error: () => this.saving.set(false)
    });
  }

  // ─── Permissions du groupe ─────────────────

  loadGroupPermissions(groupId: number): void {
    const userId = parseInt(this.authService.getCurrentUserId());
    const request: SpringBootRequest<any> = {
      data: { businessGroupId: groupId },
      user: userId
    };

    this.http.post<SpringBootResponse<GroupPermission>>(
      '/businessGroup/getPermissions', request
    ).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        if (!res.hasError && res.items) {
          this.groupPermissions.set(new Set(res.items.map(p => p.functionality || '').filter(f => f)));
        }
      }
    });
  }

  isPermChecked(functionality: string): boolean {
    return this.groupPermissions().has(functionality);
  }

  toggleGroupPermission(functionality: string): void {
    const groupId = this.editingGroup().id;
    if (!groupId) return;

    this.saving.set(true);
    const userId = parseInt(this.authService.getCurrentUserId());
    const current = new Set(this.groupPermissions());
    const action = current.has(functionality) ? 'removePermission' : 'addPermission';

    const request: SpringBootRequest<any> = {
      data: { businessGroupId: groupId, functionality },
      user: userId
    };

    this.http.post<SpringBootResponse<any>>(
      `/businessGroup/${action}`, request
    ).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        if (!res.hasError) {
          if (action === 'addPermission') {
            current.add(functionality);
          } else {
            current.delete(functionality);
          }
          this.groupPermissions.set(new Set(current));
        }
        this.saving.set(false);
      },
      error: () => this.saving.set(false)
    });
  }

  // ─── Membres du groupe ─────────────────────

  loadGroupMembers(groupId: number): void {
    const userId = parseInt(this.authService.getCurrentUserId());
    const request: SpringBootRequest<any> = {
      data: { businessGroupId: groupId },
      user: userId
    };

    this.http.post<SpringBootResponse<GroupUser>>(
      '/businessGroup/getUsersInGroup', request
    ).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        this.groupMembers.set(res.items || []);
      }
    });
  }

  addMember(): void {
    const memberId = parseInt(this.newMemberUserId());
    const groupId = this.editingGroup().id;
    if (!memberId || !groupId) return;

    const userId = parseInt(this.authService.getCurrentUserId());
    const request: SpringBootRequest<any> = {
      data: { userId: memberId, businessGroupId: groupId },
      user: userId
    };

    this.http.post<SpringBootResponse<any>>(
      '/businessGroup/assignUser', request
    ).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        if (!res.hasError) {
          this.newMemberUserId.set('');
          this.loadGroupMembers(groupId);
        }
      }
    });
  }

  removeMember(member: GroupUser): void {
    const groupId = this.editingGroup().id;
    if (!groupId || !member.userId) return;

    const userId = parseInt(this.authService.getCurrentUserId());
    const request: SpringBootRequest<any> = {
      data: { userId: member.userId, businessGroupId: groupId },
      user: userId
    };

    this.http.post<SpringBootResponse<any>>(
      '/businessGroup/removeUser', request
    ).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        if (!res.hasError) this.loadGroupMembers(groupId);
      }
    });
  }

  // ─── Demandes de changement ────────────────

  loadGroupRequests(groupId: number): void {
    this.requestsLoading.set(true);
    this.groupChangeRequestService.getAllByCriteria({
      targetGroupId: groupId,
      status: 'PENDING',
      isDeleted: false,
      size: 100
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        this.pendingRequests.set(res.content);
        this.requestsLoading.set(false);
      },
      error: () => {
        this.pendingRequests.set([]);
        this.requestsLoading.set(false);
      }
    });
  }

  approveRequest(req: GroupChangeRequest): void {
    if (!req.id) return;
    this.processingRequestId.set(req.id);
    this.groupChangeRequestService.approve(req.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.processingRequestId.set(null);
        const groupId = this.editingGroup().id;
        if (groupId) {
          this.loadGroupRequests(groupId);
          this.loadGroupMembers(groupId);
        }
      },
      error: () => this.processingRequestId.set(null)
    });
  }

  rejectRequest(req: GroupChangeRequest): void {
    if (!req.id) return;
    this.processingRequestId.set(req.id);
    this.groupChangeRequestService.reject(req.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.processingRequestId.set(null);
        const groupId = this.editingGroup().id;
        if (groupId) this.loadGroupRequests(groupId);
      },
      error: () => this.processingRequestId.set(null)
    });
  }
}
