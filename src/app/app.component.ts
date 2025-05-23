import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  template:  `<router-outlet></router-outlet>`  ,   // templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {
    // Si ya tienes el token almacenado (por ejemplo, en localStorage), redirige automáticamente.
    const token = localStorage.getItem('googleCredential');
    if (token) {
      this.router.navigate(['/calendar']); // Asegúrate de usar la ruta correcta
    }

    // Define la función de callback para el widget de Google Sign-In
    window['handleCredentialResponse'] = (response: any) => {
      console.log('Respuesta de Google:', response);
      console.log("dentro de aqui");
      // Guarda la credencial (token) en localStorage
      localStorage.setItem('googleCredential', response.credential);
      // Redirige a la sección de calendario
      this.router.navigate(['/calendar']);
    };
  }
}
