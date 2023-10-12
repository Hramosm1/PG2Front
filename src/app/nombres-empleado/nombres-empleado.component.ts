import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatTable } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { NombresEmpleadoDataSource, NombresEmpleadoItem } from './nombres-empleado-datasource';

@Component({
  selector: 'app-nombres-empleado',
  templateUrl: './nombres-empleado.component.html',
  styleUrls: ['./nombres-empleado.component.css']
})
export class NombresEmpleadoComponent implements AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<NombresEmpleadoItem>;
  dataSource = new NombresEmpleadoDataSource();

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['id', 'name'];

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;
  }
}
