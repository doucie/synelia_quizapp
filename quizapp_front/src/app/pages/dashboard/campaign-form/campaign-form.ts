import { Component, OnInit, OnDestroy, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, FormControl, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, forkJoin, of } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { CampaignService, Campaign } from '../../../core/services/campaign.service';
import { UserService, User, PagedResponse } from '../../../core/services/user.service';
import { SpecialityService, Speciality } from '../../../core/services/speciality.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { PipelineTemplateService } from '../../../core/services/pipeline-template.service';
import { PipelineStageService } from '../../../core/services/pipeline-stage.service';
import { environment } from '../../../../environments/environment';
import { ApplicationProgressService } from '../../../core/services/application-progress.service';
import { PipelineTemplate, PipelineStage } from '../../../core/models/pipeline.interfaces';
import { FilterCheckboxComponent } from '../../../shared/filter-checkbox/filter-checkbox';
import { FilterSelectComponent, FilterSelectOptionDirective } from '../../../shared/filter-select/filter-select';
import { NotificationService } from '../../../core/services/notification.service';

interface RecruiterAccess {
  user: User;
  canEvaluate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canPlanify: boolean;
  canAcceptPreScreen: boolean;
  canAcceptFinal: boolean;
  follow: boolean;
  isAdmin?: boolean; // Marque si c'est un admin
  isCreator?: boolean; // Marque si c'est le créateur (non supprimable par personne)
}

@Component({
  selector: 'app-campaign-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FilterCheckboxComponent, FilterSelectComponent, FilterSelectOptionDirective],
  templateUrl: './campaign-form.component.html',
  styleUrls: ['./campaign-form.component.scss']
})
export class CampaignFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  campaignForm!: FormGroup;
  campaignId: number | null = null;
  isEditMode = false;
  loading = signal(false);
  saving = signal(false);
  
  // Recruteurs - Recherche instantanée
  recruiterSearchControl = new FormControl('');
  searchResults = signal<User[]>([]);
  selectedRecruiters = signal<RecruiterAccess[]>([]);
  initialRecruiterIds = signal<Set<number>>(new Set());
  showSearchDropdown = signal(false);
  searching = signal(false);
  
  // Spécialités - Recherche instantanée
  specialitySearchControl = new FormControl('');
  specialitySearchResults = signal<Speciality[]>([]);
  selectedSpeciality = signal<Speciality | null>(null);
  showSpecialityDropdown = signal(false);
  searchingSpeciality = signal(false);
  checkingSpecialityAvailability = signal(false);
  hasAvailableSpecialities = signal(true);
  
  // Pipeline templates
  pipelineTemplates = signal<PipelineTemplate[]>([]);
  selectedTemplate = signal<PipelineTemplate | null>(null);
  templateStages = signal<PipelineStage[]>([]);
  loadingTemplates = signal(false);
  
  // Migration modal
  originalTemplateId: number | null = null;
  showMigrationModal = signal(false);
  migratableIds = signal<number[]>([]);
  migrating = signal(false);
  
  // Options
  statusOptions = [
    { value: 'PENDING', label: 'En attente' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'CLOSED', label: 'Fermée' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private campaignService: CampaignService,
    private userService: UserService,
    private specialityService: SpecialityService,
    private authService: AuthService,
    private pipelineTemplateService: PipelineTemplateService,
    private pipelineStageService: PipelineStageService,
    private applicationProgressService: ApplicationProgressService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.setupSearch();
    this.setupSpecialitySearch();
    this.loadSpecialityAvailability();
    this.loadPipelineTemplates();
    
    // Vérifier si on est en mode édition
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['id']) {
        this.campaignId = +params['id'];
        this.isEditMode = true;
        this.loadCampaign(this.campaignId);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm(): void {
    this.campaignForm = this.fb.group({
      campaignTitle: ['', [Validators.required, Validators.minLength(3)]],
      campaignDesc: [''], // Optionnel
      campaignStatus: ['PENDING', Validators.required],
      campaignStart: [''], // Optionnel
      campaignEnd: [''], // Optionnel
      maxApply: [null, [Validators.min(1)]],
      markedOutOf: [null, [Validators.min(1)]],
      formAssignmentStrategy: ['RANDOM'],
      formAssignmentExhaustionPolicy: ['BLOCK'],
      allCanEvaluate: [false],
      specialityId: [null, Validators.required], // Ajout spécialité
      pipelineTemplateId: [null, Validators.required]
    }, { validators: this.dateRangeValidator.bind(this) });
  }

  setupSearch(): void {
    // Recherche instantanée avec debounce
    this.recruiterSearchControl.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300), // Attendre 300ms après la dernière frappe
        distinctUntilChanged(),
        switchMap(query => {
          const searchQuery = (query || '').trim();
          
          if (!environment.production) console.log('🔍 Recherche déclenchée avec:', searchQuery);
          
          if (searchQuery.length < 2) {
            this.searchResults.set([]);
            this.showSearchDropdown.set(false);
            this.searching.set(false);
            return [];
          }
          
          this.searching.set(true);
          
          const criteria = {
            search_string: searchQuery,
            isDeleted: false, // Ne rechercher que les utilisateurs actifs
            size: 20,
            page: 0
          };
          
          if (!environment.production) console.log('📤 Envoi critères de recherche:', criteria);
          
          return this.userService.getAllUsersByCriteria(criteria);
        })
      )
      .subscribe({
        next: (response: any) => {
          if (!environment.production) console.log('📥 Réponse reçue:', response);
          
          if (response && response.content) {
            if (!environment.production) console.log(`✅ ${response.content.length} utilisateurs trouvés`);
            
            // DEBUG: Afficher les rôles des utilisateurs trouvés
            response.content.forEach((u: User, index: number) => {
              if (!environment.production) console.log(`👤 Utilisateur ${index + 1}:`, {
                nom: `${u.firstName} ${u.lastName}`,
                email: u.email,
                role: u.role,
                typeDeRole: typeof u.role
              });
            });
            
            // Filtrer pour garder uniquement les recruteurs, admins et super admins
            const filteredByRole = response.content.filter((u: User) => {
              const roles = ['recruiter', 'admin', 'super'];
              const roleMatch = roles.includes(u.role?.toLowerCase() || '');
              
              if (!roleMatch) {
                if (!environment.production) console.log(`❌ Rôle "${u.role}" non accepté pour ${u.firstName} ${u.lastName}`);
              }
              
              return roleMatch;
            });
            
            if (!environment.production) console.log(`🎯 ${filteredByRole.length} recruteurs/admins après filtrage par rôle`);
            
            // Exclure l'utilisateur connecté de la recherche
            const currentUser = this.authService.getCurrentUser();
            const currentUserId = currentUser ? parseInt(currentUser.id) : null;
            
            const filteredWithoutCurrentUser = filteredByRole.filter((u: User) => {
              const isCurrentUser = currentUserId && u.id === currentUserId;
              if (isCurrentUser) {
                if (!environment.production) console.log(`🚫 Utilisateur connecté exclu: ${u.firstName} ${u.lastName}`);
              }
              return !isCurrentUser;
            });
            
            if (!environment.production) console.log(`👤 ${filteredWithoutCurrentUser.length} utilisateurs après exclusion de l'utilisateur connecté`);
            
            // Filtrer les utilisateurs déjà sélectionnés
            const selectedIds = this.selectedRecruiters().map(r => r.user.id);
            const filteredUsers = filteredWithoutCurrentUser.filter((u: User) => !selectedIds.includes(u.id));
            
            if (!environment.production) console.log(`👥 ${filteredUsers.length} utilisateurs après exclusion des déjà sélectionnés`);
            
            // Debug: vérifier les données des utilisateurs
            if (filteredUsers.length > 0) {
              if (!environment.production) console.log('📋 Premier utilisateur:', {
                id: filteredUsers[0].id,
                email: filteredUsers[0].email,
                firstName: filteredUsers[0].firstName,
                lastName: filteredUsers[0].lastName,
                role: filteredUsers[0].role,
                username: filteredUsers[0].username
              });
            }
            
            this.searchResults.set(filteredUsers);
            this.showSearchDropdown.set(filteredUsers.length > 0);
          } else {
            console.warn('⚠️ Réponse vide ou mal formatée');
          }
          this.searching.set(false);
        },
        error: (error: any) => {
          console.error('❌ Erreur recherche utilisateurs:', error);
          this.searching.set(false);
        }
      });
  }

  setupSpecialitySearch(): void {
    // Recherche instantanée de spécialités avec debounce
    this.specialitySearchControl.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(query => {
          const searchQuery = (query || '').trim();
          
          if (!environment.production) console.log('🔍 Recherche spécialité:', searchQuery);
          
          if (searchQuery.length < 2) {
            this.specialitySearchResults.set([]);
            this.showSpecialityDropdown.set(false);
            this.searchingSpeciality.set(false);
            return [];
          }
          
          this.searchingSpeciality.set(true);
          
          return this.specialityService.getAll({
            search_string: searchQuery,
            isDeleted: false,
            size: 20,
            page: 0
          });
        })
      )
      .subscribe({
        next: (response: any) => {
          if (!environment.production) console.log('📥 Spécialités reçues:', response);
          
          // La réponse du backend contient 'items' et non 'content'
          if (response && response.items) {
            if (!environment.production) console.log(`✅ ${response.items.length} spécialités trouvées`);
            this.specialitySearchResults.set(response.items);
            this.showSpecialityDropdown.set(response.items.length > 0);
          } else {
            if (!environment.production) console.log('⚠️ Aucune spécialité dans la réponse');
            this.specialitySearchResults.set([]);
            this.showSpecialityDropdown.set(false);
          }
          this.searchingSpeciality.set(false);
        },
        error: (error: any) => {
          console.error('❌ Erreur recherche spécialités:', error);
          this.specialitySearchResults.set([]);
          this.showSpecialityDropdown.set(false);
          this.searchingSpeciality.set(false);
        }
      });
  }

  selectSpeciality(speciality: Speciality): void {
    this.selectedSpeciality.set(speciality);
    this.campaignForm.patchValue({ specialityId: speciality.id });
    
    // Réinitialiser la recherche
    this.specialitySearchControl.setValue('', { emitEvent: false });
    this.specialitySearchResults.set([]);
    this.showSpecialityDropdown.set(false);
    
    if (!environment.production) console.log('✅ Spécialité sélectionnée:', speciality);
  }

  removeSpeciality(): void {
    this.selectedSpeciality.set(null);
    this.campaignForm.patchValue({ specialityId: null });
  }

  loadSpecialityAvailability(): void {
    this.checkingSpecialityAvailability.set(true);
    this.specialityService.getAll({ isDeleted: false, size: 1, page: 0 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const totalElements = response.totalElements || response.items.length;
          this.hasAvailableSpecialities.set(totalElements > 0);
          this.checkingSpecialityAvailability.set(false);
        },
        error: () => {
          this.hasAvailableSpecialities.set(true);
          this.checkingSpecialityAvailability.set(false);
        }
      });
  }

  openSpecialities(): void {
    this.router.navigate(['/dashboard/specialities']);
  }

  // ── Pipeline Template ──────────────────────────────

  loadPipelineTemplates(): void {
    this.loadingTemplates.set(true);
    this.pipelineTemplateService.getAllByCriteria({ isActive: true, isDeleted: false, size: 100 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.pipelineTemplates.set(response.content || []);
          // En mode création, pré-sélectionner le template par défaut
          if (!this.isEditMode) {
            const defaultTemplate = response.content.find(t => t.isDefault);
            if (defaultTemplate) {
              this.selectTemplate(defaultTemplate);
            }
          }
          this.loadingTemplates.set(false);
        },
        error: () => this.loadingTemplates.set(false)
      });
  }

  selectTemplate(template: PipelineTemplate): void {
    this.selectedTemplate.set(template);
    this.campaignForm.patchValue({ pipelineTemplateId: template.id });
    // Charger les étapes du template
    if (template.id) {
      this.pipelineStageService.getByTemplate(template.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            const stages = (response.items || []).sort((a, b) => (a.stageOrder || 0) - (b.stageOrder || 0));
            this.templateStages.set(stages);
          },
          error: () => this.templateStages.set([])
        });
    }
  }

  onTemplateSelectChange(value: string | number | boolean | null): void {
    this.campaignForm.get('pipelineTemplateId')?.markAsTouched();
    if (value == null || typeof value === 'boolean') return;
    const templateId = typeof value === 'string' ? parseInt(value) : value;
    const template = this.pipelineTemplates().find(t => t.id === templateId);
    if (template) {
      // En mode édition avec un template différent → vérifier les candidats migrables
      if (this.isEditMode && this.originalTemplateId && this.originalTemplateId !== templateId && this.campaignId) {
        this.applicationProgressService.getMigratableCandidates(this.campaignId, templateId)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (result) => {
              if (result.count > 0) {
                this.migratableIds.set(result.migratableApplicationIds);
                this.showMigrationModal.set(true);
              }
              this.selectTemplate(template);
            },
            error: () => this.selectTemplate(template)
          });
      } else {
        this.selectTemplate(template);
      }
    }
  }

  // ── Migration modal actions ──────────────────────

  migrateAllCandidates(): void {
    const ids = this.migratableIds();
    const newTemplateId = this.selectedTemplate()?.id;
    if (!ids.length || !newTemplateId) return;

    this.migrating.set(true);
    this.applicationProgressService.migrateMultipleCandidates(ids, newTemplateId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.migrating.set(false);
          this.showMigrationModal.set(false);
          this.migratableIds.set([]);
        },
        error: () => {
          this.migrating.set(false);
          this.showMigrationModal.set(false);
        }
      });
  }

  skipMigration(): void {
    this.showMigrationModal.set(false);
    this.migratableIds.set([]);
  }

  customizeTemplate(): void {
    const template = this.selectedTemplate();
    if (!template?.id) return;
    const confirmed = window.confirm(
      'Vous allez être redirigé vers l\'éditeur de pipeline. Les données non sauvegardées du formulaire seront perdues. Continuer ?'
    );
    if (!confirmed) return;
    const campaignTitle = this.campaignForm.get('campaignTitle')?.value || 'Campagne';
    const customName = `${campaignTitle} - Custom`;
    this.pipelineTemplateService.duplicate(template.id, customName)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const newTemplate = response.items?.[0] || response.item;
          if (newTemplate?.id) {
            this.selectTemplate(newTemplate);
            // Ouvrir l'éditeur dans un nouvel onglet
            this.router.navigate(['/dashboard/pipeline-templates', newTemplate.id]);
          }
        }
      });
  }

  selectRecruiter(user: User): void {
    const recruiterAccess: RecruiterAccess = {
      user,
      canEvaluate: true,  // Coché par défaut
      canUpdate: false,   // Décoché par défaut
      canDelete: false,   // Décoché par défaut
      canPlanify: false,  // Décoché par défaut
      canAcceptPreScreen: false, // Décoché par défaut
      canAcceptFinal: false,     // Décoché par défaut
      follow: true
    };
    
    this.selectedRecruiters.update(recruiters => [...recruiters, recruiterAccess]);
    
    // Réinitialiser la recherche
    this.recruiterSearchControl.setValue('', { emitEvent: false });
    this.searchResults.set([]);
    this.showSearchDropdown.set(false);
  }

  removeRecruiter(index: number): void {
    this.selectedRecruiters.update(recruiters => 
      recruiters.filter((_, i) => i !== index)
    );
  }

  toggleRecruiterAccess(index: number, field: 'canEvaluate' | 'canUpdate' | 'canDelete' | 'canPlanify' | 'canAcceptPreScreen' | 'canAcceptFinal', nextValue?: boolean): void {
    this.selectedRecruiters.update(recruiters => {
      const updated = [...recruiters];
      updated[index] = {
        ...updated[index],
        [field]: typeof nextValue === 'boolean' ? nextValue : !updated[index][field]
      };
      return updated;
    });
  }

  toggleAdmin(index: number, nextValue?: boolean): void {
    this.selectedRecruiters.update(recruiters => {
      const updated = [...recruiters];
      const newAdminStatus = typeof nextValue === 'boolean' ? nextValue : !updated[index].isAdmin;
      
      updated[index] = {
        ...updated[index],
        isAdmin: newAdminStatus,
        // Si on coche Admin, tous les droits sont activés automatiquement
        ...(newAdminStatus ? {
          canEvaluate: true,
          canUpdate: true,
          canDelete: true,
          canPlanify: true,
          canAcceptPreScreen: true,
          canAcceptFinal: true
        } : {})
      };
      return updated;
    });
  }

  loadCampaign(id: number): void {
    this.loading.set(true);
    
    this.campaignService.getCampaignById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (campaign) => {
          if (!environment.production) console.log('📥 Campagne chargée:', campaign);
          this.populateForm(campaign);
          this.loadCampaignRecruiters(id);
          
          // Charger la spécialité si elle existe
          const specialityId = campaign.specialityId;
          if (specialityId) {
            if (!environment.production) console.log('🔍 Chargement de la spécialité ID:', specialityId);
            this.loadSpeciality(specialityId);
          }
          
          this.loading.set(false);
        },
        error: (error) => {
          console.error('❌ Erreur chargement campagne:', error);
          this.loading.set(false);
        }
      });
  }

  loadSpeciality(id: number): void {
    this.specialityService.getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (speciality: Speciality) => {
          if (!environment.production) console.log('✅ Spécialité chargée:', speciality);
          this.selectedSpeciality.set(speciality);
          this.campaignForm.patchValue({ specialityId: speciality.id });
        },
        error: (error: any) => {
          console.error('❌ Erreur chargement spécialité:', error);
        }
      });
  }

  loadCampaignRecruiters(campaignId: number): void {
    if (!environment.production) console.log('👥 Chargement des recruteurs pour la campagne:', campaignId);
    
    this.campaignService.getCampaignAccess(campaignId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (accessItems) => {
          if (!environment.production) console.log('📥 Accès recruteurs reçus:', accessItems);
          
          // Inclure TOUS les utilisateurs (créateur, admins et recruteurs)
          const recruiters: RecruiterAccess[] = accessItems.map((access: any) => {
            if (!environment.production) console.log('🔍 Mapping access:', access);
            return {
              user: {
                id: access.userId,
                userName: access.userName || 'Utilisateur',
                firstName: access.userFirstName || '',
                lastName: access.userLastName || '',
                email: access.userEmail || '',
                role: access.userRole || 'RECRUITER',
                isOnline: false
              },
              canEvaluate: access.canEvaluate || false,
              canUpdate: access.canUpdate || false,
              canDelete: access.canDelete || false,
              canPlanify: access.canPlanify || false,
              canAcceptPreScreen: access.canAcceptPreScreen || false,
              canAcceptFinal: access.canAcceptFinal || false,
              follow: access.follow ?? true,
              isAdmin: access.isAdmin || false,
              isCreator: access.isCreator || false // Marquer si c'est le créateur
            };
          });
          
          if (!environment.production) console.log('✅ Recruteurs chargés (incluant admin):', recruiters);
          this.selectedRecruiters.set(recruiters);
          this.initialRecruiterIds.set(new Set(recruiters.filter(recruiter => !recruiter.isCreator).map(recruiter => recruiter.user.id)));
        },
        error: (error) => {
          console.error('❌ Erreur chargement recruteurs:', error);
        }
      });
  }

  populateForm(campaign: Campaign): void {
    this.campaignForm.patchValue({
      campaignTitle: campaign.campaignTitle,
      campaignDesc: campaign.campaignDesc,
      campaignStatus: campaign.campaignStatus,
      campaignStart: this.formatDateForInput(campaign.campaignStart),
      campaignEnd: this.formatDateForInput(campaign.campaignEnd),
      maxApply: campaign.maxApply,
      markedOutOf: campaign.markedOutOf,
      formAssignmentStrategy: campaign.formAssignmentStrategy || 'RANDOM',
      formAssignmentExhaustionPolicy: campaign.formAssignmentExhaustionPolicy || 'BLOCK',
      allCanEvaluate: campaign.allCanEvaluate,
      pipelineTemplateId: campaign.pipelineTemplateId
    });

    // Charger le template sélectionné
    if (campaign.pipelineTemplateId) {
      this.originalTemplateId = campaign.pipelineTemplateId;
      const found = this.pipelineTemplates().find(t => t.id === campaign.pipelineTemplateId);
      if (found) {
        this.selectTemplate(found);
      } else {
        // Le template n'est pas encore chargé, attendre le chargement
        const checkInterval = setInterval(() => {
          const templates = this.pipelineTemplates();
          if (templates.length > 0) {
            clearInterval(checkInterval);
            const t = templates.find(t => t.id === campaign.pipelineTemplateId);
            if (t) this.selectTemplate(t);
          }
        }, 200);
        setTimeout(() => clearInterval(checkInterval), 5000);
      }
    }
  }

  formatDateForInput(date?: string): string {
    if (!date) return '';
    
    // Vérifier si la date est valide
    const d = new Date(date);
    
    // isNaN vérifie si la date est invalide (Invalid Date)
    if (isNaN(d.getTime())) {
      console.warn('⚠️ Date invalide détectée:', date);
      return '';
    }
    
    return d.toISOString().split('T')[0];
  }

  onSubmit(): void {
    if (this.campaignForm.invalid) {
      this.markFormGroupTouched(this.campaignForm);
      if (!environment.production) {
        const invalidControls = Object.entries(this.campaignForm.controls)
          .filter(([, c]) => c.invalid)
          .map(([key, c]) => `${key}: ${JSON.stringify(c.errors)}`);
        console.warn('⚠️ Formulaire invalide —', invalidControls);
      }
      return;
    }

    this.saving.set(true);

    const formValue = this.campaignForm.value;
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      console.error('❌ Utilisateur non connecté');
      this.notificationService.error('Erreur', 'Session expirée. Veuillez vous reconnecter.');
      this.saving.set(false);
      return;
    }

    const campaignData: Partial<Campaign> = {
      campaignTitle: formValue.campaignTitle,
      campaignDesc: formValue.campaignDesc,
      campaignStatus: formValue.campaignStatus,
      campaignStart: formValue.campaignStart,
      campaignEnd: formValue.campaignEnd,
      maxApply: formValue.maxApply,
      markedOutOf: formValue.markedOutOf,
      formAssignmentStrategy: formValue.formAssignmentStrategy,
      formAssignmentExhaustionPolicy: formValue.formAssignmentExhaustionPolicy,
      allCanEvaluate: formValue.allCanEvaluate,
      specialityId: formValue.specialityId,
      pipelineTemplateId: formValue.pipelineTemplateId,
      createdBy: parseInt(currentUser.id)
    };

    const operation$ = this.isEditMode && this.campaignId
      ? this.campaignService.updateCampaign(this.campaignId, campaignData)
      : this.campaignService.createCampaign(campaignData);

    operation$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        if (!environment.production) console.log('✅ Réponse campagne:', response);
        
        // Extraire l'ID de la campagne créée
        let campaignId: number | null = null;
        
        if (response.items && response.items.length > 0) {
          campaignId = response.items[0].id;
        } else if (response.id) {
          campaignId = response.id;
        }
        
        if (campaignId) {
          if (!environment.production) console.log('📝 Campagne créée avec ID:', campaignId);
          
      this.saveCampaignAccessAndNotifications(campaignId, parseInt(currentUser.id)).subscribe({
        next: () => {
          if (!environment.production) console.log('✅ Tous les accès et notifications sont synchronisés');
          this.saving.set(false);
          this.router.navigate(['/dashboard/campaigns']);
        },
        error: (error) => {
          console.error('❌ Erreur lors de la sauvegarde des accès:', error);
          this.saving.set(false);
          this.router.navigate(['/dashboard/campaigns']);
        }
      });
        } else {
          console.error('❌ Impossible de récupérer l\'ID de la campagne');
          this.saving.set(false);
          this.router.navigate(['/dashboard/campaigns']);
        }
      },
      error: (error) => {
        console.error('❌ Erreur sauvegarde campagne:', error);
        this.notificationService.error('Erreur', 'Impossible de sauvegarder la campagne. Vérifiez votre connexion et réessayez.');
        this.saving.set(false);
      }
    });
  }

  saveCampaignAccessAndNotifications(campaignId: number, currentUserId: number) {
    if (!environment.production) console.log('💾 Sauvegarde des accès recruteurs et notifications pour campagne:', campaignId);
    
    const recruiters = this.selectedRecruiters();
    const allAccessData: any[] = [];
    const notificationObservables: any[] = [];

    // 1. Ajouter le créateur avec tous les droits (is_admin = true)
    const creatorAccess = {
      campaignId,
      userId: currentUserId,
      canEvaluate: true,
      canUpdate: true,
      canDelete: true,
      canPlanify: true,
      canAcceptPreScreen: true,
      canAcceptFinal: true,
      isAdmin: true,
      follow: true, // Le créateur suit automatiquement sa campagne
      createdBy: currentUserId
      // searchString sera généré automatiquement par le backend
    };
    allAccessData.push(creatorAccess);
    if (!environment.production) console.log('👑 Créateur ajouté avec tous les droits:', creatorAccess);
    
    const initialRecruiterIds = this.initialRecruiterIds();

    // 2. Ajouter les recruteurs sélectionnés (is_admin = false)
    recruiters.forEach(recruiter => {
      if (recruiter.user.id === currentUserId || recruiter.isCreator) {
        return;
      }

      const accessData = {
        campaignId,
        userId: recruiter.user.id,
        canEvaluate: recruiter.canEvaluate,
        canUpdate: recruiter.canUpdate,
        canDelete: recruiter.canDelete,
        canPlanify: recruiter.canPlanify,
        canAcceptPreScreen: recruiter.canAcceptPreScreen,
        canAcceptFinal: recruiter.canAcceptFinal,
        isAdmin: false,
        follow: recruiter.follow,
        createdBy: currentUserId
        // searchString sera généré automatiquement par le backend
      };
      allAccessData.push(accessData);
      
      const shouldNotify = !this.isEditMode || !initialRecruiterIds.has(recruiter.user.id);
      if (shouldNotify) {
        // 3. Créer une notification pour chaque nouveau recruteur (sauf le créateur)
        const notificationData = {
          notifType: 'ADDED_TO_CAMPAIGN',
          notifActor: currentUserId,
          notifLink: `/dashboard/campaigns/${campaignId}`,
          isRead: false,
          createdBy: 1,
          userId: recruiter.user.id,
          objectTableName: 'campaigns',
          objectTableId: campaignId
        };

        notificationObservables.push(
          this.campaignService.createNotification(notificationData)
        );

        if (!environment.production) console.log('📬 Notification créée:', notificationData);
      }
      
      if (!environment.production) console.log('👤 Recruteur ajouté:', accessData);
    });
    
    // 4. Sauvegarder tous les accès et notifications en parallèle et attendre qu'ils soient tous terminés
    const saveAccess$ = this.campaignService.saveCampaignAccess(allAccessData);
    const allOperations = [saveAccess$, ...notificationObservables];
    
    return forkJoin(allOperations.length > 0 ? allOperations : [of(null)]);
  }

  cancel(): void {
    this.router.navigate(['/dashboard/campaigns']);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Getters pour faciliter l'accès aux contrôles du formulaire
  get campaignTitle() { return this.campaignForm.get('campaignTitle'); }
  get campaignDesc() { return this.campaignForm.get('campaignDesc'); }
  get campaignStatus() { return this.campaignForm.get('campaignStatus'); }
  get campaignStart() { return this.campaignForm.get('campaignStart'); }
  get campaignEnd() { return this.campaignForm.get('campaignEnd'); }
  get maxApply() { return this.campaignForm.get('maxApply'); }
  get markedOutOf() { return this.campaignForm.get('markedOutOf'); }
  get formAssignmentStrategy() { return this.campaignForm.get('formAssignmentStrategy'); }
  get formAssignmentExhaustionPolicy() { return this.campaignForm.get('formAssignmentExhaustionPolicy'); }
  get allCanEvaluate() { return this.campaignForm.get('allCanEvaluate'); }

  private dateRangeValidator(group: AbstractControl): ValidationErrors | null {
    const start = group.get('campaignStart')?.value;
    const end = group.get('campaignEnd')?.value;
    if (start && end && new Date(end) < new Date(start)) {
      return { dateRange: true };
    }
    return null;
  }
}
