import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemograficosEmpleadoComponent } from './demograficos-empleado.component';

describe('DemograficosEmpleadoComponent', () => {
  let component: DemograficosEmpleadoComponent;
  let fixture: ComponentFixture<DemograficosEmpleadoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DemograficosEmpleadoComponent]
    });
    fixture = TestBed.createComponent(DemograficosEmpleadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
