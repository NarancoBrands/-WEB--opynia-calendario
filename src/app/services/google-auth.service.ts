// import { Injectable } from '@angular/core';

// declare var google: any;
// declare var gapi: any;

// @Injectable({
//   providedIn: 'root',
// })
// export class GoogleAuthService {
//   private isGapiLoaded = false;
//   private isSigningIn = false;
//   private accessToken: string | null = null;

//   constructor() {
//     this.loadGoogleAuth();
//   }

//   // Cargar Google Identity Services y GAPI
//   public async loadGoogleAuth(): Promise<void> {
//     await this.loadGapiScript();

//     if (!google?.accounts) {
//       console.error('Google Identity Services no se ha cargado correctamente.');
//       return;
//     }

//     google.accounts.id.initialize({
//       client_id: '663931692338-a42oipfg8snb89o0tllrs822khumtulb.apps.googleusercontent.com',
//       callback: (response: any) => this.handleCredentialResponse(response),
//     });

//     google.accounts.id.prompt();
//     console.log('Google Identity Services cargado correctamente');

//     await this.loadGapiClient();
//     this.isGapiLoaded = true;
//   }

//   // Cargar el script de GAPI si aún no está disponible
//   private async loadGapiScript(): Promise<void> {
//     return new Promise((resolve, reject) => {
//       if (typeof gapi !== 'undefined') {
//         resolve();
//         return;
//       }

//       const script = document.createElement('script');
//       script.src = 'https://apis.google.com/js/api.js';
//       script.async = true;
//       script.defer = true;
//       script.onload = () => {
//         console.log('GAPI cargado correctamente.');
//         resolve();
//       };
//       script.onerror = () => {
//         console.error('Error al cargar el script de GAPI.');
//         reject();
//       };

//       document.body.appendChild(script);
//     });
//   }

//   private async loadGapiClient(): Promise<void> {
//     return new Promise((resolve, reject) => {
//       gapi.load('client:auth2', async () => {
//         try {
//           await gapi.client.init({
//             clientId: '663931692338-a42oipfg8snb89o0tllrs822khumtulb.apps.googleusercontent.com',
//             scope: 'https://www.googleapis.com/auth/calendar.events',
//           });
//           console.log('GAPI Client cargado correctamente');
//           resolve();
//         } catch (error) {
//           console.error('Error al cargar GAPI Client:', error);
//           reject(error);
//         }
//       });
//     });
//   }

//   // Manejar respuesta de autenticación
//   private handleCredentialResponse(response: any): void {
//     if (response.credential) {
//       this.accessToken = response.credential;
//       console.log('Token de autenticación recibido:', this.accessToken);
//     } else {
//       console.warn('Error en la autenticación');
//     }
//   }

//   public async signIn(): Promise<void> {
//     if (this.isSigningIn) return;
//     this.isSigningIn = true;

//     if (!this.isGapiLoaded) {
//       console.error('Google Auth aún no está cargado');
//       this.isSigningIn = false;
//       return;
//     }

//     try {
//       const authInstance = gapi.auth2.getAuthInstance();
//       if (authInstance) {
//         const user = await authInstance.signIn();
//         this.accessToken = user.getAuthResponse().access_token;
//         console.log('Usuario autenticado:', user);
//       } else {
//         console.error('No se pudo obtener la instancia de autenticación');
//       }
//     } catch (error) {
//       console.error('Error en la autenticación:', error);
//     }

//     this.isSigningIn = false;
//   }

//   public signOut(): void {
//     if (gapi.auth2) {
//       const authInstance = gapi.auth2.getAuthInstance();
//       if (authInstance) {
//         authInstance.signOut().then(() => {
//           this.accessToken = null;
//           google.accounts.id.disableAutoSelect();
//           console.log('Usuario desautenticado');
//         });
//       }
//     }
//   }

//   public isAuthenticated(): boolean {
//     return this.accessToken !== null;
//   }

//   public getAccessToken(): string | null {
//     return this.accessToken;
//   }
// }
