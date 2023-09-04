import { Component } from '@angular/core';
import { AuthService } from './../auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

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
          this.router.navigate(['/dashboard']);
        }
      },
      (error) => {
        console.log(error.error);

        Swal.fire({
          title: 'Error al iniciar sesión',
          text: error.error.error,
          icon: 'warning',
          confirmButtonColor: '#3085d6'
        });
      }
    );
  }
}
