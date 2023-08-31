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

  columnsModulos = ['id', 'name'];

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
  }

  openRegisterDialog(){}

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

}
