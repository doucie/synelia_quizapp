import { Component, ChangeDetectionStrategy, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { Application, ApplicationResponse, ApplicationService } from '../../core/services/application.service';
import { Campaign, CampaignService } from '../../core/services/campaign.service';
import { FileService, FileUploadResponse } from '../../core/services/file.service';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';
import { SourceTokenResponse, SourceTokenService } from '../../services/source-token.service';
import { FilterCheckboxComponent } from '../../shared/filter-checkbox/filter-checkbox';

interface ApplicationForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  cvFile: File | null;
  motivationLetter: string;
  remoteWork: boolean;
  relocate: boolean;
  consent: boolean;
}

interface LegalTextItem {
  title?: string;
  content?: string;
  isActive?: boolean;
}

interface LegalTextResponse {
  items?: LegalTextItem[];
}

@Component({
  selector: 'app-apply-position',
  imports: [CommonModule, RouterModule, FormsModule, SafeHtmlPipe, FilterCheckboxComponent],
  templateUrl: './apply-position.html',
  styleUrl: './apply-position.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApplyPositionComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sourceTokenService = inject(SourceTokenService);
  private readonly applicationService = inject(ApplicationService);
  private readonly campaignService = inject(CampaignService);
  private readonly fileService = inject(FileService);
  private readonly http = inject(HttpClient);

  readonly sourceToken = signal('');
  readonly sourceTokenId = signal<number | null>(null);
  readonly campaignId = signal<number | null>(null);
  readonly campaignName = signal('');
  readonly isLoadingToken = signal(true);

  readonly consentText = signal('');
  readonly isLoadingConsentText = signal(true);
  private readonly entryBlockMessage = signal<string | null>(null);
  private readonly legalBlockMessage = signal<string | null>(null);
  readonly platformBlockMessage = computed(() => this.entryBlockMessage() || this.legalBlockMessage());
  readonly privacyPolicyTitle = signal('');
  readonly privacyPolicyContent = signal('');
  readonly showPrivacyModal = signal(false);

  readonly formData = signal<ApplicationForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthDate: '',
    cvFile: null,
    motivationLetter: '',
    remoteWork: false,
    relocate: false,
    consent: false
  });
  readonly fileName = signal('');
  readonly cvFilePath = signal('');
  readonly isSubmitting = signal(false);
  readonly isUploadingCv = signal(false);
  readonly submitSuccess = signal(false);
  readonly submitError = signal<string | null>(null);
  readonly submittedTrackingCode = signal<string | null>(null);

  ngOnInit(): void {
    const tokenString = this.route.snapshot.paramMap.get('sourceToken');
    if (tokenString) {
      this.loadSourceTokenContext(tokenString);
    } else {
      const campaignIdParam = this.route.snapshot.paramMap.get('campaignId');
      if (campaignIdParam) {
        this.loadPublicCampaignContext(Number(campaignIdParam));
      } else {
        void this.router.navigate(['/campagnes']);
        return;
      }
    }

    this.loadLegalTexts();
  }

  private loadSourceTokenContext(tokenString: string): void {
    this.sourceToken.set(tokenString);

    this.sourceTokenService.getTokenInfo(tokenString).subscribe({
      next: (response: SourceTokenResponse) => {
        const tokenData = response.items?.[0];
        if (tokenData) {
          this.campaignName.set(tokenData.campaignName || 'Campagne de recrutement');
          this.sourceTokenId.set(tokenData.id || null);
        } else {
          this.campaignName.set('Campagne de recrutement Synelia');
        }
        this.entryBlockMessage.set(null);
        this.isLoadingToken.set(false);
      },
      error: (error: unknown) => {
        console.error('Erreur chargement token:', error);
        this.campaignName.set('Campagne de recrutement Synelia');
        this.isLoadingToken.set(false);
      }
    });
  }

  private loadPublicCampaignContext(campaignId: number): void {
    if (!Number.isFinite(campaignId) || campaignId <= 0) {
      this.entryBlockMessage.set('Cette campagne est introuvable ou n est plus accessible.');
      this.isLoadingToken.set(false);
      return;
    }

    this.campaignId.set(campaignId);
    this.campaignService.getPublicCampaignById(campaignId).subscribe({
      next: (campaign: Campaign) => {
        this.campaignName.set(campaign.campaignTitle || campaign.campaignName || 'Campagne de recrutement');
        if (campaign.publicApplyEnabled === false) {
          this.entryBlockMessage.set(campaign.publicStatusMessage || 'Cette campagne requiert un code recruteur.');
        } else {
          this.entryBlockMessage.set(null);
        }
        this.isLoadingToken.set(false);
      },
      error: (error: unknown) => {
        console.error('Erreur chargement campagne publique:', error);
        this.entryBlockMessage.set('Cette campagne est introuvable ou n est plus accessible.');
        this.isLoadingToken.set(false);
      }
    });
  }

  private loadLegalTexts(): void {
    this.http.post<LegalTextResponse>('/legalText/getByCriteria', {
      size: 1,
      index: 0,
      isSimpleLoading: false,
      data: { textKey: 'candidate_consent', isDeleted: false }
    }).subscribe({
      next: (response: LegalTextResponse) => {
        const item = response.items?.[0];
        if (item?.content && item.isActive) {
          this.consentText.set(item.content);
          this.legalBlockMessage.set(null);
        } else {
          this.legalBlockMessage.set(
            'La candidature est temporairement indisponible: le texte de consentement candidat n\'est pas configure.'
          );
        }

        this.isLoadingConsentText.set(false);
      },
      error: (error: unknown) => {
        console.error('Erreur chargement consentement:', error);
        this.legalBlockMessage.set(
          this.extractPlatformError(
            error,
            'La candidature est temporairement indisponible: le texte de consentement candidat est absent ou inactif.'
          )
        );
        this.isLoadingConsentText.set(false);
      }
    });

    this.http.post<LegalTextResponse>('/legalText/getByCriteria', {
      size: 1,
      index: 0,
      isSimpleLoading: false,
      data: { textKey: 'privacy_policy', isDeleted: false }
    }).subscribe({
      next: (response: LegalTextResponse) => {
        const item = response.items?.[0];
        if (item?.content && item.isActive) {
          this.privacyPolicyTitle.set(item.title || 'Politique de confidentialité');
          this.privacyPolicyContent.set(item.content);
        }
      },
      error: (error: unknown) => {
        console.error('Erreur chargement politique de confidentialite:', error);
      }
    });
  }

  openPrivacyModal(event: Event): void {
    event.preventDefault();
    this.showPrivacyModal.set(true);
  }

  closePrivacyModal(): void {
    this.showPrivacyModal.set(false);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.item(0) ?? null;

    if (!input || !file) {
      return;
    }

    const validation = this.fileService.validateCvFile(file);
    if (!validation.isValid) {
      this.submitError.set(validation.errorMessage || 'Fichier invalide');
      input.value = '';
      return;
    }

    this.submitError.set(null);
    this.formData.update((data: ApplicationForm) => ({ ...data, cvFile: file }));
    this.fileName.set(file.name);
  }

  updateBooleanField(field: 'remoteWork' | 'relocate' | 'consent', value: boolean): void {
    this.formData.update((data: ApplicationForm) => ({
      ...data,
      [field]: value
    }));
  }

  async onSubmit(): Promise<void> {
    const data = this.formData();

    if (this.isLoadingConsentText()) {
      this.submitError.set('Le texte de consentement est encore en cours de chargement.');
      return;
    }

    if (this.platformBlockMessage()) {
      this.submitError.set(this.platformBlockMessage());
      return;
    }

    if (!data.firstName || !data.lastName || !data.email || !data.phone || !data.birthDate) {
      this.submitError.set('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!data.cvFile) {
      this.submitError.set('Veuillez joindre votre CV');
      return;
    }

    if (!data.consent) {
      this.submitError.set('Veuillez accepter les conditions');
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set(null);
    this.isUploadingCv.set(true);

    try {
      const uploadResult: FileUploadResponse = await firstValueFrom(
        this.fileService.uploadCvFile(data.cvFile, data.email)
      );

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Erreur lors de l\'upload du CV');
      }

      this.cvFilePath.set(uploadResult.filePath || '');
      this.isUploadingCv.set(false);

      const application: Application = {
        candidateFirstName: data.firstName,
        candidateLastName: data.lastName,
        candidateEmail: data.email,
        candidatePhone: data.phone,
        candidateBirthDate: data.birthDate,
        candidateCvPath: uploadResult.filePath || undefined,
        motivationLetter: data.motivationLetter || '',
        emailVerified: false,
        applicationStatus: 'PENDING',
        sourceTokenId: this.sourceTokenId() || undefined,
        campaignId: this.campaignId() || undefined,
        isDeleted: false
      };

      const response: ApplicationResponse = await firstValueFrom(
        this.applicationService.createApplication(application)
      );

      if (response.hasError || !response.items || response.items.length === 0) {
        this.submitError.set(response.status?.message || 'Erreur lors de la creation de la candidature');
        return;
      }

      const created = response.items[0];
      const qt = created.searchString;
      if (qt && created.id) {
        this.submitSuccess.set(true);
        await this.router.navigate(['/quiz', created.id, qt]);
        return;
      }

      this.submitSuccess.set(true);
      this.submittedTrackingCode.set(created.trackingCode || null);
    } catch (error: unknown) {
      console.error('Erreur lors de la soumission:', error);
      if (error instanceof Error) {
        this.submitError.set(error.message);
      } else {
        this.submitError.set(
          this.extractPlatformError(
            error,
            'Une erreur est survenue lors de l\'envoi de votre candidature. Veuillez reessayer plus tard.'
          )
        );
      }
    } finally {
      this.isSubmitting.set(false);
      this.isUploadingCv.set(false);
    }
  }

  resetForm(): void {
    this.formData.set({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      birthDate: '',
      cvFile: null,
      motivationLetter: '',
      remoteWork: false,
      relocate: false,
      consent: false
    });
    this.fileName.set('');
    this.cvFilePath.set('');
    this.submitSuccess.set(false);
    this.submitError.set(null);
    this.submittedTrackingCode.set(null);
    this.isUploadingCv.set(false);
  }

  private extractPlatformError(error: unknown, fallback: string): string {
    const platformError = error as {
      error?: { status?: { message?: string } };
      status?: { message?: string };
    } | null;

    return platformError?.error?.status?.message || platformError?.status?.message || fallback;
  }
}
