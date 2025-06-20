import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService, private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {

    const authToken = this.authService.getToken(); 
    console.log('Token de autenticación obtenido', authToken);
    if (authToken) {
       console.log('Token de autenticación:', authToken);
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}` 
        }
        
      });

      console.log('Solicitud interceptada y token agregado:', request);
    }
console.log('Token de autenticación obtenido', authToken);
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 || error.status === 403) {
          console.log('Error de autenticación o autorización:', error);
          console.error('Error de autenticación o autorización:', error.statusText);
          this.authService.logout();
          console.log('Redirigiendo al login...');
          this.router.navigate(['/login']);
        }
        return throwError(error); 
      })
    );
  }
}
