import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatTable } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { TelefonoEmpleadoDataSource, TelefonoEmpleadoItem } from './telefono-empleado-datasource';

@Component({
  selector: 'app-telefono-empleado',
  templateUrl: './telefono-empleado.component.html',
  styleUrls: ['./telefono-empleado.component.css']
})
export class TelefonoEmpleadoComponent implements AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<TelefonoEmpleadoItem>;
  dataSource = new TelefonoEmpleadoDataSource();

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['id', 'name'];

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;
  }
}
