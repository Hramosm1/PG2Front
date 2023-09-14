import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';

@Component({
  selector: 'app-estado-publicacion',
  templateUrl: './estado-publicacion.component.html',
  styleUrls: ['./estado-publicacion.component.css']
})
export class EstadoPublicacionComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  estadoPublicacionDataSource: MatTableDataSource<any>;
  estadosPublicacion: any[] = [];
  router = new Router();

  displayedColumns = ['id', 'name', 'actions'];

  constructor(private http: HttpClient){
    this.estadoPublicacionDataSource = new MatTableDataSource<any>();
  }

  ngOnInit(): void {
    const token = localStorage.getItem('token');

    if (token) {
       this.cargarEstadosPublicacion();
    } else {
      this.router.navigate(['login']);
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.estadoPublicacionDataSource.filter = filterValue.trim().toLowerCase();
  }

  cargarEstadosPublicacion(){
    const urlEstados = 'http://localhost:9200/estado-publicacion';

    this.http.get<any[]>(urlEstados).subscribe(
      (response) => {
        this.estadosPublicacion = response;
        this.estadoPublicacionDataSource.data = this.estadosPublicacion;
        this.estadoPublicacionDataSource.paginator = this.paginator;
      },
      (error) => {
        console.error('Error al cargar la plaza', error);
      }
    );
  }

  openRegisterDialog() {
    Swal.fire({
      title: 'Registrar Nuevo estado de publicacion',
      html: `
        <input type="text" id="descripcion" class="swal2-input" placeholder="Descripción" required>
      `,
      showCancelButton: true,
      confirmButtonText: 'Registrar',
      preConfirm: () => {
        const descripcion = (document.getElementById('descripcion') as HTMLInputElement).value;
        return this.registerEstadoPublicacion(descripcion);
      }
    });
  }

  registerEstadoPublicacion(descripcion: string) {
    const url = 'http://localhost:9200/estado-publicacion';
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
    };

    return this.http.post(url, body, { headers }).toPromise()
      .then(() => {
        Swal.fire('Éxito', 'Estado de publicacion registrado correctamente', 'success');
        this.cargarEstadosPublicacion();
        return true;
      })
      .catch((error) => {
        console.error('Error al registrar el estado de publicacion', error);
        Swal.fire('Error', 'No se pudo registrar el estado de publicacion', 'error');
        return false;
      });
  }

  view(id: any): void {
    const urlGet = `http://localhost:9200/estado-publicacion/${id}`;
    this.http.get<any[]>(urlGet).subscribe(
      (estadoPublicacionDetails: any) => {
        Swal.fire({
          title: 'Detalles del estado de publicacion',
          html: `
            <p><strong>ID:</strong> ${estadoPublicacionDetails.id_estado_publicacion}</p>
            <p><strong>Descripción:</strong> ${estadoPublicacionDetails.descripcion}</p>
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
      title: 'Editar Medio de difusion',
      html: `
      <input type="text" id="descripcion" class="swal2-input" value="${id.descripcion}" required>
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      preConfirm: () => {
        const descripcion = (document.getElementById('descripcion') as HTMLInputElement).value;
        return this.editEstadoPublicacionRequest(id.id_estado_publicacion, descripcion);
      }
    });
  }

  editEstadoPublicacionRequest(id: number, descripcion: string) {
    const urlUpdate = `http://localhost:9200/estado-publicacion/${id}`;
    const token = localStorage.getItem('token');

    if (!token) {
      console.warn('No se encontró el token en el Local Storage.');
      return false;
    }

    const headers = new HttpHeaders({
      Authorization: `${token}`
    });

    const body = {
      descripcion: descripcion
    };

    return this.http.patch(urlUpdate, body, { headers }).toPromise()
      .then(() => {
        Swal.fire('Éxito', 'Estado publicacion actualizado correctamente', 'success');
        this.cargarEstadosPublicacion();
        return true;
      })
      .catch((error) => {
        console.error('Error al actualizar el estado de publicacion', error);
        Swal.fire('Error', 'No se pudo actualizar el estado de publicacion', 'error');
        return false;
      });
  }

  delete(id: any): void {
    const urlDelete = `http://localhost:9200/estado-publicacion/${id.id_estado_publicacion}`;
    const token = localStorage.getItem('token');

    if(token){
      const headers = new HttpHeaders({
        Authorization: `${token}`
      });

      Swal.fire({
        title: '¿Está seguro de eliminar el estado publicacion?',
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
              Swal.fire('Éxito', 'Estado publicacion eliminado correctamente', 'success');
              this.cargarEstadosPublicacion();
            },
            (err) => {
              console.error('Error al eliminar el estado publicacion', err);
              Swal.fire('Error', 'No se pudo eliminar el estado publicacion', 'error');
            }
          );
        }
      })

    }
  }
}
