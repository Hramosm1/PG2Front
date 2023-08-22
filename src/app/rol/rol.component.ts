import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-rol',
  templateUrl: './rol.component.html',
  styleUrls: ['./rol.component.css']
})

export class RolComponent implements OnInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  rolesDataSource: MatTableDataSource<any>;
  roles: any[] = [];

  displayedColumns = ['id', 'name','actions'];

  constructor(private http: HttpClient){
    this.rolesDataSource = new MatTableDataSource<any>();
  }

  ngOnInit(): void {
    this.cargarRoles();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.rolesDataSource.filter = filterValue.trim().toLowerCase();
  }

  cargarRoles(){
    const urlRoles = 'http://localhost:9200/rol';

    this.http.get<any[]>(urlRoles).subscribe(
      (response) => {
        this.roles = response;
        this.rolesDataSource.data = this.roles;
        this.rolesDataSource.paginator = this.paginator; // Configurar el paginador
      },
      (error) => {
        console.error('Error al cargar roles', error);
      }
    );
  }

  edit(id: any) {
    Swal.fire({
      title: 'Editar Rol',
      html: `
        <input type="text" id="descripcion" class="swal2-input" placeholder="Nueva Descripción">
        <input type="checkbox" id="estado" class="swal2-checkbox" checked> Activo
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      preConfirm: () => {
        const newDescripcion = (document.getElementById('descripcion') as HTMLInputElement).value;
        const newEstado = (document.getElementById('estado') as HTMLInputElement).checked;
        return this.editRoleRequest(id.id_rol, newDescripcion, newEstado);
      }
    });
  }

  editRoleRequest(id: number, descripcion: string, estado: boolean) {
    const urlUpdate = `http://localhost:9200/rol/${id}`;
    const token = localStorage.getItem('token');

    if (!token) {
      console.warn('No se encontró el token en el Local Storage.');
      return false;
    }

    const headers = new HttpHeaders({
      Authorization: `${token}`
    });

    const body = {
      descripcion: descripcion,
      estado: estado
    };

    return this.http.patch(urlUpdate, body, { headers }).toPromise()
      .then(() => {
        Swal.fire('Éxito', 'Rol actualizado correctamente', 'success');
        this.cargarRoles();
        return true;
      })
      .catch((error) => {
        console.error('Error al actualizar el rol', error);
        Swal.fire('Error', 'No se pudo actualizar el rol', 'error');
        return false;
      });
  }

  view(id: any): void {
    const urlGet = `http://localhost:9200/rol/${id}`;
    this.http.get<any[]>(urlGet).subscribe(
      (rolDetails: any) => {
        Swal.fire({
          title: 'Detalles del rol',
          html: `
            <p><strong>ID:</strong> ${rolDetails.id_rol}</p>
            <p><strong>Descripción:</strong> ${rolDetails.descripcion}</p>
            <p><strong>Estado:</strong> ${rolDetails.estado ? 'Activo' : 'Inactivo'}</p>
          `,
          icon: 'success'
        });
      },
      (error) => {
        console.error('Error al obtener los detalles del item', error);
        Swal.fire('Error', 'No se pudieron obtener los detalles del item', 'error');
      }
    );
  }

  delete(id: any): void {
    const urlDelete = `http://localhost:9200/rol/${id.id_rol}`;
    const token = localStorage.getItem('token');

    if(token){
      const headers = new HttpHeaders({
        Authorization: `${token}`
      });

      Swal.fire({
        title: '¿Está seguro de eliminar el rol?',
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
              Swal.fire('Éxito', 'Rol eliminado correctamente', 'success');
              this.cargarRoles();
            },
            (err) => {
              console.error('Error al eliminar el rol', err);
              Swal.fire('Error', 'No se pudo eliminar el rol', 'error');
            }
          );
        }
      })

    }
  }

  openRegisterDialog() {
    Swal.fire({
      title: 'Registrar Nuevo Rol',
      html: `
        <input type="text" id="descripcion" class="swal2-input" placeholder="Descripción" required>
        <input type="checkbox" id="estado" class="swal2-checkbox" checked> Activo
      `,
      showCancelButton: true,
      confirmButtonText: 'Registrar',
      preConfirm: () => {
        const descripcion = (document.getElementById('descripcion') as HTMLInputElement).value;
        const estado = (document.getElementById('estado') as HTMLInputElement).checked;
        return this.registerRole(descripcion, estado);
      }
    });
  }

  registerRole(descripcion: string, estado: boolean) {
    const url = 'http://localhost:9200/rol';
    const token = localStorage.getItem('token');

    if (!token) {
      console.warn('No se encontró el token en el Local Storage.');
      return false;
    }

    const headers = new HttpHeaders({
      Authorization: `${token}`
    });

    const body = {
      descripcion: descripcion,
      estado: estado
    };

    return this.http.post(url, body, { headers }).toPromise()
      .then(() => {
        Swal.fire('Éxito', 'Rol registrado correctamente', 'success');
        this.cargarRoles();
        return true;
      })
      .catch((error) => {
        console.error('Error al registrar el rol', error);
        Swal.fire('Error', 'No se pudo registrar el rol', 'error');
        return false;
      });
  }
}
