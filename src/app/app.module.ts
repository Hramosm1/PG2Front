import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NavigationComponent } from './navigation/navigation.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { RegistrarUsuariosComponent } from './registrar-usuarios/registrar-usuarios.component';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { LoginComponent } from './login/login.component';
import { AuthService } from './auth.service';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { RolComponent } from './rol/rol.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { EstadoEmpresaComponent } from './estado-empresa/estado-empresa.component';
import { EmpresaComponent } from './empresa/empresa.component';
import { ModulosPermisosComponent } from './modulos-permisos/modulos-permisos.component';
import { ModulosComponent } from './modulos/modulos.component';
import { PermisosComponent } from './permisos/permisos.component';
import { ModPerComponent } from './mod-per/mod-per.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { PlazasComponent } from './plazas/plazas.component';
import { EstadoPublicacionComponent } from './estado-publicacion/estado-publicacion.component';
import { MedioDifusionComponent } from './medio-difusion/medio-difusion.component';
import { PublicacionPlazaComponent } from './publicacion-plaza/publicacion-plaza.component';
import { EstEntrevistaComponent } from './est-entrevista/est-entrevista.component';
import { EntrevistaComponent } from './entrevista/entrevista.component';
import { EstadosEntrevistasComponent } from './estados-entrevistas/estados-entrevistas.component';
import { TelefonoEmpresaComponent } from './telefono-empresa/telefono-empresa.component';
import { EmailEmpresaComponent } from './email-empresa/email-empresa.component';
import { TelEmaEmpresaComponent } from './tel-ema-empresa/tel-ema-empresa.component';
import { TipoContratacionComponent } from './tipo-contratacion/tipo-contratacion.component';
import { PuestosComponent } from './puestos/puestos.component';
import { DemograficosEmpleadoComponent } from './demograficos-empleado/demograficos-empleado.component';
import { EmpleadoComponent } from './empleado/empleado.component';
import { TipoDocumentoComponent } from './tipo-documento/tipo-documento.component';
import { DocumentoComponent } from './documento/documento.component';
import { TelefonoEmpleadoComponent } from './telefono-empleado/telefono-empleado.component';
import { NombresEmpleadoComponent } from './nombres-empleado/nombres-empleado.component';
import { EmailEmpleadoComponent } from './email-empleado/email-empleado.component';
import { ApellidosEmpleadoComponent } from './apellidos-empleado/apellidos-empleado.component';
import { AsistenciaComponent } from './asistencia/asistencia.component';
import { NavegacionComponent } from './navegacion/navegacion.component';
import { EquipoProteccionPersonalComponent } from './equipo-proteccion-personal/equipo-proteccion-personal.component';
import { AsignacionEppComponent } from './asignacion-epp/asignacion-epp.component';
import { NominaComponent } from './nomina/nomina.component';

@NgModule({
  declarations: [
    AppComponent,
    NavigationComponent,
    DashboardComponent,
    RegistrarUsuariosComponent,
    LoginComponent,
    RolComponent,
    EstadoEmpresaComponent,
    EmpresaComponent,
    ModulosPermisosComponent,
    ModulosComponent,
    PermisosComponent,
    ModPerComponent,
    UsuariosComponent,
    PlazasComponent,
    EstadoPublicacionComponent,
    MedioDifusionComponent,
    PublicacionPlazaComponent,
    EstEntrevistaComponent,
    EntrevistaComponent,
    EstadosEntrevistasComponent,
    TelefonoEmpresaComponent,
    EmailEmpresaComponent,
    TelEmaEmpresaComponent,
    TipoContratacionComponent,
    PuestosComponent,
    DemograficosEmpleadoComponent,
    EmpleadoComponent,
    TipoDocumentoComponent,
    DocumentoComponent,
    TelefonoEmpleadoComponent,
    NombresEmpleadoComponent,
    EmailEmpleadoComponent,
    ApellidosEmpleadoComponent,
    AsistenciaComponent,
    NavegacionComponent,
    EquipoProteccionPersonalComponent,
    AsignacionEppComponent,
    NominaComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatGridListModule,
    MatCardModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    FlexLayoutModule,
  ],
  providers: [
    AuthService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
