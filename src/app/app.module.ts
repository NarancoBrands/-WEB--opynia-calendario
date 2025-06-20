import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms"; // Agregado ReactiveFormsModule
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AppComponent } from "./app.component";
import { LoginComponent } from './pages/login/login.component';
import { 
  IgxCalendarModule,
  IgxDialogModule
} from "igniteui-angular";
import { CalendarSample5Component } from "./calendar-sample-5/calendar-sample-5.component";
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

// Importar lo necesario para la internacionalización
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { LOCALE_ID } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
  SocialLoginModule,
  SocialAuthServiceConfig,
} from '@abacritt/angularx-social-login';
import { GoogleLoginProvider } from '@abacritt/angularx-social-login';
import { AppHeaderComponent } from "./componets/app-header/app-header.component";
import { AuthInterceptor } from "./auth.interceptor";

const routes: Routes = [
  { path: 'calendar',component: CalendarSample5Component },
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' }, // o la ruta de login si lo prefieres
  { path: '**', redirectTo: '/calendar' }
];

// Registrar el locale de español
registerLocaleData(localeEs, 'es');

@NgModule({
  bootstrap: [AppComponent],
  declarations: [
    AppComponent,
    CalendarSample5Component,
    LoginComponent,
    AppHeaderComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule, // 📌 Agregado para que funcione formGroup
    RouterModule.forRoot(routes),
    IgxCalendarModule,
    IgxDialogModule,
    HttpClientModule,
    

  ],
  providers: [
    {provide: 'SocialAuthServiceConfig',
    useValue: {
      autoLogin: false,
      providers: [
        {
          id: GoogleLoginProvider.PROVIDER_ID,
          provider: new GoogleLoginProvider('Google-Client-ID-Goes-Here'),
        },
      ],
    } as SocialAuthServiceConfig},
    { provide: LOCALE_ID, useValue: 'es' },{
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
]
})
export class AppModule { }
