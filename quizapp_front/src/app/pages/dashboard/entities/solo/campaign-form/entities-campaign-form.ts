import { Component, Inject, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { Campaign, CampaignService } from '../../../../../core/services/campaign.service';
import { Form, FormService } from '../../../../../core/services/form.service';
import { CampaignFormLink, CampaignFormMutationPayload, CampaignFormService } from '../../../../../core/services/campaign-form.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { FilterSelectComponent, FilterSelectOptionDirective } from '../../../../../shared/filter-select/filter-select';

interface LinkEditorState {
  id?: number;
  campaignId?: number;
  formId?: number;
  assignmentOrder?: number;
}

@Component({
  selector: 'app-entities-campaign-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, FilterSelectComponent, FilterSelectOptionDirective],
  templateUrl: './entities-campaign-form.html',
  styleUrls: ['./entities-campaign-form.scss']
})
export class EntitiesCampaignFormComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  links = signal<CampaignFormLink[]>([]);
  campaigns = signal<Campaign[]>([]);
  forms = signal<Form[]>([]);
  loading = signal(false);

  searchQuery = signal('');
  filterCampaignId = signal<number | null>(null);
  filterFormId = signal<number | null>(null);

  showCreateEditModal = signal(false);
  showDeleteModal = signal(false);
  isEditMode = signal(false);
  selectedLink = signal<CampaignFormLink | null>(null);
  linkForm = signal<LinkEditorState>({});

  filteredLinks = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const campaignId = this.filterCampaignId();
    const formId = this.filterFormId();

    return this.links()
      .filter(link => !query || [
        link.campaignName,
        link.formName,
        link.formDesc || '',
        String(link.assignmentOrder || ''),
        String(link.campaignId),
        String(link.formId)
      ].some(value => String(value || '').toLowerCase().includes(query)))
      .filter(link => campaignId === null || link.campaignId === campaignId)
      .filter(link => formId === null || link.formId === formId);
  });

  sharedFormsCount = computed(() => {
    const counts = new Map<number, number>();
    this.links().forEach(link => {
      if (!link.formId) {
        return;
      }

      counts.set(link.formId, (counts.get(link.formId) || 0) + 1);
    });
    return [...counts.values()].filter(count => count > 1).length;
  });

  availableFormsForSelection = computed(() => {
    const campaignId = this.linkForm().campaignId;
    if (!campaignId) {
      return this.forms();
    }

    const linkedFormIds = new Set(
      this.links()
        .filter(link => link.campaignId === campaignId)
        .map(link => link.formId)
    );

    return this.forms().filter(form => !form.id || !linkedFormIds.has(form.id));
  });

  constructor(
    @Inject(CampaignFormService) private readonly campaignFormService: CampaignFormService,
    private readonly campaignService: CampaignService,
    private readonly formService: FormService,
    private readonly notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onCampaignFilterChange(value: string | number | boolean | null): void {
    this.filterCampaignId.set(typeof value === 'number' ? value : null);
  }

  onFormFilterChange(value: string | number | boolean | null): void {
    this.filterFormId.set(typeof value === 'number' ? value : null);
  }

  updateLinkField<K extends keyof LinkEditorState>(field: K, value: LinkEditorState[K]): void {
    this.linkForm.update(current => ({
      ...current,
      [field]: value,
      ...(field === 'campaignId' ? { formId: undefined } : {})
    }));
  }

  openCreateModal(): void {
    this.linkForm.set({});
    this.isEditMode.set(false);
    this.showCreateEditModal.set(true);
  }

  openEditModal(link: CampaignFormLink): void {
    this.linkForm.set({
      id: link.id,
      campaignId: link.campaignId,
      formId: link.formId,
      assignmentOrder: link.assignmentOrder
    });
    this.isEditMode.set(true);
    this.showCreateEditModal.set(true);
  }

  closeCreateEditModal(): void {
    this.showCreateEditModal.set(false);
    this.isEditMode.set(false);
    this.linkForm.set({});
  }

  openDeleteModal(link: CampaignFormLink): void {
    this.selectedLink.set(link);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.selectedLink.set(null);
  }

  saveLink(): void {
    const state = this.linkForm();
    if (!state.campaignId || !state.formId) {
      this.notificationService.error('Erreur', 'Selectionnez une campagne et un formulaire');
      return;
    }

    const exists = this.links().some(link =>
      link.campaignId === state.campaignId &&
      link.formId === state.formId &&
      link.id !== state.id
    );
    if (exists) {
      this.notificationService.warning('Liaison existante', 'Cette campagne est deja liee a ce formulaire');
      return;
    }

    const payload: CampaignFormMutationPayload = {
      id: state.id,
      campaignId: state.campaignId,
      formId: state.formId,
      assignmentOrder: state.assignmentOrder
    };

    this.loading.set(true);
    const request$ = this.isEditMode() && state.id
      ? this.campaignFormService.update(payload)
      : this.campaignFormService.create(payload);

    request$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.success(
            'Succes',
            this.isEditMode() ? 'Liaison modifiee avec succes' : 'Liaison creee avec succes'
          );
          this.closeCreateEditModal();
          this.loadData();
        },
        error: error => {
          console.error('Erreur sauvegarde liaison campagne-formulaire:', error);
          this.notificationService.error('Erreur', 'Impossible de sauvegarder la liaison');
          this.loading.set(false);
        }
      });
  }

  deleteLink(): void {
    const link = this.selectedLink();
    if (!link?.id) {
      this.notificationService.error('Erreur', 'Impossible d identifier la liaison a supprimer');
      return;
    }

    this.loading.set(true);
    this.campaignFormService.delete(link.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.success('Succes', 'Liaison supprimee avec succes');
          this.closeDeleteModal();
          this.loadData();
        },
        error: error => {
          console.error('Erreur suppression liaison campagne-formulaire:', error);
          this.notificationService.error('Erreur', 'Impossible de supprimer la liaison');
          this.loading.set(false);
        }
      });
  }

  getCampaignLabel(campaignId?: number): string {
    if (!campaignId) {
      return 'Aucune campagne';
    }

    const campaign = this.campaigns().find(item => item.id === campaignId);
    return campaign?.campaignTitle || campaign?.campaignName || `Campagne #${campaignId}`;
  }

  getFormLabel(formId?: number): string {
    if (!formId) {
      return 'Aucun formulaire';
    }

    const form = this.forms().find(item => item.id === formId);
    return form?.formName || `Formulaire #${formId}`;
  }

  loadData(): void {
    this.loading.set(true);
    forkJoin({
      links: this.campaignFormService.getAllByCriteria({ size: 9999, page: 0, isDeleted: false }),
      campaigns: this.campaignService.getAllCampaignsByCriteria({ size: 9999, page: 0, isDeleted: false }),
      forms: this.formService.getAllByCriteria({ size: 9999, page: 0, isDeleted: false })
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ links, campaigns, forms }) => {
          const campaignItems = [...(campaigns.content || [])]
            .sort((left, right) => (left.campaignTitle || left.campaignName || '').localeCompare(right.campaignTitle || right.campaignName || ''));
          const formItems = [...(forms.content || [])]
            .sort((left, right) => (left.formName || '').localeCompare(right.formName || ''));

          const campaignById = new Map<number, Campaign>();
          campaignItems.forEach(campaign => {
            if (campaign.id) {
              campaignById.set(campaign.id, campaign);
            }
          });

          const normalizedLinks = [...(links.content || [])]
            .map(link => ({
              ...link,
              campaignName: link.campaignName || this.getCampaignLabelFromList(link.campaignId, campaignItems),
              campaignStatus: link.campaignStatus || (link.campaignId ? campaignById.get(link.campaignId)?.campaignStatus : undefined),
              formName: link.formName || this.getFormLabelFromList(link.formId, formItems)
            }))
            .sort((left, right) => {
              const campaignComparison = (left.campaignName || '').localeCompare(right.campaignName || '');
              if (campaignComparison !== 0) {
                return campaignComparison;
              }

              return (left.formName || '').localeCompare(right.formName || '') || (left.formId || 0) - (right.formId || 0);
            });

          this.campaigns.set(campaignItems);
          this.forms.set(formItems);
          this.links.set(normalizedLinks);
          this.loading.set(false);
        },
        error: error => {
          console.error('Erreur chargement liaisons campagne-formulaire:', error);
          this.notificationService.error('Erreur', 'Impossible de charger les liaisons campagne-formulaire');
          this.loading.set(false);
        }
      });
  }

  toOptionalPositiveNumber(value: unknown): number | undefined {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
  }

  private getCampaignLabelFromList(campaignId: number | undefined, campaigns: Campaign[]): string {
    if (!campaignId) {
      return 'Aucune campagne';
    }

    const campaign = campaigns.find(item => item.id === campaignId);
    return campaign?.campaignTitle || campaign?.campaignName || `Campagne #${campaignId}`;
  }

  private getFormLabelFromList(formId: number | undefined, forms: Form[]): string {
    if (!formId) {
      return 'Aucun formulaire';
    }

    const form = forms.find(item => item.id === formId);
    return form?.formName || `Formulaire #${formId}`;
  }
}