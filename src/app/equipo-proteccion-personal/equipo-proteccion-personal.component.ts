import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';

@Component({
  selector: 'app-equipo-proteccion-personal',
  templateUrl: './equipo-proteccion-personal.component.html',
  styleUrls: ['./equipo-proteccion-personal.component.css']
})
export class EquipoProteccionPersonalComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  eppDataSource: MatTableDataSource<any>;
  empleados: { [id: number]: string } = {};
  epps: any[] = [];

  router = new Router();

  columnsEpp = ['id', 'equipo', 'actions'];

  constructor(private http: HttpClient){
    this.eppDataSource = new MatTableDataSource<any>();
  }

  ngOnInit(): void {
    const token = localStorage.getItem('token');

    if (token) {
       this.cargarEpp();
    } else {
      this.router.navigate(['login']);
  }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.eppDataSource.filter = filterValue.trim().toLowerCase();
  }


  cargarEpp(){
    const urlEstados = 'http://localhost:9200/epp';

    this.http.get<any[]>(urlEstados).subscribe(
      (response) => {
        this.epps = response;
        this.eppDataSource.data = this.epps;
        this.eppDataSource.paginator = this.paginator;
      },
      (error) => {
        console.error('Error al cargar epp', error);
      }
    );
  }

  openRegisterDialog(){
    Swal.fire({
      title: 'Registrar nuevo EPP',
      html: `
          <label for="actividades">Equipo:</label><br>
          <input type="text" id="equipo" class="swal2-input" placeholder="Descripcion" required><br><br>
      `,
      showCancelButton: true,
      confirmButtonText: 'Registrar',
      customClass: 'custom-input',
      preConfirm: () => {
        const equipo = (document.getElementById('equipo') as HTMLInputElement).value;
        return this.registerEpp(equipo);
      }
    });
  }

  registerEpp(equipo: string) {
    const urlCreate = `http://localhost:9200/epp`;
    const token = localStorage.getItem('token');

    if (!token) {
      console.warn('No se encontró el token en el Local Storage.');
      return false;
    }

    const headers = new HttpHeaders({
      Authorization: `${token}`
    });

    const body = {
      equipo: equipo
    };

    return this.http.post(urlCreate, body, { headers }).toPromise()
      .then(() => {
        Swal.fire('Éxito', 'Equipo creado correctamente', 'success');
        this.cargarEpp();
        return true;
      })
      .catch((error) => {
        console.error('Error al crear el equipo', error);
        Swal.fire('Error', 'No se pudo registrar el equipo', 'error');
        return false;
      });
  }

  edit(id: any) {
    Swal.fire({
      title: 'Editar Apellido',
      html: `
          <label for="actividades">Equipo:</label><br>
          <input type="text" id="equipo" class="swal2-input" value="${id.equipo}" required><br><br>
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      preConfirm: () => {
        const equipo = (document.getElementById('equipo') as HTMLInputElement).value;
        return this.editApellidoEmpleadoRequest(id.id_epp, equipo);
      }
    });
  }

  editApellidoEmpleadoRequest(id: number,equipo: string) {
    const urlUpdate = `http://localhost:9200/epp/${id}`;
    const token = localStorage.getItem('token');

    if (!token) {
      console.warn('No se encontró el token en el Local Storage.');
      return false;
    }

    const headers = new HttpHeaders({
      Authorization: `${token}`
    });

    const body = {
      equipo: equipo,
    };

    return this.http.patch(urlUpdate, body, { headers }).toPromise()
      .then(() => {
        Swal.fire('Éxito', 'Equipo actualizado correctamente', 'success');
        this.cargarEpp();
        return true;
      })
      .catch((error) => {
        console.error('Error al actualizar el equipo', error);
        Swal.fire('Error', 'No se pudo actualizar el apellido', 'error');
        return false;
      });
  }

  view(id: any): void {
    const urlGet = `http://localhost:9200/epp/${id}`;
    this.http.get<any[]>(urlGet).subscribe(
      (Details: any) => {
        Swal.fire({
          title: 'Detalles de la asistencia',
          html: `
            <p><strong>ID:</strong> ${Details.id_epp}</p>
            <p><strong>Equipo:</strong> ${Details.equipo}</p>
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
    const urlDelete = `http://localhost:9200/epp/${id.id_epp}`;
    const token = localStorage.getItem('token');

    if(token){
      const headers = new HttpHeaders({
        Authorization: `${token}`
      });

      Swal.fire({
        title: '¿Está seguro de eliminar el equipo?',
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
              Swal.fire('Éxito', 'Equipo eliminado correctamente', 'success');
              this.cargarEpp();
            },
            (err) => {
              console.error('Error al eliminar el Equipo', err);
              Swal.fire('Error', 'No se pudo eliminar el Equipo', 'error');
            }
          );
        }
      })

    }
  }
}
