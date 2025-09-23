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