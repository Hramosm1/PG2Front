import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';


@Component({
  selector: 'app-entrevista',
  templateUrl: './entrevista.component.html',
  styleUrls: ['./entrevista.component.css']
})
export class EntrevistaComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  entrevistaDataSource: MatTableDataSource<any>;
  entrevistas: any[] = [];
  router = new Router();

  displayedColumns = ['id', 'name','actions'];

  constructor(private http: HttpClient){
    this.entrevistaDataSource = new MatTableDataSource<any>();
  }

  ngOnInit(): void {
    const token = localStorage.getItem('token');

    if (token) {
       this.cargarEntrevistas();
    } else {
      this.router.navigate(['login']);
    }
  }

  cargarEntrevistas(){

  }
  view(id: any){

  }
  edit(id: any){

  }
  delete(id: any){

  }

  openRegisterDialog(){}
}
