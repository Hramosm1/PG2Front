import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatTable } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ApellidosEmpleadoDataSource, ApellidosEmpleadoItem } from './apellidos-empleado-datasource';

@Component({
  selector: 'app-apellidos-empleado',
  templateUrl: './apellidos-empleado.component.html',
  styleUrls: ['./apellidos-empleado.component.css']
})
export class ApellidosEmpleadoComponent implements AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<ApellidosEmpleadoItem>;
  dataSource = new ApellidosEmpleadoDataSource();

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['id', 'name'];

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;
  }
}
