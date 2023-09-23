import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';


@Component({
  selector: 'app-entrevista',
  templateUrl: './entrevista.component.html',
  styleUrls: ['./entrevista.component.css']
})
export class EntrevistaComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  entrevistaDataSource: MatTableDataSource<any>;
  estadosDataSource: MatTableDataSource<any>;
  plazaDataSource: MatTableDataSource<any>;
  entrevista: any[] = [];
  estado: { [id: number]: string } = {};
  plaza: { [id: number]: string } = {};
  router = new Router();

  displayedColumns = ['id', 'estado', 'plaza', 'fecha','actions'];

  constructor(private http: HttpClient){
    this.entrevistaDataSource = new MatTableDataSource<any>();
    this.estadosDataSource = new MatTableDataSource<any>();
    this.plazaDataSource = new MatTableDataSource<any>();
  }

  ngOnInit(): void {
    const token = localStorage.getItem('token');

    if (token) {
       this.cargarEntrevistas();
       this.cargarEstados();
       this.cargarPlazas();
    } else {
      this.router.navigate(['login']);
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.entrevistaDataSource.filter = filterValue.trim().toLowerCase();
  }

  cargarEntrevistas(){
    const urlEstados = 'http://localhost:9200/entrevista';

    this.http.get<any[]>(urlEstados).subscribe(
      (response) => {
        this.entrevista = response.map(item => {
          const fechaISO = new Date(item.fecha_entrevista);
          const day = fechaISO.getDate().toString().padStart(2, '0');
          const month = (fechaISO.getMonth() + 1).toString().padStart(2, '0'); // Los meses se cuentan desde 0
          const year = fechaISO.getFullYear();
          const formattedDate = `${day}/${month}/${year}`;
          return { ...item, fecha_entrevista: formattedDate };
        });

        this.entrevistaDataSource.data = this.entrevista;
        this.entrevistaDataSource.paginator = this.paginator; // Configurar el paginador
      },
      (error) => {
        console.error('Error al cargar estados entrevista', error);
      }
    );
  }
  cargarPlazas(){
    const url = 'http://localhost:9200/plaza';

    this.http.get<any[]>(url).subscribe(
      (response) => {
        const Map: Record<number, string> = {};
        response.forEach(plaza => {
          Map[plaza.id_plaza] = plaza.descripcion;
        });
        this.plaza = Map;
      },
      (error) => {
        console.error('Error al cargar plazas', error);
      }
    );
  }

  cargarEstados(){
    const url = 'http://localhost:9200/estados-entrevista';

    this.http.get<any[]>(url).subscribe(
      (response) => {
        const Map: Record<number, string> = {};
        response.forEach(estado => {
          Map[estado.id_estado_entrevista] = estado.descripcion;
        });
        this.estado = Map;
      },
      (error) => {
        console.error('Error al cargar los estados', error);
      }
    );
  }

  openRegisterDialog() {
    Swal.fire({
      title: 'Registrar nueva entrevista',
      html: `
        <label for="plazas">Seleccione una plaza:</label>
        <select id="plaza" class="swal2-select custom-input">
          ${this.getPlazasOptions()}
        </select><br><br>
        <label for="estados">Seleccione el estado de la entrevista:</label>
        <select id="estado" class="swal2-select custom-input">
          ${this.getEstadosOptions()}
        </select><br><br>
        <label for="fechas">Fecha de entrevista:</label><br>
        <input type="date" id="fecha" #startInput class="swal2-input custom-input" />
      `,
      showCancelButton: true,
      confirmButtonText: 'Registrar',
      preConfirm: () => {
        const plaza = (document.getElementById('plaza') as HTMLInputElement).value;
        const estado = (document.getElementById('estado') as HTMLInputElement).value;
        const fecha = (document.getElementById('fecha') as HTMLInputElement).value;
        // Agregar la hora "00:00:00" a la fecha
        const fechaConHora = new Date(fecha).toISOString();
        return this.registerEntrevista(parseInt(plaza), parseInt(estado), fechaConHora);
      }
    });
  }

  getPlazasOptions() {
    return Object.keys(this.plaza).map(id => {
      const numericId = parseInt(id); // Convierte la cadena a número
      return `<option value="${numericId}">${this.plaza[numericId]}</option>`;
    }).join('');
  }

  getEstadosOptions() {
    return Object.keys(this.estado).map(id => {
      const numericId = parseInt(id); // Convierte la cadena a número
      return `<option value="${numericId}">${this.estado[numericId]}</option>`;
    }).join('');
  }

  registerEntrevista(id_plaza: number, id_estado: number, fecha: string) {
    const url = 'http://localhost:9200/entrevista';
    const token = localStorage.getItem('token');

    if (!token) {
      console.warn('No se encontró el token en el Local Storage.');
      return false;
    }

    const headers = new HttpHeaders({
      Authorization: `${token}`
    });

    const body = {
      id_estado_entrevista: id_estado,
      id_plaza: id_plaza,
      fecha_entrevista: fecha
    };

    return this.http.post(url, body, { headers }).toPromise()
      .then(() => {
        Swal.fire('Éxito', 'Entrevista registrada correctamente', 'success');
        this.cargarEntrevistas();
        return true;
      })
      .catch((error) => {
        console.error('Error al registrar la entrevista', error);
        Swal.fire('Error', 'No se pudo registrar la entrevista', 'error');
        return false;
      });
  }

  view(id: any): void {
    const urlGet = `http://localhost:9200/entrevista/${id}`;
    this.http.get<any[]>(urlGet).subscribe(
      (entrevistaDetails: any) => {
        Swal.fire({
          title: 'Detalles de la publicacion',
          html: `
            <p><strong>ID:</strong> ${entrevistaDetails.id_entrevista}</p>
            <p><strong>Estado de la entrevista:</strong> ${entrevistaDetails.estado_entrevista.descripcion}</p>
            <p><strong>Plaza:</strong> ${entrevistaDetails.plaza.descripcion}</p>
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
        <label for="plazas">Seleccione una plaza:</label>
        <select id="plaza" class="swal2-select custom-input">
          ${this.getPlazasOptions()}
        </select><br><br>
        <label for="estados">Seleccione el estado de la entrevista:</label>
        <select id="estado" class="swal2-select custom-input">
          ${this.getEstadosOptions()}
        </select><br><br>
        <label for="fechas">Fecha de entrevista:</label><br>
        <input type="date" id="fecha" #startInput class="swal2-input custom-input" />
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      preConfirm: () => {
        const plaza = (document.getElementById('plaza') as HTMLInputElement).value;
        const estado = (document.getElementById('estado') as HTMLInputElement).value;
        const fecha = (document.getElementById('fecha') as HTMLInputElement).value;
        // Agregar la hora "00:00:00" a la fecha
        const fechaConHora = new Date(fecha).toISOString();
        return this.editPlazaRequest(id.id_entrevista,parseInt(plaza),parseInt(estado), fechaConHora);
      }
    });
  }

  editPlazaRequest(id:number, plaza: number, estado: number, fecha: string) {
    const urlUpdate = `http://localhost:9200/entrevista/${id}`;
    const token = localStorage.getItem('token');

    if (!token) {
      console.warn('No se encontró el token en el Local Storage.');
      return false;
    }

    const headers = new HttpHeaders({
      Authorization: `${token}`
    });

    const body = {
      id_estado_entrevista: estado,
      id_plaza: plaza,
      fecha_entrevista: fecha
    };

    return this.http.patch(urlUpdate, body, { headers }).toPromise()
      .then(() => {
        Swal.fire('Éxito', 'Entrevista actualizada correctamente', 'success');
        this.cargarEntrevistas();
        return true;
      })
      .catch((error) => {
        console.error('Error al actualizar la entrevista', error);
        Swal.fire('Error', 'No se pudo actualizar la entrevista', 'error');
        return false;
      });
  }

  delete(id: any): void {
    const urlDelete = `http://localhost:9200/entrevista/${id.id_entrevista}`;
    const token = localStorage.getItem('token');

    if(token){
      const headers = new HttpHeaders({
        Authorization: `${token}`
      });

      Swal.fire({
        title: '¿Está seguro de eliminar la entrevista?',
        html: `
            <p><strong>ID:</strong> ${id.id_entrevista}</p>
            <p><strong>Estado de la entrevista:</strong> ${id.estado_entrevista.descripcion}</p>
            <p><strong>Plaza:</strong> ${id.plaza.descripcion}</p>
          `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: '¡Sí, bórralo!'
      }).then((result) => {
        if (result.isConfirmed) {
          this.http.delete(urlDelete, { headers }).subscribe(
            () => {
              Swal.fire('Éxito', 'Publicacion eliminada correctamente', 'success');
              this.cargarEntrevistas();
            },
            (err) => {
              console.error('Error al eliminar la publicacion', err);
              Swal.fire('Error', 'No se pudo eliminar la publicacion', 'error');
            }
          );
        }
      })

    }
  }

}
