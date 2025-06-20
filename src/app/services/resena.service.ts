import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

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

  deleteResena(id:any) {
    return this.http.delete(`${this.apiUrl}/resenas/eliminarResenas/${id}`);
  }

   updateResenaWithEventId(id: number, eventId: string): Observable<any> {
    
    const url = `${this.apiUrl}/resenas/${id}/google-event`;

    const body = { 
      google_calendar_event_id: eventId 
    };

    return this.http.patch(url, body);
  }
}
