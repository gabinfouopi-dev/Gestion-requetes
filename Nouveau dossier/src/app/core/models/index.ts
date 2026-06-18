import { Role } from '../enums/role.enum';
import { RequestStatus } from '../enums/request-status.enum';

// ─── Pagination ────────────────────────────────────────────────────────────
export interface Page<T> {
  content:       T[];
  totalElements: number;
  totalPages:    number;
  number:        number;
  size:          number;
}

export interface ApiResponse<T> {
  data:    T;
  message: string;
  success: boolean;
}

// ─── Service administratif ─────────────────────────────────────────────────
export interface ServiceModel {
  id:          number;
  nom:         string;
  description: string;
}

// ─── Utilisateur ───────────────────────────────────────────────────────────
export interface User {
  id:         number;
  nom:        string;
  prenom:     string;
  email:      string;
  tel:        string;
  role:       Role;
  serviceId?: number;
  serviceNom?: string;
  service?: ServiceModel;
}

export interface UserCreateDto {
  nom:        string;
  prenom:     string;
  email:      string;
  tel:        string;
  motDePasse: string;
  role:       Role;
  serviceId?: number;
}

export interface UserUpdateDto {
  nom:        string;
  prenom:     string;
  email:      string;
  tel:        string;
  role:       Role;
  serviceId?: number;
}

// ─── Auth ──────────────────────────────────────────────────────────────────
export interface LoginRequest {
  email:      string;
  motDePasse: string;
}

export interface LoginResponse {
  token:    string;
  type:     string;
  user:     User;
  expiresIn: number;
}

// ─── Catégorie ─────────────────────────────────────────────────────────────
export interface Category {
  id:          number;
  nom:         string;
  description: string;
  priorite:    'basse' | 'normale' | 'haute' | 'urgente';
  serviceId:   number;
  serviceNom?: string;
  service?: ServiceModel;
}

export interface CategoryDto {
  nom:         string;
  description: string;
  priorite:    string;
  serviceId:   number;
}

// ─── Pièce jointe ──────────────────────────────────────────────────────────
export interface Attachment {
  id:                       number;
  nomFichier:               string;
  chemin:                   string;
  taille?:                  number;
  type?:                    string;
  requeteId?:               number;
  reponseId?:               number;
  requeteInterServiceId?:   number;
  reponseInterServiceId?:   number;
}

// ─── Requête ───────────────────────────────────────────────────────────────
export interface Request {
  id:              number;
  objet:           string;
  description:     string;
  dateCreation:    string;
  dateSoumission?: string;
  statut:          RequestStatus;
  utilisateurId:   number;
  utilisateurNom?:  string;
  utilisateur?:    User;
  categorieId:     number;
  categorie?:      Category;
  categorieNom?:   string;
  pieceJointes?:   Attachment[];
  reponse?:        Response;
}

export interface RequestCreateDto {
  objet:       string;
  description: string;
  utilisateurId?:   number;
  categorieId: number;

}

export interface RequestUpdateDto {
  objet:       string;
  description: string;
  categorieId: number;
}

export interface RequestStatusDto {
  statut:      RequestStatus;
  commentaire?: string;
}

// ─── Réponse ───────────────────────────────────────────────────────────────
export interface Response {
  id:           number;
  titre:        string;
  contenu:      string;
  dateCreation: string;
  requeteId:    number;
  auteurId:     number;
  auteurNom?:   string;
  requete?:     Request;
  auteur?:      User;
  pieceJointes?:Attachment[];
}

export interface ResponseCreateDto {
  titre:     string;
  contenu:   string;
  requeteId: number;
  auteurId: number;
}

// ─── Requête inter-service ─────────────────────────────────────────────────
export interface InterServiceRequest {
  id:                number;
  objet:             string;
  description:       string;
  infosDemandees:    string;
  dateCreation:      string;
  dateSoumission?:   string;
  statut:            RequestStatus;
  emetteurId:        number;
  emetteurNom?:      string;
  recepteurId:       number;
  recepteurNom?:      string;
  auteurId:          number;
  auteurNom:         string;
  requeteId?:        number;
  emetteur?:         ServiceModel;
  recepteur?:        ServiceModel;
  auteur?:           User;
  pieceJointes?:     Attachment[];
  reponse?:          ISResponse;
}


export interface InterServiceRequestCreateDto {
  objet:           string;
  description:     string;
  infosDemandees:  string;
  recepteurId:     number;
  emetteurId:      number;
  auteurId:        number
  requeteId?:      number;
}

export interface InterServiceRequestReponseDto {
  contenuReponse: string;
  statut:         'accepte' | 'rejete';
}

// ─── Réponse ───────────────────────────────────────────────────────────────
export interface ISResponse {
  id:           number;
  titre:        string;
  contenu:      string;
  dateCreation: string;
  ISrequeteId:    number;
  auteurId:     number;
  auteurNom?:   string;
  isrequete?:   InterServiceRequest;
  auteur?:      User;
  pieceJointes?:Attachment[];
}

export interface ISResponseCreateDto {
  titre:     string;
  contenu:   string;
  isrequeteId: number;
  auteurId: number;
}
// ─── Statistiques dashboard ────────────────────────────────────────────────
export interface StudentStats {
  total:     number;
  enAttente: number;
  enCours:   number;
  traite:    number;
  reponses:  number;
}

export interface AgentStats {
  total:         number;
  enAttente:     number;
  enCours:       number;
  traite:        number;
  interServices: number;
}

export interface AdminStats {
  utilisateurs: number;
  etudiants:    number;
  agents:       number;
  services:     number;
  categories:   number;
  requetes:     number;
}
