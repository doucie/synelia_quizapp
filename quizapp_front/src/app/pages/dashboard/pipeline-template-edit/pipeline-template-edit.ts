import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { PipelineTemplateService } from '../../../core/services/pipeline-template.service';
import { PipelineStageService } from '../../../core/services/pipeline-stage.service';
import { PipelineTemplate, PipelineStage, StageType } from '../../../core/models/pipeline.interfaces';
import { FilterCheckboxComponent } from '../../../shared/filter-checkbox/filter-checkbox';
import { FilterSelectComponent, FilterSelectOptionDirective } from '../../../shared/filter-select/filter-select';

interface EditableStage {
  id?: number;
  stageLabel: string;
  stageType: StageType;
  stageOrder: number;
  isRequired: boolean;
  isEliminatory: boolean;
  isNew?: boolean;
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

  // drag state
  dragIndex = signal<number | null>(null);
  dragOverIndex = signal<number | null>(null);

  showDeleteStageConfirm = signal(false);
  stageToDeleteIndex = signal<number | null>(null);

  stageTypes: { value: StageType; label: string }[] = [
    { value: 'CANDIDATURE', label: 'Candidature' },
    { value: 'QUIZ', label: 'Quiz' },
    { value: 'PRESELECTION', label: 'Pré-sélection' },
    { value: 'INTERVIEW', label: 'Entretien' },
    { value: 'TECHNICAL_TEST', label: 'Test technique' },
    { value: 'EVALUATION', label: 'Évaluation' },
    { value: 'DECISION', label: 'Décision' },
    { value: 'CUSTOM', label: 'Personnalisé' }
  ];

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
    private stageService: PipelineStageService
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

        const rawStages = (stages.items || []).sort((a, b) => (a.stageOrder || 0) - (b.stageOrder || 0));
        this.stages.set(rawStages.map(s => ({
          id: s.id,
          stageLabel: s.stageLabel || '',
          stageType: (s.stageType || 'CUSTOM') as StageType,
          stageOrder: s.stageOrder || 0,
          isRequired: !!s.isRequired,
          isEliminatory: !!s.isEliminatory,
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
    const current = this.stages();
    const newOrder = current.length > 0 ? Math.max(...current.map(s => s.stageOrder)) + 1 : 1;
    this.stages.update(list => [...list, {
      stageLabel: '',
      stageType: 'CUSTOM' as StageType,
      stageOrder: newOrder,
      isRequired: false,
      isEliminatory: false,
      isNew: true
    }]);
  }

  openDeleteStageConfirm(index: number): void {
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
    const stage = this.stages()[index];

    if (stage.id && !stage.isNew) {
      this.stageService.delete(stage.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
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
    this.stages.update(list => list.map((s, i) => i === index ? { ...s, [field]: value } : s));
  }

  getStageTypeLabel(type: StageType): string {
    return this.stageTypes.find(t => t.value === type)?.label || type;
  }

  // ── Drag & drop ──

  onDragStart(index: number): void {
    this.dragIndex.set(index);
  }

  onDragOver(event: DragEvent, index: number): void {
    event.preventDefault();
    this.dragOverIndex.set(index);
  }

  onDragLeave(): void {
    this.dragOverIndex.set(null);
  }

  onDrop(event: DragEvent, targetIndex: number): void {
    event.preventDefault();
    const fromIndex = this.dragIndex();
    if (fromIndex === null || fromIndex === targetIndex) {
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
    this.saving.set(true);
    const name = this.templateName().trim();
    const desc = this.templateDesc().trim();

    // 1) Update template info
    this.templateService.update({ id: this.templateId, templateName: name, templateDesc: desc || undefined })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.saveStages(),
        error: () => this.saving.set(false)
      });
  }

  private saveStages(): void {
    const stages = this.stages();
    const existingStages = stages.filter(s => s.id && !s.isNew);
    const newStages = stages.filter(s => s.isNew || !s.id);

    // Update existing stages
    const updates = existingStages.map(s => this.stageService.update({
      id: s.id!,
      stageLabel: s.stageLabel,
      stageType: s.stageType,
      stageOrder: s.stageOrder,
      isRequired: s.isRequired,
      isEliminatory: s.isEliminatory,
      pipelineTemplateId: this.templateId
    }));

    // Create new stages
    const creates = newStages.map(s => this.stageService.create({
      stageLabel: s.stageLabel,
      stageType: s.stageType,
      stageOrder: s.stageOrder,
      isRequired: s.isRequired,
      isEliminatory: s.isEliminatory,
      pipelineTemplateId: this.templateId
    }));

    const all = [...updates, ...creates];

    if (all.length === 0) {
      this.reorderAndFinish();
      return;
    }

    forkJoin(all).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.reorderAndFinish(),
      error: () => this.saving.set(false)
    });
  }

  private reorderAndFinish(): void {
    const ids = this.stages().filter(s => s.id).map(s => s.id!);
    if (ids.length > 0) {
      this.stageService.reorder(this.templateId, ids)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => this.onSaveComplete(),
          error: () => this.onSaveComplete()
        });
    } else {
      this.onSaveComplete();
    }
  }

  private onSaveComplete(): void {
    this.saving.set(false);
    // Reload to get server-assigned IDs for new stages
    this.loadTemplate();
  }

  goBack(): void {
    this.router.navigate(['/dashboard/pipeline-templates']);
  }
}
