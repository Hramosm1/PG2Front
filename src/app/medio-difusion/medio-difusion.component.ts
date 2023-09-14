import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';

@Component({
  selector: 'app-medio-difusion',
  templateUrl: './medio-difusion.component.html',
  styleUrls: ['./medio-difusion.component.css']
})
export class MedioDifusionComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  mediosDifusionDataSource: MatTableDataSource<any>;
  mediosDifusion: any[] = [];
  router = new Router();

  displayedColumns = ['id', 'name', 'actions'];

  constructor(private http: HttpClient){
    this.mediosDifusionDataSource = new MatTableDataSource<any>();
  }

  ngOnInit(): void {
    const token = localStorage.getItem('token');

    if (token) {
       this.cargarMediosDifusion();
    } else {
      this.router.navigate(['login']);
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.mediosDifusionDataSource.filter = filterValue.trim().toLowerCase();
  }

  cargarMediosDifusion(){
    const urlEstados = 'http://localhost:9200/medio-difusion';

    this.http.get<any[]>(urlEstados).subscribe(
      (response) => {
        this.mediosDifusion = response;
        this.mediosDifusionDataSource.data = this.mediosDifusion;
        this.mediosDifusionDataSource.paginator = this.paginator;
      },
      (error) => {
        console.error('Error al cargar la plaza', error);
      }
    );
  }

  openRegisterDialog() {
    Swal.fire({
      title: 'Registrar Nuevo medio de difusion',
      html: `
        <input type="text" id="descripcion" class="swal2-input" placeholder="Descripción" required>
      `,
      showCancelButton: true,
      confirmButtonText: 'Registrar',
      preConfirm: () => {
        const descripcion = (document.getElementById('descripcion') as HTMLInputElement).value;
        return this.registerMedioDifusion(descripcion);
      }
    });
  }

  registerMedioDifusion(descripcion: string) {
    const url = 'http://localhost:9200/medio-difusion';
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
        Swal.fire('Éxito', 'Medio de difusion registrado correctamente', 'success');
        this.cargarMediosDifusion();
        return true;
      })
      .catch((error) => {
        console.error('Error al registrar el medio de difusion', error);
        Swal.fire('Error', 'No se pudo registrar el medio de difusion', 'error');
        return false;
      });
  }

  view(id: any): void {
    const urlGet = `http://localhost:9200/medio-difusion/${id}`;
    this.http.get<any[]>(urlGet).subscribe(
      (medioDifusionDetails: any) => {
        Swal.fire({
          title: 'Detalles del medio de difusion',
          html: `
            <p><strong>ID:</strong> ${medioDifusionDetails.id_medio_difusion}</p>
            <p><strong>Descripción:</strong> ${medioDifusionDetails.descripcion}</p>
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
        return this.editMedioDifusionRequest(id.id_medio_difusion, descripcion);
      }
    });
  }

  editMedioDifusionRequest(id: number, descripcion: string) {
    const urlUpdate = `http://localhost:9200/medio-difusion/${id}`;
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
        Swal.fire('Éxito', 'Medio de difusion actualizado correctamente', 'success');
        this.cargarMediosDifusion();
        return true;
      })
      .catch((error) => {
        console.error('Error al actualizar el medio de difusion', error);
        Swal.fire('Error', 'No se pudo actualizar el medio de difusion', 'error');
        return false;
      });
  }

  delete(id: any): void {
    const urlDelete = `http://localhost:9200/medio-difusion/${id.id_medio_difusion}`;
    const token = localStorage.getItem('token');

    if(token){
      const headers = new HttpHeaders({
        Authorization: `${token}`
      });

      Swal.fire({
        title: '¿Está seguro de eliminar el medio de difusion?',
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
              Swal.fire('Éxito', 'Medio de difusion eliminado correctamente', 'success');
              this.cargarMediosDifusion();
            },
            (err) => {
              console.error('Error al eliminar el medio de difusion', err);
              Swal.fire('Error', 'No se pudo eliminar el medio de difusion', 'error');
            }
          );
        }
      })

    }
  }


}
