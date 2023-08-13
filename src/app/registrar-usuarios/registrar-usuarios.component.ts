import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router'; // Importa el módulo Router


@Component({
  selector: 'app-registrar-usuarios',
  templateUrl: './registrar-usuarios.component.html',
  styleUrls: ['./registrar-usuarios.component.css']
})

export class RegistrarUsuariosComponent implements OnInit {
  registroForm: FormGroup;
  roles: any[] = [];
  seleccionarRol: number = 1;

  constructor(private formBuilder: FormBuilder, private http: HttpClient, private router: Router) {
    this.registroForm = this.formBuilder.group({
      usuario: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', Validators.required),
      id_rol: new FormControl('', Validators.required),
    });
  }

  ngOnInit(): void {
    this.cargarRoles();
  }

  cargarRoles() {
    const urlRoles = 'http://localhost:9200/rol';

    this.http.get<any[]>(urlRoles).subscribe(
      (response) => {
        this.roles = response;
      },
      (error) => {
        console.error('Error al cargar roles', error);
      }
    );
  }

  registrarUsuario() {
    if (this.registroForm.valid) {
      const url = 'http://localhost:9200/usuario';
      const formData = this.registroForm.value;

      this.http.post(url, formData).subscribe(
        (response) => {
          console.log('Usuario registrado exitosamente', response);
          this.router.navigate(['/']);
        },
        (error) => {
          console.error('Error al registrar usuario', error);
        }
      );
    }
  }
}
