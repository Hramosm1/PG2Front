import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';

@Component({
  selector: 'app-empleado',
  templateUrl: './empleado.component.html',
  styleUrls: ['./empleado.component.css']
})
export class EmpleadoComponent implements OnInit {
  @ViewChild(MatPaginator) paginatorempleados!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  empleadosDataSource: MatTableDataSource<any>;
  puestos: { [id: number]: string } = {};
  empleados: any[] = [];

  router = new Router();

  columnsEmpleados = ['id', 'nombre', 'apellido', 'puesto', 'salario', 'actions'];

  constructor(private http: HttpClient){
    this.empleadosDataSource = new MatTableDataSource<any>();
  }

  ngOnInit(): void {
    const token = localStorage.getItem('token');

    if (token) {
       this.cargarEmpleados();
       this.cargarPuestos();
    } else {
      this.router.navigate(['login']);
  }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.empleadosDataSource.filter = filterValue.trim().toLowerCase();
  }

  cargarEmpleados(){
    const urlEstados = 'http://localhost:9200/empleado';

    this.http.get<any[]>(urlEstados).subscribe(
      (response) => {
        this.empleados = response;
        this.empleadosDataSource.data = this.empleados;
        this.empleadosDataSource.paginator = this.paginatorempleados;
      },
      (error) => {
        console.error('Error al cargar empleados', error);
      }
    );
  }

  cargarPuestos(){
    const urlpuestos = 'http://localhost:9200/puesto';

    this.http.get<any[]>(urlpuestos).subscribe(
      (response) => {
        const puestosMap: Record<number, string> = {};
        response.forEach(puesto => {
          puestosMap[puesto.id_puesto] = puesto.descripcion;
        });
        this.puestos = puestosMap;
      },
      (error) => {
        console.error('Error al cargar puestos', error);
      }
    );
  }

  openRegisterDialog(){
    Swal.fire({
      title: 'Registrar nuevo empleado',
      html: `
          <label for="puestos">Selecciona un puesto:</label>
          <select id="puesto" class="swal2-select custom-input">
            ${this.getPuestosOptions()}
          </select><br><br>
          <label for="nombres">Nombre Obligatorio:</label><br>
          <input type="text" id="nombre" class="swal2-input" placeholder="Nombre" required><br><br>
          <label for="nombres">Apellido Obligatorio:</label><br>
          <input type="text" id="apellido" class="swal2-input" placeholder="Apellido" required>
      `,
      showCancelButton: true,
      confirmButtonText: 'Registrar',
      customClass: 'custom-input',
      preConfirm: () => {
        const puesto = (document.getElementById('puesto') as HTMLInputElement).value;
        const nombre = (document.getElementById('nombre') as HTMLInputElement).value;
        const apellido = (document.getElementById('apellido') as HTMLInputElement).value;
        return this.registerEmpleado(parseInt(puesto), nombre, apellido);
      }
    });
  }

  registerEmpleado(puesto: number, nombre: string, apellido: string) {
    const urlCreate = `http://localhost:9200/empleado`;
    const token = localStorage.getItem('token');

    if (!token) {
      console.warn('No se encontró el token en el Local Storage.');
      return false;
    }

    const headers = new HttpHeaders({
      Authorization: `${token}`
    });

    const body = {
      id_puesto: puesto,
      nombre: nombre,
      apellido: apellido
    };

    return this.http.post(urlCreate, body, { headers }).toPromise()
      .then(() => {
        Swal.fire('Éxito', 'Empleado creado correctamente', 'success');
        this.cargarEmpleados();
        this.cargarPuestos();
        return true;
      })
      .catch((error) => {
        console.error('Error al crear el empleado', error);
        Swal.fire('Error', 'No se pudo registrar el empleado', 'error');
        return false;
      });
  }

  getPuestosOptions() {
    this.cargarPuestos();
    return Object.keys(this.puestos).map(id => {
      const numericId = parseInt(id); // Convierte la cadena a número
      return `<option value="${numericId}">${this.puestos[numericId]}</option>`;
    }).join('');
  }

  edit(id: any) {
    Swal.fire({
      title: 'Editar empleados',
      html: `
          <label for="puestos">Selecciona un puesto:</label>
          <select id="puesto" class="swal2-select custom-input">
            ${this.getPuestosOptions()}
          </select><br><br>
          <label for="nombres">Nombre Obligatorio:</label><br>
          <input type="text" id="nombre" class="swal2-input" value="${id.nombre}" required><br><br>
          <label for="nombres">Apellido Obligatorio:</label><br>
          <input type="text" id="apellido" class="swal2-input" value="${id.apellido}" required>
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      preConfirm: () => {
        const puesto = (document.getElementById('puesto') as HTMLInputElement).value;
        const nombre = (document.getElementById('nombre') as HTMLInputElement).value;
        const apellido = (document.getElementById('apellido') as HTMLInputElement).value;
        return this.editEmpleadoRequest(id.id_empleado, parseInt(puesto), nombre, apellido);
      }
    });
  }

  editEmpleadoRequest(id: number, puesto: number, nombre: string, apellido: string) {
    const urlUpdate = `http://localhost:9200/empleado/${id}`;
    const token = localStorage.getItem('token');

    if (!token) {
      console.warn('No se encontró el token en el Local Storage.');
      return false;
    }

    const headers = new HttpHeaders({
      Authorization: `${token}`
    });

    const body = {
      id_puesto: puesto,
      nombre: nombre,
      apellido: apellido
    };

    return this.http.patch(urlUpdate, body, { headers }).toPromise()
      .then(() => {
        Swal.fire('Éxito', 'Empleado actualizado correctamente', 'success');
        this.cargarEmpleados();
        return true;
      })
      .catch((error) => {
        console.error('Error al actualizar el empleado', error);
        Swal.fire('Error', 'No se pudo actualizar el empleado', 'error');
        return false;
      });
  }

  view(id: any): void {
    const urlGet = `http://localhost:9200/empleado/${id}`;
    this.http.get<any[]>(urlGet).subscribe(
      (Details: any) => {
        Swal.fire({
          title: 'Detalles del empleado',
          html: `
            <p><strong>ID:</strong> ${Details.id_empleado}</p>
            <p><strong>Nombre:</strong> ${Details.nombre}</p>
            <p><strong>Apellido:</strong> ${Details.apellido}</p>
            <p><strong>Puesto:</strong> ${Details.puesto.descripcion}</p>
            <p><strong>Salario: Q</strong> ${Details.puesto.salario_mensual}</p>
          `,
          icon: 'success'
        });
      },
      (error) => {
        console.error('Error al obtener los detalles del empleado', error);
        Swal.fire('Error', 'No se pudieron obtener los detalles del empleado', 'error');
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
        text: 'Rol: ' + id.rol.descripcion +' ' + ' Modulo: ' +id.puestos.descripcion,
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
              this.cargarEmpleados();
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
