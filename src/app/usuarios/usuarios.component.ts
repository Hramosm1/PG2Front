import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  usuariosDataSource: MatTableDataSource<any>;
  rolesDataSource: MatTableDataSource<any>;
  usuarios: any[] = [];
  roles: { [id: number]: string } = {};
  router = new Router();

  displayedColumns = ['id', 'rol', 'usuario', 'email', 'actions'];

  constructor(private http: HttpClient){
    this.usuariosDataSource = new MatTableDataSource<any>();
    this.rolesDataSource = new MatTableDataSource<any>();
  }

  ngOnInit(): void {
    const token = localStorage.getItem('token');

    if (token) {
      this.cargarusuarios();
      this.cargarRoles();
    } else {
        this.router.navigate(['login']);
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.usuariosDataSource.filter = filterValue.trim().toLowerCase();
  }

  cargarusuarios(){
    const urlEstados = 'http://localhost:9200/usuario';

    this.http.get<any[]>(urlEstados).subscribe(
      (response) => {
        this.usuarios = response;
        this.usuariosDataSource.data = this.usuarios;
        this.usuariosDataSource.paginator = this.paginator;
      },
      (error) => {
        console.error('Error al cargar usuarios', error);
      }
    );
  }

  cargarRoles(){
    const urlRoles = 'http://localhost:9200/rol';

    this.http.get<any[]>(urlRoles).subscribe(
      (response) => {
        const rolesMap: Record<number, string> = {};
        response.forEach(rol => {
          rolesMap[rol.id_rol] = rol.descripcion;
        });
        this.roles = rolesMap;
      },
      (error) => {
        console.error('Error al cargar roles', error);
      }
    );
  }

  openRegisterDialog(){
    Swal.fire({
      title: 'Registrar nuevo usuario',
      html: `
        <input type="text" id="usuario" class="swal2-input" placeholder="usuario" required>
        <input type="email" id="email" class="swal2-input" placeholder="email@mail.com" required>
        <input type="password" id="password" class="swal2-input" placeholder="password" required>
        <select id="rol" class="swal2-select custom-input">
          ${this.getRolesOptions()} <!-- Genera las opciones del select desde roles -->
        </select>
      `,
      showCancelButton: true,
      confirmButtonText: 'Registrar',
      customClass: 'custom-input',
      preConfirm: () => {
        const newUsuario = (document.getElementById('usuario') as HTMLInputElement).value;
        const newEmail = (document.getElementById('email') as HTMLInputElement).value;
        const newPassword = (document.getElementById('password') as HTMLInputElement).value;
        const newRol = (document.getElementById('rol') as HTMLInputElement).value;
        return this.registerUsuario(newRol, newUsuario, newEmail, newPassword);
      }
    });
  }

  registerUsuario(id_rol: string, usuario: string, email: string, password: string) {
    const urlCreate = `http://localhost:9200/usuario`;
    const token = localStorage.getItem('token');

    if (!token) {
      console.warn('No se encontró el token en el Local Storage.');
      return false;
    }

    const headers = new HttpHeaders({
      Authorization: `${token}`
    });

    const body = {
      usuario: usuario,
      email: email,
      password: CryptoJS.MD5(password).toString(),
      id_rol: parseInt(id_rol)
    };

    return this.http.post(urlCreate, body, { headers }).toPromise()
      .then(() => {
        Swal.fire('Éxito', 'Usuario creado correctamente', 'success');
        this.cargarusuarios();
        this.cargarRoles();
        return true;
      })
      .catch((error) => {
        console.error('Error al crear el usaurio', error);
        Swal.fire('Error', 'No se pudo registrar el usuario', 'error');
        return false;
      });
  }

  getRolesOptions() {
    return Object.keys(this.roles).map(id => {
      const numericId = parseInt(id); // Convierte la cadena a número
      return `<option value="${numericId}">${this.roles[numericId]}</option>`;
    }).join('');
  }

  view(id: any): void{
    const urlGet = `http://localhost:9200/usuario/${id}`;
    this.http.get<any[]>(urlGet).subscribe(
      (usuarioDetails: any) => {
        Swal.fire({
          title: 'Detalles del usuario',
          html: `
            <p><strong>ID:</strong> ${usuarioDetails.id_usuario}</p>
            <p><strong>Usuario:</strong> ${usuarioDetails.usuario}</p>
            <p><strong>Email:</strong> ${usuarioDetails.email}</p>
            <p><strong>Rol:</strong> ${usuarioDetails.rol.descripcion}</p>
          `,
          icon: 'success'
        });
        console.log(usuarioDetails)
      },
      (error) => {
        console.error('Error al obtener los detalles del usuario', error);
        Swal.fire('Error', 'No se pudieron obtener los detalles del usuario', 'error');
      }
    );
  }

  edit(id: any): void{
    Swal.fire({
      title: 'Editar Usuario',
      html: `
        <input type="text" id="usuario" class="swal2-input" value="${id.usuario}">
        <input type="text" id="email" class="swal2-input" value="${id.email}">
        <input type="password" id="password" class="swal2-input" placeholder="Nueva contraseña">
        <select id="rol" class="swal2-select custom-input">
          ${this.getRolesOptions()} <!-- Genera las opciones del select desde roles -->
        </select>
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      customClass: 'custom-input',
      preConfirm: () => {
        const newUsuario = (document.getElementById('usuario') as HTMLInputElement).value;
        const newEmail = (document.getElementById('email') as HTMLInputElement).value;
        const newPassword = (document.getElementById('password') as HTMLInputElement).value;
        const newRol = (document.getElementById('rol') as HTMLInputElement).value;
        return this.editUsuarioRequest(id.id_usuario, newUsuario, newEmail, newPassword, newRol);
      }
    });
  }

  editUsuarioRequest(id: number, usuario: string, email: string, password: string, rol: string) {
    const urlUpdate = `http://localhost:9200/usuario/${id}`;
    const token = localStorage.getItem('token');

    if (!token) {
      console.warn('No se encontró el token en el Local Storage.');
      return false;
    }

    const headers = new HttpHeaders({
      Authorization: `${token}`
    });

    const body = {
      id_rol: parseInt(rol),
      usuario: usuario,
      email: email,
      password: password
    };

    return this.http.patch(urlUpdate, body, { headers }).toPromise()
      .then(() => {
        Swal.fire('Éxito', 'Rol actualizado correctamente', 'success');
        this.cargarusuarios();
        this.cargarRoles();
        return true;
      })
      .catch((error) => {
        console.error('Error al actualizar el usuario', error);
        Swal.fire('Error', 'No se pudo actualizar el usuario', 'error');
        return false;
      });
  }

  delete(id: any): void {
    const urlDelete = `http://localhost:9200/usuario/${id.id_usuario}`;
    const token = localStorage.getItem('token');

    if(token){
      const headers = new HttpHeaders({
        Authorization: `${token}`
      });

      Swal.fire({
        title: '¿Está seguro de eliminar al usuario?',
        text: id.descripcion,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: '¡Sí, bórralo!'
      }).then((result) => {
        if (result.isConfirmed) {
          this.http.delete(urlDelete, { headers }).subscribe(
            () => {
              Swal.fire('Éxito', 'Usuario eliminado correctamente', 'success');
              this.cargarusuarios();
            },
            (err) => {
              console.error('Error al eliminar al usuario', err);
              Swal.fire('Error', 'No se pudo eliminar al usuario', 'error');
            }
          );
        }
      })

    }
  }

}
