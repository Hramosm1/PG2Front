import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';

@Component({
  selector: 'app-asignacion-epp',
  templateUrl: './asignacion-epp.component.html',
  styleUrls: ['./asignacion-epp.component.css']
})
export class AsignacionEppComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  asignacionEppDataSource: MatTableDataSource<any>;
  empleados: { [id: number]: string } = {};
  equipos: { [id: number]: string } = {};
  asignacionEpp: any[] = [];

  router = new Router();

  columnsAsignacion = ['id', 'nombre', 'apellido', 'equipo', 'actions'];

  constructor(private http: HttpClient){
    this.asignacionEppDataSource = new MatTableDataSource<any>();
  }

  ngOnInit(): void {
    const token = localStorage.getItem('token');

    if (token) {
       this.cargarAsignaciones();
       this.cargarEmpleados();
       this.cargarEpp();
    } else {
      this.router.navigate(['login']);
  }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.asignacionEppDataSource.filter = filterValue.trim().toLowerCase();
  }

  cargarAsignaciones(){
    const urlEstados = 'http://localhost:9200/asignacionEpp';

    this.http.get<any[]>(urlEstados).subscribe(
      (response) => {
        this.asignacionEpp = response;
        this.asignacionEppDataSource.data = this.asignacionEpp;
        this.asignacionEppDataSource.paginator = this.paginator;
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
          empleadosMap[empleado.id_empleado] = `${empleado.nombre} ${empleado.apellido} ${empleado.puesto.descripcion}`;
        });
        this.empleados = empleadosMap;
      },
      (error) => {
        console.error('Error al cargar empleados', error);
      }
    );
  }

  cargarEpp(){
    const urlEpp = 'http://localhost:9200/epp';

    this.http.get<any[]>(urlEpp).subscribe(
      (response) => {
        const eppMap: Record<number, string> = {};

        response.forEach(epp => {
          eppMap[epp.id_epp] = epp.equipo;
        });
        this.equipos = eppMap;
      },
      (error) => {
        console.error('Error al cargar equipos', error);
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

  getEppOptions() {
    this.cargarEpp();
    return Object.keys(this.equipos).map(id => {
      const numericId = parseInt(id);
      return `<option value="${numericId}">${this.equipos[numericId]}</option>`;
    }).join('');
  }

  openRegisterDialog(){
    Swal.fire({
      title: 'Registrar nueva Asignacion',
      html: `
          <label for="empleados">Seleccione un empleado:</label>
          <select id="empleado" class="swal2-select custom-input">
            ${this.getempleadosOptions()}
          </select><br><br>
          <label for="equipos">Seleccione un equipo:</label>
          <select id="equipo" class="swal2-select custom-input">
            ${this.getEppOptions()}
          </select><br><br>
      `,
      showCancelButton: true,
      confirmButtonText: 'Registrar',
      customClass: 'custom-input',
      preConfirm: () => {
        const empleado = (document.getElementById('empleado') as HTMLInputElement).value;
        const equipo = (document.getElementById('equipo') as HTMLInputElement).value;
        return this.registerAsignacion(parseInt(empleado), parseInt(equipo));
      }
    });
  }

  registerAsignacion(empleado: number, equipo: number) {
    const urlCreate = `http://localhost:9200/asignacionEpp`;
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
      id_epp: equipo,
    };

    return this.http.post(urlCreate, body, { headers }).toPromise()
      .then(() => {
        Swal.fire('Éxito', 'Asignacion creada correctamente', 'success');
        this.cargarAsignaciones();
        this.cargarEmpleados();
        return true;
      })
      .catch((error) => {
        console.error('Error al crear la asignacion', error);
        Swal.fire('Error', 'No se pudo registrar la asignacion', 'error');
        return false;
      });
  }

  edit(id: any) {
    Swal.fire({
      title: 'Editar Asignacion',
      html: `
          <p><strong>${id.empleado.nombre} ${id.empleado.apellido}</strong></p><br>
          <label for="equipos">Seleccione un equipo:</label>
          <select id="equipo" class="swal2-select custom-input">
            ${this.getEppOptions()}
          </select><br><br>
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      preConfirm: () => {
        const equipo = (document.getElementById('equipo') as HTMLInputElement).value;
        return this.editAsignacionEpp(id.id_asignacion_epp, equipo);
      }
    });
  }

  editAsignacionEpp(id: number, equipo: string) {
    const urlUpdate = `http://localhost:9200/asignacionEpp/${id}`;
    const token = localStorage.getItem('token');

    if (!token) {
      console.warn('No se encontró el token en el Local Storage.');
      return false;
    }

    const headers = new HttpHeaders({
      Authorization: `${token}`
    });

    const body = {
      id_epp: equipo
    };

    return this.http.patch(urlUpdate, body, { headers }).toPromise()
      .then(() => {
        Swal.fire('Éxito', 'Asignacion actualizada correctamente', 'success');
        this.cargarAsignaciones();
        return true;
      })
      .catch((error) => {
        console.error('Error al actualizar la asignacion', error);
        Swal.fire('Error', 'No se pudo actualizar la asignacion', 'error');
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
            <p><strong>Fecha y hora:</strong> ${Details.fecha_hora}</p>
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
    const urlDelete = `http://localhost:9200/asignacionEpp/${id.id_asignacion_epp}`;
    const token = localStorage.getItem('token');

    if(token){
      const headers = new HttpHeaders({
        Authorization: `${token}`
      });

      Swal.fire({
        title: '¿Está seguro de eliminar la asignacion?',
        text: id.equipo,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: '¡Sí, bórralo!'
      }).then((result) => {
        if (result.isConfirmed) {
          this.http.delete(urlDelete, { headers }).subscribe(
            () => {
              Swal.fire('Éxito', 'Asignacion eliminado correctamente', 'success');
              this.cargarAsignaciones();
            },
            (err) => {
              console.error('Error al eliminar la asignacion', err);
              Swal.fire('Error', 'No se pudo eliminar la asignacion', 'error');
            }
          );
        }
      })

    }
  }
}
