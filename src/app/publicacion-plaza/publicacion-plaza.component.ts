import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';

import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;

// Define la interfaz para el documento PDF
interface PdfDocument {
  content: any[];
  styles?: any;
}

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
        this.publicacion = response.map(item => {
          const fechaISO = new Date(item.fecha_publicacion);
          const day = fechaISO.getDate().toString().padStart(2, '0');
          const month = (fechaISO.getMonth() + 1).toString().padStart(2, '0'); // Los meses se cuentan desde 0
          const year = fechaISO.getFullYear();
          const formattedDate = `${day}/${month}/${year}`;
          return { ...item, fecha_publicacion: formattedDate };
        });
        this.publicacionDataSource.data = this.publicacion;
        this.publicacionDataSource.paginator = this.paginator;
      },
      (error) => {
        console.error('Error al cargar la publicacion', error);
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
        <label for="plazas">Seleccione una plaza:</label>
        <select id="plaza" class="swal2-select custom-input">
          ${this.getPlazasOptions()}
        </select><br><br>
        <label for="medios">Seleccione medio de difusion:</label>
        <select id="medio" class="swal2-select custom-input">
          ${this.getMediosOptions()}
        </select><br><br>
        <label for="estados">Seleccione el estado de la publicacion:</label>
        <select id="estado" class="swal2-select custom-input">
          ${this.getEstadosOptions()}
        </select><br><br>
        <label for="fechas">Fecha de registro:</label><br>
        <input type="date" id="fecha" #startInput class="swal2-input custom-input" />
      `,
      showCancelButton: true,
      confirmButtonText: 'Registrar',
      preConfirm: () => {
        const plaza = (document.getElementById('plaza') as HTMLInputElement).value;
        const medio = (document.getElementById('medio') as HTMLInputElement).value;
        const estado = (document.getElementById('estado') as HTMLInputElement).value;
        const fecha = (document.getElementById('fecha') as HTMLInputElement).value;
        // Agregar la hora "00:00:00" a la fecha
        const fechaConHora = new Date(fecha).toISOString();
        return this.registerPlaza(parseInt(plaza), parseInt(medio), parseInt(estado), fechaConHora);
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

  registerPlaza(plaza: number, medio: number, estado: number, fecha: string) {
    const url = 'http://localhost:9200/publicacion-plaza';
    const token = localStorage.getItem('token');

    if (!token) {
      console.warn('No se encontró el token en el Local Storage.');
      return false;
    }

    const headers = new HttpHeaders({
      Authorization: `${token}`
    });

    const body = {
      id_plaza: plaza,
      id_medio_difusion: medio,
      id_estado_publicacion: estado,
      fecha_publicacion: fecha
    };

    return this.http.post(url, body, { headers }).toPromise()
      .then(() => {
        Swal.fire('Éxito', 'Publicacion registrada correctamente', 'success');
        this.cargarPublicaciones();
        return true;
      })
      .catch((error) => {
        console.error('Error al registrar la publicacion', error);
        Swal.fire('Error', 'No se pudo registrar la publicacion', error);
        return false;
      });
  }

  view(id: any): void {
    const urlGet = `http://localhost:9200/publicacion-plaza/${id}`;
    this.http.get<any[]>(urlGet).subscribe(
      (publicacionDetails: any) => {
        Swal.fire({
          title: 'Detalles de la publicacion',
          html: `
            <p><strong>ID:</strong> ${publicacionDetails.id_publicacion_plaza}</p>
            <p><strong>Plaza:</strong> ${publicacionDetails.plaza.descripcion}</p>
            <p><strong>Medio de difusion:</strong> ${publicacionDetails.medio_difusion.descripcion}</p>
            <p><strong>Estado de la publicacion:</strong> ${publicacionDetails.estado_publicacion.descripcion}</p>
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
        <label for="medios">Seleccione medio de difusion:</label>
        <select id="medio" class="swal2-select custom-input">
          ${this.getMediosOptions()}
        </select><br><br>
        <label for="estados">Seleccione el estado de la publicacion:</label>
        <select id="estado" class="swal2-select custom-input">
          ${this.getEstadosOptions()}
        </select><br><br>
        <label for="fechas">Fecha de registro:</label><br>
        <input type="date" id="fecha" #startInput class="swal2-input custom-input" />
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      preConfirm: () => {
        const plaza = (document.getElementById('plaza') as HTMLInputElement).value;
        const medio = (document.getElementById('medio') as HTMLInputElement).value;
        const estado = (document.getElementById('estado') as HTMLInputElement).value;
        const fecha = (document.getElementById('fecha') as HTMLInputElement).value;
        // Agregar la hora "00:00:00" a la fecha
        const fechaConHora = new Date(fecha).toISOString();
        return this.editPlazaRequest(id.id_publicacion_plaza,parseInt(plaza), parseInt(medio), parseInt(estado), fechaConHora);
      }
    });
  }

  editPlazaRequest(id:number, plaza: number, medio: number, estado: number, fecha: string) {
    const urlUpdate = `http://localhost:9200/publicacion-plaza/${id}`;
    const token = localStorage.getItem('token');

    if (!token) {
      console.warn('No se encontró el token en el Local Storage.');
      return false;
    }

    const headers = new HttpHeaders({
      Authorization: `${token}`
    });

    const body = {
      id_plaza: plaza,
      id_medio_difusion: medio,
      id_estado_publicacion: estado,
      fecha_publicacion: fecha
    };

    return this.http.patch(urlUpdate, body, { headers }).toPromise()
      .then(() => {
        Swal.fire('Éxito', 'Publicacion actualizada correctamente', 'success');
        this.cargarPublicaciones();
        return true;
      })
      .catch((error) => {
        console.error('Error al actualizar la publicacion', error);
        Swal.fire('Error', 'No se pudo actualizar la publicacion', 'error');
        return false;
      });
  }

  delete(id: any): void {
    const urlDelete = `http://localhost:9200/publicacion-plaza/${id.id_publicacion_plaza}`;
    const token = localStorage.getItem('token');

    if(token){
      const headers = new HttpHeaders({
        Authorization: `${token}`
      });

      Swal.fire({
        title: '¿Está seguro de eliminar la publicacion?',
        text: id.plaza.descripcion,
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
              this.cargarPublicaciones();
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

  generatePDF() {

    const docDefinition : any = {
      content: [
        {
          text: 'Lista de Publicaciones',
          style: 'header'
        },
        {
          table: {
            headerRows: 1,
            widths: ['auto', 'auto', 'auto', 'auto', 'auto'],
            body: [
              ['ID', 'Plaza', 'Medio de Difusión', 'Estado', 'Fecha Publicación'],
              ...this.publicacion.map(row => [
                row.id_publicacion_plaza,
                row.plaza.descripcion,
                row.medio_difusion.descripcion,
                row.estado_publicacion.descripcion,
                row.fecha_publicacion
              ])
            ]
          }
        }
      ]
    };
    const pdf = pdfMake.createPdf(docDefinition);
    pdf.open();
  }
}
