import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';

@Component({
  selector: 'app-apellidos-empleado',
  templateUrl: './apellidos-empleado.component.html',
  styleUrls: ['./apellidos-empleado.component.css']
})
export class ApellidosEmpleadoComponent implements OnInit {
  @ViewChild(MatPaginator) paginatornombres!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  apellidosEmpleadosDataSource: MatTableDataSource<any>;
  empleados: { [id: number]: string } = {};
  apellidos: any[] = [];

  router = new Router();

  columnsApellidos = ['id', 'primerNombre', 'orden', 'nombre', 'actions'];

  constructor(private http: HttpClient){
    this.apellidosEmpleadosDataSource = new MatTableDataSource<any>();
  }

  ngOnInit(): void {
    const token = localStorage.getItem('token');

    if (token) {
       this.cargarApellidos();
       this.cargarEmpleados();
    } else {
      this.router.navigate(['login']);
  }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.apellidosEmpleadosDataSource.filter = filterValue.trim().toLowerCase();
  }

  cargarApellidos(){
    const urlEstados = 'http://localhost:9200/apellidosEmpleado';

    this.http.get<any[]>(urlEstados).subscribe(
      (response) => {
        this.apellidos = response;
        this.apellidosEmpleadosDataSource.data = this.apellidos;
        this.apellidosEmpleadosDataSource.paginator = this.paginatornombres;
      },
      (error) => {
        console.error('Error al cargar apellidos', error);
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
      title: 'Registrar nuevo apellido',
      html: `
          <label for="empleados">Seleccione un empleado:</label>
          <select id="empleado" class="swal2-select custom-input">
            ${this.getempleadosOptions()}
          </select><br><br>
          <label for="ordens">No Orde:</label><br>
          <input type="number" id="orden" class="swal2-input" placeholder="No. Orden" required><br><br>
          <label for="nombres">Apellido:</label><br>
          <input type="text" id="apellido" class="swal2-input" placeholder="Apellido" required>
      `,
      showCancelButton: true,
      confirmButtonText: 'Registrar',
      customClass: 'custom-input',
      preConfirm: () => {
        const empleado = (document.getElementById('empleado') as HTMLInputElement).value;
        const orden = (document.getElementById('orden') as HTMLInputElement).value;
        const apellido = (document.getElementById('apellido') as HTMLInputElement).value;
        return this.registerApellidoEmpleado(parseInt(empleado), parseInt(orden), apellido);
      }
    });
  }

  registerApellidoEmpleado(empleado: number, orden: number, apellido: string) {
    const urlCreate = `http://localhost:9200/apellidosEmpleado`;
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
      apellido: apellido
    };

    return this.http.post(urlCreate, body, { headers }).toPromise()
      .then(() => {
        Swal.fire('Éxito', 'Apellido creado correctamente', 'success');
        this.cargarApellidos();
        this.cargarEmpleados();
        return true;
      })
      .catch((error) => {
        console.error('Error al crear el apellido', error);
        Swal.fire('Error', 'No se pudo registrar el apellido', 'error');
        return false;
      });
  }

  edit(id: any) {
    Swal.fire({
      title: 'Editar Apellido',
      html: `
          <p><strong>${id.empleado.nombre}</strong></p><br>
          <label for="ordens">No Orde:</label><br>
          <input type="number" id="orden" class="swal2-input" value="${id.no_orden}" required><br><br>
          <label for="nombres">Apellido:</label><br>
          <input type="text" id="apellido" class="swal2-input" value="${id.apellido}" required>
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      preConfirm: () => {
        const orden = (document.getElementById('orden') as HTMLInputElement).value;
        const apellido = (document.getElementById('apellido') as HTMLInputElement).value;
        return this.editApellidoEmpleadoRequest(id.id_apellidos_empleados, parseInt(orden), apellido);
      }
    });
  }

  editApellidoEmpleadoRequest(id: number, orden: number, apellido: string) {
    const urlUpdate = `http://localhost:9200/apellidosEmpleado/${id}`;
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
      apellido: apellido
    };

    return this.http.patch(urlUpdate, body, { headers }).toPromise()
      .then(() => {
        Swal.fire('Éxito', 'Apellido actualizado correctamente', 'success');
        this.cargarApellidos();
        return true;
      })
      .catch((error) => {
        console.error('Error al actualizar el apellido', error);
        Swal.fire('Error', 'No se pudo actualizar el apellido', 'error');
        return false;
      });
  }

  view(id: any): void {
    const urlGet = `http://localhost:9200/apellidosEmpleado/${id}`;
    this.http.get<any[]>(urlGet).subscribe(
      (Details: any) => {
        Swal.fire({
          title: 'Detalles del nombre',
          html: `
            <p><strong>ID:</strong> ${Details.id_apellidos_empleados}</p>
            <p><strong>Primer Nombre:</strong> ${Details.empleado.nombre}</p>
            <p><strong>No. Orden:</strong> ${Details.no_orden}</p>
            <p><strong>Apellido:</strong> ${Details.apellido}</p>
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
    const urlDelete = `http://localhost:9200/apellidosEmpleado/${id.id_apellidos_empleados}`;
    const token = localStorage.getItem('token');

    if(token){
      const headers = new HttpHeaders({
        Authorization: `${token}`
      });

      Swal.fire({
        title: '¿Está seguro de eliminar el apellido?',
        text: id.apellido,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: '¡Sí, bórralo!'
      }).then((result) => {
        if (result.isConfirmed) {
          this.http.delete(urlDelete, { headers }).subscribe(
            () => {
              Swal.fire('Éxito', 'Apellido eliminado correctamente', 'success');
              this.cargarApellidos();
            },
            (err) => {
              console.error('Error al eliminar el apellido', err);
              Swal.fire('Error', 'No se pudo eliminar el apellido', 'error');
            }
          );
        }
      })

    }
  }
}
