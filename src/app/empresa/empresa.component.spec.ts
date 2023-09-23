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
        MatSortModule,
        MatInputModule
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EmpresaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Creacion del componente Empresas', () => {
    expect(component).toBeTruthy();
  });

  it('Cargar empresas en ngOnInit', () => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiaWF0IjoxNjk1NDkzMzcyfQ.IgXAjCMFJ2OIEnK09mrjUiMu_jBG-0GF5VwRv5cSe8o'; // Ingresa manualmente el token aquí

    spyOn(component, 'cargarEmpresas').and.callThrough();

    // Simula la obtención manual del token desde localStorage
    spyOn(localStorage, 'getItem').withArgs('token').and.returnValue(token);

    component.ngOnInit();
    expect(component.cargarEmpresas).toHaveBeenCalled();
  });

  it('Aplicar filtro', () => {
    const event: any = {
      target: {
        value: 'filtro',
      },
    };
    component.applyFilter(event);
    expect(component.empresasDataSource.filter).toBe('filtro');
  });

  afterEach(() => {
    fixture.destroy();
  });
});
