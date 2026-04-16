import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { PipelineTemplateService } from '../../../core/services/pipeline-template.service';
import { PipelineStageService } from '../../../core/services/pipeline-stage.service';
import { PipelineTemplate, PipelineStage } from '../../../core/models/pipeline.interfaces';

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
    this.templateService.create({ templateName: name, templateDesc: this.createDesc().trim() || undefined })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.showCreateModal.set(false);
          // Naviguer vers l'éditeur du nouveau template
          const newId = res?.item?.id || res?.items?.[0]?.id;
          if (newId) {
            this.router.navigate(['/dashboard/pipeline-templates', newId, 'edit']);
          } else {
            this.loadTemplates();
          }
        },
        error: () => this.loadTemplates()
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
        next: () => {
          this.showDuplicateModal.set(false);
          this.loadTemplates();
        },
        error: () => this.loadTemplates()
      });
  }

  openSetDefaultConfirm(event: Event, template: PipelineTemplate): void {
    event.stopPropagation();
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
        next: () => {
          this.showDefaultConfirm.set(false);
          this.loadTemplates();
        },
        error: () => this.loadTemplates()
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
        next: () => {
          this.showDeleteConfirm.set(false);
          this.loadTemplates();
        },
        error: () => this.loadTemplates()
      });
  }

  formatDate(date?: string): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' });
  }
}
