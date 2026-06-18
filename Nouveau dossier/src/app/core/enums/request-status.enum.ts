export enum RequestStatus {
  BROUILLON  = 'BROUILLON',
  EN_ATTENTE = 'EN_ATTENTE',
  EN_COURS   = 'EN_COURS',
  TRAITE     = 'TRAITE',
  REJETE     = 'REJETE',
}

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  [RequestStatus.BROUILLON]:  'Brouillon',
  [RequestStatus.EN_ATTENTE]: 'En attente',
  [RequestStatus.EN_COURS]:   'En cours',
  [RequestStatus.TRAITE]:     'Traité',
  [RequestStatus.REJETE]:     'Rejeté',
};

export const REQUEST_STATUS_COLORS: Record<RequestStatus, string> = {
  [RequestStatus.BROUILLON]:  'default',
  [RequestStatus.EN_ATTENTE]: 'warn',
  [RequestStatus.EN_COURS]:   'accent',
  [RequestStatus.TRAITE]:     'primary',
  [RequestStatus.REJETE]:     'warn',
};
