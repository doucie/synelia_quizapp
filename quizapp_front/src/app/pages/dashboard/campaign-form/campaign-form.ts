import { Component, OnInit, OnDestroy, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, forkJoin, of } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { CampaignService, Campaign } from '../../../core/services/campaign.service';
import { UserService, User, PagedResponse } from '../../../core/services/user.service';
import { SpecialityService, Speciality } from '../../../core/services/speciality.service';
import { AuthService } from '../../../core/services/auth/auth.service';

interface RecruiterAccess {
  user: User;
  canEvaluate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canPlanify: boolean;
  canAcceptPreScreen: boolean;
  canAcceptFinal: boolean;
}

@Component({
  selector: 'app-campaign-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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
  showSearchDropdown = signal(false);
  searching = signal(false);
  
  // Spécialités - Recherche instantanée
  specialitySearchControl = new FormControl('');
  specialitySearchResults = signal<Speciality[]>([]);
  selectedSpeciality = signal<Speciality | null>(null);
  showSpecialityDropdown = signal(false);
  searchingSpeciality = signal(false);
  
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
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.setupSearch();
    this.setupSpecialitySearch();
    
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
      allCanEvaluate: [false],
      specialityId: [null, Validators.required] // Ajout spécialité
    });
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
          
          console.log('🔍 Recherche déclenchée avec:', searchQuery);
          
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
          
          console.log('📤 Envoi critères de recherche:', criteria);
          
          return this.userService.getAllUsersByCriteria(criteria);
        })
      )
      .subscribe({
        next: (response: any) => {
          console.log('📥 Réponse reçue:', response);
          
          if (response && response.content) {
            console.log(`✅ ${response.content.length} utilisateurs trouvés`);
            
            // DEBUG: Afficher les rôles des utilisateurs trouvés
            response.content.forEach((u: User, index: number) => {
              console.log(`👤 Utilisateur ${index + 1}:`, {
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
                console.log(`❌ Rôle "${u.role}" non accepté pour ${u.firstName} ${u.lastName}`);
              }
              
              return roleMatch;
            });
            
            console.log(`🎯 ${filteredByRole.length} recruteurs/admins après filtrage par rôle`);
            
            // Exclure l'utilisateur connecté de la recherche
            const currentUser = this.authService.getCurrentUser();
            const currentUserId = currentUser ? parseInt(currentUser.id) : null;
            
            const filteredWithoutCurrentUser = filteredByRole.filter((u: User) => {
              const isCurrentUser = currentUserId && u.id === currentUserId;
              if (isCurrentUser) {
                console.log(`🚫 Utilisateur connecté exclu: ${u.firstName} ${u.lastName}`);
              }
              return !isCurrentUser;
            });
            
            console.log(`👤 ${filteredWithoutCurrentUser.length} utilisateurs après exclusion de l'utilisateur connecté`);
            
            // Filtrer les utilisateurs déjà sélectionnés
            const selectedIds = this.selectedRecruiters().map(r => r.user.id);
            const filteredUsers = filteredWithoutCurrentUser.filter((u: User) => !selectedIds.includes(u.id));
            
            console.log(`👥 ${filteredUsers.length} utilisateurs après exclusion des déjà sélectionnés`);
            
            // Debug: vérifier les données des utilisateurs
            if (filteredUsers.length > 0) {
              console.log('📋 Premier utilisateur:', {
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
          
          console.log('🔍 Recherche spécialité:', searchQuery);
          
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
          console.log('📥 Spécialités reçues:', response);
          
          // La réponse du backend contient 'items' et non 'content'
          if (response && response.items) {
            console.log(`✅ ${response.items.length} spécialités trouvées`);
            this.specialitySearchResults.set(response.items);
            this.showSpecialityDropdown.set(response.items.length > 0);
          } else {
            console.log('⚠️ Aucune spécialité dans la réponse');
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
    
    console.log('✅ Spécialité sélectionnée:', speciality);
  }

  removeSpeciality(): void {
    this.selectedSpeciality.set(null);
    this.campaignForm.patchValue({ specialityId: null });
  }

  selectRecruiter(user: User): void {
    const recruiterAccess: RecruiterAccess = {
      user,
      canEvaluate: true,  // Coché par défaut
      canUpdate: false,   // Décoché par défaut
      canDelete: false,   // Décoché par défaut
      canPlanify: false,  // Décoché par défaut
      canAcceptPreScreen: false, // Décoché par défaut
      canAcceptFinal: false      // Décoché par défaut
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

  toggleRecruiterAccess(index: number, field: 'canEvaluate' | 'canUpdate' | 'canDelete' | 'canPlanify' | 'canAcceptPreScreen' | 'canAcceptFinal'): void {
    this.selectedRecruiters.update(recruiters => {
      const updated = [...recruiters];
      updated[index] = {
        ...updated[index],
        [field]: !updated[index][field]
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
          console.log('📥 Campagne chargée:', campaign);
          this.populateForm(campaign);
          this.loadCampaignRecruiters(id);
          
          // Charger la spécialité si elle existe
          const specialityId = campaign.specialitiesId || campaign.specialityId;
          if (specialityId) {
            console.log('🔍 Chargement de la spécialité ID:', specialityId);
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
          console.log('✅ Spécialité chargée:', speciality);
          this.selectedSpeciality.set(speciality);
          this.campaignForm.patchValue({ specialityId: speciality.id });
        },
        error: (error: any) => {
          console.error('❌ Erreur chargement spécialité:', error);
        }
      });
  }

  loadCampaignRecruiters(campaignId: number): void {
    console.log('👥 Chargement des recruteurs pour la campagne:', campaignId);
    
    this.campaignService.getCampaignAccess(campaignId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (accessItems) => {
          console.log('📥 Accès recruteurs reçus:', accessItems);
          
          // Filtrer pour ne garder que les non-admins (les recruteurs assignés)
          const recruiterAccess = accessItems.filter((item: any) => !item.isAdmin);
          console.log('👤 Recruteurs filtrés (non-admins):', recruiterAccess);
          
          // Pour chaque accès recruteur, créer l'objet RecruiterAccess
          const recruiters: RecruiterAccess[] = recruiterAccess.map((access: any) => {
            console.log('🔍 Mapping access:', access);
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
              canAcceptFinal: access.canAcceptFinal || false
            };
          });
          
          console.log('✅ Recruteurs chargés:', recruiters);
          this.selectedRecruiters.set(recruiters);
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
      allCanEvaluate: campaign.allCanEvaluate
    });
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
      return;
    }

    this.saving.set(true);

    const formValue = this.campaignForm.value;
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      console.error('❌ Utilisateur non connecté');
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
      allCanEvaluate: formValue.allCanEvaluate,
      specialityId: formValue.specialityId,
      createdBy: parseInt(currentUser.id)
    };

    const operation$ = this.isEditMode && this.campaignId
      ? this.campaignService.updateCampaign(this.campaignId, campaignData)
      : this.campaignService.createCampaign(campaignData);

    operation$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        console.log('✅ Réponse campagne:', response);
        
        // Extraire l'ID de la campagne créée
        let campaignId: number | null = null;
        
        if (response.items && response.items.length > 0) {
          campaignId = response.items[0].id;
        } else if (response.id) {
          campaignId = response.id;
        }
        
        if (campaignId) {
          console.log('📝 Campagne créée avec ID:', campaignId);
          // Sauvegarder les accès recruteurs et créer les notifications
          // ATTENDRE que tout soit terminé avant de naviguer
          this.saveCampaignAccessAndNotifications(campaignId, parseInt(currentUser.id)).subscribe({
            next: () => {
              console.log('✅ Tous les accès et notifications créés');
              this.saving.set(false);
              this.router.navigate(['/dashboard/campaigns']);
            },
            error: (error) => {
              console.error('❌ Erreur lors de la sauvegarde des accès:', error);
              this.saving.set(false);
              // Naviguer quand même car la campagne est créée
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
        this.saving.set(false);
      }
    });
  }

  saveCampaignAccessAndNotifications(campaignId: number, currentUserId: number) {
    console.log('💾 Sauvegarde des accès recruteurs et notifications pour campagne:', campaignId);
    
    const recruiters = this.selectedRecruiters();
    const allAccessData: any[] = [];
    const notificationObservables: any[] = [];
    
    // Helper pour calculer searchString (concaténation des valeurs)
    const calculateSearchString = (obj: any): string => {
      return Object.values(obj).filter(v => v != null).join(' ');
    };

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
      createdBy: currentUserId,
      searchString: '' // Sera calculé après
    };
    creatorAccess.searchString = calculateSearchString(creatorAccess);
    allAccessData.push(creatorAccess);
    console.log('👑 Créateur ajouté avec tous les droits:', creatorAccess);
    
    // 2. Ajouter les recruteurs sélectionnés (is_admin = false)
    recruiters.forEach(recruiter => {
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
        follow: true,
        createdBy: currentUserId,
        searchString: '' // Sera calculé après
      };
      accessData.searchString = calculateSearchString(accessData);
      allAccessData.push(accessData);
      
      // 3. Créer une notification pour chaque recruteur (sauf le créateur)
      const notificationData = {
        notifType: 'ADDED_TO_CAMPAIGN',
        notifActor: currentUserId,
        notifLink: `/dashboard/campaigns/${campaignId}`,
        isRead: false,
        createdBy: 1,
        userId: recruiter.user.id,
        objectTableName: 'campaigns', // Lier à la table campaigns
        objectTableId: campaignId,     // Lier à cette campagne spécifique
        searchString: '' // Sera calculé après
      };
      notificationData.searchString = calculateSearchString(notificationData);
      
      // Ajouter l'observable de notification à la liste
      notificationObservables.push(
        this.campaignService.createNotification(notificationData)
      );
      
      console.log('👤 Recruteur ajouté:', accessData);
      console.log('📬 Notification créée:', notificationData);
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
  get allCanEvaluate() { return this.campaignForm.get('allCanEvaluate'); }
}
