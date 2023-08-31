import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';

@Component({
  selector: 'app-empresa',
  templateUrl: './empresa.component.html',
  styleUrls: ['./empresa.component.css']
})

export class EmpresaComponent implements OnInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  empresasDataSource: MatTableDataSource<any>;
  empresas: any[] = [];
  estadosEmpresa: { [id: number]: string } = {};
  router = new Router();

  displayedColumns = ['id', 'name', 'state', 'actions'];

  constructor(private http: HttpClient){
    this.empresasDataSource = new MatTableDataSource<any>();
  }

  ngOnInit(): void {
    const token = localStorage.getItem('token');

    if (token) {
      this.cargarEstadosEmpresa();
      this.cargarEmpresas();
    } else {
        this.router.navigate(['login']);
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.empresasDataSource.filter = filterValue.trim().toLowerCase();
  }

  cargarEmpresas(){
    const urlEmpresas = 'http://localhost:9200/empresa';

    this.http.get<any[]>(urlEmpresas).subscribe(
      (response) => {
        this.empresas = response.map(empresa => {
          return { ...empresa, descripcion_estado: this.estadosEmpresa[empresa.id_estado] };
        });
        this.empresasDataSource.data = this.empresas;
        this.empresasDataSource.paginator = this.paginator; // Configurar el paginador
      },
      (error) => {
        console.error('Error al cargar roles', error);
      }
    );
  }

  cargarEstadosEmpresa() {
    const urlEstadosEmpresa = 'http://localhost:9200/estadoEmpresa';

    this.http.get<any[]>(urlEstadosEmpresa).subscribe(
      (response) => {
        const estadosEmpresaMap: Record<number, string> = {}; // Usar Record<number, string> para definir el tipo
        response.forEach(estado => {
          estadosEmpresaMap[estado.id_estado_empresa] = estado.descripcion;
        });
        this.estadosEmpresa = estadosEmpresaMap;
      },
      (error) => {
        console.error('Error al cargar estados de empresa', error);
      }
    );
  }

  openRegisterDialog() {
    this.cargarEstadosEmpresa(); // Carga los estados de empresa antes de mostrar el diálogo

    Swal.fire({
      title: 'Registrar Nueva Empresa',
      html: `
        <input type="text" id="descripcion" class="swal2-input" placeholder="Descripción" required>
        <select id="id_estado" class="swal2-select custom-input">
          ${this.getEstadosOptions()} <!-- Genera las opciones del select desde estadosEmpresa -->
        </select>
      `,
      showCancelButton: true,
      confirmButtonText: 'Registrar',
      customClass: 'custom-input',
      preConfirm: () => {
        const descripcion = (document.getElementById('descripcion') as HTMLInputElement).value;
        const id_estado = parseInt((document.getElementById('id_estado') as HTMLSelectElement).value);
        return this.registerEmpresa(descripcion, id_estado); // Llama a la función para registrar empresa
      }
    });
  }

  getEstadosOptions() {
    return Object.keys(this.estadosEmpresa).map(id => {
      const numericId = parseInt(id); // Convierte la cadena a número
      return `<option value="${numericId}">${this.estadosEmpresa[numericId]}</option>`;
    }).join('');
  }

  registerEmpresa(descripcion: string, id_estado: number) {
    const token = localStorage.getItem('token');

    if (!token) {
      console.warn('No se encontró el token en el Local Storage.');
      return false;
    }

    const headers = new HttpHeaders({
      Authorization: `${token}`
    });

    const nuevaEmpresa = {
      descripcion: descripcion,
      id_estado: id_estado
    };

    const urlRegistroEmpresa = 'http://localhost:9200/empresa'; // URL de registro de empresa

    return this.http.post(urlRegistroEmpresa, nuevaEmpresa, { headers }).toPromise()
    .then(() => {
      Swal.fire('Éxito', 'Empresa registrada correctamente', 'success');
      this.cargarEmpresas();
      return true;
    })
    .catch((error) => {
      console.error('Error al registrar la empresa', error);
      Swal.fire('Error', 'No se pudo registrar la empresa', 'error');
      return false;
    });
  }

  delete(_t51: any) {
    throw new Error('Method not implemented.');
  }

  edit(_t51: any) {
    throw new Error('Method not implemented.');
  }

  view(arg0: any) {
    throw new Error('Method not implemented.');
  }
}
