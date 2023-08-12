import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './../auth.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // Importa map desde 'rxjs/operators'

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
})
export class NavigationComponent {
  isHandset$: Observable<boolean>;

  constructor(
    private authService: AuthService,
    private router: Router,
    private breakpointObserver: BreakpointObserver
  ) {
    this.isHandset$ = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
      map((result) => result.matches)
    );
  }

  logout(): void {
    // Limpiar el token de autenticación (adapta esto según cómo estés manejando el token)
    this.authService.clearAuthToken();

    // Redirigir al usuario a la página de inicio de sesión
    this.router.navigate(['/login']); // Cambia 'login' por la ruta de tu página de inicio de sesión
  }
}
