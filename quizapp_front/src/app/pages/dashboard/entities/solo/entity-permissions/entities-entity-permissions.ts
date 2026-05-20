import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EntityCrudBase, ColumnDef } from '../../../../../shared/entity-crud-base';
import { EntityDetailPanelComponent } from '../../../../../shared/entity-detail-panel/entity-detail-panel';
import { DependencyPopupComponent } from '../../../../../shared/dependency-popup/dependency-popup';
import { ColumnVisibilityManagerComponent } from '../../../../../shared/column-visibility-manager/column-visibility-manager';
import { FilterCheckboxComponent } from '../../../../../shared/filter-checkbox/filter-checkbox';
import { FilterSelectComponent, FilterSelectOptionDirective } from '../../../../../shared/filter-select/filter-select';
import { EntityPermissionCrudService, EntityPermissionItem, PagedEntityPermissionResponse, EntityPermissionCrudCriteria } from '../../../../../core/services/entity-permission-crud.service';
import { Application, ApplicationService } from '../../../../../core/services/application.service';
import { ApiService } from '../../../../../core/services/api.service';
import { BusinessGroup, BusinessGroupCrudService } from '../../../../../core/services/business-group-crud.service';
import { Campaign, CampaignService } from '../../../../../core/services/campaign.service';
import { Form, FormService } from '../../../../../core/services/form.service';
import { Interview, InterviewService } from '../../../../../core/services/interview.service';
import { User, UserService } from '../../../../../core/services/user.service';
import { Quiz } from '../../../../../shared/models/interfaces';

interface LabelOption {
  value: string;
  label: string;
}

interface EntityReferenceOption {
  id: number;
  label: string;
}

const ENTITY_TYPE_OPTIONS: LabelOption[] = [
  { value: 'CAMPAIGN', label: 'Campagne' },
  { value: 'INTERVIEW', label: 'Entretien' },
  { value: 'APPLICATION', label: 'Candidature' },
  { value: 'QUIZ', label: 'Quiz' },
  { value: 'FORM', label: 'Formulaire' },
];

const ENTITY_PERMISSION_KEY_OPTIONS: LabelOption[] = [
  { value: 'ADMIN', label: 'Administrateur' },
  { value: 'CREATOR', label: 'Createur' },
  { value: 'UPDATE', label: 'Modification' },
  { value: 'DELETE', label: 'Suppression' },
  { value: 'EVALUATE', label: 'Evaluation' },
  { value: 'CORRECT_TEST', label: 'Correction de test' },
  { value: 'PLANIFY', label: 'Planification' },
  { value: 'ADVANCE_PIPELINE', label: 'Avancement pipeline' },
  { value: 'FOLLOW', label: 'Suivi' },
];

const SYSTEM_ROLE_OPTIONS: LabelOption[] = [
  { value: 'SUPER_ADMIN', label: 'Super administrateur' },
  { value: 'ADMIN', label: 'Administrateur' },
  { value: 'RECRUITER', label: 'Recruteur' },
  { value: 'CANDIDATE', label: 'Candidat' },
];

@Component({
  selector: 'app-entities-entity-permissions',
  standalone: true,
  imports: [FilterSelectComponent, FilterSelectOptionDirective, CommonModule, FormsModule, FilterCheckboxComponent, EntityDetailPanelComponent, DependencyPopupComponent, ColumnVisibilityManagerComponent],
  templateUrl: './entities-entity-permissions.html',
  styleUrls: ['./entities-entity-permissions.scss']
})
export class EntitiesEntityPermissionsComponent extends EntityCrudBase<EntityPermissionItem, EntityPermissionCrudCriteria, PagedEntityPermissionResponse> {
  private service = inject(EntityPermissionCrudService);
  private apiService = inject(ApiService);
  private applicationService = inject(ApplicationService);
  private businessGroupService = inject(BusinessGroupCrudService);
  private campaignService = inject(CampaignService);
  private formService = inject(FormService);
  private interviewService = inject(InterviewService);
  private userService = inject(UserService);
  protected override readonly router = inject(Router);
  protected override readonly pageSizeStorageKey = 'entitiesEntityPermissionsPageSize';
  protected override readonly entityName = 'permissions entité';
  protected override readonly entityTypeApi = 'entityPermission';

  readonly entityTypeOptions = ENTITY_TYPE_OPTIONS;
  readonly permissionKeyOptions = ENTITY_PERMISSION_KEY_OPTIONS;
  readonly systemRoleOptions = SYSTEM_ROLE_OPTIONS;

  allApplications = signal<Application[]>([]);
  allUsers = signal<User[]>([]);
  businessGroups = signal<BusinessGroup[]>([]);
  campaigns = signal<Campaign[]>([]);
  forms = signal<Form[]>([]);
  interviews = signal<Interview[]>([]);
  quizzes = signal<Quiz[]>([]);

  advancedCriteria: EntityPermissionCrudCriteria = {};
  editFormData: EntityPermissionItem = {};
  createFormData: Partial<EntityPermissionItem> = {};

  override allColumns: ColumnDef[] = [
    { key: 'id', label: 'ID', priority: 1 },
    { key: 'entityType', label: 'Type Entité', priority: 1 },
    { key: 'entityId', label: 'Entité', priority: 2 },
    { key: 'permission', label: 'Permission', priority: 1 },
    { key: 'userId', label: 'Utilisateur', priority: 2 },
    { key: 'businessGroupId', label: 'Groupe Métier', priority: 2 },
    { key: 'systemRole', label: 'Rôle Système', priority: 2 },
    { key: 'createdAt', label: 'Créé le', priority: 2 },
    { key: 'actions', label: 'Actions', priority: 1 },
  ];

  override ngOnInit(): void {
    super.ngOnInit();
    this.loadCatalogs();
  }

  protected fetchAll(criteria: EntityPermissionCrudCriteria): Observable<PagedEntityPermissionResponse> { return this.service.getAllByCriteria(criteria); }
  protected performCreate(item: Partial<EntityPermissionItem>): Observable<any> { return this.service.create(item as EntityPermissionItem); }
  protected performUpdate(item: EntityPermissionItem): Observable<any> { return this.service.update(item); }
  protected performDelete(id: number): Observable<any> { return this.service.delete(id); }
  protected performRestore(id: number): Observable<any> { return this.service.restore(id); }
  protected resetAdvancedCriteriaValues(): void { this.advancedCriteria = {}; }
  protected resetCreateFormData(): void { this.createFormData = {}; }

  onAdvancedEntityTypeChange(entityType?: string): void {
    this.advancedCriteria.entityType = entityType;
    this.advancedCriteria.entityId = undefined;
  }

  onEditEntityTypeChange(entityType?: string): void {
    this.editFormData.entityType = entityType;
    this.editFormData.entityId = undefined;
  }

  onCreateEntityTypeChange(entityType?: string): void {
    this.createFormData.entityType = entityType;
    this.createFormData.entityId = undefined;
  }

  onEditUserChange(userId?: number): void {
    this.editFormData.userId = userId;
    if (userId !== undefined && userId !== null) {
      this.editFormData.businessGroupId = undefined;
      this.editFormData.systemRole = undefined;
    }
  }

  onEditBusinessGroupChange(businessGroupId?: number): void {
    this.editFormData.businessGroupId = businessGroupId;
    if (businessGroupId !== undefined && businessGroupId !== null) {
      this.editFormData.userId = undefined;
      this.editFormData.systemRole = undefined;
    }
  }

  onEditSystemRoleChange(systemRole?: string): void {
    this.editFormData.systemRole = systemRole;
    if (systemRole) {
      this.editFormData.userId = undefined;
      this.editFormData.businessGroupId = undefined;
    }
  }

  onCreateUserChange(userId?: number): void {
    this.createFormData.userId = userId;
    if (userId !== undefined && userId !== null) {
      this.createFormData.businessGroupId = undefined;
      this.createFormData.systemRole = undefined;
    }
  }

  onCreateBusinessGroupChange(businessGroupId?: number): void {
    this.createFormData.businessGroupId = businessGroupId;
    if (businessGroupId !== undefined && businessGroupId !== null) {
      this.createFormData.userId = undefined;
      this.createFormData.systemRole = undefined;
    }
  }

  onCreateSystemRoleChange(systemRole?: string): void {
    this.createFormData.systemRole = systemRole;
    if (systemRole) {
      this.createFormData.userId = undefined;
      this.createFormData.businessGroupId = undefined;
    }
  }

  hasEntityCatalogOptions(entityType?: string): boolean {
    return this.getEntityOptions(entityType).length > 0;
  }

  getEntityTypeDisplay(entityType?: string): string {
    if (!entityType) {
      return '-';
    }

    const option = this.entityTypeOptions.find((item) => item.value === entityType.toUpperCase());
    return option ? option.label : entityType;
  }

  getEntityDisplay(entityType?: string, entityId?: number): string {
    if (!entityId) {
      return '-';
    }

    const option = this.getEntityOptions(entityType).find((item) => item.id === entityId);
    return option ? option.label : `#${entityId}`;
  }

  getPermissionDisplay(permissionKey?: string): string {
    if (!permissionKey) {
      return '-';
    }

    const option = this.permissionKeyOptions.find((item) => item.value === permissionKey.toUpperCase());
    return option ? `${option.label} (${option.value})` : permissionKey;
  }

  getUserDisplay(userId?: number, item?: EntityPermissionItem): string {
    if (item) {
      const metadataDisplay = this.getEntityPermissionUserMetadataDisplay(item);
      if (metadataDisplay) {
        return metadataDisplay;
      }
    }

    if (!userId) {
      return '-';
    }

    const user = this.allUsers().find((candidate) => candidate.id === userId);
    if (!user) {
      return `#${userId}`;
    }

    const fullName = [user.prenom || user.firstName, user.nom || user.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();

    if (fullName && user.email) {
      return `${fullName} (${user.email})`;
    }

    return fullName || user.email || `#${userId}`;
  }

  getBusinessGroupDisplay(businessGroupId?: number): string {
    if (!businessGroupId) {
      return '-';
    }

    const businessGroup = this.businessGroups().find((candidate) => candidate.id === businessGroupId);
    if (!businessGroup) {
      return `#${businessGroupId}`;
    }

    return businessGroup.groupName || `#${businessGroupId}`;
  }

  getSystemRoleDisplay(systemRole?: string): string {
    if (!systemRole) {
      return '-';
    }

    const option = this.systemRoleOptions.find((item) => item.value === systemRole.toUpperCase());
    return option ? option.label : systemRole;
  }

  getScopeSummary(item?: EntityPermissionItem): string {
    if (!item) {
      return '-';
    }

    if (item.userId) {
      return this.getUserDisplay(item.userId, item);
    }

    if (item.businessGroupId) {
      return this.getBusinessGroupDisplay(item.businessGroupId);
    }

    if (item.systemRole) {
      return this.getSystemRoleDisplay(item.systemRole);
    }

    return '-';
  }

  getEntityOptions(entityType?: string): EntityReferenceOption[] {
    switch ((entityType || '').toUpperCase()) {
      case 'APPLICATION':
        return this.allApplications()
          .filter((item) => item.id !== undefined)
          .map((item) => ({
            id: item.id!,
            label: this.buildApplicationLabel(item),
          }));
      case 'CAMPAIGN':
        return this.campaigns()
          .filter((item) => item.id !== undefined)
          .map((item) => ({
            id: item.id,
            label: this.buildCampaignLabel(item),
          }));
      case 'FORM':
        return this.forms()
          .filter((item) => item.id !== undefined)
          .map((item) => ({
            id: item.id!,
            label: this.buildFormLabel(item),
          }));
      case 'INTERVIEW':
        return this.interviews()
          .filter((item) => item.id !== undefined)
          .map((item) => ({
            id: item.id!,
            label: this.buildInterviewLabel(item),
          }));
      case 'QUIZ':
        return this.quizzes()
          .filter((item) => item.id !== undefined)
          .map((item) => ({
            id: item.id,
            label: this.buildQuizLabel(item),
          }));
      default:
        return [];
    }
  }

  private loadCatalogs(): void {
    this.applicationService.getAllApplicationsByCriteria({ page: 0, size: 9999, isDeleted: false }).subscribe({
      next: (response) => this.allApplications.set(response.content),
      error: () => this.allApplications.set([]),
    });

    this.businessGroupService.getAllByCriteria({ page: 0, size: 9999, isDeleted: false }).subscribe({
      next: (response) => this.businessGroups.set(response.content),
      error: () => this.businessGroups.set([]),
    });

    this.campaignService.getAllCampaignsByCriteria({ page: 0, size: 9999, isDeleted: false }).subscribe({
      next: (response) => this.campaigns.set(response.content),
      error: () => this.campaigns.set([]),
    });

    this.formService.getAllByCriteria({ page: 0, size: 9999, isDeleted: false }).subscribe({
      next: (response) => this.forms.set(response.content),
      error: () => this.forms.set([]),
    });

    this.interviewService.getAllInterviewsByCriteria({ page: 0, size: 9999, isDeleted: false }).subscribe({
      next: (response) => this.interviews.set(response.content),
      error: () => this.interviews.set([]),
    });

    this.apiService.getQuizzes().subscribe({
      next: (response) => this.quizzes.set(response || []),
      error: () => this.quizzes.set([]),
    });

    this.userService.getByCriteria({ page: 0, size: 9999, isDeleted: false }).subscribe({
      next: (response) => this.allUsers.set(response.content),
      error: () => this.allUsers.set([]),
    });
  }

  private buildApplicationLabel(application: Application): string {
    const fullName = [application.candidateFirstName, application.candidateLastName].filter(Boolean).join(' ').trim();
    const detail = fullName || application.candidateEmail || 'Candidature';
    return `#${application.id} - ${detail}`;
  }

  private buildCampaignLabel(campaign: Campaign): string {
    const detail = campaign.campaignTitle || campaign.campaignName || 'Campagne';
    return `#${campaign.id} - ${detail}`;
  }

  private buildFormLabel(form: Form): string {
    const detail = form.formName || 'Formulaire';
    return `#${form.id} - ${detail}`;
  }

  private buildInterviewLabel(interview: Interview): string {
    const detail = interview.candidateName || interview.candidateEmail || interview.interviewDate || 'Entretien';
    return `#${interview.id} - ${detail}`;
  }

  private buildQuizLabel(quiz: Quiz): string {
    return `#${quiz.id} - ${quiz.title}`;
  }

  private getEntityPermissionUserMetadataDisplay(item: EntityPermissionItem): string | undefined {
    const fullName = [item.userFirstName, item.userLastName].filter(Boolean).join(' ').trim();

    if (fullName && item.userEmail) {
      return `${fullName} (${item.userEmail})`;
    }

    if (fullName) {
      return fullName;
    }

    if (item.userName && item.userEmail) {
      return `${item.userName} (${item.userEmail})`;
    }

    return item.userName || item.userEmail || undefined;
  }
}
