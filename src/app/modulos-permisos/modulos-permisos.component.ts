import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';

@Component({
  selector: 'app-modulos-permisos',
  templateUrl: './modulos-permisos.component.html',
  styleUrls: ['./modulos-permisos.component.css']
})

export class ModulosPermisosComponent implements OnInit {

  @ViewChild(MatPaginator) paginatorModulos!: MatPaginator;
  @ViewChild(MatPaginator) paginatorPermisos!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  modulosDataSource: MatTableDataSource<any>;
  permisosDataSource: MatTableDataSource<any>;
  modulos: any[] = [];
  permisos: any[] = [];
  router = new Router();

  columnsModulos = ['id', 'name'];
  columnsPermisos = ['id', 'rol', 'modulo'];

  constructor(private http: HttpClient){
    this.modulosDataSource = new MatTableDataSource<any>();
    this.permisosDataSource = new MatTableDataSource<any>();
  }

  ngOnInit(): void {
    const token = localStorage.getItem('token');

    if (token) {
       this.cargarModulos();
       this.cargarPermisos();
    } else {
      this.router.navigate(['login']);
    }
  }

  applyFilterModulos(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.modulosDataSource.filter = filterValue.trim().toLowerCase();
  }
  applyFilterPermisos(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.permisosDataSource.filter = filterValue.trim().toLowerCase();
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

  cargarPermisos(){
    const urlEstados = 'http://localhost:9200/permiso';

    this.http.get<any[]>(urlEstados).subscribe(
      (response) => {
        this.permisos = response;
        this.permisosDataSource.data = this.permisos;
        this.permisosDataSource.paginator = this.paginatorPermisos;
      },
      (error) => {
        console.error('Error al cargar permisos', error);
      }
    );
  }
}
