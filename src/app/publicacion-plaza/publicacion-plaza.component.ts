import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';

@Component({
  selector: 'app-publicacion-plaza',
  templateUrl: './publicacion-plaza.component.html',
  styleUrls: ['./publicacion-plaza.component.css']
})
export class PublicacionPlazaComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('startInput') startInput: any;
  publicacionDataSource: MatTableDataSource<any>;
  publicacion: any[] = [];
  router = new Router();
  plazas: { [id: number]: string } = {};
  medios: { [id: number]: string } = {};
  estados: { [id: number]: string } = {};

  displayedColumns = ['id', 'plaza', 'medio', 'estado', 'fecha', 'actions'];

  constructor(private http: HttpClient){
    this.publicacionDataSource = new MatTableDataSource<any>();
  }

  ngOnInit(): void {
    const token = localStorage.getItem('token');

    if (token) {
       this.cargarPublicaciones();
       this.cargarPlazas();
       this.cargarMediosDifusion();
       this.cargarEstados();
    } else {
      this.router.navigate(['login']);
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.publicacionDataSource.filter = filterValue.trim().toLowerCase();
  }

  cargarPublicaciones(){
    const urlEstados = 'http://localhost:9200/publicacion-plaza';

    this.http.get<any[]>(urlEstados).subscribe(
      (response) => {
        this.publicacion = response;
        this.publicacionDataSource.data = this.publicacion;
        this.publicacionDataSource.paginator = this.paginator;
      },
      (error) => {
        console.error('Error al cargar la publicacion', error);
      }
    );

    console.log(this.publicacion);
  }

  cargarPlazas(){
    const url = 'http://localhost:9200/plaza';

    this.http.get<any[]>(url).subscribe(
      (response) => {
        const Map: Record<number, string> = {};
        response.forEach(plaza => {
          Map[plaza.id_plaza] = plaza.descripcion;
        });
        this.plazas = Map;
      },
      (error) => {
        console.error('Error al cargar plazas', error);
      }
    );
  }

  cargarMediosDifusion(){
    const url = 'http://localhost:9200/medio-difusion';

    this.http.get<any[]>(url).subscribe(
      (response) => {
        const Map: Record<number, string> = {};
        response.forEach(medio => {
          Map[medio.id_medio_difusion] = medio.descripcion;
        });
        this.medios = Map;
      },
      (error) => {
        console.error('Error al cargar medios de difusion', error);
      }
    );
  }

  cargarEstados(){
    const url = 'http://localhost:9200/estado-publicacion';

    this.http.get<any[]>(url).subscribe(
      (response) => {
        const Map: Record<number, string> = {};
        response.forEach(estado => {
          Map[estado.id_estado_publicacion] = estado.descripcion;
        });
        this.estados = Map;
      },
      (error) => {
        console.error('Error al cargar medios de difusion', error);
      }
    );
  }



  openRegisterDialog() {


    Swal.fire({
      title: 'Registrar Nueva publicacion',
      html: `
        <label for="plaza">Seleccione una plaza:</label>
        <select id="plazas" class="swal2-select custom-input">
          ${this.getPlazasOptions()}
        </select><br><br>
        <label for="medio">Seleccione medio de difusion:</label>
        <select id="medios" class="swal2-select custom-input">
          ${this.getMediosOptions()}
        </select><br><br>
        <label for="estado">Seleccione el estado de la publicacion:</label>
        <select id="estados" class="swal2-select custom-input">
          ${this.getEstadosOptions()}
        </select><br><br>
        <label for="estado">Fecha de registro:</label><br>
        <input type="date" id="fecha" #startInput class="swal2-input custom-input" />
      `,
      showCancelButton: true,
      confirmButtonText: 'Registrar',
      preConfirm: () => {
        const descripcion = (document.getElementById('descripcion') as HTMLInputElement).value;
        const estado = (document.getElementById('estado') as HTMLInputElement).checked ? 1 : 0;
        return this.registerPlaza(descripcion, estado);
      }
    });
  }

  getPlazasOptions() {
    return Object.keys(this.plazas).map(id => {
      const numericId = parseInt(id); // Convierte la cadena a número
      return `<option value="${numericId}">${this.plazas[numericId]}</option>`;
    }).join('');
  }

  getMediosOptions() {
    return Object.keys(this.medios).map(id => {
      const numericId = parseInt(id); // Convierte la cadena a número
      return `<option value="${numericId}">${this.medios[numericId]}</option>`;
    }).join('');
  }

  getEstadosOptions() {
    return Object.keys(this.estados).map(id => {
      const numericId = parseInt(id); // Convierte la cadena a número
      return `<option value="${numericId}">${this.estados[numericId]}</option>`;
    }).join('');
  }

  registerPlaza(descripcion: string, estado: number) {
    const url = 'http://localhost:9200/plaza';
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
      id_estado_plaza: estado
    };

    return this.http.post(url, body, { headers }).toPromise()
      .then(() => {
        Swal.fire('Éxito', 'Plaza registrado correctamente', 'success');
        this.cargarPublicaciones();
        return true;
      })
      .catch((error) => {
        console.error('Error al registrar la plaza', error);
        Swal.fire('Error', 'No se pudo registrar la plaza', 'error');
        return false;
      });
  }

  view(id: any): void {
    const urlGet = `http://localhost:9200/plaza/${id}`;
    this.http.get<any[]>(urlGet).subscribe(
      (plazaDetails: any) => {
        Swal.fire({
          title: 'Detalles de la plaza',
          html: `
            <p><strong>ID:</strong> ${plazaDetails.id_plaza}</p>
            <p><strong>Descripción:</strong> ${plazaDetails.descripcion}</p>
            <p><strong>Estado:</strong> ${plazaDetails.id_estado_plaza === 1 ? 'Activo' : 'Inactivo'}</p>
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

  edit(id: any) {
    Swal.fire({
      title: 'Editar Rol',
      html: `
      <input type="text" id="descripcion" class="swal2-input" value="${id.descripcion}" required>
      <input type="checkbox" id="estado" class="swal2-checkbox" ${id.id_estado_plaza === 1 ? 'checked' : ''}> Activo
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      preConfirm: () => {
        const descripcion = (document.getElementById('descripcion') as HTMLInputElement).value;
        const estado = (document.getElementById('estado') as HTMLInputElement).checked ? 1 : 0;
        return this.editPlazaRequest(id.id_plaza, descripcion, estado);
      }
    });
  }

  editPlazaRequest(id: number, descripcion: string, estado: number) {
    const urlUpdate = `http://localhost:9200/plaza/${id}`;
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
      id_estado_plaza: estado
    };

    return this.http.patch(urlUpdate, body, { headers }).toPromise()
      .then(() => {
        Swal.fire('Éxito', 'Plaza actualizada correctamente', 'success');
        this.cargarPublicaciones();
        return true;
      })
      .catch((error) => {
        console.error('Error al actualizar la plaza', error);
        Swal.fire('Error', 'No se pudo actualizar la plaza', 'error');
        return false;
      });
  }

  delete(id: any): void {
    const urlDelete = `http://localhost:9200/plaza/${id.id_plaza}`;
    const token = localStorage.getItem('token');

    if(token){
      const headers = new HttpHeaders({
        Authorization: `${token}`
      });

      Swal.fire({
        title: '¿Está seguro de eliminar la plaza?',
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
              Swal.fire('Éxito', 'Plaza eliminada correctamente', 'success');
              this.cargarPublicaciones();
            },
            (err) => {
              console.error('Error al eliminar la plaza', err);
              Swal.fire('Error', 'No se pudo eliminar la plaza', 'error');
            }
          );
        }
      })

    }
  }

}
