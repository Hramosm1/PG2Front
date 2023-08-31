import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-permisos',
  templateUrl: './permisos.component.html',
  styleUrls: ['./permisos.component.css']
})
export class PermisosComponent implements OnInit{
  @ViewChild(MatPaginator) paginatorPermisos!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  permisosDataSource: MatTableDataSource<any>;
  modulos: any[] = [];
  permisos: any[] = [];

  columnsPermisos = ['id', 'rol', 'modulo'];

  constructor(private http: HttpClient){
    this.permisosDataSource = new MatTableDataSource<any>();
  }

  ngOnInit(): void {
    const token = localStorage.getItem('token');

    if (token) {
       this.cargarPermisos();
    }
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
