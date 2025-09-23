// Modèle pour les champs de recherche avancée
export interface SearchField {
    key: string; // Clé pour lier au modèle
    label: string; // Label affiché
    type: 'text' | 'email' | 'select' | 'date' | 'range' | 'number' | 'boolean' | 'date_range';
    placeholder?: string; // Placeholder optionnel
    options?: {value: any, label: string }[]; // pour les selects
    required?: boolean; // si le champ est obligatoire
    inputType?: string; // Pour range avec dates
    range?: boolean; // Pour date range
}
export interface SearchCriteria {
    [key: string]: any; 
    // Objet dynamique pour contenir les critères de recherche
}


// Interfaces pour le tableau générique
export interface TableColumn {
  key: string;
  label: string;
  type: 'text' | 'date' | 'status' | 'badge' | 'actions';
  sortable?: boolean;
  width?: string;
  format?: (value: any) => string;
}

export interface TableAction {
  key: string;
  label: string;
  icon: string;
  class: string;
  condition?: (item: any) => boolean;
}

export interface TableConfig {
  columns: TableColumn[];
  actions: TableAction[];
  trackBy: string;
  emptyState: {
    title: string;
    message: string;
    icon: string;
  };
}

export interface PaginationInfo {
  currentPage: number;
  totalElements: number;
  pageSize: number;
  totalPages: number;
}

export interface StatsInfo {
  total: number;
  online?: number;
  offline?: number;
  [key: string]: number | undefined;
}

// Interfaces pour le modal
export interface FormField {
  key: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'select' | 'date' | 'textarea';
  required?: boolean;
  readonly?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
}

export interface ModalConfig {
  title: string;
  fields: FormField[];
  submitLabel: string;
  cancelLabel: string;
  showDeleteButton?: boolean;
  deleteLabel?: string;
}