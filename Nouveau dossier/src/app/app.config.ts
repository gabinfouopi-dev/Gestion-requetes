import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';

export const appConfig: ApplicationConfig = {
  providers: [
    // Performance : zone.js coalescing
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Router avec transitions de vue et binding d'inputs
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),

    // HttpClient avec intercepteur JWT fonctionnel
    provideHttpClient(withInterceptors([jwtInterceptor]), withFetch()),

    // Angular Material animations asynchrones (meilleure perf)
    provideAnimationsAsync(),

    // Locale française pour Material Datepicker
    { provide: MAT_DATE_LOCALE, useValue: 'fr-FR' },

    // Style outline pour tous les form-fields Material
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'outline', subscriptSizing: 'dynamic' }
    },

    // Durée par défaut des snackbars
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: { duration: 3500, horizontalPosition: 'end', verticalPosition: 'bottom' }
    },
  ],
};
