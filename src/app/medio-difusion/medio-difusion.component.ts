import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatTable } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MedioDifusionDataSource, MedioDifusionItem } from './medio-difusion-datasource';

@Component({
  selector: 'app-medio-difusion',
  templateUrl: './medio-difusion.component.html',
  styleUrls: ['./medio-difusion.component.css']
})
export class MedioDifusionComponent implements AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<MedioDifusionItem>;
  dataSource = new MedioDifusionDataSource();

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['id', 'name'];

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;
  }
}
