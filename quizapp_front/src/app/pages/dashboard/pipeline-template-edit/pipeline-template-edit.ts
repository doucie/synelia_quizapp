import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, forkJoin, of } from 'rxjs';
import { PipelineTemplateService } from '../../../core/services/pipeline-template.service';
import { PipelineStageService } from '../../../core/services/pipeline-stage.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PipelineTemplate, PipelineStage, StageType, STAGE_TYPES, STAGE_TYPE_LABELS, SINGLETON_INTERMEDIATE_STAGE_TYPES, getPipelineReadinessIssues } from '../../../core/models/pipeline.interfaces';
import { FilterCheckboxComponent } from '../../../shared/filter-checkbox/filter-checkbox';
import { FilterSelectComponent, FilterSelectOptionDirective } from '../../../shared/filter-select/filter-select';

interface EditableStage {
  id?: number;
  stageLabel: string;
  stageType: StageType;
  stageOrder: number;
  isRequired: boolean;
  allowSkip: boolean;
  isEliminatory: boolean;
  emailRequired: boolean;
  emailAutomatic: boolean;
  configJson?: string | null;
  isNew?: boolean;
}

interface StageFlagPolicy {
  supportsEmail: boolean;
  emailHint?: string;
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

  editableStageTypes: StageType[] = ['QUIZ', 'PRESELECTION', 'INTERVIEW', 'EVALUATION'];

  readinessIssues = computed(() => getPipelineReadinessIssues(this.stages()));

  templateState = computed(() => {
    const template = this.template();
    const issues = this.readinessIssues();

    if (template?.isLocked) {
      return {
        label: issues.length > 0 ? 'Verrouillé avec écarts legacy' : 'Verrouillé',
        description: issues.length > 0
          ? 'Ce pipeline est déjà utilisé par des candidatures et contient encore des incohérences structurelles legacy. Corrigez-les via duplication plutôt que sur cette version.'
          : 'Ce pipeline est déjà utilisé par des candidatures. Préparez une nouvelle version via duplication.',
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
          stageLabel: s.stageLabel || '',
          stageType: (s.stageType || 'PRESELECTION') as StageType,
          stageOrder: s.stageOrder || 0,
          isRequired: !!s.isRequired,
          allowSkip: this.readAllowSkipFromConfig(s.configJson),
          isEliminatory: !!s.isEliminatory,
          emailRequired: !!s.emailRequired,
          emailAutomatic: !!s.emailAutomatic,
          configJson: s.configJson ?? null,
          isNew: false
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
    if (this.isLockedTemplate()) {
      this.notificationService.warning('Pipeline verrouillé', 'Ce template est déjà utilisé. Préparez une correction via duplication plutôt qu’en le modifiant directement.');
      return;
    }

    const availableTypes = this.getAvailableSingletonStageTypes();
    if (availableTypes.length === 0) {
      this.notificationService.warning('Étapes du pipeline', 'Le modèle actuel ne supporte qu’une seule occurrence de chaque type intermédiaire métier (Quiz, Présélection, Entretien, Évaluation).');
      return;
    }

    const current = this.stages();
    const decisionIndex = current.findIndex(stage => stage.stageType === 'DECISION');
    const insertIndex = decisionIndex >= 0 ? decisionIndex : current.length;
    const nextList = [...current];

    nextList.splice(insertIndex, 0, this.normalizeStageForEditor({
      stageLabel: '',
      stageType: availableTypes[0],
      stageOrder: 0,
      isRequired: false,
      allowSkip: false,
      isEliminatory: false,
      emailRequired: false,
      emailAutomatic: false,
      configJson: null,
      isNew: true
    }));

    this.stages.set(nextList.map((stage, index) => ({ ...stage, stageOrder: index + 1 })));
  }

  openDeleteStageConfirm(index: number): void {
    if (this.isLockedTemplate()) {
      this.notificationService.warning('Pipeline verrouillé', 'Ce template est déjà utilisé. Préparez une correction via duplication plutôt qu’en le modifiant directement.');
      return;
    }

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
    if (this.isLockedTemplate()) {
      this.closeDeleteStageConfirm();
      return;
    }

    const index = this.stageToDeleteIndex();
    if (index === null) return;
    const stage = this.stages()[index];

    if (stage.id && !stage.isNew) {
      this.stageService.delete(stage.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe((response) => {
          if (response.hasError) {
            this.notificationService.error('Étapes du pipeline', response.status.message || 'Impossible de supprimer cette étape.');
            return;
          }

          this.removeStageFromList(index);
        });
    } else {
      this.removeStageFromList(index);
    }
    this.showDeleteStageConfirm.set(false);
  }

  private removeStageFromList(index: number): void {
    this.stages.update(list => {
      const newList = list.filter((_, i) => i !== index);
      return newList.map((s, i) => ({ ...s, stageOrder: i + 1 }));
    });
  }

  updateStageField(index: number, field: keyof EditableStage, value: any): void {
    if (this.isLockedTemplate()) {
      return;
    }

    if (this.isFixedStage(this.stages()[index]) && (field === 'stageLabel' || field === 'stageType')) {
      return;
    }

    this.stages.update(list => list.map((s, i) => {
      if (i !== index) {
        return s;
      }

      return this.normalizeStageForEditor({ ...s, [field]: value });
    }));
  }

  updateStageEmailRequired(index: number, value: boolean): void {
    if (this.isLockedTemplate()) {
      return;
    }

    this.stages.update(list => list.map((s, i) => {
      if (i !== index) {
        return s;
      }

      return this.normalizeStageForEditor({
        ...s,
        emailRequired: value,
        emailAutomatic: value ? s.emailAutomatic : false
      });
    }));
  }

  updateStageEmailAutomatic(index: number, value: boolean): void {
    if (this.isLockedTemplate()) {
      return;
    }

    this.stages.update(list => list.map((s, i) => {
      if (i !== index) {
        return s;
      }

      return this.normalizeStageForEditor({
        ...s,
        emailRequired: value ? true : s.emailRequired,
        emailAutomatic: value
      });
    }));
  }

  updateStageAllowSkip(index: number, value: boolean): void {
    if (this.isLockedTemplate()) {
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
    return !this.isLockedTemplate() && !this.isFixedStage(stage) && !this.getStageFlagPolicy(stage.stageType).locksEliminatory;
  }

  shouldShowStageAllowSkipToggle(stage: EditableStage): boolean {
    return !this.isFixedStage(stage) && stage.isRequired;
  }

  supportsStageEmails(stage: EditableStage): boolean {
    return this.getStageFlagPolicy(stage.stageType).supportsEmail;
  }

  getStageFlagHint(stage: EditableStage): string | null {
    return this.getStageFlagPolicy(stage.stageType).emailHint ?? null;
  }

  getStageSkipHint(stage: EditableStage): string | null {
    if (this.isFixedStage(stage)) {
      return null;
    }

    if (stage.emailRequired) {
      if (stage.isRequired && stage.allowSkip) {
        return 'Cette étape pourra être ignorée seulement après envoi de l’email requis.';
      }

      if (!stage.isRequired) {
        return 'Même non obligatoire, cette étape ne pourra être ignorée qu’après envoi de l’email requis.';
      }
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
    return STAGE_TYPE_LABELS[type] || type;
  }

  hasAvailableStageTypeForCreation(): boolean {
    return !this.isLockedTemplate() && this.getAvailableSingletonStageTypes().length > 0;
  }

  private normalizeStageForEditor(stage: EditableStage): EditableStage {
    const policy = this.getStageFlagPolicy(stage.stageType);
    const emailAutomatic = policy.supportsEmail ? !!stage.emailAutomatic : false;
    const emailRequired = policy.supportsEmail
      ? (emailAutomatic ? true : !!stage.emailRequired)
      : false;
    const allowSkip = !this.isFixedStage(stage) && stage.isRequired ? !!stage.allowSkip : false;

    return {
      ...stage,
      allowSkip,
      isEliminatory: policy.forcedEliminatory ?? stage.isEliminatory,
      emailRequired,
      emailAutomatic: emailRequired ? emailAutomatic : false
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
    const normalizedStageType = stageType === 'TECHNICAL_TEST' ? 'QUIZ' : stageType;

    switch (normalizedStageType) {
      case 'PRESELECTION':
        return {
          supportsEmail: true,
          emailHint: 'Une pré-sélection refusée clôt déjà la candidature. Les emails pilotent ici les décisions de pré-sélection.',
          locksEliminatory: true,
          forcedEliminatory: true
        };
      case 'INTERVIEW':
        return {
          supportsEmail: true,
          emailHint: 'Les emails pilotent l’invitation d’entretien et le déblocage de l’étape suivante.',
          locksEliminatory: false
        };
      case 'QUIZ':
      case 'EVALUATION':
        return {
          supportsEmail: false,
          emailHint: 'Aucun flux email métier n’est branché pour ce type d’étape aujourd’hui.',
          locksEliminatory: false
        };
      case 'CANDIDATURE':
        return {
          supportsEmail: false,
          locksEliminatory: true,
          forcedEliminatory: false
        };
      case 'DECISION':
        return {
          supportsEmail: true,
          locksEliminatory: true,
          forcedEliminatory: false
        };
      default:
        return {
          supportsEmail: false,
          emailHint: 'Aucun flux email métier n’est branché pour ce type d’étape aujourd’hui.',
          locksEliminatory: false
        };
    }
  }

  getEditableStageTypeOptions(stage: EditableStage): { value: StageType; label: string }[] {
    const usedSingletonTypes = new Set(
      this.stages()
        .filter(existingStage => existingStage !== stage)
        .map(existingStage => existingStage.stageType)
        .filter((stageType): stageType is StageType => this.isSingletonIntermediateStageType(stageType))
    );
    const supported = this.stageTypes.filter(type => this.editableStageTypes.includes(type.value)
      && (!this.isSingletonIntermediateStageType(type.value) || !usedSingletonTypes.has(type.value)));

    if (this.isFixedStage(stage) || supported.some(type => type.value === stage.stageType)) {
      return supported;
    }

    return [
      { value: stage.stageType, label: this.getStageTypeLabel(stage.stageType) },
      ...supported
    ];
  }

  isFixedStage(stage: EditableStage): boolean {
    return stage.stageType === 'CANDIDATURE' || stage.stageType === 'DECISION';
  }

  private getAvailableSingletonStageTypes(): StageType[] {
    const usedTypes = new Set(
      this.stages()
        .map(stage => stage.stageType)
        .filter((stageType): stageType is StageType => this.isSingletonIntermediateStageType(stageType))
    );

    return this.editableStageTypes.filter(stageType => !usedTypes.has(stageType));
  }

  private isSingletonIntermediateStageType(stageType: StageType): boolean {
    return SINGLETON_INTERMEDIATE_STAGE_TYPES.includes(stageType as typeof SINGLETON_INTERMEDIATE_STAGE_TYPES[number]);
  }

  isStageReorderable(stage: EditableStage): boolean {
    return !this.isLockedTemplate() && !this.isFixedStage(stage);
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
    if (this.isLockedTemplate()) {
      this.notificationService.warning('Pipeline verrouillé', 'Ce template est déjà utilisé. Préparez une correction via duplication plutôt qu’en le modifiant directement.');
      return;
    }

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
    const currentStages = this.stages();
    const existingStages = currentStages.filter(s => s.id && !s.isNew);
    const newStages = currentStages.filter(s => s.isNew || !s.id);

    const updates = existingStages.map(stage => this.stageService.update(this.toStagePayload(stage)));
    const creates = newStages.map(stage => this.stageService.create(this.toStagePayload(stage)));

    if (updates.length === 0 && creates.length === 0) {
      this.reorderAndFinish(onSuccess);
      return;
    }

    forkJoin({
      updates: updates.length > 0 ? forkJoin(updates) : of([]),
      creates: creates.length > 0 ? forkJoin(creates) : of([])
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: ({ updates: updateResponses, creates: createResponses }) => {
        const stageError = [...updateResponses, ...createResponses].find(response => response.hasError);
        if (stageError) {
          this.notificationService.error('Pipeline', stageError.status.message || 'Impossible d’enregistrer les étapes du pipeline.');
          this.saving.set(false);
          return;
        }

        if (createResponses.length > 0) {
          this.attachCreatedStageIds(createResponses);
        }

        if (this.stages().some(stage => !stage.id)) {
          this.notificationService.error('Pipeline', 'Impossible de réordonner le pipeline: au moins une étape créée n’a pas retourné d’identifiant.');
          this.saving.set(false);
          return;
        }

        this.reorderAndFinish(onSuccess);
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
      emailRequired: normalizedStage.emailRequired,
      emailAutomatic: normalizedStage.emailAutomatic,
      configJson: this.buildStageConfigJson(normalizedStage),
      pipelineTemplateId: this.templateId
    };
  }

  private attachCreatedStageIds(createResponses: { item?: PipelineStage; items?: PipelineStage[] }[]): void {
    const createdIds = createResponses.map(response => response.item?.id || response.items?.[0]?.id);
    let createdIndex = 0;

    this.stages.update(list => list.map(stage => {
      if (stage.id) {
        return stage;
      }

      const nextId = createdIds[createdIndex++];
      return {
        ...stage,
        id: nextId,
        isNew: false
      };
    }));
  }

  private reorderAndFinish(onSuccess: () => void): void {
    const ids = this.stages().map(stage => stage.id).filter((id): id is number => typeof id === 'number');
    if (ids.length !== this.stages().length) {
      this.notificationService.error('Pipeline', 'Impossible de réordonner le pipeline: certaines étapes ne sont pas encore identifiées par le backend.');
      this.saving.set(false);
      return;
    }

    if (ids.length > 0) {
      this.stageService.reorder(this.templateId, ids)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.hasError) {
              this.notificationService.error('Pipeline', response.status.message || 'Impossible de réordonner les étapes du pipeline.');
              this.saving.set(false);
              return;
            }

            onSuccess();
          },
          error: () => {
            this.notificationService.error('Pipeline', 'Impossible de réordonner les étapes du pipeline.');
            this.saving.set(false);
          }
        });
    } else {
      onSuccess();
    }
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
