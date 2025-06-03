import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  SocialAuthService,
  GoogleLoginProvider,
  SocialUser,
} from '@abacritt/angularx-social-login';
import { AuthService } from 'src/app/services/auth.service';

@Component({

  selector: 'app-root',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],

})

export class LoginComponent implements OnInit {

  loginForm!: FormGroup;

  socialUser!: SocialUser;

  isLoggedin?: boolean;

  showPassword: boolean = false;
  
  constructor(
    private formBuilder: FormBuilder,
    private socialAuthService: SocialAuthService, 
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit() {

    console.log('acceder login')

    this.loginForm = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
    });

    // this.socialAuthService.authState.subscribe((user) => {

    //   this.socialUser = user;
    //   this.isLoggedin = user != null;
    //   console.log(this.socialUser);

    // });

  }

  login() {
    this.auth.login(this.loginForm.value).subscribe(res => {
      console.log(res);

      localStorage.setItem('opyniaUser', JSON.stringify(res.data.usuario));
      localStorage.setItem('opyniaAuthToken', res.data.token);

      this.auth.updateToken().then(updated => {
        this.router.navigateByUrl('/calendario');
        this.loginForm.reset();
      });
    })
  }

  loginWithGoogle(): void {

    this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID);

  }

  logOut(): void {

    this.socialAuthService.signOut();

  }
  calendario(){
    this.router.navigate(['/calendar']);
  }
logo(){
  return "http://127.0.0.1:8000/storage/logo/logo_sin_fondo.png";
}
}



// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { Router } from '@angular/router';

// declare var createGoogleEvent: any;

// @Component({
//   selector: 'app-login',
//   templateUrl: './login.component.html',
//   styleUrls: ['./login.component.scss'],
// })
// export class LoginComponent implements OnInit {
//   appointmentForm: FormGroup; // Declaración del FormGroup

//   constructor(private fb: FormBuilder, private router: Router) {
//     // Se inicializa el FormGroup dentro del constructor
//     this.appointmentForm = this.fb.group({
//       appointmentTime: ['', Validators.required],
//       email: ['', [Validators.required, Validators.email]],
//     });
//   }

//   ngOnInit() {}

//   // Función para agendar la reunión en Google Calendar
//   scheduleMeeting() {
//     if (this.appointmentForm.invalid) {
//       console.error('El formulario no es válido');
//       return;
//     }

//     let appointmentTime = new Date(this.appointmentForm.value.appointmentTime);
//     const startTime = appointmentTime.toISOString().slice(0, 18) + '-07:00';
//     const endTime = this.getEndTime(appointmentTime);
    
//     const eventDetails = {
//       email: this.appointmentForm.value.email,
//       startTime: startTime,
//       endTime: endTime,
//     };

//     console.info(eventDetails);
//     createGoogleEvent(eventDetails);
//   }

//   getEndTime(appointmentTime: Date) {
//     appointmentTime.setHours(appointmentTime.getHours() + 1);
//     return appointmentTime.toISOString().slice(0, 18) + '-07:00';
//   }

//   // Función para redirigir al calendario
//   calendario() {
//     this.router.navigate(['/calendario']);
//   }

//   generateICSFile() {
//     if (this.appointmentForm.invalid) {
//       console.error('El formulario no es válido');
//       return;
//     }

//     const datetimeValue = this.appointmentForm.value.appointmentTime;
//     const date = new Date(datetimeValue);
//     const endTime = new Date(date);
//     endTime.setHours(endTime.getHours() + 1);

//     const formattedStartDate = date.toISOString().replace(/[-:]/g, '').slice(0, -5);
//     const formattedEndDate = endTime.toISOString().replace(/[-:]/g, '').slice(0, -5);

//     const icsContent = `BEGIN:VCALENDAR
// VERSION:2.0
// BEGIN:VEVENT
// DTSTAMP:${formattedStartDate}Z
// DTSTART:${formattedStartDate}Z
// DTEND:${formattedEndDate}Z
// SUMMARY:Sample Event
// DESCRIPTION:This is a sample event
// LOCATION:Sample Location
// END:VEVENT
// END:VCALENDAR`;

//     const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
//     const downloadLink = document.createElement('a');
//     downloadLink.href = URL.createObjectURL(blob);
//     downloadLink.download = 'event.ics';
//     downloadLink.click();
//   }
// }







// import { Component, OnInit } from '@angular/core';
// //import { GoogleAuthService } from 'src/app/services/google-auth.service';

// // declare var gapi: any;
// declare var google:any;

// @Component({
//   selector: 'app-login',
//   templateUrl: './login.component.html',
//   styleUrls: ['./login.component.scss'],
// })
// export class LoginComponent implements OnInit{

// ngOnInit(){

//   google.accounts.id.initialize({
//     client_id:'663931692338-a42oipfg8snb89o0tllrs822khumtulb.apps.googleusercontent.com',
//     callback: (response :any)=>{

//     }
//   });

//   google.accounts.id.renderButton(document.getElementById("google-btn"),{

//     theme: 'filled_blue',
// size: 'large',
// shape: 'rectangle',
// width: 350,


//   })


// }




  
//   isAuthenticated = false;

//   constructor(private googleAuth: GoogleAuthService) {}

//   // async ngOnInit() {
//   //   await this.googleAuth.loadGoogleAuth();
//   //   this.isAuthenticated = this.googleAuth.isAuthenticated();
//   // }

//   login() {
//     this.googleAuth.signIn();
//     this.isAuthenticated = this.googleAuth.isAuthenticated();
//     console.log('Usuario autenticado');
//   }

//   logout() {
//     this.googleAuth.signOut();
//     this.isAuthenticated = false;
//     console.log('Sesión cerrada');
//   }

//   async createEvent() {
//     if (!this.isAuthenticated) {
//       console.error('Debes iniciar sesión primero');
//       return;
//     }

//     const event = {
//       summary: 'Evento de prueba',
//       location: 'Online',
//       description: 'Este es un evento creado desde Angular',
//       start: {
//         dateTime: new Date().toISOString(),
//         timeZone: 'America/New_York',
//       },
//       end: {
//         dateTime: new Date(new Date().getTime() + 3600000).toISOString(), // +1 hora
//         timeZone: 'America/New_York',
//       },
//     };

//     try {
//       const accessToken = this.googleAuth.getAccessToken();
//       if (!accessToken) {
//         throw new Error('No se encontró un token de acceso');
//       }

//       gapi.client.setApiKey(accessToken); // Establecer el token antes de hacer la petición

//       const response = await gapi.client.request({
//         path: 'https://www.googleapis.com/calendar/v3/calendars/primary/events',
//         method: 'POST',
//         body: event,
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           'Content-Type': 'application/json',
//         },
//       });

//       console.log('Evento creado:', response);
//     } catch (error) {
//       console.error('Error al crear el evento:', error);
//     }
//   }
// }

