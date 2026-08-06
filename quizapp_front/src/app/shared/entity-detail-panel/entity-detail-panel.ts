import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface DetailField {
  key: string;
  label: string;
  type?: 'text' | 'date' | 'boolean' | 'badge' | 'id';
  badgeMap?: Record<string, { label: string; cssClass: string }>;
  editable?: boolean;
  displayValue?: (entity: any, value: any) => string;
}

@Component({
  selector: 'app-entity-detail-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './entity-detail-panel.html',
  styleUrl: './entity-detail-panel.scss'
})
export class EntityDetailPanelComponent {
  @Input() entity: any = null;
  @Input() fields: DetailField[] = [];
  @Input() title = 'Détails';
  @Input() isOpen = false;
  @Input() canEdit = true;
  @Input() canDelete = true;
  @Input() canRestore = true;

  @Output() closePanel = new EventEmitter<void>();
  @Output() editItem = new EventEmitter<any>();
  @Output() deleteItem = new EventEmitter<any>();
  @Output() restoreItem = new EventEmitter<any>();
  @Output() saveItem = new EventEmitter<any>();

  isEditing = false;
  editData: Record<string, any> = {};

  private readonly READ_ONLY_KEYS = new Set([
    'id', 'createdAt', 'updatedAt', 'dateCreation', 'dateModification',
    'createdBy', 'updatedBy'
  ]);

  private readonly LABEL_MAP: Record<string, string> = {
    id: 'ID', nom: 'Nom', prenom: 'Prénom', pseudo: 'Pseudo',
    email: 'Email', telephone: 'Téléphone', role: 'Rôle',
    isOnline: 'En ligne', isDeleted: 'Supprimé', isActive: 'Actif',
    isPublished: 'Publié', isLocked: 'Verrouillé', isCorrect: 'Correct',
    isSelected: 'Sélectionné', isUsed: 'Utilisé',
    createdAt: 'Créé le', updatedAt: 'Modifié le',
    dateCreation: 'Créé le', dateModification: 'Modifié le',
    createdBy: 'Créé par', updatedBy: 'Modifié par',
    description: 'Description', formName: 'Nom du formulaire',
    formDesc: 'Description', campaignId: 'ID Campagne',
    departmentId: 'ID Département', specialityId: 'ID Spécialité',
    questionId: 'ID Question', answerId: 'ID Réponse',
    formId: 'ID Formulaire', formVersionId: 'ID Version',
    applicationId: 'ID Candidature', interviewId: 'ID Entretien',
    userId: 'ID Utilisateur', candidateInterviewId: 'ID Entretien candidat',
    sourceTokenId: 'ID Token source', versionNumber: 'N° de version',
    questionText: 'Question', questionType: 'Type de question',
    difficultyLevel: 'Difficulté', questionChrono: 'Chronomètre (s)',
    score: 'Score', answerText: 'Réponse', answerOrder: 'Ordre',
    questionOrder: 'Ordre', chronoOverride: 'Chrono personnalisé',
    candidateName: 'Candidat', globalScore: 'Note',
    globalComment: 'Commentaire', token: 'Token', code: 'Code',
    expiredAt: 'Expire le', title: 'Titre', content: 'Contenu',
    subject: 'Sujet', body: 'Corps', templateKey: 'Clé du template',
    configName: 'Nom de la config', companyName: 'Entreprise',
    primaryColor: 'Couleur primaire', colorScheme: 'Schéma de couleurs',
    host: 'Hôte', port: 'Port', username: 'Utilisateur',
    senderEmail: 'Email expéditeur', senderName: 'Nom expéditeur',
    permissions: 'Permissions', follow: 'Suivre',
    notificationType: 'Type', message: 'Message', isRead: 'Lu',
    candidateFirstname: 'Prénom candidat', candidateLastname: 'Nom candidat',
    candidateEmail: 'Email candidat',
  };

  @HostListener('document:keydown.escape')
  onEscKey() {
    if (this.isEditing) { this.cancelEdit(); return; }
    if (this.isOpen) this.closePanel.emit();
  }

  close() {
    if (this.isEditing) this.cancelEdit();
    this.closePanel.emit();
  }

  edit() {
    if (!this.canEdit) {
      return;
    }

    this.editData = { ...this.entity };
    this.isEditing = true;
  }

  cancelEdit() {
    this.isEditing = false;
    this.editData = {};
  }

  save() {
    if (!this.canEdit) {
      return;
    }

    this.saveItem.emit({ ...this.editData });
    this.isEditing = false;
    this.editData = {};
  }

  delete() {
    if (!this.canDelete) {
      return;
    }

    this.deleteItem.emit(this.entity);
  }

  restore() {
    if (!this.canRestore) {
      return;
    }

    this.restoreItem.emit(this.entity);
  }

  isFieldEditable(field: DetailField): boolean {
    if (field.editable === false) return false;
    if (field.type === 'id') return false;
    if (this.READ_ONLY_KEYS.has(field.key)) return false;
    return true;
  }

  getBadgeOptions(field: DetailField): { value: string; label: string }[] {
    if (!field.badgeMap) return [];
    return Object.entries(field.badgeMap).map(([value, config]) => ({
      value, label: config.label
    }));
  }

  getDisplayFields(): DetailField[] {
    if (this.fields.length > 0) return this.fields;
    if (!this.entity) return [];
    return Object.keys(this.entity)
      .filter(key => {
        const value = this.entity[key];
        return typeof value !== 'object' || value === null;
      })
      .filter(key => !Array.isArray(this.entity[key]))
      .map(key => ({
        key,
        label: this.LABEL_MAP[key] || this.formatLabel(key),
        type: this.inferType(key, this.entity[key]) as any
      }));
  }

  getFieldValue(field: DetailField): any {
    return this.entity?.[field.key];
  }

  formatValue(field: DetailField): string {
    const value = this.getFieldValue(field);
    if (field.displayValue) {
      const displayValue = field.displayValue(this.entity, value);
      return displayValue === null || displayValue === undefined || displayValue === '' ? '-' : String(displayValue);
    }
    if (value === null || value === undefined || value === '') return '-';
    switch (field.type) {
      case 'date': return this.formatDate(value);
      case 'boolean': return value ? 'Oui' : 'Non';
      case 'id': return '#' + value;
      case 'badge': return field.badgeMap?.[value]?.label || value || '-';
      default: return String(value);
    }
  }

  private formatDate(date: string): string {
    if (!date) return '-';
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return '-';
      return d.toLocaleDateString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch { return '-'; }
  }

  private formatLabel(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/^./, s => s.toUpperCase())
      .trim();
  }

  private inferType(key: string, value: any): string {
    if (key === 'id') return 'id';
    if (key === 'createdAt' || key === 'updatedAt' || key === 'dateCreation' ||
        key === 'dateModification' || key === 'expiredAt') return 'date';
    if (typeof value === 'boolean') return 'boolean';
    if (key.startsWith('is') && key.length > 2 && key[2] === key[2].toUpperCase()) return 'boolean';
    return 'text';
  }
}
