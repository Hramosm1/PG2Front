import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';

@Component({
  selector: 'app-est-entrevista',
  templateUrl: './est-entrevista.component.html',
  styleUrls: ['./est-entrevista.component.css']
})
export class EstEntrevistaComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  estadoEntrevistaDataSource: MatTableDataSource<any>;
  estadoEntrevista: any[] = [];
  router = new Router();

  displayedColumns = ['id', 'name','actions'];

  constructor(private http: HttpClient){
    this.estadoEntrevistaDataSource = new MatTableDataSource<any>();
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
    this.estadoEntrevistaDataSource.filter = filterValue.trim().toLowerCase();
  }

  cargarEstados(){
    const urlEstados = 'http://localhost:9200/estados-entrevista';

    this.http.get<any[]>(urlEstados).subscribe(
      (response) => {
        this.estadoEntrevista = response;
        this.estadoEntrevistaDataSource.data = this.estadoEntrevista;
        this.estadoEntrevistaDataSource.paginator = this.paginator; // Configurar el paginador
        console.log( this.estadoEntrevistaDataSource.data );
      },
      (error) => {
        console.error('Error al cargar estados entrevista', error);
      }
    );
  }

  view(id: any){

  }
  edit(id: any){

  }
  delete(id: any){

  }

  openRegisterDialog() {
    Swal.fire({
      title: 'Registrar nuevo estado entrevista',
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
    const url = 'http://localhost:9200/estados-entrevista';
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
