# UniRequêtes — Frontend Angular 19

Application de gestion des requêtes dans une institution universitaire.

**Licence Professionnelle en Génie Logiciel — Université de Douala**

---

## Stack technique

| Technologie | Version |
|---|---|
| Angular | 19.1.7 |
| Angular Material | 19.1.7 |
| TypeScript | 5.7 |
| RxJS | 7.8 |

---

## Architecture

```
src/app/
├── core/               # Services, guards, interceptors, modèles, enums
├── shared/             # Composants, layouts, pipes, directives réutilisables
├── features/
│   ├── auth/           # Connexion et sélection de profil
│   ├── student/        # Module étudiant
│   ├── agent/          # Module agent administratif
│   └── admin/          # Module administrateur
├── app.routes.ts       # Routing racine avec lazy loading
├── app.config.ts       # Configuration standalone Angular 19
└── app.component.ts    # Composant racine
```

---

## Installation

```bash
# Installer les dépendances
npm install

# Lancer en développement (Spring Boot sur localhost:8080)
ng serve

# Build production
ng build
```

---

## Configuration API

Le fichier `proxy.conf.json` redirige `/api` vers `http://localhost:8080`.
Pour la production, modifiez `src/environments/environment.production.ts`.

---

## Comptes de test (Spring Boot)

| Rôle | Email | Mot de passe |
|---|---|---|
| Étudiant | alain.nguema@univ.cm | demo1234 |
| Agent | marie.essomba@univ.cm | demo1234 |
| Admin | b.tchoua@univ.cm | demo1234 |

---

## Fonctionnalités

### Module Étudiant
- Dashboard avec statistiques personnelles
- Créer / modifier / soumettre / supprimer une requête
- Consulter les réponses reçues
- Suivre l'avancement (timeline animée)
- Upload de pièces jointes

### Module Agent
- Dashboard service avec requêtes en attente
- Consulter et répondre aux requêtes du service
- Changer le statut d'une requête
- Créer des requêtes inter-services
- Répondre aux demandes inter-services reçues
- Suivi des échanges inter-services

### Module Admin
- Dashboard global avec statistiques
- CRUD utilisateurs + affectation de service
- CRUD services
- CRUD catégories avec filtres

---

## Patterns utilisés

- **Standalone Components** — zéro NgModule
- **Angular Signals** — gestion d'état locale par feature (`signal`, `computed`, `effect`)
- **Reactive Forms** — tous les formulaires
- **Functional Guards** — `authGuard` et `roleGuard(roles)`
- **Functional Interceptor** — JWT automatique + gestion 401
- **Lazy Loading** — chaque feature est un chunk séparé
- **toSignal()** — conversion Observable → Signal sans subscribe manuel

---

## Migration vers Angular 20+

Le projet est conçu pour être facilement mis à jour :
- Pas de NgModules
- Composants autonomes avec imports explicites
- Services `providedIn: 'root'`
- Aucun `subscribe()` non géré

---

## Structure des endpoints Spring Boot attendus

Voir `src/app/core/constants/api.constants.ts` pour la liste complète.

Exemple de sécurisation Spring Security :

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(s -> s.sessionCreationPolicy(STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/requetes/moi").hasRole("ETUDIANT")
                .requestMatchers("/api/requetes/service/**").hasRole("AGENT")
                .requestMatchers("/api/utilisateurs/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }
}
```
