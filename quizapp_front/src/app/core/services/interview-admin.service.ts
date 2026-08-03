import { Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { EntityPermission } from '../models/permission.interfaces';
import { Application } from './application.service';
import { Campaign } from './campaign.service';
import { CandidateInterviewEntity } from './candidate-interview-entity.service';
import { EntityPermissionService } from './entity-permission.service';
import { Interview } from './interview.service';
import { InterviewParticipant } from './interview-participant.service';
import { User, UserService } from './user.service';

export interface InterviewEvaluatorOption {
  id: number;
  userId: number;
  prenom?: string;
  nom?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: string;
  userRole?: string;
  isOnline: boolean;
  canEvaluate: boolean;
}

export interface CampaignEvaluatorCatalog {
  campaignPermissions: EntityPermission[];
  evaluators: InterviewEvaluatorOption[];
  preselectedEvaluatorIds: number[];
}

export interface InterviewEditEvaluatorCatalog {
  campaignPermissions: EntityPermission[];
  evaluators: InterviewEvaluatorOption[];
  selectedEvaluatorIds: number[];
}

export type CandidateResponseState = 'RESCHEDULE_REQUESTED' | 'DECLINED' | null;

export interface CandidateResponsePresentation {
  label: string;
  className: string;
  icon: string;
  editActionLabel: string;
}

const DEFAULT_CANDIDATE_RESPONSE_PRESENTATION: CandidateResponsePresentation = {
  label: 'Aucune réponse',
  className: '',
  icon: 'bi-chat-left-text',
  editActionLabel: 'Modifier le créneau'
};

const CANDIDATE_RESPONSE_PRESENTATIONS: Record<Exclude<CandidateResponseState, null>, CandidateResponsePresentation> = {
  RESCHEDULE_REQUESTED: {
    label: 'Le candidat demande une autre date',
    className: 'candidate-response-card--warning',
    icon: 'bi-arrow-repeat',
    editActionLabel: 'Replanifier et renvoyer la convocation'
  },
  DECLINED: {
    label: 'Le candidat a refusé ce créneau',
    className: 'candidate-response-card--error',
    icon: 'bi-x-octagon',
    editActionLabel: 'Modifier le créneau'
  }
};

export interface InterviewWithDetails extends Interview {
  candidateName?: string;
  candidateEmail?: string;
  campaignTitle?: string;
  applicationId?: number;
  candidateFirstName?: string;
  candidateLastName?: string;
  quizScorePercent?: number;
  candidateInterviewId?: number;
  declineReason?: string | null;
  alternativeDateRequested?: string | null;
  candidateResponseState?: CandidateResponseState;
}

export interface InterviewEvaluationEvaluator extends InterviewEvaluatorOption {
  hasEvaluated: boolean;
  hasFinished: boolean;
  isAdmin: boolean;
  isCreator: boolean;
}

export interface InterviewEvaluationRoster {
  evaluators: InterviewEvaluationEvaluator[];
  currentUserParticipantId: number | null;
  canCurrentUserEvaluate: boolean;
}

type CampaignAccessLike = {
  userId?: number;
  isAdmin?: boolean | number;
  isCreator?: boolean | number;
};

type PermissionItemsResponse = {
  items?: EntityPermission[];
};

@Injectable({ providedIn: 'root' })
export class InterviewAdminService {
  constructor(
    private entityPermissionService: EntityPermissionService,
    private userService: UserService
  ) {}

  getCampaignEvaluatorCatalog(campaignId: number): Observable<CampaignEvaluatorCatalog> {
    return this.entityPermissionService.getForEntity('CAMPAIGN', campaignId).pipe(
      switchMap(response => {
        const grantedPermissions = (response.items || []).filter(permission => permission.granted);
        const preselectedEvaluatorIds = this.extractGrantedPermissionUserIds(grantedPermissions, 'EVALUATE');

        return this.resolveEvaluators(
          this.extractUserIds(grantedPermissions),
          new Set(preselectedEvaluatorIds)
        ).pipe(
          map(evaluators => ({
            campaignPermissions: grantedPermissions,
            evaluators,
            preselectedEvaluatorIds
          }))
        );
      })
    );
  }

  getInterviewNotificationEvaluators(interviewId: number): Observable<InterviewEvaluatorOption[]> {
    return this.entityPermissionService.getForEntity('INTERVIEW', interviewId).pipe(
      switchMap(response => {
        const grantedPermissions = (response.items || []).filter(permission => permission.granted);
        const evaluatorIds = this.extractGrantedPermissionUserIds(grantedPermissions, 'VIEW_EVALUATIONS');
        return this.resolveEvaluators(evaluatorIds, new Set(evaluatorIds));
      })
    );
  }

  getInterviewEditEvaluatorCatalog(interviewId: number, campaignId?: number): Observable<InterviewEditEvaluatorCatalog> {
    const campaignPermissions$: Observable<PermissionItemsResponse> = campaignId
      ? this.entityPermissionService.getForEntity('CAMPAIGN', campaignId)
      : of({ items: [] });

    return forkJoin({
      interviewPermissions: this.entityPermissionService.getForEntity('INTERVIEW', interviewId),
      campaignPermissions: campaignPermissions$
    }).pipe(
      switchMap(({ interviewPermissions, campaignPermissions }) => {
        const grantedInterviewPermissions = (interviewPermissions.items || []).filter(permission => permission.granted);
        const grantedCampaignPermissions = (campaignPermissions.items || []).filter(permission => permission.granted);
        const selectedEvaluatorIds = this.extractGrantedPermissionUserIds(grantedInterviewPermissions, 'VIEW_EVALUATIONS');
        const campaignEvaluatorIds = this.extractGrantedPermissionUserIds(grantedCampaignPermissions, 'EVALUATE');
        const userIds = [...new Set([...selectedEvaluatorIds, ...campaignEvaluatorIds])];

        return this.resolveEvaluators(userIds, new Set(campaignEvaluatorIds)).pipe(
          map(evaluators => ({
            campaignPermissions: grantedCampaignPermissions,
            selectedEvaluatorIds,
            evaluators: this.sortEvaluators(
              evaluators,
              new Set(selectedEvaluatorIds),
              new Set(campaignEvaluatorIds)
            )
          }))
        );
      })
    );
  }

  hasCandidateResponse(candidateResponseState: CandidateResponseState | undefined): boolean {
    return Boolean(candidateResponseState);
  }

  getCandidateResponsePresentation(
    candidateResponseState: CandidateResponseState | undefined
  ): CandidateResponsePresentation {
    if (!candidateResponseState) {
      return DEFAULT_CANDIDATE_RESPONSE_PRESENTATION;
    }

    return CANDIDATE_RESPONSE_PRESENTATIONS[candidateResponseState];
  }

  getCandidateResponseEditActionLabel(candidateResponseState: CandidateResponseState | undefined): string {
    return this.getCandidateResponsePresentation(candidateResponseState).editActionLabel;
  }

  buildInterviewDetails(
    interviews: Interview[],
    applications: Application[],
    campaigns: Campaign[],
    candidateInterviews: CandidateInterviewEntity[]
  ): InterviewWithDetails[] {
    const applicationMap = new Map(
      applications
        .filter((application): application is Application & { id: number } => typeof application.id === 'number')
        .map(application => [application.id, application])
    );
    const campaignMap = new Map(
      campaigns
        .filter((campaign): campaign is Campaign & { id: number } => typeof campaign.id === 'number')
        .map(campaign => [campaign.id, campaign])
    );

    return interviews.map(interview => {
      const application = typeof interview.applicationId === 'number'
        ? applicationMap.get(interview.applicationId)
        : undefined;
      const campaign = typeof interview.campaignId === 'number'
        ? campaignMap.get(interview.campaignId)
        : undefined;
      const candidateInterview = this.findCandidateInterview(interview, candidateInterviews);

      return {
        ...interview,
        candidateName: application
          ? `${application.candidateFirstName || ''} ${application.candidateLastName || ''}`.trim()
          : 'Candidat inconnu',
        candidateEmail: application?.candidateEmail,
        campaignTitle: campaign?.campaignTitle || campaign?.campaignName,
        applicationId: application?.id,
        candidateFirstName: application?.candidateFirstName,
        candidateLastName: application?.candidateLastName,
        quizScorePercent: application?.aggregatedQuizScorePercent,
        candidateInterviewId: candidateInterview?.id,
        declineReason: candidateInterview?.declineReason || null,
        alternativeDateRequested: candidateInterview?.alternativeDateRequested || null,
        candidateResponseState: this.resolveCandidateResponseState(candidateInterview)
      };
    });
  }

  buildEvaluationRoster(
    permissions: EntityPermission[],
    participants: InterviewParticipant[],
    campaignAccesses: CampaignAccessLike[],
    currentUserId: number,
    onlineThreshold = 15000
  ): Observable<InterviewEvaluationRoster> {
    const canCurrentUserEvaluate = permissions.some(permission =>
      permission.granted
      && permission.userId === currentUserId
      && (permission.permissionKey || '').toUpperCase() === 'VIEW_EVALUATIONS'
    ) || participants.some(participant => participant.userId === currentUserId);

    const currentUserParticipantId = participants.find(participant => participant.userId === currentUserId)?.id ?? null;
    const evaluatorUserIds = [...new Set([
      ...this.extractGrantedPermissionUserIds(permissions.filter(permission => permission.granted), 'VIEW_EVALUATIONS'),
      ...participants
        .map(participant => participant.userId)
        .filter((userId): userId is number => typeof userId === 'number')
    ])];

    if (!evaluatorUserIds.length) {
      return of({
        evaluators: [],
        currentUserParticipantId,
        canCurrentUserEvaluate
      });
    }

    const participantMap = this.buildParticipantMap(participants);

    return forkJoin(
      evaluatorUserIds.map(userId =>
        this.userService.getById(userId).pipe(
          map(user => this.toInterviewEvaluationEvaluator(
            userId,
            user,
            participantMap.get(userId),
            campaignAccesses,
            currentUserId,
            onlineThreshold
          )),
          catchError(() => of(this.toInterviewEvaluationEvaluator(
            userId,
            null,
            participantMap.get(userId),
            campaignAccesses,
            currentUserId,
            onlineThreshold
          )))
        )
      )
    ).pipe(
      map(evaluators => ({
        evaluators,
        currentUserParticipantId,
        canCurrentUserEvaluate
      }))
    );
  }

  refreshEvaluationRosterStatuses(
    evaluators: InterviewEvaluationEvaluator[],
    participants: InterviewParticipant[],
    currentUserId: number,
    onlineThreshold = 20000
  ): InterviewEvaluationEvaluator[] {
    const participantMap = this.buildParticipantMap(participants);

    return evaluators.map(evaluator => {
      const participant = participantMap.get(evaluator.id);

      if (!participant) {
        if (evaluator.id === currentUserId && !evaluator.isOnline) {
          return { ...evaluator, isOnline: true };
        }
        return evaluator;
      }

      return {
        ...evaluator,
        isOnline: this.resolveParticipantOnline(participant, evaluator.id, currentUserId, onlineThreshold),
        hasFinished: this.resolveParticipantHasFinished(participant)
      };
    });
  }

  private resolveEvaluators(userIds: number[], canEvaluateIds: Set<number>): Observable<InterviewEvaluatorOption[]> {
    if (!userIds.length) {
      return of([]);
    }

    return forkJoin(
      userIds.map(userId =>
        this.userService.getById(userId).pipe(
          map(user => this.toEvaluatorOption(userId, user, canEvaluateIds.has(userId))),
          catchError(() => of(this.toEvaluatorOption(userId, null, canEvaluateIds.has(userId))))
        )
      )
    );
  }

  private toEvaluatorOption(
    userId: number,
    user: Partial<User> | null,
    canEvaluate: boolean
  ): InterviewEvaluatorOption {
    const firstName = user?.firstName || user?.prenom || '';
    const lastName = user?.lastName || user?.nom || '';
    const role = user?.role || user?.userRole || '';

    return {
      id: userId,
      userId,
      prenom: firstName,
      nom: lastName,
      firstName,
      lastName,
      email: user?.email || '',
      role,
      userRole: user?.userRole || role,
      isOnline: Boolean(user?.isOnline),
      canEvaluate
    };
  }

  private toInterviewEvaluationEvaluator(
    userId: number,
    user: Partial<User> | null,
    participant: InterviewParticipant | undefined,
    campaignAccesses: CampaignAccessLike[],
    currentUserId: number,
    onlineThreshold: number
  ): InterviewEvaluationEvaluator {
    const base = this.toEvaluatorOption(userId, user, true);
    const access = campaignAccesses.find(candidate => candidate.userId === userId);

    return {
      ...base,
      isOnline: this.resolveParticipantOnline(participant, userId, currentUserId, onlineThreshold),
      hasEvaluated: false,
      hasFinished: this.resolveParticipantHasFinished(participant),
      isAdmin: Boolean(access?.isAdmin),
      isCreator: Boolean(access?.isCreator)
    };
  }

  private extractGrantedPermissionUserIds(permissions: EntityPermission[], permissionKey: string): number[] {
    const normalizedPermissionKey = permissionKey.toUpperCase();

    return this.extractUserIds(
      permissions.filter(permission => (permission.permissionKey || '').toUpperCase() === normalizedPermissionKey)
    );
  }

  private extractUserIds(permissions: EntityPermission[]): number[] {
    return [...new Set(
      permissions
        .map(permission => permission.userId)
        .filter((userId): userId is number => typeof userId === 'number')
    )];
  }

  private findCandidateInterview(
    interview: Interview,
    candidateInterviews: CandidateInterviewEntity[]
  ): CandidateInterviewEntity | undefined {
    const matches = candidateInterviews.filter(candidateInterview => candidateInterview.interviewId === interview.id);
    if (!matches.length) {
      return undefined;
    }

    if (interview.applicationId) {
      return matches.find(candidateInterview => candidateInterview.applicationId === interview.applicationId) || matches[0];
    }

    return matches[0];
  }

  private buildParticipantMap(participants: InterviewParticipant[]): Map<number, InterviewParticipant> {
    return new Map(
      participants
        .filter((participant): participant is InterviewParticipant & { userId: number } => typeof participant.userId === 'number')
        .map(participant => [participant.userId, participant])
    );
  }

  private resolveParticipantOnline(
    participant: InterviewParticipant | undefined,
    evaluatorUserId: number,
    currentUserId: number,
    onlineThreshold: number
  ): boolean {
    if (evaluatorUserId === currentUserId) {
      return true;
    }

    if (!participant || participant.isOnline !== true) {
      return false;
    }

    if (!participant.lastPingAt || participant.lastPingAt === 'undefined' || participant.lastPingAt === 'null') {
      return true;
    }

    const lastPing = this.parseBackendDate(participant.lastPingAt);
    if (!lastPing) {
      return true;
    }

    return (Date.now() - lastPing.getTime()) < onlineThreshold;
  }

  private resolveParticipantHasFinished(participant: InterviewParticipant | undefined): boolean {
    const rawHasFinished = participant?.hasFinished as boolean | string | number | undefined;
    return rawHasFinished === true || rawHasFinished === 'true' || rawHasFinished === 1;
  }

  private resolveCandidateResponseState(candidateInterview?: CandidateInterviewEntity): CandidateResponseState {
    if (!candidateInterview) {
      return null;
    }
    if (candidateInterview.alternativeDateRequested) {
      return 'RESCHEDULE_REQUESTED';
    }
    if (candidateInterview.declineReason) {
      return 'DECLINED';
    }
    return null;
  }

  private parseBackendDate(dateStr: string): Date | null {
    if (!dateStr) {
      return null;
    }

    try {
      if (dateStr.includes('/')) {
        const parts = dateStr.split(' ');
        const dateParts = parts[0]?.split('/') || [];
        const timeParts = parts[1]?.split(':') || ['00', '00', '00'];

        if (dateParts.length !== 3) {
          return null;
        }

        return new Date(
          Number(dateParts[2]),
          Number(dateParts[1]) - 1,
          Number(dateParts[0]),
          Number(timeParts[0]),
          Number(timeParts[1]),
          Number(timeParts[2] || '0')
        );
      }

      return new Date(dateStr);
    } catch {
      return null;
    }
  }

  private sortEvaluators(
    evaluators: InterviewEvaluatorOption[],
    selectedIds: Set<number>,
    canEvaluateIds: Set<number>
  ): InterviewEvaluatorOption[] {
    return [...evaluators].sort((left, right) => {
      const leftSelected = selectedIds.has(left.userId) ? 1 : 0;
      const rightSelected = selectedIds.has(right.userId) ? 1 : 0;
      if (leftSelected !== rightSelected) {
        return rightSelected - leftSelected;
      }

      const leftCanEvaluate = canEvaluateIds.has(left.userId) ? 1 : 0;
      const rightCanEvaluate = canEvaluateIds.has(right.userId) ? 1 : 0;
      if (leftCanEvaluate !== rightCanEvaluate) {
        return rightCanEvaluate - leftCanEvaluate;
      }

      return this.getEvaluatorLabel(left).localeCompare(this.getEvaluatorLabel(right));
    });
  }

  private getEvaluatorLabel(evaluator: InterviewEvaluatorOption): string {
    const fullName = `${evaluator.firstName || ''} ${evaluator.lastName || ''}`.trim();
    return fullName || `Évaluateur #${evaluator.userId}`;
  }
}