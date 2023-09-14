import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatTable } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { PublicacionPlazaDataSource, PublicacionPlazaItem } from './publicacion-plaza-datasource';

@Component({
  selector: 'app-publicacion-plaza',
  templateUrl: './publicacion-plaza.component.html',
  styleUrls: ['./publicacion-plaza.component.css']
})
export class PublicacionPlazaComponent implements AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<PublicacionPlazaItem>;
  dataSource = new PublicacionPlazaDataSource();

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['id', 'name'];

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;
  }
}
