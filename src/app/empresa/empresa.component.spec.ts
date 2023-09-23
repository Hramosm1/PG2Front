import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EmpresaComponent } from './empresa.component';
import { AppNavigationFakeComponent } from './app-navigation.component.fake'; // Asegúrate de que la ruta sea correcta
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule } from '@angular/material/paginator'; // Añadir la importación de MatPaginatorModule
import { MatTableModule } from '@angular/material/table'; // Importa otros módulos de Angular Material si son necesarios
import { MatSortModule  } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';

describe('EmpresaComponent', () => {
  let component: EmpresaComponent;
  let fixture: ComponentFixture<EmpresaComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [EmpresaComponent, AppNavigationFakeComponent],
      imports: [
        HttpClientModule,
        RouterTestingModule,
        BrowserAnimationsModule,
        MatFormFieldModule,
        MatPaginatorModule,
        MatTableModule,
        MatSortModule
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EmpresaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // it('should fetch empresas on ngOnInit', () => {
  //   spyOn(component, 'cargarEmpresas').and.callThrough();
  //   component.ngOnInit();
  //   expect(component.cargarEmpresas).toHaveBeenCalled();
  // });

  // it('should apply filter when applyFilter is called', () => {
  //   const event: any = {
  //     target: {
  //       value: 'example filter',
  //     },
  //   };
  //   component.applyFilter(event);
  //   expect(component.empresasDataSource.filter).toBe('example filter');
  // });

  // You can write more tests for other component methods and behavior

  afterEach(() => {
    fixture.destroy();
  });
});
