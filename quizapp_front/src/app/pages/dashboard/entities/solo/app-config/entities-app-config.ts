import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EntityCrudBase, BaseSearchCriteria, BasePagedResponse, ColumnDef } from '../../../../../shared/entity-crud-base';
import { EntityDetailPanelComponent } from '../../../../../shared/entity-detail-panel/entity-detail-panel';
import { DependencyPopupComponent } from '../../../../../shared/dependency-popup/dependency-popup';
import { ColumnVisibilityManagerComponent } from '../../../../../shared/column-visibility-manager/column-visibility-manager';
import { FilterCheckboxComponent } from '../../../../../shared/filter-checkbox/filter-checkbox';
import { FilterSelectComponent, FilterSelectOptionDirective } from '../../../../../shared/filter-select/filter-select';
import { AppConfigService, AppConfig } from '../../../../../core/services/app-config.service';
import { LogoHtmlSanitizerService } from '../../../../../core/services/logo-html-sanitizer.service';
import { ThemeService } from '../../../../../core/services/theme.service';

interface AppConfigCriteria extends BaseSearchCriteria {
  configName?: string;
  isActive?: boolean;
}

interface PagedAppConfigResponse extends BasePagedResponse<AppConfig> {}

@Component({
  selector: 'app-entities-app-config',
  standalone: true,
  imports: [FilterSelectComponent, FilterSelectOptionDirective, CommonModule, FormsModule, FilterCheckboxComponent, EntityDetailPanelComponent, DependencyPopupComponent, ColumnVisibilityManagerComponent],
  templateUrl: './entities-app-config.html',
  styleUrls: ['./entities-app-config.scss']
})
export class EntitiesAppConfigComponent extends EntityCrudBase<AppConfig, AppConfigCriteria, PagedAppConfigResponse> {
  private service = inject(AppConfigService);
  private logoHtmlSanitizer = inject(LogoHtmlSanitizerService);
  private themeService = inject(ThemeService);
  protected override readonly router = inject(Router);
  protected override readonly pageSizeStorageKey = 'entitiesAppConfigPageSize';
  protected override readonly entityName = 'config application';
  protected override readonly entityTypeApi = 'appConfig';

  advancedCriteria: AppConfigCriteria = {};
  editFormData: AppConfig = {} as AppConfig;
  createFormData: Partial<AppConfig> = {};
  activatingConfigId: number | null = null;

  override allColumns: ColumnDef[] = [
    { key: 'id', label: 'ID', priority: 1 },
    { key: 'configName', label: 'Nom Config', priority: 1 },
    { key: 'companyName', label: 'Entreprise', priority: 2 },
    { key: 'primaryColor', label: 'Couleur Primaire', priority: 3 },
    { key: 'theme', label: 'Thème', priority: 3 },
    { key: 'active', label: 'Actif', priority: 2 },
    { key: 'deleted', label: 'Supprimé', priority: 3 },
    { key: 'actions', label: 'Actions', priority: 1 },
  ];

  protected fetchAll(criteria: AppConfigCriteria): Observable<PagedAppConfigResponse> {
    const { page, size, ...data } = criteria;
    return this.service.getByCriteria(data, page, size).pipe(
      map(resp => ({
        content: resp.items,
        totalElements: resp.count,
        totalPages: Math.ceil(resp.count / (size || 10))
      }))
    );
  }
  protected performCreate(item: Partial<AppConfig>): Observable<any> { return this.service.create(item); }
  protected performUpdate(item: AppConfig): Observable<any> { return this.service.update(item); }
  protected performDelete(id: number): Observable<any> { return this.service.delete(id); }
  protected performRestore(id: number): Observable<any> { return this.service.update({ id, isDeleted: false }); }
  protected resetAdvancedCriteriaValues(): void { this.advancedCriteria = {}; }
  protected resetCreateFormData(): void { this.createFormData = {}; }

  canActivate(item: AppConfig): boolean {
    return !!item.id && !item.isDeleted && !item.isActive;
  }

  activateConfig(item: AppConfig): void {
    if (!this.canActivate(item) || this.activatingConfigId !== null) {
      return;
    }

    if (!confirm(`Activer la configuration "${item.configName || 'sans nom'}" ?`)) {
      return;
    }

    this.activatingConfigId = item.id;
    this.service.activate(item.id).subscribe({
      next: (response) => {
        const activeConfig = {
          ...item,
          ...response,
          logoHtml: this.logoHtmlSanitizer.sanitize(response?.logoHtml ?? item.logoHtml)
        };

        this.notificationService.success('Succès', `Configuration "${item.configName}" activée`);
        this.themeService.applyTheme(activeConfig);
        this.themeService.companyName.set(activeConfig.companyName || 'Synelia');
        this.themeService.appLink.set(activeConfig.appLink?.trim() || '');
        this.themeService.logoHtml.set(this.logoHtmlSanitizer.sanitizeOrEmpty(activeConfig.logoHtml));
        this.themeService.candidateAccountsEnabled.set(activeConfig.candidateAccountsEnabled === true);
        this.themeService.activeConfig.set(activeConfig);
        this.activatingConfigId = null;
        this.loadItems();
      },
      error: () => {
        this.notificationService.error('Erreur', 'Erreur lors de l\'activation');
        this.activatingConfigId = null;
      }
    });
  }
}
