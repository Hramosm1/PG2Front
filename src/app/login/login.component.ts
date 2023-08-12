import { Component } from '@angular/core';
import { AuthService } from './../auth.service';
import { Router } from '@angular/router'; // Importa el módulo Router

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent {
  identifier: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onLogin(): void {
    this.authService.login(this.identifier, this.password).subscribe(
      (response) => {
        // Maneja la respuesta aquí
        if (response && response.token) {
          // Almacenar el token en el almacenamiento local o en una cookie
          localStorage.setItem('token', response.token);

          // Redireccionar al usuario a la página de navegación
          this.router.navigate(['/navigation']); // Cambia 'dashboard' por la ruta de tu página de navegación
        }
      },
      (error) => {
        // Maneja el error aquí
        console.error('Error de inicio de sesión:', error);
      }
    );
  }
}
