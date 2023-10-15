import { Component,OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './../auth.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // Importa map desde 'rxjs/operators'

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
})
export class NavigationComponent implements OnInit {
  isHandset$: Observable<boolean>;
  identifier:  string[] = [];
  isSubMenu1Open = false;


  constructor(
    private authService: AuthService,
    private router: Router,
    private breakpointObserver: BreakpointObserver
  ) {
    this.isHandset$ = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
      map((result) => result.matches)
    );
  }

  logout(): void {
    this.authService.clearAuthToken();
    this.router.navigate(['/login']);
  }

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    const identificador = localStorage.getItem('identifier');

    if (identificador !== null) {
      this.identifier = [identificador];
    } else {

    }

    if (!token) {
      this.router.navigate(['login']);
    }
  }

   // Método para alternar la visibilidad del submenú 1
   toggleSubMenu1() {
    this.isSubMenu1Open = !this.isSubMenu1Open;
  }
}
