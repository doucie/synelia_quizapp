import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { PipelineTemplateService } from '../../../core/services/pipeline-template.service';
import { PipelineStageService } from '../../../core/services/pipeline-stage.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PipelineTemplate, PipelineStage, StageType, STAGE_TYPES, STAGE_TYPE_LABELS, getPipelineReadinessIssues } from '../../../core/models/pipeline.interfaces';
import { FilterCheckboxComponent } from '../../../shared/filter-checkbox/filter-checkbox';
import { FilterSelectComponent, FilterSelectOptionDirective } from '../../../shared/filter-select/filter-select';

interface EditableStage {
  id?: number;
  uid: string;
  stageLabel: string;
  stageType: StageType;
  stageOrder: number;
  isRequired: boolean;
  allowSkip: boolean;
  isEliminatory: boolean;
  configJson?: string | null;
  isNew?: boolean;
  isLocked?: boolean;
}

interface StageFlagPolicy {
  locksEliminatory: boolean;
  forcedEliminatory?: boolean;
}

@Component({
  selector: 'app-pipeline-template-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterCheckboxComponent, FilterSelectComponent, FilterSelectOptionDirective],
  templateUrl: './pipeline-template-edit.html',
  styleUrls: ['./pipeline-template-edit.scss']
})
export class PipelineTemplateEditComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private templateId!: number;

  template = signal<PipelineTemplate | null>(null);
  stages = signal<EditableStage[]>([]);
  loading = signal(true);
  saving = signal(false);

  templateName = signal('');
  templateDesc = signal('');
  templateActive = signal(false);
  isLockedTemplate = computed(() => !!this.template()?.isLocked);

  // drag state
  dragIndex = signal<number | null>(null);
  dragOverIndex = signal<number | null>(null);

  showDeleteStageConfirm = signal(false);
  stageToDeleteIndex = signal<number | null>(null);

  stageTypes: { value: StageType; label: string }[] = STAGE_TYPES.map((value) => ({
    value,
    label: STAGE_TYPE_LABELS[value]
  }));

  editableStageTypes: StageType[] = ['QUIZ', 'PRESELECTION', 'INTERVIEW'];

  readinessIssues = computed(() => getPipelineReadinessIssues(this.stages()));

  templateState = computed(() => {
    const template = this.template();
    const issues = this.readinessIssues();

    if (template?.isLocked) {
      return {
        label: issues.length > 0 ? 'Utilisé avec écarts à corriger' : 'Utilisé',
        description: issues.length > 0
          ? 'Ce pipeline est déjà utilisé par des candidatures. Les étapes déjà atteintes sont verrouillées (toute modification crée une nouvelle révision); corrigez directement les écarts ci-dessous.'
          : 'Ce pipeline est déjà utilisé par des candidatures. Les étapes déjà atteintes sont verrouillées: leur modification crée une nouvelle révision, le retrait les archive.',
        kind: 'locked'
      } as const;
    }

    if (this.templateActive() && issues.length === 0) {
      return {
        label: 'Actif',
        description: 'Ce pipeline peut être utilisé opérationnellement et défini par défaut.',
        kind: 'active'
      } as const;
    }

    if (this.templateActive()) {
      return {
        label: 'Activation bloquée',
        description: 'Complétez les points ci-dessous avant d’activer ce pipeline.',
        kind: 'warning'
      } as const;
    }

    if (issues.length === 0) {
      return {
        label: 'Brouillon prêt',
        description: 'Le pipeline est prêt à être activé lors du prochain enregistrement.',
        kind: 'ready'
      } as const;
    }

    return {
      label: 'Brouillon à compléter',
      description: 'Complétez la structure minimale avant d’activer ce pipeline.',
      kind: 'inactive'
    } as const;
  });

  hasChanges = computed(() => {
    const t = this.template();
    if (!t) return false;
    return this.templateName() !== (t.templateName || '') ||
           this.templateDesc() !== (t.templateDesc || '');
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private templateService: PipelineTemplateService,
    private stageService: PipelineStageService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id || isNaN(+id)) {
      this.router.navigate(['/dashboard/pipeline-templates']);
      return;
    }
    this.templateId = +id;
    this.loadTemplate();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadTemplate(): void {
    this.loading.set(true);
    forkJoin({
      templates: this.templateService.getAllByCriteria({ size: 1, idDe: String(this.templateId), idA: String(this.templateId) }),
      stages: this.stageService.getByTemplate(this.templateId)
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: ({ templates, stages }) => {
        const t = (templates.content || [])[0] || null;
        this.template.set(t);
        this.templateName.set(t?.templateName || '');
        this.templateDesc.set(t?.templateDesc || '');
        this.templateActive.set(!!t?.isActive);

        const rawStages = (stages.items || []).sort((a, b) => (a.stageOrder || 0) - (b.stageOrder || 0));
        this.stages.set(rawStages.map(s => this.normalizeStageForEditor({
          id: s.id,
          uid: 'stage-' + s.id,
          stageLabel: s.stageLabel || '',
          stageType: (s.stageType || 'PRESELECTION') as StageType,
          stageOrder: s.stageOrder || 0,
          isRequired: !!s.isRequired,
          allowSkip: this.readAllowSkipFromConfig(s.configJson),
          isEliminatory: !!s.isEliminatory,
          configJson: s.configJson ?? null,
          isNew: false,
          isLocked: !!s.isLocked
        })));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard/pipeline-templates']);
      }
    });
  }

  // ── Stage management ──

  addStage(): void {
    const current = this.stages();
    const decisionIndex = current.findIndex(stage => stage.stageType === 'DECISION');
    const insertIndex = decisionIndex >= 0 ? decisionIndex : current.length;
    const nextList = [...current];

    nextList.splice(insertIndex, 0, this.normalizeStageForEditor({
      uid: this.newStageUid(),
      stageLabel: '',
      stageType: this.editableStageTypes[0],
      stageOrder: 0,
      isRequired: false,
      allowSkip: false,
      isEliminatory: false,
      configJson: null,
      isNew: true
    }));

    this.stages.set(nextList.map((stage, index) => ({ ...stage, stageOrder: index + 1 })));
  }

  openDeleteStageConfirm(index: number): void {
    if (this.isFixedStage(this.stages()[index])) {
      this.notificationService.warning('Étape fixe', 'Les étapes Candidature et Décision ne peuvent pas être supprimées.');
      return;
    }

    this.stageToDeleteIndex.set(index);
    this.showDeleteStageConfirm.set(true);
  }

  closeDeleteStageConfirm(): void {
    this.showDeleteStageConfirm.set(false);
    this.stageToDeleteIndex.set(null);
  }

  confirmDeleteStage(): void {
    const index = this.stageToDeleteIndex();
    if (index === null) return;

    // Le retrait est appliqué localement; le moteur (saveTemplateStages) gère le
    // soft-delete (étape libre) ou l'archivage (étape déjà atteinte).
    this.removeStageFromList(index);
    this.showDeleteStageConfirm.set(false);
  }

  private removeStageFromList(index: number): void {
    this.stages.update(list => {
      const newList = list.filter((_, i) => i !== index);
      return newList.map((s, i) => ({ ...s, stageOrder: i + 1 }));
    });
  }

  updateStageField(index: number, field: keyof EditableStage, value: any): void {
    const stage = this.stages()[index];
    if (this.isStageLocked(stage)) {
      return;
    }

    if (this.isFixedStage(stage) && (field === 'stageLabel' || field === 'stageType')) {
      return;
    }

    this.stages.update(list => list.map((s, i) => {
      if (i !== index) {
        return s;
      }

      return this.normalizeStageForEditor({ ...s, [field]: value });
    }));
  }

  updateStageAllowSkip(index: number, value: boolean): void {
    if (this.isStageLocked(this.stages()[index])) {
      return;
    }

    this.stages.update(list => list.map((s, i) => {
      if (i !== index) {
        return s;
      }

      return this.normalizeStageForEditor({
        ...s,
        allowSkip: value
      });
    }));
  }

  isStageEliminatoryEditable(stage: EditableStage): boolean {
    return !this.isStageLocked(stage) && !this.isFixedStage(stage) && !this.getStageFlagPolicy(stage.stageType).locksEliminatory;
  }

  shouldShowStageAllowSkipToggle(stage: EditableStage): boolean {
    return !this.isFixedStage(stage) && stage.isRequired;
  }

  getStageSkipHint(stage: EditableStage): string | null {
    if (this.isFixedStage(stage)) {
      return null;
    }

    if (!stage.isRequired) {
      return 'Une étape non obligatoire est déjà skippable côté candidat; aucun réglage avancé n’est nécessaire.';
    }

    if (stage.allowSkip) {
      return 'Cette étape restera skippable même si elle est marquée obligatoire.';
    }

    return 'Par défaut, une étape obligatoire ne peut pas être ignorée.';
  }

  getStageTypeLabel(type: StageType): string {
    return STAGE_TYPE_LABELS[type];
  }

  hasAvailableStageTypeForCreation(): boolean {
    return true;
  }

  private newStageUid(): string {
    return 'new-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  }

  private normalizeStageForEditor(stage: EditableStage): EditableStage {
    const policy = this.getStageFlagPolicy(stage.stageType);
    const allowSkip = !this.isFixedStage(stage) && stage.isRequired ? !!stage.allowSkip : false;

    return {
      ...stage,
      allowSkip,
      isEliminatory: policy.forcedEliminatory ?? stage.isEliminatory
    };
  }

  private readAllowSkipFromConfig(configJson?: string | null): boolean {
    const config = this.readStageConfigObject(configJson);
    return config?.['allowSkip'] === true;
  }

  private readStageConfigObject(configJson?: string | null): Record<string, unknown> | null {
    const rawConfig = configJson?.trim();
    if (!rawConfig) {
      return {};
    }

    try {
      const parsed = JSON.parse(rawConfig);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
        ? parsed as Record<string, unknown>
        : null;
    } catch {
      return null;
    }
  }

  private buildStageConfigJson(stage: EditableStage): string | null | undefined {
    const rawConfig = stage.configJson?.trim();
    const parsedConfig = this.readStageConfigObject(stage.configJson);

    if (rawConfig && parsedConfig === null) {
      return stage.configJson;
    }

    const nextConfig = { ...(parsedConfig || {}) };
    if (stage.isRequired && stage.allowSkip) {
      nextConfig['allowSkip'] = true;
    } else {
      delete nextConfig['allowSkip'];
    }

    return Object.keys(nextConfig).length > 0 ? JSON.stringify(nextConfig) : null;
  }

  private getStageFlagPolicy(stageType: StageType): StageFlagPolicy {
    const normalizedStageType = stageType as StageType;

    switch (normalizedStageType) {
      case 'PRESELECTION':
        return {
          locksEliminatory: true,
          forcedEliminatory: true
        };
      case 'INTERVIEW':
        return {
          locksEliminatory: false
        };
      case 'QUIZ':
        return {
          locksEliminatory: false
        };
      case 'CANDIDATURE':
        return {
          locksEliminatory: true,
          forcedEliminatory: false
        };
      case 'DECISION':
        return {
          locksEliminatory: true,
          forcedEliminatory: false
        };
      default:
        return {
          locksEliminatory: false
        };
    }
  }

  getEditableStageTypeOptions(stage: EditableStage): { value: StageType; label: string }[] {
    return this.stageTypes.filter(type => this.editableStageTypes.includes(type.value));
  }

  isFixedStage(stage: EditableStage): boolean {
    return stage.stageType === 'CANDIDATURE' || stage.stageType === 'DECISION';
  }

  isStageLocked(stage: EditableStage): boolean {
    return !!stage.isLocked;
  }

  getStageLockHint(stage: EditableStage): string | null {
    if (!this.isStageLocked(stage)) {
      return null;
    }

    return 'Étape déjà atteinte par des candidatures: ses champs sont verrouillés. Toute modification enregistrée créera une nouvelle révision, le retrait l’archivera.';
  }

  isStageReorderable(stage: EditableStage): boolean {
    return !this.isFixedStage(stage);
  }

  // ── Drag & drop ──

  onDragStart(index: number): void {
    if (!this.isStageReorderable(this.stages()[index])) {
      this.dragIndex.set(null);
      return;
    }

    this.dragIndex.set(index);
  }

  onDragOver(event: DragEvent, index: number): void {
    if (this.dragIndex() === null || !this.isStageReorderable(this.stages()[index])) {
      return;
    }

    event.preventDefault();
    this.dragOverIndex.set(index);
  }

  onDragLeave(): void {
    this.dragOverIndex.set(null);
  }

  onDrop(event: DragEvent, targetIndex: number): void {
    event.preventDefault();
    const fromIndex = this.dragIndex();
    if (fromIndex === null || fromIndex === targetIndex || !this.isStageReorderable(this.stages()[targetIndex])) {
      this.dragIndex.set(null);
      this.dragOverIndex.set(null);
      return;
    }
    this.stages.update(list => {
      const newList = [...list];
      const [moved] = newList.splice(fromIndex, 1);
      newList.splice(targetIndex, 0, moved);
      return newList.map((s, i) => ({ ...s, stageOrder: i + 1 }));
    });
    this.dragIndex.set(null);
    this.dragOverIndex.set(null);
  }

  onDragEnd(): void {
    this.dragIndex.set(null);
    this.dragOverIndex.set(null);
  }

  // ── Save ──

  save(): void {
    const name = this.templateName().trim();
    const desc = this.templateDesc().trim();
    const currentTemplate = this.template();
    const isCurrentlyActive = !!currentTemplate?.isActive;
    const shouldBeActive = this.templateActive();
    const readinessIssues = this.readinessIssues();

    if (shouldBeActive && readinessIssues.length > 0) {
      this.notificationService.warning('Pipeline incomplet', readinessIssues[0]);
      return;
    }

    this.saving.set(true);

    // Ordre de sauvegarde : cas de déactivation.
    // On persiste d'abord le template (nom, description, isActive=false), puis les étapes :
    // cela garantit qu'un template dont les étapes ne peuvent plus être synchronisées
    // (données legacy, validation backend) peut toujours être désactivé. Risque assumé :
    // si la sauvegarde des étapes échoue ensuite, le template reste désactivé avec les
    // anciennes étapes — l'utilisateur est notifié de l'erreur. Le cas inverse (activation)
    // reste transactionnel : les étapes sont sauvées avant l'activation.
    if (isCurrentlyActive && !shouldBeActive) {
      this.updateTemplateInfo(name, desc, () => this.saveStages(() => this.onSaveComplete()));
      return;
    }

    this.saveStages(() => this.updateTemplateInfo(name, desc, () => this.onSaveComplete()));
  }

  private updateTemplateInfo(name: string, desc: string, onSuccess: () => void): void {
    this.templateService.update({ id: this.templateId, templateName: name, templateDesc: desc || undefined, isActive: this.templateActive() })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.hasError) {
            this.notificationService.error('Pipeline', response.status.message || 'Impossible de mettre à jour le pipeline.');
            this.saving.set(false);
            return;
          }

          onSuccess();
        },
        error: () => {
          this.notificationService.error('Pipeline', 'Impossible de mettre à jour le pipeline.');
          this.saving.set(false);
        }
      });
  }

  private saveStages(onSuccess: () => void): void {
    const payloads = this.stages().map(stage => this.toStagePayload(stage));

    this.stageService.saveTemplateStages(this.templateId, payloads)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.hasError) {
            this.notificationService.error('Pipeline', response.status.message || 'Impossible d’enregistrer les étapes du pipeline.');
            this.saving.set(false);
            return;
          }

          onSuccess();
        },
        error: () => {
          this.notificationService.error('Pipeline', 'Impossible d’enregistrer les étapes du pipeline.');
          this.saving.set(false);
        }
      });
  }

  private toStagePayload(stage: EditableStage): PipelineStage {
    const normalizedStage = this.normalizeStageForEditor(stage);

    return {
      id: normalizedStage.id,
      stageLabel: normalizedStage.stageLabel,
      stageType: normalizedStage.stageType,
      stageOrder: normalizedStage.stageOrder,
      isRequired: normalizedStage.isRequired,
      isEliminatory: normalizedStage.isEliminatory,
      configJson: this.buildStageConfigJson(normalizedStage),
      pipelineTemplateId: this.templateId
    };
  }

  private onSaveComplete(): void {
    this.saving.set(false);
    this.notificationService.success('Pipeline enregistré', 'Le modèle de pipeline a été mis à jour.');
    this.loadTemplate();
  }

  goBack(): void {
    this.router.navigate(['/dashboard/pipeline-templates']);
  }
}
