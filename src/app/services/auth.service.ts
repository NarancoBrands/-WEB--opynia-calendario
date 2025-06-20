import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthCredentials } from '../models/auth-credentials';
import { HttpClient, HttpHeaders , HttpResponse, HttpErrorResponse} from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: "root",
})
export class AuthService {
  // private apiUrl = 'http://localhost:3306/api';
  private apiUrl = `${environment.apiUrl}/api`;
  headers: any;

  constructor(private http: HttpClient) {}

  async updateToken() {
    return new Promise((resolve, reject) => {
      let authToken: any = localStorage.getItem("whereventsAuthToken");

      this.headers = new HttpHeaders({
        Authorization: "Bearer " + authToken,
      });

      resolve(true);
    });
  }

  login(credentials: any): Observable<any> {
    // return this.http.post(this.apiUrl, credentials);
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  loadComercio(data: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/comercios`, data);
  }

  saveResena(resena: any) {
    return this.http.post(`${this.apiUrl}/resenas/createResenas`, resena);
  }

  getResenasByIdComercio(id: any) {
    return this.http.get(`${this.apiUrl}/resenas/getByIdComercio/${id}`);
  }

  getToken(): string | null {
    return localStorage.getItem("opyniaAuthToken");
  }

  logout() {
  localStorage.clear();
  }
}
