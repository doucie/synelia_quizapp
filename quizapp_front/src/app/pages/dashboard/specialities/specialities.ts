import { Component, OnInit, OnDestroy, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { SpecialityService, Speciality } from '../../../core/services/speciality.service';
import { DepartmentService, Department } from '../../../core/services/department.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { FilterSelectComponent, FilterSelectOptionDirective } from '../../../shared/filter-select/filter-select';

interface SpecialityFormData {
  id?: number;
  nom: string;
  description: string;
  departmentId?: number;
}

@Component({
  selector: 'app-specialities',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterSelectComponent, FilterSelectOptionDirective],
  templateUrl: './specialities.html',
  styleUrls: ['./specialities.scss']
})
export class SpecialitiesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  specialities = signal<Speciality[]>([]);
  departments = signal<Department[]>([]);
  loading = signal(false);
  searchQuery = signal('');
  filterStatus = signal<'all' | 'active' | 'deleted'>('all');
  filterDepartment = signal<number | null>(null);

  // Modals
  showCreateEditModal = signal(false);
  showDeleteModal = signal(false);

  // Form
  specialityForm = signal<SpecialityFormData>({ nom: '', description: '' });
  isEditMode = signal(false);
  selectedSpeciality = signal<Speciality | null>(null);

  // Admin mode
  currentUser = computed(() => this.authService.getCurrentUser());
  isAdminModeEnabled = signal(false);

  constructor(
    private specialityService: SpecialityService,
    private departmentService: DepartmentService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    effect(() => {
      const user = this.currentUser();
      this.isAdminModeEnabled.set(user?.adminMode || false);
    });
  }

  ngOnInit(): void {
    this.loadSpecialities();
    this.loadDepartments();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Computed
  filteredSpecialities = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const status = this.filterStatus();
    const deptId = this.filterDepartment();
    let filtered = this.specialities();

    if (query) {
      filtered = filtered.filter(s =>
        (s.nom || s.name || '').toLowerCase().includes(query) ||
        (s.description || '').toLowerCase().includes(query) ||
        (s.departmentName || '').toLowerCase().includes(query)
      );
    }

    if (status === 'active') {
      filtered = filtered.filter(s => !s.isDeleted);
    } else if (status === 'deleted') {
      filtered = filtered.filter(s => s.isDeleted);
    }

    if (deptId) {
      filtered = filtered.filter(s => s.departmentId === deptId);
    }

    return filtered;
  });

  activeCount = computed(() => this.specialities().filter(s => !s.isDeleted).length);
  deletedCount = computed(() => this.specialities().filter(s => s.isDeleted).length);

  loadSpecialities(): void {
    this.loading.set(true);
    this.specialityService.getAll({ size: 100, page: 0 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.specialities.set(response.items || []);
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Erreur chargement spécialités:', error);
          this.notificationService.error('Erreur', 'Impossible de charger les spécialités');
          this.loading.set(false);
        }
      });
  }

  loadDepartments(): void {
    this.departmentService.getAllDepartmentsByCriteria({ size: 100, page: 0, isDeleted: false })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.departments.set(response.items || []);
        },
        error: (error) => {
          console.error('Erreur chargement départements:', error);
        }
      });
  }

  getSpecialityName(spec: Speciality): string {
    return spec.nom || spec.name || spec.specialityName || 'Sans nom';
  }

  getSpecialityInitial(spec: Speciality): string {
    return (spec.nom || spec.name || spec.specialityName || 'S').charAt(0).toUpperCase();
  }

  getDepartmentNameById(deptId?: number): string {
    if (!deptId) return 'Non assigné';
    const dept = this.departments().find(d => d.id === deptId);
    return dept?.nom || dept?.name || 'Inconnu';
  }

  // Modal actions
  openCreateModal(): void {
    if (!this.isAdminModeEnabled()) {
      this.notificationService.warning('Accès refusé', 'Le mode admin doit être activé');
      return;
    }
    this.isEditMode.set(false);
    this.specialityForm.set({ nom: '', description: '' });
    this.showCreateEditModal.set(true);
  }

  openEditModal(spec: Speciality): void {
    if (!this.isAdminModeEnabled()) {
      this.notificationService.warning('Accès refusé', 'Le mode admin doit être activé');
      return;
    }
    this.isEditMode.set(true);
    this.selectedSpeciality.set(spec);
    this.specialityForm.set({
      id: spec.id,
      nom: spec.nom || spec.name || spec.specialityName || '',
      description: spec.description || '',
      departmentId: spec.departmentId
    });
    this.showCreateEditModal.set(true);
  }

  closeCreateEditModal(): void {
    this.showCreateEditModal.set(false);
    this.selectedSpeciality.set(null);
  }

  openDeleteModal(spec: Speciality): void {
    if (!this.isAdminModeEnabled()) {
      this.notificationService.warning('Accès refusé', 'Le mode admin doit être activé');
      return;
    }
    this.selectedSpeciality.set(spec);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.selectedSpeciality.set(null);
  }

  saveSpeciality(): void {
    const form = this.specialityForm();
    if (!form.nom.trim()) {
      this.notificationService.error('Erreur', 'Le nom de la spécialité est obligatoire');
      return;
    }

    this.loading.set(true);

    if (this.isEditMode() && form.id) {
      this.specialityService.update(form.id, {
        nom: form.nom.trim(),
        description: form.description.trim() || null as any,
        departmentId: form.departmentId
      }).pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.notificationService.success('Succès', 'Spécialité modifiée avec succès');
            this.closeCreateEditModal();
            this.loadSpecialities();
          },
          error: (error) => {
            console.error('Erreur modification:', error);
            this.notificationService.error('Erreur', 'Impossible de modifier la spécialité');
            this.loading.set(false);
          }
        });
    } else {
      this.specialityService.create({
        nom: form.nom.trim(),
        description: form.description.trim() || null as any,
        departmentId: form.departmentId
      }).pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.notificationService.success('Succès', 'Spécialité créée avec succès');
            this.closeCreateEditModal();
            this.loadSpecialities();
          },
          error: (error) => {
            console.error('Erreur création:', error);
            this.notificationService.error('Erreur', 'Impossible de créer la spécialité');
            this.loading.set(false);
          }
        });
    }
  }

  confirmDelete(): void {
    const spec = this.selectedSpeciality();
    if (!spec) return;

    this.loading.set(true);
    this.specialityService.delete(spec.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.success('Succès', 'Spécialité supprimée avec succès');
          this.closeDeleteModal();
          this.loadSpecialities();
        },
        error: (error) => {
          console.error('Erreur suppression:', error);
          this.notificationService.error('Erreur', 'Impossible de supprimer la spécialité');
          this.loading.set(false);
        }
      });
  }

  restoreSpeciality(spec: Speciality): void {
    if (!this.isAdminModeEnabled()) {
      this.notificationService.warning('Accès refusé', 'Le mode admin doit être activé');
      return;
    }
    this.specialityService.restore(spec.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.success('Succès', 'Spécialité restaurée');
          this.loadSpecialities();
        },
        error: (error) => {
          console.error('Erreur restauration:', error);
          this.notificationService.error('Erreur', 'Impossible de restaurer la spécialité');
        }
      });
  }

  updateFormField(field: keyof SpecialityFormData, value: any): void {
    this.specialityForm.update(form => ({ ...form, [field]: value }));
  }
}
