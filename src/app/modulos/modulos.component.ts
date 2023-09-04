import {Component, OnInit, ViewChild} from '@angular/core';
import {MatTableModule} from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

@Component({
  selector: 'app-modulos',
  templateUrl: './modulos.component.html',
  styleUrls: ['./modulos.component.css'],
})
export class ModulosComponent implements OnInit {
  @ViewChild(MatPaginator) paginatorModulos!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  modulosDataSource: MatTableDataSource<any>;
  modulos: any[] = [];
  router = new Router();

  columnsModulos = ['id', 'name', 'actions'];

  constructor(private http: HttpClient){
    this.modulosDataSource = new MatTableDataSource<any>();
  }

  ngOnInit(): void {
    const token = localStorage.getItem('token');

    if (token) {
      this.cargarModulos();
    } else {
      this.router.navigate(['login']);
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.modulosDataSource.filter = filterValue.trim().toLowerCase();
  }

  cargarModulos(){
    const urlEstados = 'http://localhost:9200/modulo';

    this.http.get<any[]>(urlEstados).subscribe(
      (response) => {
        this.modulos = response;
        this.modulosDataSource.data = this.modulos;
        this.modulosDataSource.paginator = this.paginatorModulos; // Configurar el paginador
      },
      (error) => {
        console.error('Error al cargar modulos', error);
      }
    );
  }

  view(id: any): void {
    const urlGet = `http://localhost:9200/modulo/${id}`;
    this.http.get<any[]>(urlGet).subscribe(
      (moduloDetails: any) => {
        Swal.fire({
          title: 'Detalles del modulo',
          html: `
            <p><strong>ID:</strong> ${moduloDetails.id_modulo}</p>
            <p><strong>Modulo:</strong> ${moduloDetails.descripcion}</p>
            <p><strong>Estado:</strong> ${moduloDetails.estado}</p>
          `,
          icon: 'success'
        });
      },
      (error) => {
        console.error('Error al obtener los detalles del modulo', error);
        Swal.fire('Error', 'No se pudieron obtener los detalles del modulo', 'error');
      }
    );


  }

  delete(id: any): void {
    const urlDelete = `http://localhost:9200/modulo/${id.id_modulo}`;
    const token = localStorage.getItem('token');

    if(token){
      const headers = new HttpHeaders({
        Authorization: `${token}`
      });

      Swal.fire({
        title: '¿Está seguro de eliminar el modulo?',
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
              Swal.fire('Éxito', 'Rol eliminado correctamente', 'success');
              this.cargarModulos();
            },
            (err) => {
              console.error('Error al eliminar el modulo', err);
              Swal.fire('Error', 'No se pudo eliminar el modulo', 'error');
            }
          );
        }
      })

    }
  }

  edit(id: any) {
    Swal.fire({
      title: 'Editar modulo',
      html: `
        <input type="text" id="modulo" class="swal2-input" placeholder="Nueva Descripción">
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      preConfirm: () => {
        const newmodulo = (document.getElementById('modulo') as HTMLInputElement).value;
        return this.editModuloRequest(id.id_modulo, newmodulo);
      }
    });
  }

  editModuloRequest(id: number, descripcion: string) {
    const urlUpdate = `http://localhost:9200/modulo/${id}`;
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
        Swal.fire('Éxito', 'Modulo actualizado correctamente', 'success');
        this.cargarModulos();
        return true;
      })
      .catch((error) => {
        console.error('Error al actualizar el modulo', error);
        Swal.fire('Error', 'No se pudo actualizar el modulo', 'error');
        return false;
      });
  }

  openRegisterDialog() {
    Swal.fire({
      title: 'Registrar Nuevo Modulo',
      html: `
        <input type="text" id="descripcion" class="swal2-input" placeholder="Nombre del modulo" required>
        <input type="checkbox" id="estado" class="swal2-checkbox" checked> Activo
      `,
      showCancelButton: true,
      confirmButtonText: 'Registrar',
      preConfirm: () => {
        const descripcion = (document.getElementById('descripcion') as HTMLInputElement).value;
        const estado = (document.getElementById('estado') as HTMLInputElement).checked;
        return this.registerRole(descripcion, estado);
      }
    });
  }

  registerRole(descripcion: string, estado: boolean) {
    const url = 'http://localhost:9200/modulo';
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
      estado: estado
    };

    return this.http.post(url, body, { headers }).toPromise()
      .then(() => {
        Swal.fire('Éxito', 'Modulo registrado correctamente', 'success');
        this.cargarModulos();
        return true;
      })
      .catch((error) => {
        console.error('Error al registrar el modulo', error);
        Swal.fire('Error', 'No se pudo registrar el modulo', 'error');
        return false;
      });
  }
}
