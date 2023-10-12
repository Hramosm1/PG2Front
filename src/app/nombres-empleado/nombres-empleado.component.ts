import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nombres-empleado',
  templateUrl: './nombres-empleado.component.html',
  styleUrls: ['./nombres-empleado.component.css']
})
export class NombresEmpleadoComponent implements OnInit {
  @ViewChild(MatPaginator) paginatornombres!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  nombresEmpleadosDataSource: MatTableDataSource<any>;
  empleados: { [id: number]: string } = {};
  nombres: any[] = [];

  router = new Router();

  columnsNombres = ['id', 'primerNombre', 'orden', 'nombre', 'actions'];

  constructor(private http: HttpClient){
    this.nombresEmpleadosDataSource = new MatTableDataSource<any>();
  }

  ngOnInit(): void {
    const token = localStorage.getItem('token');

    if (token) {
       this.cargarNombres();
       this.cargarEmpleados();
    } else {
      this.router.navigate(['login']);
  }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.nombresEmpleadosDataSource.filter = filterValue.trim().toLowerCase();
  }

  cargarNombres(){
    const urlEstados = 'http://localhost:9200/nombreEmpleado';

    this.http.get<any[]>(urlEstados).subscribe(
      (response) => {
        this.nombres = response;
        this.nombresEmpleadosDataSource.data = this.nombres;
        this.nombresEmpleadosDataSource.paginator = this.paginatornombres;
      },
      (error) => {
        console.error('Error al cargar nombres', error);
      }
    );
  }

  cargarEmpleados(){
    const urlempleados = 'http://localhost:9200/empleado';

    this.http.get<any[]>(urlempleados).subscribe(
      (response) => {
        const empleadosMap: Record<number, string> = {};
        response.forEach(empleado => {
          empleadosMap[empleado.id_empleado] = empleado.nombre;
        });
        this.empleados = empleadosMap;
      },
      (error) => {
        console.error('Error al cargar empleados', error);
      }
    );
  }

  getempleadosOptions() {
    this.cargarEmpleados();
    return Object.keys(this.empleados).map(id => {
      const numericId = parseInt(id);
      return `<option value="${numericId}">${this.empleados[numericId]}</option>`;
    }).join('');
  }

  openRegisterDialog(){
    Swal.fire({
      title: 'Registrar nuevo nombre',
      html: `
          <label for="empleados">Seleccione un empleado:</label>
          <select id="empleado" class="swal2-select custom-input">
            ${this.getempleadosOptions()}
          </select><br><br>
          <label for="ordens">No Orde:</label><br>
          <input type="number" id="orden" class="swal2-input" placeholder="No. Orden" required><br><br>
          <label for="nombres">Nombre:</label><br>
          <input type="text" id="nombre" class="swal2-input" placeholder="Nombre" required>
      `,
      showCancelButton: true,
      confirmButtonText: 'Registrar',
      customClass: 'custom-input',
      preConfirm: () => {
        const empleado = (document.getElementById('empleado') as HTMLInputElement).value;
        const orden = (document.getElementById('orden') as HTMLInputElement).value;
        const nombre = (document.getElementById('nombre') as HTMLInputElement).value;
        return this.registerNombreEmpleado(parseInt(empleado), parseInt(orden), nombre);
      }
    });
  }

  registerNombreEmpleado(empleado: number, orden: number, nombre: string) {
    const urlCreate = `http://localhost:9200/nombreEmpleado`;
    const token = localStorage.getItem('token');

    if (!token) {
      console.warn('No se encontró el token en el Local Storage.');
      return false;
    }

    const headers = new HttpHeaders({
      Authorization: `${token}`
    });

    const body = {
      id_empleado: empleado,
      no_orden: orden,
      nombre: nombre
    };

    return this.http.post(urlCreate, body, { headers }).toPromise()
      .then(() => {
        Swal.fire('Éxito', 'Nombre creado correctamente', 'success');
        this.cargarNombres();
        this.cargarEmpleados();
        return true;
      })
      .catch((error) => {
        console.error('Error al crear el nombre', error);
        Swal.fire('Error', 'No se pudo registrar el nombre', 'error');
        return false;
      });
  }

  edit(id: any) {
    Swal.fire({
      title: 'Editar nombres',
      html: `
          <p><strong>${id.empleado.nombre}</strong></p><br>
          <label for="ordens">No Orde:</label><br>
          <input type="number" id="orden" class="swal2-input" value="${id.no_orden}" required><br><br>
          <label for="nombres">Nombre:</label><br>
          <input type="text" id="nombre" class="swal2-input" value="${id.nombre}" required>
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      preConfirm: () => {
        const orden = (document.getElementById('orden') as HTMLInputElement).value;
        const nombre = (document.getElementById('nombre') as HTMLInputElement).value;
        return this.editNombreEmpleadoRequest(id.id_nombres_empleados, parseInt(orden), nombre);
      }
    });
  }

  editNombreEmpleadoRequest(id: number, orden: number, nombre: string) {
    const urlUpdate = `http://localhost:9200/nombreEmpleado/${id}`;
    const token = localStorage.getItem('token');

    if (!token) {
      console.warn('No se encontró el token en el Local Storage.');
      return false;
    }

    const headers = new HttpHeaders({
      Authorization: `${token}`
    });

    const body = {
      no_orden: orden,
      nombre: nombre
    };

    return this.http.patch(urlUpdate, body, { headers }).toPromise()
      .then(() => {
        Swal.fire('Éxito', 'Nombre actualizado correctamente', 'success');
        this.cargarNombres();
        return true;
      })
      .catch((error) => {
        console.error('Error al actualizar el nombre', error);
        Swal.fire('Error', 'No se pudo actualizar el nombre', 'error');
        return false;
      });
  }

  view(id: any): void {
    const urlGet = `http://localhost:9200/nombreEmpleado/${id}`;
    this.http.get<any[]>(urlGet).subscribe(
      (Details: any) => {
        Swal.fire({
          title: 'Detalles del nombre',
          html: `
            <p><strong>ID:</strong> ${Details.id_nombres_empleados}</p>
            <p><strong>Primer Nombre:</strong> ${Details.empleado.nombre}</p>
            <p><strong>No. Orden:</strong> ${Details.no_orden}</p>
            <p><strong>Nombre:</strong> ${Details.nombre}</p>
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
    const urlDelete = `http://localhost:9200/nombreEmpleado/${id.id_nombres_empleados}`;
    const token = localStorage.getItem('token');

    if(token){
      const headers = new HttpHeaders({
        Authorization: `${token}`
      });

      Swal.fire({
        title: '¿Está seguro de eliminar el nombre?',
        text: id.nombre,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: '¡Sí, bórralo!'
      }).then((result) => {
        if (result.isConfirmed) {
          this.http.delete(urlDelete, { headers }).subscribe(
            () => {
              Swal.fire('Éxito', 'Nombre eliminado correctamente', 'success');
              this.cargarNombres();
            },
            (err) => {
              console.error('Error al eliminar el nombre', err);
              Swal.fire('Error', 'No se pudo eliminar el nombre', 'error');
            }
          );
        }
      })

    }
  }
}
