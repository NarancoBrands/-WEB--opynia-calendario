import { Component, OnInit, AfterViewInit, ViewChild } from "@angular/core";
import * as bootstrap from "bootstrap";
import { Chart, registerables } from "chart.js";
import { AuthService } from "../services/auth.service";
import { ResenaService } from "../services/resena.service";
import { ActivatedRoute, Router } from "@angular/router";
import { GoogleCalendarService } from "../services/google-calendar.service";
import { Subscription } from "rxjs";
import { GoogleCalendar } from "../interfaces/google-calendar";
@Component({
  selector: "app-calendar",
  templateUrl: "./calendar-sample-5.component.html",
  styleUrls: ["./calendar-sample-5.component.scss"],
})
export class CalendarSample5Component implements OnInit, AfterViewInit {
  public infoBoxes: any[] = [];
  public selectedDate: Date = new Date();
  public noteText: string = "";
  public noteNumber: string = "";
  public noteEmail?: string = "";
  public noteName: string = "";
  public noteTime: string = "";
  public alertMessage: string = "";
  public alertType: string = "success";
  public currentSection: "notes" | "stats" = "notes";
  public totalResenas = 0;
  public resenasConvertidas = 0;
  public resenasSinConvertir = 0;
  private pieChart: any;
  public isLoading: boolean = false;
  public currentCalendarDate: Date = new Date();
  public calendarDays: any[] = [];
  public weekDays: string[] = [ "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb","Dom"];
  public months: string[] = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  public isDeleting: boolean = false;
  // Modales y estado
  public logoutModal: any;
  private deleteModal: any;
  private currentUser: any;
  private reseñaIdToDelete: number | null = null;

  // ¡Nuestra única propiedad para saber el estado de la conexión con Google!
  public isGoogleConnected: boolean = false;

  constructor(
    private authService: AuthService,
    private resenaService: ResenaService,
    private googleCalendarService: GoogleCalendarService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    Chart.register(...registerables);
    this.generateCalendar();

    // Comprobamos si existe nuestra bandera en el localStorage
    if (localStorage.getItem("googleAuthInProgress") === "true") {
      localStorage.removeItem("googleAuthInProgress");
      this.refreshUserDataAndUpdateUrl();
    } else {
      this.loadUserAndCheckStatus();
    }
  }

  ngAfterViewInit(): void {
    this.deleteModal = new bootstrap.Modal(
      document.getElementById("deleteModal") as HTMLElement
    );
    this.logoutModal = new bootstrap.Modal(
      document.getElementById("logoutModal") as HTMLElement
    );
  }

  loadUserAndCheckStatus(): void {
    this.currentUser = JSON.parse(localStorage.getItem("opyniaUser") || "{}");
    this.checkGoogleConnectionStatus();
    this.getResenas();
  }

  refreshUserDataAndUpdateUrl(): void {
    this.googleCalendarService.getAuthenticatedUser().subscribe((user) => {
      localStorage.setItem("opyniaUser", JSON.stringify(user));
      this.currentUser = user;

      this.checkGoogleConnectionStatus();
      this.getResenas();

      this.router.navigate([], {
        relativeTo: this.activatedRoute,
        queryParams: { status: null },
        queryParamsHandling: "merge",
        replaceUrl: true,
      });
    });
  }

  checkGoogleConnectionStatus(): void {
    if (this.currentUser && this.currentUser.google_connected) {
      this.isGoogleConnected = true;
      this.startWatching();
    } else {
      this.isGoogleConnected = false;
    }
  }

  connectToGoogle(): void {
    localStorage.setItem("googleAuthInProgress", "true");

    this.showAlert("Redirigiendo a Google para la conexión...", "info");

    this.googleCalendarService.getGoogleAuthUrl().subscribe({
      next: (response) => {
        if (response.authUrl) {
          window.location.href = response.authUrl;
        }
      },
      error: (err) => {
        console.error("Error al obtener la URL de Google", err);
        this.showAlert("No se pudo iniciar la conexión con Google.", "danger");
        // Si hay un error, borramos la bandera que pusimos
        localStorage.removeItem("googleAuthInProgress");
      },
    });
  }

  startWatching(): void {
    console.log("Intentando activar la sincronización automática...");
    this.googleCalendarService.startWatchingCalendar().subscribe({
      next: (response) => {
        console.log(response.message || "Sincronización ya activa o iniciada.");
      },
      error: (err) =>
        console.error(
          "Error al intentar activar la vigilancia automática",
          err
        ),
    });
  }

  disconnectFromGoogle(): void {
    if (
      !confirm(
        "¿Estás seguro de que quieres desconectar tu cuenta de Google? Esto detendrá la sincronización y borrará los permisos."
      )
    ) {
      return;
    }

    this.showAlert("Desconectando de Google...", "info");
    this.googleCalendarService.stopWatchingAndDisconnect().subscribe({
      next: (response) => {
        this.showAlert(response.message, "success");
        this.refreshUserDataAndUpdateUrl(); // Refrescamos el estado para actualizar la UI
      },
      error: (err) => {
        this.showAlert("No se pudo desconectar la cuenta.", "danger");
      },
    });
  }

  getResenas(): void {
    if (!this.currentUser?.id) {
      return;
    }

    this.isLoading = true;
    this.resenaService.getResenasByIdComercio(this.currentUser.id).subscribe({
      next: (res: any) => {
        this.infoBoxes = res.data || [];
        this.calculateStats();
        this.isLoading = false;
      },
      error: (error) => {
        console.error("Error obteniendo reseñas:", error);
        this.showAlert("Error al cargar las reseñas", "danger");
        this.isLoading = false;
      },
    });
  }

  /**
   * Guarda una reseña en nuestra base de datos y, si corresponde,
   * pide al backend que cree el evento en Google Calendar.
   */
  saveNote(): void {
    if (!this.noteName.trim() || !this.noteNumber.trim() || !this.noteTime) {
      this.showAlert("Por favor, completa los campos obligatorios.", "danger");
      return;
    }
    if (!this.validatePhoneNumber(this.cleanPhoneNumber(this.noteNumber))) {
      this.showAlert(
        "El formato del número es incorrecto. Debe tener 9 dígitos.",
        "danger"
      );
      return;
    }

    this.isLoading = true;
    const resenaData = {
      nombre: this.noteName.trim(),
      telefono: `34${this.cleanPhoneNumber(this.noteNumber)}`,
      mensaje: this.noteText.trim() || "Sin mensaje adicional",
      comercioId: this.currentUser.id,
      programado_en: this.combineDateAndTime(this.selectedDate, this.noteTime),
      email: this.noteEmail ? this.noteEmail.trim() : null,
    };

    this.resenaService.saveResena(resenaData).subscribe({
      next: (response: any) => {
        // Añadimos la nueva reseña a la lista local
        this.infoBoxes.push(response.data);
        this.calculateStats();
        this.clearForm();
        this.closeModal();
        this.showAlert("Reseña creada exitosamente", "success");
        this.isLoading = false;
      },
      error: (error) => {
        console.error("Error guardando reseña:", error);
        this.showAlert("Error al guardar la reseña", "danger");
        this.isLoading = false;
      },
    });
  }

  async confirmDeleteResena(): Promise<void> {
    if (!this.reseñaIdToDelete) return;
    this.isDeleting = true;
    const reseñaToDelete = this.infoBoxes.find(
      (item) => item.id === this.reseñaIdToDelete
    );

    // Procedemos a borrar la reseña de nuestra base de datos.
    this.resenaService.deleteResena(this.reseñaIdToDelete).subscribe({
      next: (response) => {
        const msg = (response as { message: string }).message;
        this.infoBoxes = this.infoBoxes.filter(
          (item) => item.id !== this.reseñaIdToDelete
        );
        this.calculateStats();
        this.deleteModal.hide();
        this.showAlert(msg, "success");
        this.isLoading = false;
        this.reseñaIdToDelete = null;
      },
      error: (error) => {
        this.showAlert("Error al eliminar la reseña", "danger");
        this.isLoading = false;
      },
      complete: () => {
        this.isDeleting = false; // <-- Establece en false al finalizar (éxito o error)
      },
    });
  }

  // --- MÉTODOS AUXILIARES Y DE UI (SIN CAMBIOS) ---

  openNoteModal(): void {
    const modal = new bootstrap.Modal(
      document.getElementById("noteModal") as HTMLElement
    );
    modal.show();
  }

  generateCalendar(): void {
    const year = this.currentCalendarDate.getFullYear();
    const month = this.currentCalendarDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    const dayOfWeek = firstDay.getDay(); 
    const offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate.setDate(startDate.getDate() - offset);
    this.calendarDays = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      this.calendarDays.push({
        day: date.getDate(),
        date: new Date(date),
        otherMonth: date.getMonth() !== month,
        isToday: this.isSameDate(date, new Date()),
        isSelected: this.isSameDate(date, this.selectedDate),
      });
    }
  }

  selectDate(day: any): void {
    if (day.otherMonth) return;
    this.selectedDate = new Date(day.date);
    this.generateCalendar();
  }

  handleClick(day: any) {
    this.selectDate(day);
    this.openNoteModal();
  }

  previousMonth(): void {
    this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() - 1);
    this.generateCalendar();
  }

  nextMonth(): void {
    this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() + 1);
    this.generateCalendar();
  }

  getMonthYear(): string {
    const month = this.months[this.currentCalendarDate.getMonth()];
    const year = this.currentCalendarDate.getFullYear();
    return `${month} ${year}`;
  }

  private isSameDate(date1: Date, date2: Date): boolean {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  }

  calculateStats(): void {
    this.totalResenas = this.infoBoxes.length;
    this.resenasConvertidas = this.infoBoxes.filter(
      (resena) => resena.enviado
    ).length;
    this.resenasSinConvertir = this.totalResenas - this.resenasConvertidas;
    if (this.currentSection === "stats") {
      this.createPieChart();
    }
  }

  deleteResena(id: number): void {
    this.reseñaIdToDelete = id;
    this.deleteModal.show();
  }

  validatePhoneNumber(phone: string): boolean {
    const phoneRegex = /^\d{9}$/;
    return phoneRegex.test(phone);
  }

  cleanPhoneNumber(phone: string): string {
    return phone.replace(/\D/g, "").slice(0, 9);
  }

   combineDateAndTime(date: Date, time: string): string {
    if (!time || !date) return "";
    const [hours, minutes] = time.split(":");

    const localDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      parseInt(hours, 10),
      parseInt(minutes, 10)
    );


    const utcIsoString = localDate.toISOString();

    return utcIsoString.slice(0, 19).replace('T', ' ');
  }

  showAlert(message: string, type: string): void {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => {
      this.alertMessage = "";
    }, 5000);
  }

  clearForm(): void {
    this.noteText = "";
    this.noteName = "";
    this.noteEmail = "";
    this.noteNumber = "";
    this.noteTime = "";
  }

  closeModal(): void {
    const modalEl = document.getElementById("noteModal");
    if (modalEl) {
      const modal = bootstrap.Modal.getInstance(modalEl);
      modal?.hide();
    }
  }

  toggleSection(): void {
    if (this.pieChart) {
      this.pieChart.destroy();
      this.pieChart = null;
    }
    this.currentSection = this.currentSection === "notes" ? "stats" : "notes";
    if (this.currentSection === "stats") {
      setTimeout(() => {
        this.createPieChart();
      }, 10);
    }
  }

  createPieChart(): void {
    const pieChartElement = <HTMLCanvasElement>(
      document.getElementById("pieChart")
    );
    if (pieChartElement) {
      if (this.pieChart) this.pieChart.destroy();
      const pConvertidas =
        this.totalResenas > 0
          ? (this.resenasConvertidas / this.totalResenas) * 100
          : 0;
      const pSinConvertir = 100 - pConvertidas;
      this.pieChart = new Chart(pieChartElement, {
        type: "pie",
        data: {
          labels: ["Reseñas Convertidas", "Reseñas Sin Convertir"],
          datasets: [
            {
              data: [pConvertidas, pSinConvertir],
              backgroundColor: ["#4CAF50", "#FF5722"],
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: "top" },
            tooltip: {
              callbacks: {
                label: (c) => `${c.label || ""}: ${Number(c.raw).toFixed(2)}%`,
              },
            },
          },
        },
      });
    }
  }

  showLogoutModal(): void {
    this.logoutModal.show();
  }

  confirmLogout(): void {
    localStorage.removeItem("opyniaUser");
    localStorage.removeItem("opyniaAuthToken"); // Limpiamos el token de nuestra API
    localStorage.removeItem("googleCredential"); // Limpiamos el token viejo de google (si aún existe)
    this.currentUser = null;
    this.showAlert("Sesión cerrada exitosamente", "success");
    this.logoutModal.hide();
    setTimeout(() => {
      window.location.href = "/login";
    }, 1500);
  }
}
