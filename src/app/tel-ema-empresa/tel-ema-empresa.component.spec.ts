import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TelEmaEmpresaComponent } from './tel-ema-empresa.component';

describe('TelEmaEmpresaComponent', () => {
  let component: TelEmaEmpresaComponent;
  let fixture: ComponentFixture<TelEmaEmpresaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TelEmaEmpresaComponent]
    });
    fixture = TestBed.createComponent(TelEmaEmpresaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
