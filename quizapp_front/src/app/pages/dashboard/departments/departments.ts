import { Component, OnInit, OnDestroy, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { DepartmentService, Department } from '../../../core/services/department.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

interface DepartmentFormData {
  id?: number;
  nom: string;
  description: string;
}

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './departments.html',
  styleUrls: ['./departments.scss']
})
export class DepartmentsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  departments = signal<Department[]>([]);
  loading = signal(false);
  searchQuery = signal('');
  filterStatus = signal<'all' | 'active' | 'deleted'>('all');

  // Modals
  showCreateEditModal = signal(false);
  showDeleteModal = signal(false);

  // Form
  departmentForm = signal<DepartmentFormData>({ nom: '', description: '' });
  isEditMode = signal(false);
  selectedDepartment = signal<Department | null>(null);

  // Admin mode
  currentUser = computed(() => this.authService.getCurrentUser());
  isAdminModeEnabled = signal(false);

  constructor(
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
    this.loadDepartments();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Computed
  filteredDepartments = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const status = this.filterStatus();
    let filtered = this.departments();

    if (query) {
      filtered = filtered.filter(d =>
        (d.nom || d.name || '').toLowerCase().includes(query) ||
        (d.description || '').toLowerCase().includes(query)
      );
    }

    if (status === 'active') {
      filtered = filtered.filter(d => !d.isDeleted);
    } else if (status === 'deleted') {
      filtered = filtered.filter(d => d.isDeleted);
    }

    return filtered;
  });

  activeCount = computed(() => this.departments().filter(d => !d.isDeleted).length);
  deletedCount = computed(() => this.departments().filter(d => d.isDeleted).length);

  loadDepartments(): void {
    this.loading.set(true);
    this.departmentService.getAllDepartmentsByCriteria({ size: 100, page: 0 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.departments.set(response.items || []);
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Erreur chargement départements:', error);
          this.notificationService.error('Erreur', 'Impossible de charger les départements');
          this.loading.set(false);
        }
      });
  }

  getDepartmentName(dept: Department): string {
    return dept.nom || dept.name || 'Sans nom';
  }

  getDepartmentInitial(dept: Department): string {
    return (dept.nom || dept.name || 'D').charAt(0).toUpperCase();
  }

  // Modal actions
  openCreateModal(): void {
    if (!this.isAdminModeEnabled()) {
      this.notificationService.warning('Accès refusé', 'Le mode admin doit être activé');
      return;
    }
    this.isEditMode.set(false);
    this.departmentForm.set({ nom: '', description: '' });
    this.showCreateEditModal.set(true);
  }

  openEditModal(dept: Department): void {
    if (!this.isAdminModeEnabled()) {
      this.notificationService.warning('Accès refusé', 'Le mode admin doit être activé');
      return;
    }
    this.isEditMode.set(true);
    this.selectedDepartment.set(dept);
    this.departmentForm.set({
      id: dept.id,
      nom: dept.nom || dept.name || '',
      description: dept.description || ''
    });
    this.showCreateEditModal.set(true);
  }

  closeCreateEditModal(): void {
    this.showCreateEditModal.set(false);
    this.selectedDepartment.set(null);
  }

  openDeleteModal(dept: Department): void {
    if (!this.isAdminModeEnabled()) {
      this.notificationService.warning('Accès refusé', 'Le mode admin doit être activé');
      return;
    }
    this.selectedDepartment.set(dept);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.selectedDepartment.set(null);
  }

  saveDepartment(): void {
    const form = this.departmentForm();
    if (!form.nom.trim()) {
      this.notificationService.error('Erreur', 'Le nom du département est obligatoire');
      return;
    }

    this.loading.set(true);

    if (this.isEditMode() && form.id) {
      this.departmentService.update(form.id, {
        nom: form.nom.trim(),
        description: form.description.trim() || null as any
      }).pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.notificationService.success('Succès', 'Département modifié avec succès');
            this.closeCreateEditModal();
            this.loadDepartments();
          },
          error: (error) => {
            console.error('Erreur modification:', error);
            this.notificationService.error('Erreur', 'Impossible de modifier le département');
            this.loading.set(false);
          }
        });
    } else {
      this.departmentService.create({
        nom: form.nom.trim(),
        description: form.description.trim() || null as any
      }).pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.notificationService.success('Succès', 'Département créé avec succès');
            this.closeCreateEditModal();
            this.loadDepartments();
          },
          error: (error) => {
            console.error('Erreur création:', error);
            this.notificationService.error('Erreur', 'Impossible de créer le département');
            this.loading.set(false);
          }
        });
    }
  }

  confirmDelete(): void {
    const dept = this.selectedDepartment();
    if (!dept) return;

    this.loading.set(true);
    this.departmentService.delete(dept.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.success('Succès', 'Département supprimé avec succès');
          this.closeDeleteModal();
          this.loadDepartments();
        },
        error: (error) => {
          console.error('Erreur suppression:', error);
          this.notificationService.error('Erreur', 'Impossible de supprimer le département');
          this.loading.set(false);
        }
      });
  }

  restoreDepartment(dept: Department): void {
    if (!this.isAdminModeEnabled()) {
      this.notificationService.warning('Accès refusé', 'Le mode admin doit être activé');
      return;
    }
    this.departmentService.restore(dept.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.success('Succès', 'Département restauré');
          this.loadDepartments();
        },
        error: (error) => {
          console.error('Erreur restauration:', error);
          this.notificationService.error('Erreur', 'Impossible de restaurer le département');
        }
      });
  }

  updateFormField(field: keyof DepartmentFormData, value: string): void {
    this.departmentForm.update(form => ({ ...form, [field]: value }));
  }
}
