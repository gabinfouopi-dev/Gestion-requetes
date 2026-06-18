export const API_BASE = '/api';

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN:  `${API_BASE}/auth/login`,
    LOGOUT: `${API_BASE}/auth/logout`,
    ME:     `${API_BASE}/auth/me`,
  },
  // Utilisateurs
  USERS: {
    BASE:      `${API_BASE}/utilisateurs`,
    BY_ID:     (id: number) => `${API_BASE}/utilisateurs/${id}`,
    AFFECTER:  (id: number) => `${API_BASE}/utilisateurs/${id}/service`,
  },
  // Services
  SERVICES: {
    BASE:  `${API_BASE}/services`,
    BY_ID: (id: number) => `${API_BASE}/services/${id}`,
  },
  // Catégories
  CATEGORIES: {
    BASE:  `${API_BASE}/categories`,
    BY_ID: (id: number) => `${API_BASE}/categories/${id}`,
  },
  // Requêtes
  REQUESTS: {
    BASE:        `${API_BASE}/requetes`,
    BY_ID:       (id: number) => `${API_BASE}/requetes/${id}`,
    MY:          (userid: number) => `${API_BASE}/requetes/moi/${userid}`,
    BY_SERVICE:  (svcId: number) => `${API_BASE}/requetes/service/${svcId}`,
    SOUMETTRE:   (id: number) => `${API_BASE}/requetes/${id}/soumettre`,
    STATUT:      (id: number) => `${API_BASE}/requetes/${id}/statut`,
  },
  // Réponses
  RESPONSES: {
    BASE:        `${API_BASE}/reponses`,
    BY_ID:       (id: number) => `${API_BASE}/reponses/${id}`,
    MY:          (userid: number) => `${API_BASE}/reponses/moi/${userid}`,
    BY_REQUEST:  (reqId: number) => `${API_BASE}/reponses/requete/${reqId}`,
  },
  // Requêtes inter-services
  INTER_SERVICE_REQUESTS: {
    BASE:        `${API_BASE}/requetes-inter-services`,
    BY_ID:       (id: number) => `${API_BASE}/requetes-inter-services/${id}`,
    BY_EMETTEUR: (svcId: number) => `${API_BASE}/requetes-inter-services/emetteur/${svcId}`,
    BY_RECEPTEUR:(svcId: number) => `${API_BASE}/requetes-inter-services/recepteur/${svcId}`,
    STATUT:      (id: number) => `${API_BASE}/requetes-inter-services/${id}/statut`,
    REPONDRE:    (id: number) => `${API_BASE}/requetes-inter-services/${id}/repondre`,
  },
  // Reponses inter-services
  INTER_SERVICE_REPONSES: {
    BASE:        `${API_BASE}/reponses-inter-services`,
    BY_ID:       (id: number) => `${API_BASE}/reponses-inter-services/${id}`,
    MY: (svcId: number) => `${API_BASE}/reponses-inter-services/emetteur/${svcId}`,
    BY_RECEPTEUR:(svcId: number) => `${API_BASE}/reponses-inter-services/recepteur/${svcId}`,
    BY_REQUEST:    (id: number) => `${API_BASE}/reponses-inter-services/requete/${id}`,
  },
  // Pièces jointes
  ATTACHMENTS: {
    UPLOAD:   `${API_BASE}/pieces-jointes/upload`,
    DOWNLOAD: (id: number) => `${API_BASE}/pieces-jointes/${id}/download`,
    PREVIEW:  (id: number) => `${API_BASE}/pieces-jointes/${id}/preview`,
    DELETE:   (id: number) => `${API_BASE}/pieces-jointes/${id}`,
    By_REQUEST:   (id: number) => `${API_BASE}/pieces-jointes/requetes/${id}`,
    By_REPONSE:   (id: number) => `${API_BASE}/pieces-jointes/reponses/${id}`,
    By_ISREQUEST:   (id: number) => `${API_BASE}/pieces-jointes/isrequetes/${id}`,
    By_ISREPONSE:   (id: number) => `${API_BASE}/pieces-jointes/isreponses/${id}`,
  },
} as const;

export const JWT_KEY     = 'uni_jwt_token';
export const USER_KEY    = 'uni_current_user';
export const ROLE_KEY    = 'uni_user_role';
