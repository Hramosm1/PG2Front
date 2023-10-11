import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';


@Component({
  selector: 'app-telefono-empresa',
  templateUrl: './telefono-empresa.component.html',
  styleUrls: ['./telefono-empresa.component.css']
})
export class TelefonoEmpresaComponent implements OnInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  empresaDataSource: MatTableDataSource<any>;
  telefonos: any[] = [];
  router = new Router();
  empresas: { [id: number]: string } = {};

  displayedColumns = ['id', 'empresa', 'telefono', 'actions'];

  constructor(private http: HttpClient){
    this.empresaDataSource = new MatTableDataSource<any>();
  }

  ngOnInit(): void {
    const token = localStorage.getItem('token');

    if (token) {
      this.cargarTelefonoEmpresas();
      this.cargarEmpresas();
    } else {
      this.router.navigate(['login']);
    }

  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.empresaDataSource.filter = filterValue.trim().toLowerCase();
  }

  cargarTelefonoEmpresas(){
    const urlRoles = 'http://localhost:9200/telefonoEmpresa';

    this.http.get<any[]>(urlRoles).subscribe(
      (response) => {
        this.telefonos = response;
        this.empresaDataSource.data = this.telefonos;
        this.empresaDataSource.paginator = this.paginator; // Configurar el paginador
      },
      (error) => {
        console.error('Error al cargar roles', error);
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
        console.error('Error al cargar las empresas', error);
      }
    );
  }

  getEmpresasOptions() {
    return Object.keys(this.empresas).map(id => {
      const numericId = parseInt(id); // Convierte la cadena a número
      return `<option value="${numericId}">${this.empresas[numericId]}</option>`;
    }).join('');
  }

  openRegisterDialog() {
    Swal.fire({
      title: 'Registrar nuevo Telefono',
      html: `
        <label for="empresas">Seleccione una empresa:</label>
        <select id="empresa" class="swal2-select custom-input">
          ${this.getEmpresasOptions()}
        </select><br>
        <input type="text" id="telefono" class="swal2-input" placeholder="Telefono" required><br><br>
        <label for="estados">Estado:</label>
        <input type="checkbox" id="estado" class="swal2-checkbox" checked> Activo

      `,
      showCancelButton: true,
      confirmButtonText: 'Registrar',
      preConfirm: () => {
        const empresa = (document.getElementById('empresa') as HTMLInputElement).value;
        const email = (document.getElementById('telefono') as HTMLInputElement).value;
        const estado = (document.getElementById('estado') as HTMLInputElement).checked;
        return this.registerTelefono(parseInt(empresa), email, estado);
      }
    });
  }

  registerTelefono(empresa: number, telefono: string, estado: boolean ) {
    const url = 'http://localhost:9200/telefonoEmpresa';
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
      telefono: telefono,
      estado_telefono_empresa: estado
    };

    return this.http.post(url, body, { headers }).toPromise()
      .then(() => {
        Swal.fire('Éxito', 'Telefono registrado correctamente', 'success');
        this.cargarTelefonoEmpresas();
        this.cargarEmpresas();
        return true;
      })
      .catch((error) => {
        console.error('Error al registrar el telefono', error);
        Swal.fire('Error', 'No se pudo registrar el telefono', 'error');
        return false;
      });
  }

  edit(id: any) {
    Swal.fire({
      title: 'Editar Telefono',
      html: `
        <input type="text" id="telefono" class="swal2-input" value="${id.telefono}" required><br><br>
        <label for="estados">Estado:</label>
        <input type="checkbox" id="estado" class="swal2-checkbox" checked> Activo

      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      preConfirm: () => {
        const newTelefono = (document.getElementById('telefono') as HTMLInputElement).value;
        const newEstado = (document.getElementById('estado') as HTMLInputElement).checked;
        return this.editEmailRequest(id.id_telefono_empresa, newTelefono, newEstado);
      }
    });
  }

  editEmailRequest(id: number, telefono: string, estado: boolean) {
    const urlUpdate = `http://localhost:9200/telefonoEmpresa/${id}`;
    const token = localStorage.getItem('token');

    if (!token) {
      console.warn('No se encontró el token en el Local Storage.');
      return false;
    }

    const headers = new HttpHeaders({
      Authorization: `${token}`
    });

    const body = {
      telefono: telefono,
      estado_telefono_empresa: estado
    };

    return this.http.patch(urlUpdate, body, { headers }).toPromise()
      .then(() => {
        Swal.fire('Éxito', 'Telefono actualizado correctamente', 'success');
        this.cargarTelefonoEmpresas();
        return true;
      })
      .catch((error) => {
        Swal.fire('Error', 'No se pudo actualizar el telefono', 'error');
        console.log(error);
        return false;
      });
  }

  view(id: any): void {
    const urlGet = `http://localhost:9200/telefonoEmpresa/${id}`;
    this.http.get<any[]>(urlGet).subscribe(
      (Details: any) => {
        Swal.fire({
          title: 'Detalles del Telefono',
          html: `
            <p><strong>ID:</strong> ${Details.id_telefono_empresa}</p>
            <p><strong>Telefono:</strong> ${Details.telefono}</p>
            <p><strong>Empresa:</strong> ${Details.empresa.descripcion}</p>
            <p><strong>Estado:</strong> ${Details.estado_telefono_empresa ? 'Activo' : 'Inactivo'}</p>
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
    const urlDelete = `http://localhost:9200/telefonoEmpresa/${id.id_telefono_empresa}`;
    const token = localStorage.getItem('token');

    if(token){
      const headers = new HttpHeaders({
        Authorization: `${token}`
      });

      Swal.fire({
        title: '¿Está seguro de eliminar el telefono?',
        text: id.telefono,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: '¡Sí, bórralo!'
      }).then((result) => {
        if (result.isConfirmed) {
          this.http.delete(urlDelete, { headers }).subscribe(
            () => {
              Swal.fire('Éxito', 'Telefono eliminado correctamente', 'success');
              this.cargarTelefonoEmpresas();
            },
            (err) => {
              console.error('Error al eliminar el telefono', err);
              Swal.fire('Error', 'No se pudo eliminar el telefono', 'error');
            }
          );
        }
      })

    }
  }





}
