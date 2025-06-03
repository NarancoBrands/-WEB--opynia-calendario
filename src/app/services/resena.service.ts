import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ResenaService {
  private apiUrl = 'http://127.0.0.1:8000/api';
  constructor(private http: HttpClient) { }

   saveResena(resena:any) {
    return this.http.post(`${this.apiUrl}/resenas/createResenas`, resena);
  }

  getResenasByIdComercio(id:any) {
    return this.http.get(`${this.apiUrl}/resenas/getByIdComercio/${id}`);
  }
}
