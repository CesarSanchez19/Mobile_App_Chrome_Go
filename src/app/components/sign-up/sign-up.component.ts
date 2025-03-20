import { Component, OnInit, ViewChild } from '@angular/core';
import { IonModal, ModalController, IonDatetime } from '@ionic/angular';
import { Router } from '@angular/router';

interface Country {
  name: string;
  code: string;
  flag: string;
}

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
  standalone: false,
})
export class SignUpComponent implements OnInit {
  @ViewChild('countryModal') countryModal!: IonModal;
  @ViewChild('dateModal') dateModal!: IonModal;
  @ViewChild('datetime') datetime!: IonDatetime;

  hidePassword = true;
  hideConfirmPassword = true;
  showCountrySelector = false;
  selectedCountry: Country = { name: 'México', code: '52', flag: 'mx' };
  countrySearch = '';

  // Variables para el calendario
  selectedDate: string = '';
  dateValue: any = null;
  showDatePicker = false;
  formattedDateDisplay: string = '19 de marzo';
  currentMonthYear: string = 'marzo de 2025';
  calendarDays: any[] = [];
  currentDate: Date = new Date();
  selectedCalendarDate: Date = new Date();

  countries: Country[] = [
    { name: 'España', code: '34', flag: 'es' },
    { name: 'México', code: '52', flag: 'mx' },
    { name: 'Estados Unidos', code: '1', flag: 'us' },
    { name: 'Argentina', code: '54', flag: 'ar' },
    { name: 'Colombia', code: '57', flag: 'co' },
    { name: 'Perú', code: '51', flag: 'pe' },
    { name: 'Chile', code: '56', flag: 'cl' },
    { name: 'Brasil', code: '55', flag: 'br' },
    { name: 'Ecuador', code: '593', flag: 'ec' },
    { name: 'Venezuela', code: '58', flag: 've' },
    { name: 'Bolivia', code: '591', flag: 'bo' },
    { name: 'Uruguay', code: '598', flag: 'uy' },
    { name: 'Paraguay', code: '595', flag: 'py' },
    { name: 'Costa Rica', code: '506', flag: 'cr' },
  ];

  // Nombres de los meses en español
  mesesEnEspanol = [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
  ];

  constructor(
    private modalController: ModalController,
    private router: Router
  ) {}

  ngOnInit() {
    this.generateCalendar();
  }

  iraInicioSesion() {
    this.router.navigate(['/login']);
  }

  iraHome() {
    this.router.navigate(['/home']);
  }

  continuarConGoogle() {
    // Manejar autenticación de Google
    console.log('Intento de inicio de sesión con Google');

    // Navegar al home después del inicio de sesión con Google exitoso
    this.router.navigate(['/home']);
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword') {
    if (field === 'password') {
      this.hidePassword = !this.hidePassword;
    } else {
      this.hideConfirmPassword = !this.hideConfirmPassword;
    }
  }

  // Modal de países
  openCountryModal() {
    this.showCountrySelector = true;
    this.countrySearch = '';
  }

  closeCountryModal() {
    this.showCountrySelector = false;
  }

  selectCountry(country: Country) {
    this.selectedCountry = country;
    this.showCountrySelector = false;
  }

  get filteredCountries(): Country[] {
    if (!this.countrySearch) {
      return this.countries;
    }
    const search = this.countrySearch.toLowerCase();
    return this.countries.filter(
      (country) =>
        country.name.toLowerCase().includes(search) ||
        country.code.includes(search)
    );
  }

  // Método para abrir el modal de fecha (faltaba en el código original)
  openDateModal() {
    this.showDatePicker = true;
  }

  // Método para cerrar el modal de fecha (faltaba en el código original)
  closeDateModal() {
    this.showDatePicker = false;
  }

  // Método para cancelar la selección de fecha (faltaba en el código original)
  cancelDateSelection() {
    this.showDatePicker = false;
  }

  generateCalendar() {
    const year = this.selectedCalendarDate.getFullYear();
    const month = this.selectedCalendarDate.getMonth();

    // Primer día del mes
    const firstDay = new Date(year, month, 1);
    // Último día del mes
    const lastDay = new Date(year, month + 1, 0);

    // Array para almacenar todos los días del calendario
    const days = [];

    // Agregar días del mes anterior para completar la primera semana
    const firstDayOfWeek = firstDay.getDay(); // 0 = Domingo, 1 = Lunes, etc.
    const prevMonthLastDay = new Date(year, month, 0).getDate();

    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        currentMonth: false,
        selected: false,
        today: false
      });
    }

    // Agregar días del mes actual
    const today = new Date();
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const currentDate = new Date(year, month, i);
      days.push({
        day: i,
        currentMonth: true,
        selected: this.isSameDate(currentDate, this.selectedCalendarDate),
        today: this.isSameDate(currentDate, today)
      });
    }

    // Agregar días del próximo mes para completar la última semana
    const remainingDays = 7 - (days.length % 7);
    if (remainingDays < 7) {
      for (let i = 1; i <= remainingDays; i++) {
        days.push({
          day: i,
          currentMonth: false,
          selected: false,
          today: false
        });
      }
    }

    this.calendarDays = days;
    this.updateMonthYearDisplay();
  }

  isSameDate(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }

  updateMonthYearDisplay() {
    const month = this.mesesEnEspanol[this.selectedCalendarDate.getMonth()];
    const year = this.selectedCalendarDate.getFullYear();
    this.currentMonthYear = `${month} de ${year}`;

    const day = this.selectedCalendarDate.getDate();
    this.formattedDateDisplay = `${day} de ${month}`;
  }

  selectDate(day: any) {
    if (!day.currentMonth) return;

    // Deseleccionar el día anterior
    this.calendarDays.forEach(d => d.selected = false);

    // Seleccionar el nuevo día
    day.selected = true;

    // Actualizar la fecha seleccionada
    this.selectedCalendarDate = new Date(
      this.selectedCalendarDate.getFullYear(),
      this.selectedCalendarDate.getMonth(),
      day.day
    );

    this.updateMonthYearDisplay();
  }

  previousMonth() {
    this.selectedCalendarDate = new Date(
      this.selectedCalendarDate.getFullYear(),
      this.selectedCalendarDate.getMonth() - 1,
      1
    );
    this.generateCalendar();
  }

  nextMonth() {
    this.selectedCalendarDate = new Date(
      this.selectedCalendarDate.getFullYear(),
      this.selectedCalendarDate.getMonth() + 1,
      1
    );
    this.generateCalendar();
  }

  confirmDateSelection() {
    const day = this.selectedCalendarDate.getDate().toString().padStart(2, '0');
    const month = (this.selectedCalendarDate.getMonth() + 1).toString().padStart(2, '0');
    const year = this.selectedCalendarDate.getFullYear();
    this.selectedDate = `${day}/${month}/${year}`;
    this.showDatePicker = false;
  }

  onSubmit() {
    console.log('Formulario enviado');
  }

  // Obtiene la URL de la bandera del país
  getCountryFlagUrl(countryCode: string): string {
    return `https://flagcdn.com/48x36/${countryCode.toLowerCase()}.png`;
  }
}
