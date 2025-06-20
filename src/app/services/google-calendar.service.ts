import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GoogleCalendar } from '../interfaces/google-calendar';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
declare var gapi: any;
declare var google: any;
@Injectable({
  providedIn: 'root'
})
export class GoogleCalendarService {
private apiUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene la URL de autenticación de Google desde nuestro backend.
   */
  getGoogleAuthUrl(): Observable<any> {
    return this.http.get(`${this.apiUrl}/google/auth/redirect`, { headers: this.getAuthHeaders() });
  }

  /**
   * Pide a nuestro backend que inicie la vigilancia del calendario para el usuario actual.
   */
  startWatchingCalendar(): Observable<any> {
    return this.http.post(`${this.apiUrl}/google/start-watching`, {}, { headers: this.getAuthHeaders() });
  }

  stopWatchingAndDisconnect(): Observable<any> {
    return this.http.post(`${this.apiUrl}/google/disconnect`, {}, { headers: this.getAuthHeaders() });
  }
getAuthenticatedUser(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user`, { headers: this.getAuthHeaders() });
  }
  /**
   * Método privado para obtener las cabeceras de autenticación con el token de nuestra API.
   */
  private getAuthHeaders(): HttpHeaders {
    const authToken = localStorage.getItem('opyniaAuthToken');
    if (!authToken) {
      return new HttpHeaders();
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${authToken}`
    });
  }
}