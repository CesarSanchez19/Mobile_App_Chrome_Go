import { Component, OnInit, ViewChild } from '@angular/core';
import { IonModal, ModalController, IonDatetime } from '@ionic/angular';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';

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

  // Campos del formulario
  fullName: string = '';
  username: string = '';
  email: string = '';
  phone: string = '';
  password: string = '';
  confirmPassword: string = '';

  // Variables para mostrar u ocultar contraseñas
  hidePassword = true;
  hideConfirmPassword = true;

  // Variables para el selector de país
  showCountrySelector = false;
  selectedCountry: Country = { name: 'México', code: '52', flag: 'mx' };
  countrySearch = '';

  // Variables para el selector de fecha (fecha de nacimiento)
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

  // Mensaje de error para el registro
  errorMessage: string = '';

  constructor(
    private modalController: ModalController,
    private router: Router,
    private afAuth: AngularFireAuth
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
    // Registro usando Google
    this.afAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
      .then(userCredential => {
        console.log('Registro con Google exitoso:', userCredential);
        this.router.navigate(['/home']);
      })
      .catch(error => {
        console.error('Error en registro con Google:', error);
        this.errorMessage = 'Error: ' + error.message;
      });
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword') {
    if (field === 'password') {
      this.hidePassword = !this.hidePassword;
    } else {
      this.hideConfirmPassword = !this.hideConfirmPassword;
    }
  }

  // Métodos para el modal de países
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

  // Métodos para el modal de fecha
  openDateModal() {
    this.showDatePicker = true;
  }

  closeDateModal() {
    this.showDatePicker = false;
  }

  cancelDateSelection() {
    this.showDatePicker = false;
  }

  generateCalendar() {
    const year = this.selectedCalendarDate.getFullYear();
    const month = this.selectedCalendarDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    const firstDayOfWeek = firstDay.getDay();
    const prevMonthLastDay = new Date(year, month, 0).getDate();

    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        currentMonth: false,
        selected: false,
        today: false
      });
    }

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
    this.calendarDays.forEach(d => d.selected = false);
    day.selected = true;
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

  // Método para registrar el usuario en Firebase
  onSubmit() {
    // Reinicia el mensaje de error
    this.errorMessage = '';

    // Validación de campos vacíos
    if (!this.fullName && !this.username && !this.email && !this.selectedDate && !this.phone && !this.password && !this.confirmPassword) {
      this.errorMessage = 'Por favor, completa todos los campos.';
      return;
    }
    if (!this.fullName) {
      this.errorMessage = 'Por favor, ingresa tu nombre completo.';
      return;
    }
    if (!this.username) {
      this.errorMessage = 'Por favor, ingresa un nombre de usuario.';
      return;
    }
    if (!this.email) {
      this.errorMessage = 'Por favor, ingresa tu correo electrónico.';
      return;
    }
    if (!this.selectedDate) {
      this.errorMessage = 'Por favor, selecciona tu fecha de nacimiento.';
      return;
    }
    if (!this.phone) {
      this.errorMessage = 'Por favor, ingresa tu número de teléfono.';
      return;
    }
    if (!this.password) {
      this.errorMessage = 'Por favor, ingresa una contraseña.';
      return;
    }
    if (!this.confirmPassword) {
      this.errorMessage = 'Por favor, repite tu contraseña.';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }

    // Validación de formatos
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'El correo electrónico no tiene un formato válido.';
      return;
    }
    const usernameRegex = /^[a-zA-Z0-9]+$/;
    if (!usernameRegex.test(this.username)) {
      this.errorMessage = 'El nombre de usuario debe contener solo letras y números, sin espacios.';
      return;
    }
    const phoneRegex = /^[0-9]+$/;
    if (!phoneRegex.test(this.phone)) {
      this.errorMessage = 'El número de teléfono solo debe contener dígitos.';
      return;
    }
    if (this.password.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    // Crear usuario en Firebase
    this.afAuth.createUserWithEmailAndPassword(this.email, this.password)
      .then(userCredential => {
        console.log('Registro exitoso:', userCredential);
        if (userCredential.user) {
          // Actualizar el perfil del usuario con el nombre completo
          userCredential.user.updateProfile({
            displayName: this.fullName
          }).then(() => {
            // Opcional: Aquí se puede guardar información adicional en Firestore si se requiere.
            this.router.navigate(['/home']);
          }).catch(error => {
            console.error('Error al actualizar el perfil:', error);
            this.errorMessage = 'Error al actualizar el perfil. Intenta nuevamente.';
          });
        } else {
          this.router.navigate(['/home']);
        }
      })
      .catch(error => {
        console.error('Error en registro:', error);
        switch (error.code) {
          case 'auth/invalid-email':
            this.errorMessage = 'El correo electrónico está mal escrito, por favor introdúcelo correctamente.';
            break;
          case 'auth/email-already-in-use':
            this.errorMessage = 'El correo electrónico ya está en uso.';
            break;
          case 'auth/weak-password':
            this.errorMessage = 'La contraseña es muy débil, por favor elige una contraseña más fuerte.';
            break;
          default:
            this.errorMessage = 'Error en registro: ' + error.message;
            break;
        }
      });
  }

  // Obtiene la URL de la bandera del país
  getCountryFlagUrl(countryCode: string): string {
    return `https://flagcdn.com/48x36/${countryCode.toLowerCase()}.png`;
  }
}
