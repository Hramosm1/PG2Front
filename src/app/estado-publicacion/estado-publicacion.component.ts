import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatTable } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { EstadoPublicacionDataSource, EstadoPublicacionItem } from './estado-publicacion-datasource';

@Component({
  selector: 'app-estado-publicacion',
  templateUrl: './estado-publicacion.component.html',
  styleUrls: ['./estado-publicacion.component.css']
})
export class EstadoPublicacionComponent implements AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<EstadoPublicacionItem>;
  dataSource = new EstadoPublicacionDataSource();

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['id', 'name'];

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;
  }
}
