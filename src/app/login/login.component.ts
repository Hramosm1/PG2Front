import { Component } from '@angular/core';
import { AuthService } from './../auth.service';
import { Router } from '@angular/router'; // Importa el módulo Router

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  identifier: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onLogin(): void {
    this.authService.login(this.identifier, this.password).subscribe(
      (response) => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          this.router.navigate(['/navigation']);
        }
      },
      (error) => {
        console.error('Error de inicio de sesión:', error);
      }
    );
  }
}
