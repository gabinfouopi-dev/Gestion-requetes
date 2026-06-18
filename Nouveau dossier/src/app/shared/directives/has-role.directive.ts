import { Directive, Input, TemplateRef, ViewContainerRef, inject, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Role } from '../../core/enums/role.enum';

/**
 * *appHasRole="['ADMIN', 'AGENT']"
 * Affiche l'élément uniquement si l'utilisateur possède l'un des rôles.
 */
@Directive({ selector: '[appHasRole]', standalone: true })
export class HasRoleDirective implements OnInit {
  @Input('appHasRole') roles: Role[] = [];

  private auth = inject(AuthService);
  private tmpl = inject(TemplateRef);
  private vcr  = inject(ViewContainerRef);

  ngOnInit(): void {
    const role = this.auth.userRole();
    if (role && this.roles.includes(role)) {
      this.vcr.createEmbeddedView(this.tmpl);
    }
  }
}
