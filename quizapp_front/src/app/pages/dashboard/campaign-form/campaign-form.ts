import { Component, OnInit, OnDestroy, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { CampaignService, Campaign } from '../../../core/services/campaign.service';
import { UserService, User, PagedResponse } from '../../../core/services/user.service';
import { SpecialityService, Speciality } from '../../../core/services/speciality.service';

interface RecruiterAccess {
  user: User;
  canEvaluate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
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
  
  markedOutOfOptions = [
    { value: 10, label: '10 points' },
    { value: 20, label: '20 points' },
    { value: 50, label: '50 points' },
    { value: 100, label: '100 points' },
    { value: -1, label: 'Personnalisé' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private campaignService: CampaignService,
    private userService: UserService,
    private specialityService: SpecialityService
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
      markedOutOf: [10, [Validators.required, Validators.min(1)]],
      markedOutOfPreset: [10],
      customMarkedOutOf: [{ value: '', disabled: true }],
      specialityId: [null, Validators.required] // Ajout spécialité
    });

    // Écouter les changements du preset pour activer/désactiver le champ personnalisé
    this.campaignForm.get('markedOutOfPreset')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        const customField = this.campaignForm.get('customMarkedOutOf');
        const markedOutOfField = this.campaignForm.get('markedOutOf');
        
        if (value === -1) {
          customField?.enable();
          customField?.setValidators([Validators.required, Validators.min(1)]);
        } else {
          customField?.disable();
          customField?.clearValidators();
          markedOutOfField?.setValue(value);
        }
        customField?.updateValueAndValidity();
      });

    // Écouter les changements du champ personnalisé
    this.campaignForm.get('customMarkedOutOf')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        if (value) {
          this.campaignForm.get('markedOutOf')?.setValue(value);
        }
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
            
            // Filtrer les utilisateurs déjà sélectionnés
            const selectedIds = this.selectedRecruiters().map(r => r.user.id);
            const filteredUsers = filteredByRole.filter((u: User) => !selectedIds.includes(u.id));
            
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
      canDelete: false    // Décoché par défaut
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

  toggleRecruiterAccess(index: number, field: 'canEvaluate' | 'canUpdate' | 'canDelete'): void {
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
          this.populateForm(campaign);
          this.loadCampaignRecruiters(id);
          this.loading.set(false);
        },
        error: (error) => {
          console.error('❌ Erreur chargement campagne:', error);
          this.loading.set(false);
        }
      });
  }

  loadCampaignRecruiters(campaignId: number): void {
    // TODO: Charger les recruteurs associés via campaign_crud
    // this.campaignService.getCampaignRecruiters(campaignId).subscribe(...)
  }

  populateForm(campaign: Campaign): void {
    this.campaignForm.patchValue({
      campaignTitle: campaign.campaignTitle,
      campaignDesc: campaign.campaignDesc,
      campaignStatus: campaign.campaignStatus,
      campaignStart: this.formatDateForInput(campaign.campaignStart),
      campaignEnd: this.formatDateForInput(campaign.campaignEnd),
      maxApply: campaign.maxApply,
      allCanEvaluate: campaign.allCanEvaluate,
      markedOutOf: campaign.markedOutOf
    });

    // Définir le preset approprié
    const markedOutOf = campaign.markedOutOf || 10;
    const isPreset = [10, 20, 50, 100].includes(markedOutOf);
    
    if (isPreset) {
      this.campaignForm.patchValue({ markedOutOfPreset: markedOutOf });
    } else {
      this.campaignForm.patchValue({ 
        markedOutOfPreset: -1,
        customMarkedOutOf: markedOutOf
      });
    }
  }

  formatDateForInput(date?: string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  onSubmit(): void {
    if (this.campaignForm.invalid) {
      this.markFormGroupTouched(this.campaignForm);
      return;
    }

    this.saving.set(true);

    const formValue = this.campaignForm.value;
    const campaignData: Partial<Campaign> = {
      campaignTitle: formValue.campaignTitle,
      campaignDesc: formValue.campaignDesc,
      campaignStatus: formValue.campaignStatus,
      campaignStart: formValue.campaignStart,
      campaignEnd: formValue.campaignEnd,
      maxApply: formValue.maxApply,
      allCanEvaluate: formValue.allCanEvaluate,
      markedOutOf: formValue.markedOutOf
    };

    const operation$ = this.isEditMode && this.campaignId
      ? this.campaignService.updateCampaign(this.campaignId, campaignData)
      : this.campaignService.createCampaign(campaignData);

    operation$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (campaign) => {
        console.log('✅ Campagne sauvegardée:', campaign);
        
        // Sauvegarder les accès recruteurs
        if (campaign.id) {
          this.saveCampaignRecruiters(campaign.id);
        }
        
        this.saving.set(false);
        this.router.navigate(['/dashboard/campaigns']);
      },
      error: (error) => {
        console.error('❌ Erreur sauvegarde campagne:', error);
        this.saving.set(false);
      }
    });
  }

  saveCampaignRecruiters(campaignId: number): void {
    // TODO: Implémenter la sauvegarde des accès recruteurs via campaign_crud
    const recruiters = this.selectedRecruiters();
    
    recruiters.forEach(recruiter => {
      const accessData = {
        campaignId,
        userId: recruiter.user.id,
        canEvaluate: recruiter.canEvaluate,
        canUpdate: recruiter.canUpdate,
        canDelete: recruiter.canDelete,
        follow: false
      };
      
      // this.campaignService.saveCampaignAccess(accessData).subscribe(...)
      console.log('💾 Sauvegarde accès recruteur:', accessData);
    });
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
  get markedOutOf() { return this.campaignForm.get('markedOutOf'); }
  get markedOutOfPreset() { return this.campaignForm.get('markedOutOfPreset'); }
  get customMarkedOutOf() { return this.campaignForm.get('customMarkedOutOf'); }
}
