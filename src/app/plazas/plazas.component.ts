import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';

@Component({
  selector: 'app-plazas',
  templateUrl: './plazas.component.html',
  styleUrls: ['./plazas.component.css']
})
export class PlazasComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  plazasDataSource: MatTableDataSource<any>;
  plazas: any[] = [];
  router = new Router();

  displayedColumns = ['id', 'name','state', 'actions'];

  constructor(private http: HttpClient){
    this.plazasDataSource = new MatTableDataSource<any>();
  }

  ngOnInit(): void {
    const token = localStorage.getItem('token');

    if (token) {
       this.cargarPlazas();
    } else {
      this.router.navigate(['login']);
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.plazasDataSource.filter = filterValue.trim().toLowerCase();
  }

  cargarPlazas(){
    const urlEstados = 'http://localhost:9200/plaza';

    this.http.get<any[]>(urlEstados).subscribe(
      (response) => {
        this.plazas = response;
        this.plazasDataSource.data = this.plazas;
        this.plazasDataSource.paginator = this.paginator;
      },
      (error) => {
        console.error('Error al cargar la plaza', error);
      }
    );
  }

  openRegisterDialog() {
    Swal.fire({
      title: 'Registrar Nueva Plaza',
      html: `
        <input type="text" id="descripcion" class="swal2-input" placeholder="Descripción" required>
        <input type="checkbox" id="estado" class="swal2-checkbox" checked> Activo
      `,
      showCancelButton: true,
      confirmButtonText: 'Registrar',
      preConfirm: () => {
        const descripcion = (document.getElementById('descripcion') as HTMLInputElement).value;
        const estado = (document.getElementById('estado') as HTMLInputElement).checked ? 1 : 0;
        return this.registerPlaza(descripcion, estado);
      }
    });
  }

  registerPlaza(descripcion: string, estado: number) {
    const url = 'http://localhost:9200/plaza';
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
      id_estado_plaza: estado
    };

    return this.http.post(url, body, { headers }).toPromise()
      .then(() => {
        Swal.fire('Éxito', 'Plaza registrado correctamente', 'success');
        this.cargarPlazas();
        return true;
      })
      .catch((error) => {
        console.error('Error al registrar la plaza', error);
        Swal.fire('Error', 'No se pudo registrar la plaza', 'error');
        return false;
      });
  }

  view(id: any): void {
    const urlGet = `http://localhost:9200/plaza/${id}`;
    this.http.get<any[]>(urlGet).subscribe(
      (plazaDetails: any) => {
        Swal.fire({
          title: 'Detalles de la plaza',
          html: `
            <p><strong>ID:</strong> ${plazaDetails.id_plaza}</p>
            <p><strong>Descripción:</strong> ${plazaDetails.descripcion}</p>
            <p><strong>Estado:</strong> ${plazaDetails.id_estado_plaza === 1 ? 'Activo' : 'Inactivo'}</p>
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
      <input type="text" id="descripcion" class="swal2-input" value="${id.descripcion}" required>
      <input type="checkbox" id="estado" class="swal2-checkbox" ${id.id_estado_plaza === 1 ? 'checked' : ''}> Activo
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      preConfirm: () => {
        const descripcion = (document.getElementById('descripcion') as HTMLInputElement).value;
        const estado = (document.getElementById('estado') as HTMLInputElement).checked ? 1 : 0;
        return this.editPlazaRequest(id.id_plaza, descripcion, estado);
      }
    });
  }

  editPlazaRequest(id: number, descripcion: string, estado: number) {
    const urlUpdate = `http://localhost:9200/plaza/${id}`;
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
      id_estado_plaza: estado
    };

    return this.http.patch(urlUpdate, body, { headers }).toPromise()
      .then(() => {
        Swal.fire('Éxito', 'Plaza actualizada correctamente', 'success');
        this.cargarPlazas();
        return true;
      })
      .catch((error) => {
        console.error('Error al actualizar la plaza', error);
        Swal.fire('Error', 'No se pudo actualizar la plaza', 'error');
        return false;
      });
  }

  delete(id: any): void {
    const urlDelete = `http://localhost:9200/plaza/${id.id_plaza}`;
    const token = localStorage.getItem('token');

    if(token){
      const headers = new HttpHeaders({
        Authorization: `${token}`
      });

      Swal.fire({
        title: '¿Está seguro de eliminar la plaza?',
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
              Swal.fire('Éxito', 'Plaza eliminada correctamente', 'success');
              this.cargarPlazas();
            },
            (err) => {
              console.error('Error al eliminar la plaza', err);
              Swal.fire('Error', 'No se pudo eliminar la plaza', 'error');
            }
          );
        }
      })

    }
  }
}
