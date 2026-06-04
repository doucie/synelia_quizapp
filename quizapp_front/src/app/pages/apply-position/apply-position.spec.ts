import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of } from 'rxjs';

import { ApplicationService } from '../../core/services/application.service';
import { CampaignService } from '../../core/services/campaign.service';
import { FileService } from '../../core/services/file.service';
import { SourceTokenService } from '../../services/source-token.service';

import { ApplyPositionComponent } from './apply-position';

describe('ApplyPositionComponent', () => {
  let fixture: ComponentFixture<ApplyPositionComponent>;
  let component: ApplyPositionComponent;
  let route: { snapshot: { paramMap: ReturnType<typeof convertToParamMap> } };
  let router: jasmine.SpyObj<Router>;
  let sourceTokenService: jasmine.SpyObj<SourceTokenService>;
  let applicationService: jasmine.SpyObj<ApplicationService>;
  let campaignService: jasmine.SpyObj<CampaignService>;
  let fileService: jasmine.SpyObj<FileService>;
  let http: jasmine.SpyObj<HttpClient>;

  const primeLegalTexts = () => {
    http.post.calls.reset();
    http.post.and.returnValues(
      of({ items: [{ content: 'Consentement actif', isActive: true }] }),
      of({ items: [{ title: 'Politique', content: '<p>Confidentialite</p>', isActive: true }] })
    );
  };

  const createComponent = () => {
    primeLegalTexts();
    fixture = TestBed.createComponent(ApplyPositionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  beforeEach(async () => {
    route = { snapshot: { paramMap: convertToParamMap({}) } };
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    sourceTokenService = jasmine.createSpyObj<SourceTokenService>('SourceTokenService', ['getTokenInfo']);
    applicationService = jasmine.createSpyObj<ApplicationService>('ApplicationService', ['createApplication']);
    campaignService = jasmine.createSpyObj<CampaignService>('CampaignService', ['getPublicCampaignById']);
    fileService = jasmine.createSpyObj<FileService>('FileService', ['validateCvFile', 'uploadCvFile']);
    http = jasmine.createSpyObj<HttpClient>('HttpClient', ['post']);

    sourceTokenService.getTokenInfo.and.returnValue(of({ hasError: false, status: { code: '200', message: 'ok' }, items: [] }));
    applicationService.createApplication.and.returnValue(of({ hasError: false, items: [] } as any));
    campaignService.getPublicCampaignById.and.returnValue(of({ id: 1, campaignTitle: 'Campagne', publicApplyEnabled: true } as any));
    fileService.validateCvFile.and.returnValue({ isValid: true });
    fileService.uploadCvFile.and.returnValue(of({ success: true, filePath: 'uploads/cv/test.pdf' }));

    await TestBed.configureTestingModule({
      imports: [ApplyPositionComponent],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: Router, useValue: router },
        { provide: SourceTokenService, useValue: sourceTokenService },
        { provide: ApplicationService, useValue: applicationService },
        { provide: CampaignService, useValue: campaignService },
        { provide: FileService, useValue: fileService },
        { provide: HttpClient, useValue: http }
      ]
    });

    TestBed.overrideComponent(ApplyPositionComponent, {
      set: {
        template: ''
      }
    });

    await TestBed.compileComponents();
  });

  it('loads the public campaign context and exposes the recruiter-code block message when direct apply is disabled', () => {
    route.snapshot.paramMap = convertToParamMap({ campaignId: '42' });
    campaignService.getPublicCampaignById.and.returnValue(of({
      id: 42,
      campaignTitle: 'Campagne Backend',
      publicApplyEnabled: false,
      publicStatusMessage: 'Code recruteur requis pour ouvrir le formulaire.'
    } as any));

    createComponent();

    expect(campaignService.getPublicCampaignById).toHaveBeenCalledWith(42);
    expect(component.campaignId()).toBe(42);
    expect(component.campaignName()).toBe('Campagne Backend');
    expect(component.platformBlockMessage()).toBe('Code recruteur requis pour ouvrir le formulaire.');
  });

  it('submits a direct public application with campaignId when the candidate enters through a public campaign', async () => {
    route.snapshot.paramMap = convertToParamMap({ campaignId: '42' });
    campaignService.getPublicCampaignById.and.returnValue(of({
      id: 42,
      campaignTitle: 'Campagne Front',
      publicApplyEnabled: true
    } as any));
    applicationService.createApplication.and.returnValue(of({
      hasError: false,
      items: [{ trackingCode: 'TRACK42' }]
    } as any));

    createComponent();

    const cvFile = new File(['cv'], 'ada.pdf', { type: 'application/pdf' });
    component.formData.set({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.test',
      phone: '0102030405',
      birthDate: '1990-12-10',
      cvFile,
      motivationLetter: 'Je souhaite rejoindre Synelia.',
      remoteWork: true,
      relocate: false,
      consent: true
    });

    await component.onSubmit();

    expect(fileService.uploadCvFile).toHaveBeenCalledWith(cvFile, 'ada@example.test');
    expect(applicationService.createApplication).toHaveBeenCalledWith(jasmine.objectContaining({
      candidateFirstName: 'Ada',
      candidateLastName: 'Lovelace',
      candidateEmail: 'ada@example.test',
      campaignId: 42,
      sourceTokenId: undefined,
      candidateCvPath: 'uploads/cv/test.pdf'
    }));
    expect(component.submitSuccess()).toBeTrue();
    expect(component.submittedTrackingCode()).toBe('TRACK42');
  });
});