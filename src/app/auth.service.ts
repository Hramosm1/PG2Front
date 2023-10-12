import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = 'http://localhost:9200';

  constructor(private http: HttpClient) {}

  login(identifier: string, password: string): Observable<any> {
    const body = { identifier, password };
    return this.http.post(`${this.baseUrl}/login`, body);
  }

  clearAuthToken(): void {
    localStorage.removeItem('token');
    // También puedes realizar otras tareas relacionadas con el cierre de sesión aquí
  }
}
