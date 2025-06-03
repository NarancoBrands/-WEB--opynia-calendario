import { Component, OnInit, AfterViewInit } from "@angular/core";
import * as bootstrap from "bootstrap";
import { Chart, registerables } from "chart.js";
import { AuthService } from "../services/auth.service";
import { ResenaService } from "../services/resena.service";

// Se asumen que tanto gapi como google están disponibles globalmente
declare var gapi: any;
declare var google: any;

@Component({
  selector: "app-calendar",
  templateUrl: "./calendar-sample-5.component.html",
  styleUrls: ["./calendar-sample-5.component.scss"],
})
export class CalendarSample5Component implements OnInit, AfterViewInit {
  // Datos de notas y estadísticas
  public infoBoxes: any[] = [];
  public selectedDate: Date = new Date();
  public noteText: string = '';
  public noteNumber: string = '';
  public noteEmail?: string = '';
  public noteName: string = '';
  public noteTime: string = '';
  public alertMessage: string = '';
  public alertType: string = 'success';
  public currentSection: 'notes' | 'stats' = 'notes';
  public totalResenas = 0;
  public resenasConvertidas = 0;
  public resenasSinConvertir = 0;
  private pieChart: any;
  public isLoading: boolean = false;

  // Variables para autenticación con GIS
  public accessToken: string | null = null;
  private tokenClient: any;
  private currentUser: any;

  constructor(
    private api: AuthService,
    private resenaService: ResenaService
  ) {}

  ngOnInit(): void {
    Chart.register(...registerables);
    
    // Obtener usuario actual
    this.currentUser = JSON.parse(localStorage.getItem('opyniaUser') || '{"id": 0}');
    
    if (typeof gapi === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        this.loadGoogleClient();
      };
      document.head.appendChild(script);
    } else {
      this.loadGoogleClient();
    }

    this.getResenas();
  }

  ngAfterViewInit(): void {
    // Inicialización adicional si es necesaria
  }

  getResenas(): void {
    if (!this.currentUser.id) {
      this.showAlert('Error: Usuario no identificado', 'danger');
      return;
    }

    this.isLoading = true;
    this.resenaService.getResenasByIdComercio(this.currentUser.id).subscribe({
      next: (res: any) => {
        console.log('Reseñas obtenidas:', res);
        this.infoBoxes = res.data || [];
        console.log(res.data);
        this.calculateStats();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error obteniendo reseñas:', error);
        this.showAlert('Error al cargar las reseñas', 'danger');
        this.isLoading = false;
      }
    });
  }

  calculateStats(): void {
    this.totalResenas = this.infoBoxes.length;
    // Aquí puedes agregar lógica para calcular convertidas vs sin convertir
    // basándote en algún campo de estado en tus reseñas
    this.resenasConvertidas = this.infoBoxes.filter(resena => resena.enviado).length;
    this.resenasSinConvertir = this.totalResenas - this.resenasConvertidas;
  }

  loadGoogleClient(): void {
    gapi.load('client', () => {
      gapi.client.init({
        apiKey: 'AIzaSyAHAWbUeyc-pHCSUG20dyfkKos2sMH6a1w',
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest']
      }).then(() => {
        console.log('GAPI client initialized.');

        const savedToken = localStorage.getItem('googleCredential');
        if (savedToken) {
          this.accessToken = savedToken;
          gapi.client.setToken({ access_token: this.accessToken });
          console.log('Token recuperado desde localStorage:', this.accessToken);
        }

        this.tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: '663931692338-a42oipfg8snb89o0tllrs822khumtulb.apps.googleusercontent.com',
          scope: 'https://www.googleapis.com/auth/calendar',
          callback: (response: any) => {
            if (response.error) {
              console.error('Error obteniendo token:', response);
            } else {
              this.accessToken = response.access_token;
              console.log('Access token acquired via GIS:', this.accessToken);
              gapi.client.setToken({ access_token: this.accessToken });
              localStorage.setItem('googleCredential', this.accessToken);
            }
          }
        });
      }).catch((error: any) => {
        console.error('Error initializing gapi client:', error);
      });
    });
  }

  createGoogleCalendarEvent(resenaData: any): void {
    if (!this.accessToken) {
      console.log('No hay token de Google Calendar disponible');
      return;
    }

    // Convertir el formato de fecha para Google Calendar (ISO)
    const startDateTime = this.convertToISOString(resenaData.programado_en);
    const endDateTime = this.addThirtyMinutesToISO(startDateTime);

    const event = {
      summary: `Reseña - ${resenaData.nombre}`,
      description: `Cliente: ${resenaData.nombre}\nTeléfono: ${resenaData.telefono}\nMensaje: ${resenaData.mensaje}`,
      start: {
        dateTime: startDateTime,
        timeZone: 'Europe/Madrid' // Ajusta según tu zona horaria
      },
      end: {
        dateTime: endDateTime,
        timeZone: 'Europe/Madrid'
      }
    };

    gapi.client.calendar.events.insert({
      calendarId: 'primary',
      resource: event
    }).then((response: any) => {
      if (response && !response.error) {
        console.log('Evento creado en Google Calendar:', response.result.htmlLink);
        this.showAlert('Evento agregado al calendario de Google', 'success');
      } else {
        console.error('Error creando el evento en Google Calendar:', response.error);
      }
    }).catch((error: any) => {
      console.error('Error en la llamada a la API de Google Calendar:', error);
    });
  }

// Añade estas funciones a tu componente Angular

// Función para validar el número de teléfono
validatePhoneNumber(phone: string): boolean {
  // Debe tener exactamente 9 dígitos y solo números
  const phoneRegex = /^\d{9}$/;
  return phoneRegex.test(phone);
}

// Función para limpiar el número de teléfono (eliminar caracteres no numéricos)
cleanPhoneNumber(phone: string): string {
  return phone.replace(/\D/g, '').slice(0, 9);
}

combineDateAndTime(date: Date, time: string): string {
  if (!time || !date) {
    console.error('Fecha o hora no válidas', date, time);
    return '';
  }

  const [hours, minutes] = time.split(':');
  
  // Crear una fecha en la zona horaria de España
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  
  // Crear la fecha como si fuera en España (Europe/Madrid)
  const spanishDate = new Date();
  spanishDate.setFullYear(year, month, day);
  spanishDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

  // Obtener el offset de España para esta fecha específica
  const spanishOffset = this.getSpanishTimezoneOffset(spanishDate);
  
  // Convertir a UTC restando el offset de España
  const utcTime = new Date(spanishDate.getTime() - (spanishOffset * 60000));

  if (isNaN(utcTime.getTime())) {
    console.error('Fecha inválida:', utcTime);
    return '';
  }

  // Formatear en formato ISO UTC (Y-m-d H:i:s)
  const utcYear = utcTime.getUTCFullYear();
  const utcMonth = String(utcTime.getUTCMonth() + 1).padStart(2, '0');
  const utcDay = String(utcTime.getUTCDate()).padStart(2, '0');
  const utcHour = String(utcTime.getUTCHours()).padStart(2, '0');
  const utcMinute = String(utcTime.getUTCMinutes()).padStart(2, '0');
  const utcSecond = String(utcTime.getUTCSeconds()).padStart(2, '0');

  const formattedDate = `${utcYear}-${utcMonth}-${utcDay} ${utcHour}:${utcMinute}:${utcSecond}`;
  
  console.log(`Hora española introducida: ${time}`);
  console.log(`Fecha española: ${spanishDate.toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}`);
  console.log(`Fecha UTC enviada al backend: ${formattedDate}`);
  
  return formattedDate;
}

// Función auxiliar para obtener el offset de España (maneja horario de verano/invierno)
getSpanishTimezoneOffset(date: Date): number {
  // Crear dos fechas: una en UTC y otra en España
  const utcDate = new Date(date.getTime());
  const spanishDate = new Date(date.toLocaleString('en-US', { timeZone: 'Europe/Madrid' }));
  
  // Calcular la diferencia en minutos
  const offset = (utcDate.getTime() - spanishDate.getTime()) / (1000 * 60);
  
  // En verano España es UTC+2 (offset = -120)
  // En invierno España es UTC+1 (offset = -60)
  return -offset;
}

// Función modificada para guardar la nota con validación de teléfono
saveNote(): void {
  if (!this.noteName.trim() || !this.noteNumber.trim() || !this.noteTime) {
    this.showAlert('Error: Por favor, completa los campos obligatorios.', 'danger');
    return;
  }

  // Limpiar y validar el número de teléfono
  const cleanedNumber = this.cleanPhoneNumber(this.noteNumber);
  if (!this.validatePhoneNumber(cleanedNumber)) {
    this.showAlert('El formato del número es incorrecto. Debe tener exactamente 9 dígitos.', 'danger');
    return;
  }

  if (!this.currentUser.id) {
    this.showAlert('Error: Usuario no identificado', 'danger');
    return;
  }

  this.isLoading = true;

  // Crear el objeto de datos según la estructura del backend
  const resenaData = {
    nombre: this.noteName.trim(),
    telefono: `34${cleanedNumber}`, // Agregar el prefijo 34
    mensaje: this.noteText.trim() || 'Sin mensaje adicional',
    comercioId: this.currentUser.id,
    programado_en: this.combineDateAndTime(this.selectedDate, this.noteTime),
    email: this.noteEmail ? this.noteEmail.trim() : null,
  };

  console.log('Enviando reseña:', resenaData);
  console.log('Fecha formateada:', resenaData.programado_en);

  this.resenaService.saveResena(resenaData).subscribe({
    next: (response: any) => {
      console.log('Reseña guardada exitosamente:', response);
      
      // Agregar la nueva reseña a la lista local
      const newResena = {
        ...response.data,
        fecha: this.formatDate(this.selectedDate) + ' - ' + this.noteTime,
        email: this.noteEmail || 'No especificado'
      };
      
      this.infoBoxes.push(response.data); // Agregar al inicio de la lista
      this.calculateStats();
      
      // Limpiar formulario y cerrar modal
      this.clearForm();
      this.closeModal();
      this.showAlert('Reseña creada exitosamente', 'success');
      
      // Crear evento en Google Calendar si está disponible
      this.createGoogleCalendarEvent(resenaData);
      
      this.isLoading = false;
    },
    error: (error) => {
      console.error('Error guardando reseña:', error);
      let errorMessage = 'Error al guardar la reseña';
      
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else if (error.error && error.error.errors) {
        // Manejar errores de validación de Laravel
        const validationErrors = [].concat(...Object.values(error.error.errors));
        errorMessage = validationErrors.join(', ');
      }
      
      this.showAlert(errorMessage, 'danger');
      this.isLoading = false;
    }
  });
}

  // Función para convertir el formato Laravel a ISO para Google Calendar
  convertToISOString(laravelDateTime: string): string {
    // Convertir "2024-01-15 14:30:00" a formato ISO
    const date = new Date(laravelDateTime.replace(' ', 'T'));
    return date.toISOString();
  }

  addThirtyMinutesToISO(isoString: string): string {
    const date = new Date(isoString);
    date.setMinutes(date.getMinutes() + 30);
    return date.toISOString();
  }

  showAlert(message: string, type: string): void {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => { 
      this.alertMessage = ''; 
    }, 5000);
  }

  clearForm(): void {
    this.noteText = '';
    this.noteName = '';
    this.noteEmail = '';
    this.noteNumber = '';
    this.noteTime = '';
  }

  closeModal(): void {
    const modal = bootstrap.Modal.getInstance(document.getElementById('noteModal') as HTMLElement);
    modal?.hide();
  }

  formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    };
    return date.toLocaleDateString('es-ES', options);
  }

  onDateSelected(event: any): void {
    this.selectedDate = new Date(event);
  }

  toggleSection(): void {
    if (this.pieChart) {
      this.pieChart.destroy();
      this.pieChart = null;
    }
    this.currentSection = this.currentSection === 'notes' ? 'stats' : 'notes';
    if (this.currentSection === 'stats') {
      setTimeout(() => {
        this.createPieChart();
      }, 10);
    }
  }

  openNoteModal(): void {
    // Solicitar autenticación de Google Calendar si no está disponible
    // if (!this.accessToken && this.tokenClient) {
    //   this.tokenClient.requestAccessToken();
    // }
    
    const modal = new bootstrap.Modal(document.getElementById('noteModal') as HTMLElement);
    modal.show();
  }

  createPieChart(): void {
    const pieChartElement = <HTMLCanvasElement>document.getElementById('pieChart');
    if (pieChartElement && !this.pieChart) {
      const porcentajeConvertidas = this.totalResenas > 0 ? (this.resenasConvertidas / this.totalResenas) * 100 : 0;
      const porcentajeSinConvertir = this.totalResenas > 0 ? (this.resenasSinConvertir / this.totalResenas) * 100 : 0;

      this.pieChart = new Chart(pieChartElement, {
        type: 'pie',
        data: {
          labels: ['Reseñas Convertidas', 'Reseñas Sin Convertir'],
          datasets: [{
            label: 'Reseñas',
            data: [porcentajeConvertidas, porcentajeSinConvertir],
            backgroundColor: ['#4CAF50', '#FF5722'],
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'top' },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.label || '';
                  const value = context.raw || 0;
                  return `${label}: ${(Number(value) || 0).toFixed(2)}%`;
                }
              }
            }
          }
        }
      });
    }
  }

  // Método para refrescar las reseñas manualmente
  refreshResenas(): void {
    this.getResenas();
  }

  // Método de prueba para verificar el formato de fecha
  testDateFormat(): void {
    const testDate = new Date();
    const testTime = "14:30";
    const result = this.combineDateAndTime(testDate, testTime);
    console.log('Formato de prueba:', result);
    
    // Verificar que coincida con el patrón Y-m-d H:i:s
    const pattern = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
    console.log('¿Formato válido?', pattern.test(result));
  }
}