import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tipo-contratacion',
  templateUrl: './tipo-contratacion.component.html',
  styleUrls: ['./tipo-contratacion.component.css']
})
export class TipoContratacionComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('startInput') startInput: any;
  tipoContratacionDataSource: MatTableDataSource<any>;
  tipoContratacion: any[] = [];
  router = new Router();
  empresas: { [id: number]: string } = {};


  displayedColumns = ['id', 'empresa', 'descripcion', 'actions'];

  constructor(private http: HttpClient){
    this.tipoContratacionDataSource = new MatTableDataSource<any>();
  }

  ngOnInit(): void {
    const token = localStorage.getItem('token');

    if (token) {
       this.cargarTipoContratacion();
       this.cargarEmpresas();
    } else {
      this.router.navigate(['login']);
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.tipoContratacionDataSource.filter = filterValue.trim().toLowerCase();
  }

  cargarTipoContratacion(){
    const urlEstados = 'http://localhost:9200/tipoContratacion';

    this.http.get<any[]>(urlEstados).subscribe(
      (response) => {
        this.tipoContratacion = response;
        this.tipoContratacionDataSource.data = this.tipoContratacion;
        this.tipoContratacionDataSource.paginator = this.paginator; // Configurar el paginador
      },
      (error) => {
        console.error('Error al cargar los tipos de contratacion', error);
      }
    );
  }

  cargarEmpresas(){
    const url = 'http://localhost:9200/empresa';

    this.http.get<any[]>(url).subscribe(
      (response) => {
        const Map: Record<number, string> = {};
        response.forEach(empresa => {
          Map[empresa.id_empresa] = empresa.descripcion;
        });
        this.empresas = Map;
      },
      (error) => {
        console.error('Error al cargar empresas', error);
      }
    );
  }

  openRegisterDialog() {
    Swal.fire({
      title: 'Registrar nuevo tipo de contratacion',
      html: `
        <label for="empresas">Seleccione una empresa:</label>
        <select id="empresa" class="swal2-select custom-input">
          ${this.getempresasOptions()}
        </select><br><br>
        <label for="fechas">Tipo de contratacion:</label><br>
        <input type="text" id="descripcion" class="swal2-input" placeholder="Descripción" required>
      `,
      showCancelButton: true,
      confirmButtonText: 'Registrar',
      preConfirm: () => {
        const empresa = (document.getElementById('empresa') as HTMLInputElement).value;
        const descripcion = (document.getElementById('descripcion') as HTMLInputElement).value;
        return this.registerTipoContratacion(parseInt(empresa), descripcion);
      }
    });
  }

  getempresasOptions() {
    return Object.keys(this.empresas).map(id => {
      const numericId = parseInt(id); // Convierte la cadena a número
      return `<option value="${numericId}">${this.empresas[numericId]}</option>`;
    }).join('');
  }

  registerTipoContratacion(empresa: number, descripcion: string) {
    const url = 'http://localhost:9200/tipoContratacion';
    const token = localStorage.getItem('token');

    if (!token) {
      console.warn('No se encontró el token en el Local Storage.');
      return false;
    }

    const headers = new HttpHeaders({
      Authorization: `${token}`
    });

    const body = {
      id_empresa: empresa,
      descripcion: descripcion,
    };

    return this.http.post(url, body, { headers }).toPromise()
      .then(() => {
        Swal.fire('Éxito', 'Registro exitoso', 'success');
        this.cargarTipoContratacion();
        return true;
      })
      .catch((error) => {
        console.error('Error al registrar la publicacion', error);
        Swal.fire('Error', 'No se pudo realizar el registro', error);
        return false;
      });
  }

  view(id: any): void {
    const urlGet = `http://localhost:9200/tipoContratacion/${id}`;
    this.http.get<any[]>(urlGet).subscribe(
      (Details: any) => {
        Swal.fire({
          title: 'Detalles del tipo de contratacion',
          html: `
            <p><strong>ID:</strong> ${Details.id_tipo_contratacion}</p>
            <p><strong>Empresa:</strong> ${Details.empresa.descripcion}</p>
            <p><strong>Tipo contratacion:</strong> ${Details.descripcion}</p>
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
        <label for="fechas">Tipo de contratacion:</label><br>
        <input type="text" id="descripcion" class="swal2-input" value="${id.descripcion}" required>
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      preConfirm: () => {
        const descripcion = (document.getElementById('descripcion') as HTMLInputElement).value;
        return this.editPlazaRequest(id.id_tipo_contratacion,descripcion);
      }
    });
  }

  editPlazaRequest(id:number, descripcion: string) {
    const urlUpdate = `http://localhost:9200/tipoContratacion/${id}`;
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
        Swal.fire('Éxito', 'Registro actualizado correctamente', 'success');
        this.cargarTipoContratacion();
        return true;
      })
      .catch((error) => {
        console.error('Error al realizar la actualizacion', error);
        Swal.fire('Error', 'No se pudo actualizar el registro', 'error');
        return false;
      });
  }

  delete(id: any): void {
    const urlDelete = `http://localhost:9200/tipoContratacion/${id.id_tipo_contratacion}`;
    const token = localStorage.getItem('token');

    if(token){
      const headers = new HttpHeaders({
        Authorization: `${token}`
      });

      Swal.fire({
        title: '¿Está seguro de eliminar el tipo de contratacion?',
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
              Swal.fire('Éxito', 'Registro eliminado correctamente', 'success');
              this.cargarTipoContratacion();
            },
            (err) => {
              console.error('Error al eliminar el registro', err);
              Swal.fire('Error', 'No se pudo eliminar el registro', 'error');
            }
          );
        }
      })

    }
  }
}
