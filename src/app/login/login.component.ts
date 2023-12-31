import { Component } from '@angular/core';
import { AuthService } from './../auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import * as CryptoJS from 'crypto-js';

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
    const encryptedPassword = CryptoJS.MD5(this.password).toString();
    this.authService.login(this.identifier, encryptedPassword).subscribe(
      (response) => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('identifier', this.identifier);
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
