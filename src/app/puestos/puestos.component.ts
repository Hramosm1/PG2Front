import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';

@Component({
  selector: 'app-puestos',
  templateUrl: './puestos.component.html',
  styleUrls: ['./puestos.component.css']
})
export class PuestosComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('startInput') startInput: any;
  puestosDataSource: MatTableDataSource<any>;
  puestos: any[] = [];
  router = new Router();
  tipoContratacion: { [id: number]: string } = {};

  displayedColumns = ['id', 'empresa', 'puesto','tipoContratacion', 'salario', 'actions'];

  constructor(private http: HttpClient){
    this.puestosDataSource = new MatTableDataSource<any>();
  }

  ngOnInit(): void {
    const token = localStorage.getItem('token');

    if (token) {
       this.cargarTipoContratacion();
       this.cargarPuestos();
    } else {
      this.router.navigate(['login']);
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.puestosDataSource.filter = filterValue.trim().toLowerCase();
  }

  cargarPuestos(){
    const urlEstados = 'http://localhost:9200/puesto';

    this.http.get<any[]>(urlEstados).subscribe(
      (response) => {
        this.puestos = response;
        this.puestosDataSource.data = this.puestos;
        this.puestosDataSource.paginator = this.paginator; // Configurar el paginador
      },
      (error) => {
        console.error('Error al cargar los puestos', error);
      }
    );
  }

  cargarTipoContratacion(){
    const url = 'http://localhost:9200/tipoContratacion';

    this.http.get<any[]>(url).subscribe(
      (response) => {
        const Map: Record<number, string> = {};
        response.forEach(tipoContratacion => {
          Map[tipoContratacion.id_tipo_contratacion] = `${tipoContratacion.empresa.descripcion} ${tipoContratacion.descripcion}`;;
        });
        this.tipoContratacion = Map;
      },
      (error) => {
        console.error('Error al cargar tipos de contratacion', error);
      }
    );
  }

  openRegisterDialog() {
    Swal.fire({
      title: 'Registrar nuevo puesto',
      html: `
        <label for="tiposContratacion">Seleccione un tipo de contratacion:</label>
        <select id="tipoContratacion" class="swal2-select custom-input">
          ${this.gettipoContratacionOptions()}
        </select><br><br>
        <label for="salarios">Salario Mensual:</label><br>
        <input type="number" id="salario" class="swal2-input" placeholder="Salario" required><br>
        <label for="salarios">Puesto:</label><br>
        <input type="text" id="observacion" class="swal2-input" placeholder="Puesto" required>
      `,
      showCancelButton: true,
      confirmButtonText: 'Registrar',
      preConfirm: () => {
        const tipoContratacion = (document.getElementById('tipoContratacion') as HTMLInputElement).value;
        const salario = (document.getElementById('salario') as HTMLInputElement).value;
        const observacion = (document.getElementById('observacion') as HTMLInputElement).value;
        return this.registrarPuesto(parseInt(tipoContratacion), salario, observacion);
      }
    });
  }

  gettipoContratacionOptions() {
    return Object.keys(this.tipoContratacion).map(id => {
      const numericId = parseInt(id); // Convierte la cadena a número
      return `<option value="${numericId}">${this.tipoContratacion[numericId]}</option>`;
    }).join('');
  }

  registrarPuesto(tipoContratacion: number, salario: string, observacion: string) {
    const url = 'http://localhost:9200/puesto';
    const token = localStorage.getItem('token');

    if (!token) {
      console.warn('No se encontró el token en el Local Storage.');
      return false;
    }

    const headers = new HttpHeaders({
      Authorization: `${token}`
    });

    const body = {
      id_tipo_contratacion: tipoContratacion,
      salario_mensual: salario,
      descripcion: observacion
    };

    return this.http.post(url, body, { headers }).toPromise()
      .then(() => {
        Swal.fire('Éxito', 'Registro exitoso', 'success');
        this.cargarPuestos();
        return true;
      })
      .catch((error) => {
        console.error('Error al realizar el registro', error);
        Swal.fire('Error', 'No se pudo realizar el registro', error);
        return false;
      });
  }

  view(id: any): void {
    const urlGet = `http://localhost:9200/puesto/${id}`;
    this.http.get<any[]>(urlGet).subscribe(
      (Details: any) => {
        Swal.fire({
          title: 'Detalles del tipo de contratacion',
          html: `
            <p><strong>ID:</strong> ${Details.id_puesto}</p>
            <p><strong>Empresa:</strong> ${Details.tipo_contratacion.empresa.descripcion}</p>
            <p><strong>Puesto:</strong> ${Details.descripcion}</p>
            <p><strong>Tipo Contratacion:</strong> ${Details.tipo_contratacion.descripcion}</p>
            <p><strong>Salario: Q</strong> ${Details.salario_mensual}</p>
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
        <label for="salarios">Salario Mensual:</label><br>
        <input type="number" id="salario" class="swal2-input" value="${id.salario_mensual}" required><br>
        <label for="Puesto">Puesto:</label><br>
        <input type="text" id="puesto" class="swal2-input" value="${id.descripcion}" required>
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      preConfirm: () => {
        const salario = (document.getElementById('salario') as HTMLInputElement).value;
        const puesto = (document.getElementById('puesto') as HTMLInputElement).value;
        return this.editPlazaRequest(id.id_puesto,salario, puesto);
      }
    });
  }

  editPlazaRequest(id:number, salario: string, puesto: string) {
    const urlUpdate = `http://localhost:9200/puesto/${id}`;
    const token = localStorage.getItem('token');

    if (!token) {
      console.warn('No se encontró el token en el Local Storage.');
      return false;
    }

    const headers = new HttpHeaders({
      Authorization: `${token}`
    });

    const body = {
      salario_mensual: salario,
      descripcion: puesto
    };

    return this.http.patch(urlUpdate, body, { headers }).toPromise()
      .then(() => {
        Swal.fire('Éxito', 'Registro actualizado correctamente', 'success');
        this.cargarPuestos();
        return true;
      })
      .catch((error) => {
        console.error('Error al realizar la actualizacion', error);
        Swal.fire('Error', 'No se pudo actualizar el registro', 'error');
        return false;
      });
  }

  delete(id: any): void {
    const urlDelete = `http://localhost:9200/puesto/${id.id_puesto}`;
    const token = localStorage.getItem('token');

    if(token){
      const headers = new HttpHeaders({
        Authorization: `${token}`
      });

      Swal.fire({
        title: '¿Está seguro de eliminar el puesto?',
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
              Swal.fire('Éxito', 'Registro eliminado correctamente', 'success');
              this.cargarPuestos();
            },
            (err) => {
              console.error('Error al eliminar el registro', err);
              Swal.fire('Error', 'No se pudo eliminar el registro', 'error');
            }
          );
        }
      })

    }
  }
}
