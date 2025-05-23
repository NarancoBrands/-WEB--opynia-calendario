import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as bootstrap from 'bootstrap';
import { Chart, registerables } from 'chart.js';
import { AuthService } from '../services/auth.service';

// Se asumen que tanto gapi como google están disponibles globalmente
declare var gapi: any;
declare var google: any;

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar-sample-5.component.html',
  styleUrls: ['./calendar-sample-5.component.scss'],
})
export class CalendarSample5Component implements OnInit, AfterViewInit {
  // Datos de notas y estadísticas
  public infoBoxes = [
    // { title: '22 Enero', content: 'Reunión presencial.', name: 'Juan Pérez', email: 'juan@example.com', number: 123456789 },
  ];
  public selectedDate: Date = new Date();
  public noteText: string = '';
  public noteNumber: number = 0;
  public noteEmail?: string = '';
  public noteName: string = '';
  public noteTime: string = '';
  public alertMessage: string = '';
  public alertType: string = 'success';
  public currentSection: 'notes' | 'stats' = 'notes';
  public totalResenas = 140;
  public resenasConvertidas = 103;
  public resenasSinConvertir = 37;
  private pieChart: any;

  // Variables para autenticación con GIS
  public accessToken: string | null = null;
  private tokenClient: any;

  constructor(
    private api: AuthService
    ) {}

  ngOnInit(): void {
    // Registrar Chart.js
    Chart.register(...registerables);

    // Cargar el cliente de gapi y luego inicializarlo
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

    this.getResenas()
  }

  ngAfterViewInit(): void {
    // Inicializar el gráfico si es necesario, por ejemplo, cuando la sección de estadísticas es seleccionada.
  }

  getResenas() {
    this.api.getResenasByIdComercio(JSON.parse(localStorage.getItem('opyniaUser') || '{"id": 0}').id).subscribe((res:any) => {
      console.log(res);
      this.infoBoxes=res.data;
    })
  }

  loadGoogleClient(): void {
    gapi.load('client', () => {
      gapi.client.init({
        apiKey: 'AIzaSyAHAWbUeyc-pHCSUG20dyfkKos2sMH6a1w',
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest']
      }).then(() => {
        console.log('GAPI client initialized.');

        // Verificar si ya tenemos un token guardado en el almacenamiento local (localStorage)
        const savedToken = localStorage.getItem('googleCredential');
        if (savedToken) {
          this.accessToken = savedToken;
          gapi.client.setToken({ access_token: this.accessToken });
          console.log('Token recuperado desde localStorage:', this.accessToken);
        }

        // Inicializar el token client con GIS (nuevo método)
        this.tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: '663931692338-a42oipfg8snb89o0tllrs822khumtulb.apps.googleusercontent.com',
          scope: 'https://www.googleapis.com/auth/calendar',
          callback: (response: any) => {
            if (response.error) {
              console.error('Error obteniendo token:', response);
            } else {
              this.accessToken = response.access_token;
              console.log('Access token acquired via GIS:', this.accessToken);
              // Asignar el token a gapi.client para usarlo en llamadas posteriores
              gapi.client.setToken({ access_token: this.accessToken });
              // Guardar el token en localStorage si lo necesitas persistente
              localStorage.setItem('googleCredential', this.accessToken);
            }
          }
        });
      }).catch((error: any) => {
        console.error('Error initializing gapi client:', error);
      });
    });
  }

  // Función para crear un evento en Google Calendar usando gapi.client.calendar.events.insert
  createGoogleCalendarEvent(note: any): void {
    if (!this.accessToken) {
      console.error('No se encontró token de acceso. El usuario debe iniciar sesión en Google.');
      return;
    }

    const event = {
      summary: note.title,
      description: note.content,
      start: {
        dateTime: this.combineDateAndTime(this.selectedDate, this.noteTime),
        timeZone: 'UTC'
      },
      end: {
        dateTime: this.addThirtyMinutes(this.combineDateAndTime(this.selectedDate, this.noteTime)),
        timeZone: 'UTC'
      }
    };

    gapi.client.calendar.events.insert({
      calendarId: 'primary',
      resource: event
    }).then((response: any) => {
      if (response && !response.error) {
        console.log('Evento creado en Google Calendar:', response.result.htmlLink);
      } else {
        console.error('Error creando el evento en Google Calendar:', response.error);
      }
    }).catch((error: any) => {
      console.error('Error en la llamada a la API de Google Calendar:', error);
    });
  }

  // Combina la fecha y la hora para obtener un formato adecuado para Google Calendar
  combineDateAndTime(date: Date, time: string): string {
    if (!time || !date) {
      console.error('Fecha o hora no válidas', date, time);
      return '';
    }

    const [hours, minutes] = time.split(':');
    const newDate = new Date(date);
    newDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0); // Asegúrate de configurar la hora y minutos correctamente

    if (isNaN(newDate.getTime())) {
      console.error('Fecha inválida:', newDate);
      return '';
    }

    return newDate.toISOString();
  }

  // Suma 30 minutos a la hora de inicio para obtener la hora de finalización
  addThirtyMinutes(dateISOString: string): string {
    const date = new Date(dateISOString);
    date.setMinutes(date.getMinutes() + 30); // Añadir 30 minutos
    return date.toISOString();
  }

  // Guarda la nota y crea un evento en Google Calendar
  saveNote(): void {
    if (this.noteName.trim() && this.noteNumber && this.noteTime) {

      const data = {
        nombre: this.noteName,
        telefono: this.noteNumber,
        mensaje: this.noteText || 'Sin contenido',
        comercioId: JSON.parse(localStorage.getItem('opyniaUser') || '{"id": 0}').id
      };

      this.api.saveResena(data).subscribe(res => {
  
        // const newNote = {
        //   title: `${this.formatDate(this.selectedDate)} - ${this.noteTime}`,
        //   number: this.noteNumber,
        //   name: this.noteName,
        //   content: this.noteText || 'Sin contenido',
        //   email: this.noteEmail || 'No especificado',
        // };
        const newNote = {
          fecha: `${this.formatDate(this.selectedDate)} - ${this.noteTime}`,
          telefono: this.noteNumber,
          nombre: this.noteName,
          mensaje: this.noteText || 'Sin contenido',
          email: this.noteEmail || 'No especificado',
        };
        this.infoBoxes.push(newNote);
        console.log(this.infoBoxes);
  
  
        this.clearForm();
        this.showAlert('Nota creada con éxito', 'success');

        const modal = bootstrap.Modal.getInstance(document.getElementById('noteModal') as HTMLElement);
        modal?.hide();
  
        // Crear el evento en Google Calendar
        // this.createGoogleCalendarEvent(newNote);
  
      })
      

    } else {
      this.showAlert('Error: Por favor, completa los campos obligatorios.', 'danger');
    }
  }

  // Función para mostrar alertas
  showAlert(message: string, type: string): void {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => { this.alertMessage = ''; }, 3000);
  }

  // Limpiar el formulario
  clearForm(): void {
    this.noteText = '';
    this.noteName = '';
    this.noteEmail = '';
    this.noteNumber = 0;
    this.noteTime = '';
  }

  // Formatear la fecha
  formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
  }

  // Evento al seleccionar una fecha
  onDateSelected(event: any): void {
    this.selectedDate = new Date(event);
  }

  // Método toggle para cambiar entre secciones de notas y estadísticas
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
    const modal = new bootstrap.Modal(document.getElementById('noteModal') as HTMLElement);
    modal.show();
  }

  // Crear gráfico circular de estadísticas
  createPieChart(): void {
    const pieChartElement = <HTMLCanvasElement>document.getElementById('pieChart');
    if (pieChartElement && !this.pieChart) {
      const porcentajeConvertidas = (this.resenasConvertidas / this.totalResenas) * 100;
      const porcentajeSinConvertir = (this.resenasSinConvertir / this.totalResenas) * 100;
  
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
}



