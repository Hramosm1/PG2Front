import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NavigationComponent } from './navigation/navigation.component';
import { RegistrarUsuariosComponent } from './registrar-usuarios/registrar-usuarios.component';
import { LoginComponent } from './login/login.component';
import { RolComponent } from './rol/rol.component';
import { EstadoEmpresaComponent } from './estado-empresa/estado-empresa.component';
import { EmpresaComponent } from './empresa/empresa.component';
import { ModulosPermisosComponent } from './modulos-permisos/modulos-permisos.component';
import { ModPerComponent } from './mod-per/mod-per.component';
import { ModulosComponent } from './modulos/modulos.component';
import { PermisosComponent } from './permisos/permisos.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { PlazasComponent } from './plazas/plazas.component';
import { MedioDifusionComponent } from './medio-difusion/medio-difusion.component'
import { EstadoPublicacionComponent } from './estado-publicacion/estado-publicacion.component';
import { PublicacionPlazaComponent } from './publicacion-plaza/publicacion-plaza.component';
import { EstadosEntrevistasComponent } from './estados-entrevistas/estados-entrevistas.component';
import { TelEmaEmpresaComponent } from './tel-ema-empresa/tel-ema-empresa.component';
import { TipoContratacionComponent } from './tipo-contratacion/tipo-contratacion.component';
import { PuestosComponent } from './puestos/puestos.component';
import { DemograficosEmpleadoComponent } from './demograficos-empleado/demograficos-empleado.component';
import { AsistenciaComponent } from './asistencia/asistencia.component';
import { EquipoProteccionPersonalComponent } from './equipo-proteccion-personal/equipo-proteccion-personal.component';
import { AsignacionEppComponent } from './asignacion-epp/asignacion-epp.component';
import { NominaComponent } from './nomina/nomina.component';




const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' }, // Redirecciona la ruta raíz a login
  { path: 'login', component: LoginComponent},
  { path: 'dashboard', component: DashboardComponent},
  { path: 'navigation', component: NavigationComponent},
  { path: 'registrar-usuarios', component: RegistrarUsuariosComponent},
  { path: 'rol', component: RolComponent},
  { path: 'estado-empresa', component: EstadoEmpresaComponent},
  { path: 'empresa', component: EmpresaComponent},
  { path: 'modulos-permisos', component: ModulosPermisosComponent},
  { path: 'mod-per', component: ModPerComponent},
  { path: 'modulos', component: ModulosComponent},
  { path: 'permisos', component: PermisosComponent},
  { path: 'usuarios', component: UsuariosComponent},
  { path: 'plazas', component: PlazasComponent},
  { path: 'medio-difusion', component: MedioDifusionComponent},
  { path: 'estados-publicacion', component: EstadoPublicacionComponent},
  { path: 'publicacion-plaza', component: PublicacionPlazaComponent},
  { path: 'estados-entrevistas', component: EstadosEntrevistasComponent},
  { path: 'tel-ema-empresa', component: TelEmaEmpresaComponent},
  { path: 'tipo-contratacion', component: TipoContratacionComponent},
  { path: 'puestos', component: PuestosComponent},
  { path: 'demograficos', component: DemograficosEmpleadoComponent},
  { path: 'asistencia', component: AsistenciaComponent},
  { path: 'epp', component: EquipoProteccionPersonalComponent},
  { path: 'asignacion-epp', component: AsignacionEppComponent},
  { path: 'nomina', component: NominaComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
