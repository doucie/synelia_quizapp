import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { PipelineTemplateService } from '../../../core/services/pipeline-template.service';
import { PipelineStageService } from '../../../core/services/pipeline-stage.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PipelineTemplate, PipelineStage, getPipelineReadinessIssues } from '../../../core/models/pipeline.interfaces';

@Component({
  selector: 'app-pipeline-templates',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pipeline-templates.html',
  styleUrls: ['./pipeline-templates.scss']
})
export class PipelineTemplatesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  templates = signal<PipelineTemplate[]>([]);
  loading = signal(false);
  searchQuery = signal('');

  // Stages par template (cache)
  stagesMap = signal<Record<number, PipelineStage[]>>({});

  // Modale de confirmation
  showDefaultConfirm = signal(false);
  templateToSetDefault = signal<PipelineTemplate | null>(null);

  // Modale de duplication
  showDuplicateModal = signal(false);
  templateToDuplicate = signal<PipelineTemplate | null>(null);
  duplicateName = signal('');

  // Modale de création
  showCreateModal = signal(false);
  createName = signal('');
  createDesc = signal('');

  // Modale de suppression
  showDeleteConfirm = signal(false);
  templateToDelete = signal<PipelineTemplate | null>(null);

  filteredTemplates = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const list = this.templates();
    if (!query) return list;
    return list.filter(t =>
      (t.templateName || '').toLowerCase().includes(query) ||
      (t.templateDesc || '').toLowerCase().includes(query)
    );
  });

  constructor(
    private templateService: PipelineTemplateService,
    private stageService: PipelineStageService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTemplates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTemplates(): void {
    this.loading.set(true);
    this.templateService.getAllByCriteria({ size: 100, isDeleted: false })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.templates.set(res.content || []);
          this.loading.set(false);
          // Charger les stages pour chaque template
          (res.content || []).forEach(t => {
            if (t.id) this.loadStagesForTemplate(t.id);
          });
        },
        error: () => this.loading.set(false)
      });
  }

  private loadStagesForTemplate(templateId: number): void {
    this.stageService.getByTemplate(templateId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const stages = res.items || [];
          this.stagesMap.update(map => ({ ...map, [templateId]: stages }));
        }
      });
  }

  getStagesCount(templateId?: number): number {
    if (!templateId) return 0;
    return (this.stagesMap()[templateId] || []).length;
  }

  getStages(templateId?: number): PipelineStage[] {
    if (!templateId) return [];
    return this.stagesMap()[templateId] || [];
  }

  // ── Actions ──

  editTemplate(template: PipelineTemplate): void {
    if (template.id) {
      this.router.navigate(['/dashboard/pipeline-templates', template.id, 'edit']);
    }
  }

  openCreateModal(): void {
    this.createName.set('');
    this.createDesc.set('');
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  confirmCreate(): void {
    const name = this.createName().trim();
    if (!name) return;
    this.templateService.create({ templateName: name, templateDesc: this.createDesc().trim() || undefined, isActive: false })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.hasError) {
            this.notificationService.error('Création du pipeline', res.status.message || 'Impossible de créer le pipeline.');
            return;
          }

          this.showCreateModal.set(false);
          const newId = res?.item?.id || res?.items?.[0]?.id;
          this.notificationService.success('Pipeline créé', 'Le modèle a été créé en brouillon inactif avec ses étapes fixes.');
          if (newId) {
            this.router.navigate(['/dashboard/pipeline-templates', newId, 'edit']);
          } else {
            this.loadTemplates();
          }
        },
        error: () => {
          this.notificationService.error('Création du pipeline', 'Impossible de créer le pipeline.');
          this.loadTemplates();
        }
      });
  }

  openDuplicateModal(event: Event, template: PipelineTemplate): void {
    event.stopPropagation();
    this.templateToDuplicate.set(template);
    this.duplicateName.set(`${template.templateName} (copie)`);
    this.showDuplicateModal.set(true);
  }

  closeDuplicateModal(): void {
    this.showDuplicateModal.set(false);
    this.templateToDuplicate.set(null);
  }

  confirmDuplicate(): void {
    const template = this.templateToDuplicate();
    const name = this.duplicateName().trim();
    if (!template?.id || !name) return;
    this.templateService.duplicate(template.id, name)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.hasError) {
            this.notificationService.error('Duplication du pipeline', res.status.message || 'Impossible de dupliquer le pipeline.');
            return;
          }

          this.showDuplicateModal.set(false);
          const newId = res?.item?.id || res?.items?.[0]?.id;
          this.notificationService.success('Pipeline dupliqué', 'La copie a été créée en brouillon inactif.');
          if (newId) {
            this.router.navigate(['/dashboard/pipeline-templates', newId, 'edit']);
            return;
          }
          this.loadTemplates();
        },
        error: () => {
          this.notificationService.error('Duplication du pipeline', 'Impossible de dupliquer le pipeline.');
          this.loadTemplates();
        }
      });
  }

  openSetDefaultConfirm(event: Event, template: PipelineTemplate): void {
    event.stopPropagation();
    if (!this.canSetDefault(template)) {
      this.notificationService.warning('Définir par défaut', this.getSetDefaultBlockedReason(template) || 'Ce pipeline ne peut pas être défini par défaut pour le moment.');
      return;
    }
    this.templateToSetDefault.set(template);
    this.showDefaultConfirm.set(true);
  }

  closeSetDefaultConfirm(): void {
    this.showDefaultConfirm.set(false);
    this.templateToSetDefault.set(null);
  }

  confirmSetDefault(): void {
    const template = this.templateToSetDefault();
    if (!template?.id) return;
    this.templateService.setDefault(template.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.hasError) {
            this.notificationService.error('Définir par défaut', res.status.message || 'Impossible de définir ce pipeline par défaut.');
            return;
          }

          this.showDefaultConfirm.set(false);
          this.notificationService.success('Défaut mis à jour', 'Le pipeline par défaut a été mis à jour.');
          this.loadTemplates();
        },
        error: () => {
          this.notificationService.error('Définir par défaut', 'Impossible de définir ce pipeline par défaut.');
          this.loadTemplates();
        }
      });
  }

  openDeleteConfirm(event: Event, template: PipelineTemplate): void {
    event.stopPropagation();
    this.templateToDelete.set(template);
    this.showDeleteConfirm.set(true);
  }

  closeDeleteConfirm(): void {
    this.showDeleteConfirm.set(false);
    this.templateToDelete.set(null);
  }

  confirmDelete(): void {
    const template = this.templateToDelete();
    if (!template?.id) return;
    this.templateService.delete(template.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.hasError) {
            this.notificationService.error('Suppression du pipeline', res.status.message || 'Impossible de supprimer le pipeline.');
            return;
          }

          this.showDeleteConfirm.set(false);
          this.notificationService.success('Pipeline supprimé', 'Le modèle de pipeline a été supprimé.');
          this.loadTemplates();
        },
        error: () => {
          this.notificationService.error('Suppression du pipeline', 'Impossible de supprimer le pipeline.');
          this.loadTemplates();
        }
      });
  }

  canSetDefault(template: PipelineTemplate): boolean {
    return !template.isDefault && !this.getSetDefaultBlockedReason(template);
  }

  hasLoadedStages(templateId?: number): boolean {
    return typeof templateId === 'number' && Object.prototype.hasOwnProperty.call(this.stagesMap(), templateId);
  }

  getTemplateReadinessIssues(template: PipelineTemplate): string[] {
    if (!this.hasLoadedStages(template.id)) {
      return [];
    }

    return getPipelineReadinessIssues(this.getStages(template.id));
  }

  getTemplateReadinessState(template: PipelineTemplate): { label: string; kind: 'ready' | 'incomplete' | 'warning' | 'loading' } | null {
    if (!this.hasLoadedStages(template.id)) {
      return { label: 'Analyse', kind: 'loading' };
    }

    const issues = this.getTemplateReadinessIssues(template);

    if (template.isLocked && issues.length > 0) {
      return { label: 'Legacy à nettoyer', kind: 'warning' };
    }

    if (template.isActive && issues.length > 0) {
      return { label: 'Incomplet', kind: 'warning' };
    }

    if (!template.isActive && issues.length === 0) {
      return { label: 'Prêt à activer', kind: 'ready' };
    }

    if (issues.length > 0) {
      return { label: 'À compléter', kind: 'incomplete' };
    }

    return null;
  }

  getSetDefaultBlockedReason(template: PipelineTemplate): string | null {
    if (template.isDefault) {
      return 'Ce pipeline est déjà défini par défaut.';
    }

    if (!this.hasLoadedStages(template.id)) {
      return 'Analyse structurelle du pipeline en cours...';
    }

    if (!template.isActive) {
      return 'Brouillon inactif: activez ce pipeline depuis l’éditeur avant usage.';
    }

    const issues = this.getTemplateReadinessIssues(template);
    if (issues.length > 0) {
      return `Configuration incomplète: ${issues[0]}`;
    }

    return null;
  }

  getTemplateAvailabilityHint(template: PipelineTemplate): string | null {
    if (!this.hasLoadedStages(template.id)) {
      return 'Analyse structurelle du pipeline en cours...';
    }

    const issues = this.getTemplateReadinessIssues(template);
    if (issues.length > 0) {
      if (template.isLocked) {
        return `${issues.length} écart(s) legacy détecté(s): consultez le détail en lecture seule puis dupliquez ce template pour corriger ces points.`;
      }

      return template.isActive
        ? `Configuration incomplète: ${issues[0]}`
        : `À compléter: ${issues[0]}`;
    }

    if (!template.isActive) {
      return 'Brouillon prêt: activez ce pipeline dans l’éditeur pour l’utiliser.';
    }

    if (template.isLocked) {
      return 'Template verrouillé: consultez-le en lecture seule ou dupliquez-le pour préparer une nouvelle variante.';
    }

    return null;
  }

  formatDate(date?: string): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' });
  }
}
