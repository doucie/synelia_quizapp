/**
 * Nettoie les données de formulaire avant envoi au backend.
 * Convention d'update partiel :
 *   - "" (empty string) → null (demande d'effacement du champ en BDD)
 *   - null → null (effacement explicite)
 *   - autre valeur → conservée telle quelle
 */
export function cleanFormData<T extends Record<string, unknown>>(data: T): T {
  if (data == null || typeof data !== 'object' || Array.isArray(data)) {
    return data;
  }

  const cleaned = { ...data } as Record<string, unknown>;

  for (const key of Object.keys(cleaned)) {
    const value = cleaned[key];

    if (value === '') {
      cleaned[key] = null;
    } else if (value != null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      cleaned[key] = cleanFormData(value as Record<string, unknown>);
    }
  }

  return cleaned as T;
}
