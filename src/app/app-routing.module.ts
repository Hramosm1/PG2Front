import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NavigationComponent } from './navigation/navigation.component';
import { RegistrarUsuariosComponent } from './registrar-usuarios/registrar-usuarios.component';
import { LoginComponent } from './login/login.component';
import { RolComponent } from './rol/rol.component'


const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' }, // Redirecciona la ruta raíz a login
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'navigation', component: NavigationComponent },
  { path: 'registrar-usuarios', component: RegistrarUsuariosComponent },
  { path: 'rol', component: RolComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
