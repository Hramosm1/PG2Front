import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';

@Component({
  selector: 'app-asistencia',
  templateUrl: './asistencia.component.html',
  styleUrls: ['./asistencia.component.css']
})
export class AsistenciaComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  asistenciaDataSource: MatTableDataSource<any>;
  empleados: { [id: number]: string } = {};
  asistencias: any[] = [];

  router = new Router();

  columnsAsistencia = ['id', 'nombre', 'apellido', 'puesto', 'empresa', 'actividad', 'fechaHora', 'actions'];

  constructor(private http: HttpClient){
    this.asistenciaDataSource = new MatTableDataSource<any>();
  }

  ngOnInit(): void {
    const token = localStorage.getItem('token');

    if (token) {
       this.cargarAsistencias();
       this.cargarEmpleados();
    } else {
      this.router.navigate(['login']);
  }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.asistenciaDataSource.filter = filterValue.trim().toLowerCase();
  }

  formatFechaHora(fechaISO: string): string {
    const fecha = new Date(fechaISO);
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const año = fecha.getFullYear();
    const horas = fecha.getHours().toString().padStart(2, '0');
    const minutos = fecha.getMinutes().toString().padStart(2, '0');

    return `${dia}/${mes}/${año} ${horas}:${minutos}`;
  }

  cargarAsistencias(){
    const urlEstados = 'http://localhost:9200/asistencia';

    this.http.get<any[]>(urlEstados).subscribe(
      (response) => {
        this.asistencias = response;
        this.asistenciaDataSource.data = this.asistencias;
        this.asistenciaDataSource.paginator = this.paginator;
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
          empleadosMap[empleado.id_empleado] = `${empleado.nombre} ${empleado.apellido}`;
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
      title: 'Registrar nueva asistencia',
      html: `
          <label for="empleados">Seleccione un empleado:</label>
          <select id="empleado" class="swal2-select custom-input">
            ${this.getempleadosOptions()}
          </select><br><br>
          <label for="actividades">Actividad:</label><br>
          <input type="text" id="actividad" class="swal2-input" placeholder="Descripcion" required><br><br>
      `,
      showCancelButton: true,
      confirmButtonText: 'Registrar',
      customClass: 'custom-input',
      preConfirm: () => {
        const empleado = (document.getElementById('empleado') as HTMLInputElement).value;
        const actividad = (document.getElementById('actividad') as HTMLInputElement).value;
        return this.registerAsistencia(parseInt(empleado), actividad);
      }
    });
  }

  registerAsistencia(empleado: number, actividad: string) {
    const urlCreate = `http://localhost:9200/asistencia`;
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
      actividad: actividad,
    };

    return this.http.post(urlCreate, body, { headers }).toPromise()
      .then(() => {
        Swal.fire('Éxito', 'Asistencia creada correctamente', 'success');
        this.cargarAsistencias();
        this.cargarEmpleados();
        return true;
      })
      .catch((error) => {
        console.error('Error al crear la asistencia', error);
        Swal.fire('Error', 'No se pudo registrar la asistencia', 'error');
        return false;
      });
  }

  // edit(id: any) {
  //   Swal.fire({
  //     title: 'Editar Apellido',
  //     html: `
  //         <p><strong>${id.empleado.nombre}</strong></p><br>
  //         <label for="ordens">No Orde:</label><br>
  //         <input type="number" id="orden" class="swal2-input" value="${id.no_orden}" required><br><br>
  //         <label for="nombres">Apellido:</label><br>
  //         <input type="text" id="apellido" class="swal2-input" value="${id.apellido}" required>
  //     `,
  //     showCancelButton: true,
  //     confirmButtonText: 'Guardar',
  //     preConfirm: () => {
  //       const orden = (document.getElementById('orden') as HTMLInputElement).value;
  //       const apellido = (document.getElementById('apellido') as HTMLInputElement).value;
  //       return this.editApellidoEmpleadoRequest(id.id_apellidos_empleados, parseInt(orden), apellido);
  //     }
  //   });
  // }

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
        this.cargarAsistencias();
        return true;
      })
      .catch((error) => {
        console.error('Error al actualizar el apellido', error);
        Swal.fire('Error', 'No se pudo actualizar el apellido', 'error');
        return false;
      });
  }

  view(id: any): void {
    const urlGet = `http://localhost:9200/asistencia/${id}`;
    this.http.get<any[]>(urlGet).subscribe(
      (Details: any) => {
        Swal.fire({
          title: 'Detalles de la asistencia',
          html: `
            <p><strong>ID:</strong> ${Details.id_asistencia}</p>
            <p><strong>Nombre:</strong> ${Details.empleado.nombre}</p>
            <p><strong>Apellido:</strong> ${Details.empleado.apellido}</p>
            <p><strong>Puesto:</strong> ${Details.empleado.puesto.descripcion}</p>
            <p><strong>Empresa:</strong> ${Details.empleado.puesto.tipo_contratacion.empresa.descripcion}</p>
            <p><strong>Actividad:</strong> ${Details.actividad}</p>
            <p><strong>Fecha y hora:</strong> ${this.formatFechaHora(Details.fecha_hora)}</p>
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

  // delete(id: any): void {
  //   const urlDelete = `http://localhost:9200/apellidosEmpleado/${id.id_apellidos_empleados}`;
  //   const token = localStorage.getItem('token');

  //   if(token){
  //     const headers = new HttpHeaders({
  //       Authorization: `${token}`
  //     });

  //     Swal.fire({
  //       title: '¿Está seguro de eliminar el apellido?',
  //       text: id.apellido,
  //       icon: 'warning',
  //       showCancelButton: true,
  //       confirmButtonColor: '#3085d6',
  //       cancelButtonColor: '#d33',
  //       confirmButtonText: '¡Sí, bórralo!'
  //     }).then((result) => {
  //       if (result.isConfirmed) {
  //         this.http.delete(urlDelete, { headers }).subscribe(
  //           () => {
  //             Swal.fire('Éxito', 'Apellido eliminado correctamente', 'success');
  //             this.cargarAsistencias();
  //           },
  //           (err) => {
  //             console.error('Error al eliminar el apellido', err);
  //             Swal.fire('Error', 'No se pudo eliminar el apellido', 'error');
  //           }
  //         );
  //       }
  //     })

  //   }
  // }
}
