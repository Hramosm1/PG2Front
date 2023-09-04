import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';

@Component({
  selector: 'app-permisos',
  templateUrl: './permisos.component.html',
  styleUrls: ['./permisos.component.css']
})
export class PermisosComponent implements OnInit{
  @ViewChild(MatPaginator) paginatorPermisos!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  permisosDataSource: MatTableDataSource<any>;
  modulos: { [id: number]: string } = {};
  roles: { [id: number]: string } = {};
  permisos: any[] = [];

  router = new Router();

  columnsPermisos = ['id', 'rol', 'modulo','actions'];

  constructor(private http: HttpClient){
    this.permisosDataSource = new MatTableDataSource<any>();
  }

  ngOnInit(): void {
    const token = localStorage.getItem('token');

    if (token) {
       this.cargarPermisos();
       this.cargarModulos();
       this.cargarRoles();
    } else {
      this.router.navigate(['login']);
  }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.permisosDataSource.filter = filterValue.trim().toLowerCase();
  }

  cargarPermisos(){
    const urlEstados = 'http://localhost:9200/permiso';

    this.http.get<any[]>(urlEstados).subscribe(
      (response) => {
        this.permisos = response;
        this.permisosDataSource.data = this.permisos;
        this.permisosDataSource.paginator = this.paginatorPermisos;
      },
      (error) => {
        console.error('Error al cargar permisos', error);
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

  cargarModulos(){
    const urlModulos = 'http://localhost:9200/modulo';

    this.http.get<any[]>(urlModulos).subscribe(
      (response) => {
        const modulosMap: Record<number, string> = {};
        response.forEach(modulo => {
          modulosMap[modulo.id_modulo] = modulo.descripcion;
        });
        this.modulos = modulosMap;
      },
      (error) => {
        console.error('Error al cargar modulos', error);
      }
    );
  }

  openRegisterDialog(){
    Swal.fire({
      title: 'Registrar nuevo permiso',
      html: `

          <label for="rol">Selecciona un rol:</label>
          <select id="rol" class="swal2-select custom-input">
            ${this.getRolOptions()} <!-- Genera las opciones del select desde roles -->
          </select><br>
          <label for="modulo">Selecciona un módulo:</label>
          <select id="modulo" class="swal2-select custom-input">
            ${this.getModuloOptions()} <!-- Genera las opciones del select desde modulos -->
          </select><br>
        <div style="text-align: left;">
          <input type="checkbox" id="lectura" class="swal2-checkbox" checked> Lectura<br>
          <input type="checkbox" id="escritura" class="swal2-checkbox" checked> Escritura<br>
          <input type="checkbox" id="actualizacion" class="swal2-checkbox" checked> Actualizacion<br>
          <input type="checkbox" id="eliminacion" class="swal2-checkbox" checked> Eliminacion
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Registrar',
      customClass: 'custom-input',
      preConfirm: () => {
        const lectura = (document.getElementById('lectura') as HTMLInputElement).checked;
        const escritura = (document.getElementById('escritura') as HTMLInputElement).checked;
        const actualizacion = (document.getElementById('actualizacion') as HTMLInputElement).checked;
        const eliminacion = (document.getElementById('eliminacion') as HTMLInputElement).checked;;
        const rol = (document.getElementById('rol') as HTMLInputElement).value;
        const modulo = (document.getElementById('modulo') as HTMLInputElement).value;
        return this.registerPermiso(rol, modulo, lectura, escritura, actualizacion, eliminacion);
      }
    });
  }

  registerPermiso(id_rol: string, id_modulo: string, lectura: boolean, escritura: boolean, actualizacion: boolean, eliminacion: boolean) {
    const urlCreate = `http://localhost:9200/permiso`;
    const token = localStorage.getItem('token');

    if (!token) {
      console.warn('No se encontró el token en el Local Storage.');
      return false;
    }

    const headers = new HttpHeaders({
      Authorization: `${token}`
    });

    const body = {
      id_modulo: parseInt(id_modulo),
      id_rol: parseInt(id_rol),
      r: lectura,
      w: escritura,
      u: actualizacion,
      d: eliminacion
    };

    return this.http.post(urlCreate, body, { headers }).toPromise()
      .then(() => {
        Swal.fire('Éxito', 'Permiso creado correctamente', 'success');
        this.cargarPermisos();
        this.cargarRoles();
        this.cargarModulos();
        return true;
      })
      .catch((error) => {
        console.error('Error al crear el permiso', error);
        Swal.fire('Error', 'No se pudo registrar el permiso', 'error');
        return false;
      });
  }

  getRolOptions() {
    return Object.keys(this.roles).map(id => {
      const numericId = parseInt(id); // Convierte la cadena a número
      return `<option value="${numericId}">${this.roles[numericId]}</option>`;
    }).join('');
  }

  getModuloOptions() {
    return Object.keys(this.modulos).map(id => {
      const numericId = parseInt(id); // Convierte la cadena a número
      return `<option value="${numericId}">${this.modulos[numericId]}</option>`;
    }).join('');
  }

  edit(id: any) {
    Swal.fire({
      title: 'Editar permisos',
      html: `
        <input type="checkbox" id="lectura" class="swal2-checkbox" checked> Lectura
        <input type="checkbox" id="escritura" class="swal2-checkbox" checked> Escritura
        <input type="checkbox" id="actualizacion" class="swal2-checkbox" checked> Actualizacion
        <input type="checkbox" id="eliminacion" class="swal2-checkbox" checked> Eliminacion
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      preConfirm: () => {
        const lectura = (document.getElementById('lectura') as HTMLInputElement).checked;
        const escritura = (document.getElementById('escritura') as HTMLInputElement).checked;
        const actualizacion = (document.getElementById('actualizacion') as HTMLInputElement).checked;
        const eliminacion = (document.getElementById('eliminacion') as HTMLInputElement).checked;
        return this.editPermisoRequest(id.id_permiso, lectura, escritura, actualizacion, eliminacion);
      }
    });
  }

  editPermisoRequest(id: number, lectura: boolean, escritura: boolean, actualizacion: boolean, eliminacion: boolean) {
    const urlUpdate = `http://localhost:9200/permiso/${id}`;
    const token = localStorage.getItem('token');

    if (!token) {
      console.warn('No se encontró el token en el Local Storage.');
      return false;
    }

    const headers = new HttpHeaders({
      Authorization: `${token}`
    });

    const body = {
      r: lectura,
      w: escritura,
      u: actualizacion,
      d: eliminacion
    };

    return this.http.patch(urlUpdate, body, { headers }).toPromise()
      .then(() => {
        Swal.fire('Éxito', 'Permiso actualizado correctamente', 'success');
        this.cargarPermisos();
        return true;
      })
      .catch((error) => {
        console.error('Error al actualizar el permiso', error);
        Swal.fire('Error', 'No se pudo actualizar el permiso', 'error');
        return false;
      });
  }

  view(id: any): void {
    const urlGet = `http://localhost:9200/permiso/${id}`;
    this.http.get<any[]>(urlGet).subscribe(
      (permisoDetails: any) => {
        Swal.fire({
          title: 'Detalles del permiso',
          html: `
            <p><strong>ID:</strong> ${permisoDetails.id_permiso}</p>
            <p><strong>Lectura:</strong> ${permisoDetails.r ? 'Activo' : 'Inactivo'}</p>
            <p><strong>Escritura:</strong> ${permisoDetails.w ? 'Activo' : 'Inactivo'}</p>
            <p><strong>Actualizacion:</strong> ${permisoDetails.u ? 'Activo' : 'Inactivo'}</p>
            <p><strong>Eliminacion:</strong> ${permisoDetails.d ? 'Activo' : 'Inactivo'}</p>
            <p><strong>Rol:</strong> ${permisoDetails.rol.descripcion}</p>
            <p><strong>Modulo:</strong> ${permisoDetails.modulos.descripcion}</p>

          `,
          icon: 'success'
        });
      },
      (error) => {
        console.error('Error al obtener los detalles del permiso', error);
        Swal.fire('Error', 'No se pudieron obtener los detalles del permiso', 'error');
      }
    );
  }

  delete(id: any): void {
    const urlDelete = `http://localhost:9200/permiso/${id.id_permiso}`;
    const token = localStorage.getItem('token');

    if(token){
      const headers = new HttpHeaders({
        Authorization: `${token}`
      });

      Swal.fire({
        title: '¿Está seguro de eliminar el permiso?',
        text: 'Rol: ' + id.rol.descripcion +' ' + ' Modulo: ' +id.modulos.descripcion,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: '¡Sí, bórralo!'
      }).then((result) => {
        if (result.isConfirmed) {
          this.http.delete(urlDelete, { headers }).subscribe(
            () => {
              Swal.fire('Éxito', 'Permiso eliminado correctamente', 'success');
              this.cargarPermisos();
            },
            (err) => {
              console.error('Error al eliminar el permiso', err);
              Swal.fire('Error', 'No se pudo eliminar el permiso', 'error');
            }
          );
        }
      })

    }
  }

}
