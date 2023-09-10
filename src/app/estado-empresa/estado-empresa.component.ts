import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';


@Component({
  selector: 'app-estado-empresa',
  templateUrl: './estado-empresa.component.html',
  styleUrls: ['./estado-empresa.component.css']
})
export class EstadoEmpresaComponent implements OnInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  estadosDataSource: MatTableDataSource<any>;
  estados: any[] = [];
  router = new Router();

  displayedColumns = ['id', 'name','actions'];

  constructor(private http: HttpClient){
    this.estadosDataSource = new MatTableDataSource<any>();
  }

  ngOnInit(): void {
    const token = localStorage.getItem('token');

    if (token) {
       this.cargarEstados();
    } else {
      this.router.navigate(['login']);
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.estadosDataSource.filter = filterValue.trim().toLowerCase();
  }

  cargarEstados(){
    const urlEstados = 'http://localhost:9200/estadoEmpresa';

    this.http.get<any[]>(urlEstados).subscribe(
      (response) => {
        this.estados = response;
        this.estadosDataSource.data = this.estados;
        this.estadosDataSource.paginator = this.paginator; // Configurar el paginador
      },
      (error) => {
        console.error('Error al cargar roles', error);
      }
    );
  }

  edit(id: any) {
    Swal.fire({
      title: 'Editar estado',
      html: `
        <input type="text" id="descripcion" class="swal2-input" value="${id.descripcion}">
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      preConfirm: () => {
        const newDescripcion = (document.getElementById('descripcion') as HTMLInputElement).value;
        return this.editEstadoRequest(id.id_estado_empresa, newDescripcion);
      }
    });
  }

  editEstadoRequest(id: number, descripcion: string) {
    const urlUpdate = `http://localhost:9200/estadoEmpresa/${id}`;
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

    return this.http.patch(urlUpdate, body, { headers }).toPromise()
      .then(() => {
        Swal.fire('Éxito', 'Estado actualizado correctamente', 'success');
        this.cargarEstados();
        return true;
      })
      .catch((error) => {
        console.error('Error al actualizar el estado', error);
        Swal.fire('Error', 'No se pudo actualizar el estado', 'error');
        return false;
      });
  }

  view(id: any): void {
    const urlGet = `http://localhost:9200/estadoEmpresa/${id}`;
    this.http.get<any[]>(urlGet).subscribe(
      (estadoDetails: any) => {
        Swal.fire({
          title: 'Detalles del estado',
          html: `
            <p><strong>ID:</strong> ${estadoDetails.id_estado_empresa}</p>
            <p><strong>Descripción:</strong> ${estadoDetails.descripcion}</p>
          `,
          icon: 'success'
        });
      },
      (error) => {
        console.error('Error al obtener los detalles del estado', error);
        Swal.fire('Error', 'No se pudieron obtener los detalles del estado', 'error');
      }
    );
  }

  delete(id: any): void {
    const urlDelete = `http://localhost:9200/estadoEmpresa/${id.id_estado_empresa}`;
    const token = localStorage.getItem('token');

    if(token){
      const headers = new HttpHeaders({
        Authorization: `${token}`
      });

      Swal.fire({
        title: '¿Está seguro de eliminar el estado?',
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
              Swal.fire('Éxito', 'Estado eliminado correctamente', 'success');
              this.cargarEstados();
            },
            (err) => {
              console.error('Error al eliminar el estado', err);
              Swal.fire('Error', 'No se pudo eliminar el estado', 'error');
            }
          );
        }
      })

    }
  }

  openRegisterDialog() {
    Swal.fire({
      title: 'Registrar Nuevo Estado',
      html: `
        <input type="text" id="descripcion" class="swal2-input" placeholder="Descripción" required>
      `,
      showCancelButton: true,
      confirmButtonText: 'Registrar',
      preConfirm: () => {
        const descripcion = (document.getElementById('descripcion') as HTMLInputElement).value;
        return this.registerRole(descripcion);
      }
    });
  }

  registerRole(descripcion: string) {
    const url = 'http://localhost:9200/estadoEmpresa';
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
        Swal.fire('Éxito', 'Estado registrado correctamente', 'success');
        this.cargarEstados();
        return true;
      })
      .catch((error) => {
        console.error('Error al registrar el estado', error);
        Swal.fire('Error', 'No se pudo registrar el estado', 'error');
        return false;
      });
  }
}
