import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';


@Component({
  selector: 'app-email-empresa',
  templateUrl: './email-empresa.component.html',
  styleUrls: ['./email-empresa.component.css']
})
export class EmailEmpresaComponent implements OnInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  emailDataSource: MatTableDataSource<any>;
  emails: any[] = [];
  router = new Router();
  empresas: { [id: number]: string } = {};

  displayedColumns = ['id', 'empresa', 'email', 'actions'];

  constructor(private http: HttpClient){
    this.emailDataSource = new MatTableDataSource<any>();
  }

  ngOnInit(): void {
    const token = localStorage.getItem('token');

    if (token) {
      this.cargarEmailEmpresas();
      this.cargarEmpresas();
    } else {
      this.router.navigate(['login']);
    }

  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.emailDataSource.filter = filterValue.trim().toLowerCase();
  }

  cargarEmailEmpresas(){
    const urlRoles = 'http://localhost:9200/emailEmpresa';

    this.http.get<any[]>(urlRoles).subscribe(
      (response) => {
        this.emails = response;
        this.emailDataSource.data = this.emails;
        this.emailDataSource.paginator = this.paginator; // Configurar el paginador
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

  edit(id: any) {
    Swal.fire({
      title: 'Editar Email',
      html: `
        <input type="email" id="email" class="swal2-input" value="${id.email_empresa}" required><br><br>
        <label for="estados">Estado:</label>
        <input type="checkbox" id="estado" class="swal2-checkbox" checked> Activo

      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      preConfirm: () => {
        const newEmail = (document.getElementById('email') as HTMLInputElement).value;
        const newEstado = (document.getElementById('estado') as HTMLInputElement).checked;
        return this.editEmailRequest(id.id_email_empresa, newEmail, newEstado);
      }
    });
  }

  editEmailRequest(id: number, email: string, estado: boolean) {
    const urlUpdate = `http://localhost:9200/emailEmpresa/${id}`;
    const token = localStorage.getItem('token');

    if (!token) {
      console.warn('No se encontró el token en el Local Storage.');
      return false;
    }

    const headers = new HttpHeaders({
      Authorization: `${token}`
    });

    const body = {
      email_empresa: email,
      estado_email_empresa: estado
    };

    return this.http.patch(urlUpdate, body, { headers }).toPromise()
      .then(() => {
        Swal.fire('Éxito', 'Email actualizado correctamente', 'success');
        this.cargarEmailEmpresas();
        return true;
      })
      .catch((error) => {
        Swal.fire('Error', 'No se pudo actualizar el Email', 'error');
        console.log(error);
        return false;
      });
  }

  view(id: any): void {
    const urlGet = `http://localhost:9200/emailEmpresa/${id}`;
    this.http.get<any[]>(urlGet).subscribe(
      (Details: any) => {
        Swal.fire({
          title: 'Detalles del Email',
          html: `
            <p><strong>ID:</strong> ${Details.id_email_empresa}</p>
            <p><strong>Email:</strong> ${Details.email_empresa}</p>
            <p><strong>Empresa:</strong> ${Details.empresa.descripcion}</p>
            <p><strong>Estado:</strong> ${Details.estado_email_empresa ? 'Activo' : 'Inactivo'}</p>
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
    const urlDelete = `http://localhost:9200/emailEmpresa/${id.id_email_empresa}`;
    const token = localStorage.getItem('token');

    if(token){
      const headers = new HttpHeaders({
        Authorization: `${token}`
      });

      Swal.fire({
        title: '¿Está seguro de eliminar el email?',
        text: id.email_empresa,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: '¡Sí, bórralo!'
      }).then((result) => {
        if (result.isConfirmed) {
          this.http.delete(urlDelete, { headers }).subscribe(
            () => {
              Swal.fire('Éxito', 'Email eliminado correctamente', 'success');
              this.cargarEmailEmpresas();
            },
            (err) => {
              console.error('Error al eliminar el email', err);
              Swal.fire('Error', 'No se pudo eliminar el email', 'error');
            }
          );
        }
      })

    }
  }

  openRegisterDialog() {
    Swal.fire({
      title: 'Registrar nuevo Email',
      html: `
        <label for="empresas">Seleccione una empresa:</label>
        <select id="empresa" class="swal2-select custom-input">
          ${this.getEmpresasOptions()}
        </select><br>
        <input type="email" id="email" class="swal2-input" placeholder="Email" required><br><br>
        <label for="estados">Estado:</label>
        <input type="checkbox" id="estado" class="swal2-checkbox" checked> Activo

      `,
      showCancelButton: true,
      confirmButtonText: 'Registrar',
      preConfirm: () => {
        const empresa = (document.getElementById('empresa') as HTMLInputElement).value;
        const email = (document.getElementById('email') as HTMLInputElement).value;
        const estado = (document.getElementById('estado') as HTMLInputElement).checked;
        return this.registerEmail(parseInt(empresa), email, estado);
      }
    });
  }

  getEmpresasOptions() {
    return Object.keys(this.empresas).map(id => {
      const numericId = parseInt(id); // Convierte la cadena a número
      return `<option value="${numericId}">${this.empresas[numericId]}</option>`;
    }).join('');
  }

  registerEmail(empresa: number, email: string, estado: boolean ) {
    const url = 'http://localhost:9200/emailEmpresa';
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
      email_empresa: email,
      estado_email_empresa: estado
    };

    return this.http.post(url, body, { headers }).toPromise()
      .then(() => {
        Swal.fire('Éxito', 'Email registrado correctamente', 'success');
        this.cargarEmailEmpresas();
        this.cargarEmpresas();
        return true;
      })
      .catch((error) => {
        console.error('Error al registrar el email', error);
        Swal.fire('Error', 'No se pudo registrar el email', 'error');
        return false;
      });
  }

}
