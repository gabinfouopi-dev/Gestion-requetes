import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Retourne les erreurs d'un contrôle sous forme de message lisible.
 */
export function getErrorMessage(control: AbstractControl | null, label = 'Ce champ'): string {
  if (!control || !control.errors || !control.touched) return '';
  const { required, email, minlength, maxlength, pattern } = control.errors;
  if (required)   return `${label} est requis.`;
  if (email)      return `Format d'email invalide.`;
  if (minlength)  return `${label} doit contenir au moins ${minlength.requiredLength} caractères.`;
  if (maxlength)  return `${label} ne peut dépasser ${maxlength.requiredLength} caractères.`;
  if (pattern)    return `Format invalide.`;
  return 'Valeur invalide.';
}

/**
 * Validateur personnalisé : mot de passe et confirmation identiques.
 */
export const passwordMatchValidator: ValidatorFn = (
  group: AbstractControl
): ValidationErrors | null => {
  const pwd     = group.get('motDePasse')?.value;
  const confirm = group.get('confirmMotDePasse')?.value;
  return pwd === confirm ? null : { passwordMismatch: true };
};

/**
 * Marque tous les contrôles d'un formulaire comme touchés
 * (pour déclencher l'affichage des erreurs).
 */
export function markAllAsTouched(control: AbstractControl): void {
  control.markAsTouched();
  if ('controls' in control) {
    Object.values((control as any).controls).forEach(markAllAsTouched);
  }
}

/**
 * Retourne les initiales d'un prénom + nom.
 */
export function getInitials(prenom?: string, nom?: string): string {
  return `${prenom?.[0] ?? ''}${nom?.[0] ?? ''}`.toUpperCase();
}

/**
 * Tronque un texte à max caractères.
 */
export function truncate(value: string, max = 60): string {
  return value && value.length > max ? value.slice(0, max) + '…' : value ?? '';
}
