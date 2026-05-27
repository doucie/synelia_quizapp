import { Component, Inject, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { Campaign, CampaignService } from '../../../core/services/campaign.service';
import { Form, FormMutationPayload, FormService } from '../../../core/services/form.service';
import { FormVersion, FormVersionService } from '../../../core/services/form-version.service';
import { CampaignFormLink, CampaignFormService } from '../../../core/services/campaign-form.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { FilterCheckboxComponent } from '../../../shared/filter-checkbox/filter-checkbox';
import { FilterSelectComponent, FilterSelectOptionDirective } from '../../../shared/filter-select/filter-select';

type FormStatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

interface FormEditorState {
  id?: number;
  formName: string;
  formDesc: string;
  isActive: boolean;
}

@Component({
  selector: 'app-forms',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, FilterCheckboxComponent, FilterSelectComponent, FilterSelectOptionDirective],
  templateUrl: './forms.html',
  styleUrls: ['./forms.scss']
})
export class FormsComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  forms = signal<Form[]>([]);
  campaigns = signal<Campaign[]>([]);
  campaignFormLinks = signal<CampaignFormLink[]>([]);
  loading = signal(false);
  versionsByForm = signal<Record<number, FormVersion[]>>({});
  expandedForms = signal<Set<number>>(new Set());

  searchQuery = signal('');
  filterCampaignId = signal<number | null>(null);
  filterStatus = signal<FormStatusFilter>('ALL');

  showCreateEditModal = signal(false);
  showDeleteModal = signal(false);
  isEditMode = signal(false);
  selectedForm = signal<Form | null>(null);
  formState = signal<FormEditorState>(this.getEmptyFormState());
  isAdminModeEnabled = signal(false);

  linksByFormId = computed(() => {
    const grouped = new Map<number, CampaignFormLink[]>();
    this.campaignFormLinks().forEach(link => {
      if (!link.formId) {
        return;
      }

      const current = grouped.get(link.formId) || [];
      current.push(link);
      grouped.set(link.formId, current);
    });

    grouped.forEach((links, formId) => {
      grouped.set(
        formId,
        [...links].sort((left, right) => (left.assignmentOrder || 9999) - (right.assignmentOrder || 9999) || (left.id || 0) - (right.id || 0))
      );
    });

    return grouped;
  });

  filteredForms = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const campaignId = this.filterCampaignId();
    const status = this.filterStatus();
    const linksByFormId = this.linksByFormId();

    return [...this.forms()]
      .filter(form => !form.isDeleted)
      .filter(form => {
        if (!query) {
          return true;
        }

        return [
          form.formName,
          form.formDesc,
          this.getLinkedCampaignNamesFromMap(form, linksByFormId).join(' ')
        ]
          .filter((value): value is string => Boolean(value))
          .some(value => value.toLowerCase().includes(query));
      })
      .filter(form => campaignId === null || this.isLinkedToCampaign(form, campaignId, linksByFormId))
      .filter(form => {
        if (status === 'ACTIVE') {
          return form.isActive === true;
        }
        if (status === 'INACTIVE') {
          return form.isActive !== true;
        }
        return true;
      })
      .sort((left, right) => {
        const leftName = (left.formName || '').toLowerCase();
        const rightName = (right.formName || '').toLowerCase();
        return leftName.localeCompare(rightName) || (right.id || 0) - (left.id || 0);
      });
  });

  activeFormsCount = computed(() => this.forms().filter(form => !form.isDeleted && form.isActive).length);
  sharedFormsCount = computed(() => [...this.linksByFormId().values()].filter(links => links.length > 1).length);

  constructor(
    private readonly formService: FormService,
    private readonly campaignService: CampaignService,
    private readonly formVersionService: FormVersionService,
    @Inject(CampaignFormService) private readonly campaignFormService: CampaignFormService,
    private readonly authService: AuthService,
    private readonly notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.isAdminModeEnabled.set(user?.adminMode || false);
      });

    this.loadForms();
    this.loadCampaigns();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onCampaignFilterChange(value: string | number | boolean | null): void {
    this.filterCampaignId.set(typeof value === 'number' ? value : null);
  }

  onStatusFilterChange(value: string | number | boolean | null): void {
    if (value === 'ACTIVE' || value === 'INACTIVE') {
      this.filterStatus.set(value);
      return;
    }

    this.filterStatus.set('ALL');
  }

  loadForms(): void {
    this.loading.set(true);
    forkJoin({
      forms: this.formService.getAllByCriteria({ size: 200, page: 0, isDeleted: false }),
      links: this.campaignFormService.getAllByCriteria({ size: 9999, page: 0, isDeleted: false }),
      versions: this.formVersionService.getAllByCriteria({ size: 9999, page: 0, isDeleted: false })
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ forms, links, versions }) => {
          const items = forms.content || [];
          this.forms.set(items);
          this.campaignFormLinks.set(links.content || []);
          this.versionsByForm.set(this.buildVersionsIndex(items, versions.content || []));
          this.loading.set(false);
        },
        error: error => {
          console.error('Erreur chargement formulaires:', error);
          this.notificationService.error('Erreur', 'Impossible de charger les formulaires');
          this.loading.set(false);
        }
      });
  }

  loadCampaigns(): void {
    this.campaignService.getAllCampaignsByCriteria({ size: 9999, page: 0, isDeleted: false })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: response => {
          this.campaigns.set(response.content || []);
        },
        error: error => {
          console.error('Erreur chargement campagnes:', error);
        }
      });
  }

  openCreateModal(): void {
    if (!this.isAdminModeEnabled()) {
      this.notificationService.warning('Acces refuse', 'Le mode admin doit etre active pour creer un formulaire');
      return;
    }

    this.isEditMode.set(false);
    this.selectedForm.set(null);
    this.formState.set(this.getEmptyFormState());
    this.showCreateEditModal.set(true);
  }

  openEditModal(form: Form): void {
    if (!this.isAdminModeEnabled()) {
      this.notificationService.warning('Acces refuse', 'Le mode admin doit etre active pour modifier un formulaire');
      return;
    }

    this.isEditMode.set(true);
    this.selectedForm.set(form);
    this.formState.set({
      id: form.id,
      formName: form.formName || '',
      formDesc: form.formDesc || '',
      isActive: form.isActive !== false
    });
    this.showCreateEditModal.set(true);
  }

  closeCreateEditModal(): void {
    this.showCreateEditModal.set(false);
    this.selectedForm.set(null);
    this.formState.set(this.getEmptyFormState());
  }

  openDeleteModal(form: Form): void {
    if (!this.isAdminModeEnabled()) {
      this.notificationService.warning('Acces refuse', 'Le mode admin doit etre active pour supprimer un formulaire');
      return;
    }

    this.selectedForm.set(form);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.selectedForm.set(null);
  }

  updateFormField<K extends keyof FormEditorState>(field: K, value: FormEditorState[K]): void {
    this.formState.update(current => ({
      ...current,
      [field]: value
    }));
  }

  saveForm(): void {
    const state = this.formState();

    if (!state.formName.trim()) {
      this.notificationService.error('Erreur', 'Le nom du formulaire est obligatoire');
      return;
    }

    this.loading.set(true);

    const payload: FormMutationPayload = {
      formName: state.formName.trim(),
      formDesc: state.formDesc.trim(),
      isActive: state.isActive
    };

    const request$ = this.isEditMode() && state.id
      ? this.formService.update({ ...payload, id: state.id })
      : this.formService.create(payload);

    request$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.success(
            'Succes',
            this.isEditMode() ? 'Formulaire modifie avec succes' : 'Formulaire cree avec succes'
          );
          this.closeCreateEditModal();
          this.loadForms();
        },
        error: error => {
          console.error('Erreur sauvegarde formulaire:', error);
          this.notificationService.error('Erreur', 'Impossible de sauvegarder le formulaire');
          this.loading.set(false);
        }
      });
  }

  deleteForm(): void {
    const form = this.selectedForm();
    if (!form?.id) {
      return;
    }

    this.loading.set(true);
    this.formService.delete(form.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.success('Succes', 'Formulaire supprime avec succes');
          this.closeDeleteModal();
          this.loadForms();
        },
        error: error => {
          console.error('Erreur suppression formulaire:', error);
          this.notificationService.error('Erreur', 'Impossible de supprimer le formulaire');
          this.loading.set(false);
        }
      });
  }

  toggleVersions(formId?: number): void {
    if (!formId) {
      return;
    }

    const next = new Set(this.expandedForms());
    if (next.has(formId)) {
      next.delete(formId);
    } else {
      next.add(formId);
    }

    this.expandedForms.set(next);
  }

  isExpanded(formId?: number): boolean {
    return Boolean(formId && this.expandedForms().has(formId));
  }

  getFormVersions(formId?: number): FormVersion[] {
    if (!formId) {
      return [];
    }

    return this.versionsByForm()[formId] || [];
  }

  getPublishedVersionCount(formId?: number): number {
    return this.getFormVersions(formId).filter(version => version.isPublished && !version.isDeleted).length;
  }

  getLinkedCampaignCount(form: Form): number {
    return this.getLinkedCampaigns(form).length;
  }

  getLinkedCampaignNames(form: Form): string[] {
    return this.getLinkedCampaigns(form)
      .map(link => link.campaignName || this.getCampaignLabel(link.campaignId))
      .filter((value, index, collection) => Boolean(value) && collection.indexOf(value) === index);
  }

  getLinkedCampaignBadgeLabel(form: Form): string {
    const linkedCampaignNames = this.getLinkedCampaignNames(form);
    if (linkedCampaignNames.length > 0) {
      return linkedCampaignNames[0];
    }

    return 'Aucune campagne liee';
  }

  hasSharedPublicationWarning(form: Form): boolean {
    return this.getLinkedCampaignCount(form) > 1 && this.getPublishedVersionCount(form.id) > 0;
  }

  hasSharedTimingWarning(form: Form): boolean {
    return this.getLinkedCampaignCount(form) > 1 && Boolean(form.isTimed);
  }

  getCampaignLabel(campaignId?: number): string {
    if (!campaignId) {
      return 'Aucune campagne';
    }

    const campaign = this.campaigns().find(item => item.id === campaignId);
    return campaign?.campaignTitle || campaign?.campaignName || `Campagne #${campaignId}`;
  }

  formatDate(value?: string): string {
    if (!value) {
      return '-';
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('fr-FR');
  }

  private getEmptyFormState(): FormEditorState {
    return {
      formName: '',
      formDesc: '',
      isActive: true
    };
  }

  private getLinkedCampaigns(form: Form): CampaignFormLink[] {
    if (form.id) {
      return this.linksByFormId().get(form.id) || [];
    }

    return [];
  }

  private getLinkedCampaignNamesFromMap(form: Form, linksByFormId: Map<number, CampaignFormLink[]>): string[] {
    if (form.id) {
      return (linksByFormId.get(form.id) || [])
        .map(link => link.campaignName || this.getCampaignLabel(link.campaignId))
        .filter((value, index, collection) => Boolean(value) && collection.indexOf(value) === index);
    }

    return [];
  }

  private isLinkedToCampaign(form: Form, campaignId: number, linksByFormId: Map<number, CampaignFormLink[]>): boolean {
    if (form.id) {
      return (linksByFormId.get(form.id) || []).some(link => link.campaignId === campaignId);
    }

    return false;
  }

  private buildVersionsIndex(forms: Form[], versions: FormVersion[]): Record<number, FormVersion[]> {
    const grouped: Record<number, FormVersion[]> = {};

    forms.forEach(form => {
      if (form.id) {
        grouped[form.id] = [];
      }
    });

    versions.forEach(version => {
      if (!version.formId) {
        return;
      }

      if (!grouped[version.formId]) {
        grouped[version.formId] = [];
      }

      grouped[version.formId].push(version);
    });

    Object.keys(grouped).forEach(key => {
      grouped[Number(key)] = [...grouped[Number(key)]].sort(
        (left, right) => (right.versionNumber || 0) - (left.versionNumber || 0) || (right.id || 0) - (left.id || 0)
      );
    });

    return grouped;
  }
}