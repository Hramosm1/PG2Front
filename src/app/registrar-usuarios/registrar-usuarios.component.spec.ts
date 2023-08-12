import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarUsuariosComponent } from './registrar-usuarios.component';

describe('RegistrarUsuariosComponent', () => {
  let component: RegistrarUsuariosComponent;
  let fixture: ComponentFixture<RegistrarUsuariosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RegistrarUsuariosComponent]
    });
    fixture = TestBed.createComponent(RegistrarUsuariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
