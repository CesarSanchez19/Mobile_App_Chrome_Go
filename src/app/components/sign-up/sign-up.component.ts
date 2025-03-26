import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { AccountUserService } from 'src/app/services/account-user.service';
import { Users } from 'src/app/interfaces/users';

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
  formReg: FormGroup;
  errorMessage: string = '';
  hidePassword = true;
  hideConfirmPassword = true;

  // Variables para selector de país
  showCountrySelector = false;
  selectedCountry: Country = { name: 'México', code: '52', flag: 'mx' };
  countrySearch: string = '';

  // Variables para selector de fecha
  showDatePicker = false;
  selectedDate: string = '';

  // Variables para el calendario
  calendarDays: any[] = [];
  selectedCalendarDate: Date = new Date();
  currentMonthYear: string = '';
  formattedDateDisplay: string = '';
  mesesEnEspanol = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];

  // Lista de países
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
    { name: 'Costa Rica', code: '506', flag: 'cr' }
  ];

  constructor(
    private router: Router,
    private userService: UserService,
    private accountUserService: AccountUserService,
    private fb: FormBuilder
  ) {
    // Inicialización del formulario con validadores
    this.formReg = this.fb.group({
      fullName: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      birthday: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  // Validador personalizado para confirmar que ambas contraseñas coinciden
  passwordMatchValidator: ValidatorFn = (group: AbstractControl): { [key: string]: boolean } | null => {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  };

  ngOnInit(): void {
    this.generateCalendar();
  }

  // Toggle de visibilidad para contraseña y confirmación
  togglePasswordVisibility(field: 'password' | 'confirmPassword') {
    if (field === 'password') {
      this.hidePassword = !this.hidePassword;
    } else {
      this.hideConfirmPassword = !this.hideConfirmPassword;
    }
  }

  // Métodos para modal de países
  openCountryModal() {
    this.showCountrySelector = true;
    this.countrySearch = '';
  }
  closeCountryModal() {
    this.showCountrySelector = false;
  }
  selectCountry(country: Country) {
    this.selectedCountry = country;
    this.closeCountryModal();
  }
  get filteredCountries(): Country[] {
    if (!this.countrySearch) return this.countries;
    const search = this.countrySearch.toLowerCase();
    return this.countries.filter(country =>
      country.name.toLowerCase().includes(search) || country.code.includes(search)
    );
  }

  // Métodos para modal de fecha (calendario)
  openDateModal() {
    this.showDatePicker = true;
  }
  closeDateModal() {
    this.showDatePicker = false;
  }
  cancelDateSelection() {
    this.closeDateModal();
  }
  generateCalendar() {
    const year = this.selectedCalendarDate.getFullYear();
    const month = this.selectedCalendarDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    const firstDayOfWeek = firstDay.getDay();
    const prevMonthLastDay = new Date(year, month, 0).getDate();

    // Días del mes anterior
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        currentMonth: false,
        selected: false,
        today: false
      });
    }
    // Días del mes actual
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
    // Días para completar la última semana
    const remainingDays = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        currentMonth: false,
        selected: false,
        today: false
      });
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
    // Actualizamos el control de fecha en el formulario
    this.formReg.patchValue({ birthday: this.selectedDate });
    this.closeDateModal();
  }

  // Registro del usuario y guardado en Firestore
  async onSubmit() {
    this.errorMessage = '';
    if (this.formReg.invalid) {
      this.errorMessage = 'Por favor, completa todos los campos correctamente.';
      return;
    }
    try {
      const { fullName, username, email, phone, birthday, password, confirmPassword } = this.formReg.value;
      // Registro en Firebase Auth (correo y contraseña)
      const userCredential = await this.userService.register({ email, password });
      console.log('Usuario registrado:', userCredential.user);

      // Crear objeto de usuario para Firestore
      const userData: Users = {
        fullName,
        username,
        email,
        phone,
        birthday,
        password,
        confirmPassword
      };

      // Guardar datos del usuario en Firestore
      await this.accountUserService.addUser(userData);

      this.router.navigate(['/home']);
    } catch (error: any) {
      console.error('Error en el registro:', error);
      switch (error.code) {
        case 'auth/email-already-in-use':
          this.errorMessage = 'El correo electrónico ya está registrado.';
          break;
        case 'auth/invalid-email':
          this.errorMessage = 'El correo electrónico no es válido.';
          break;
        case 'auth/weak-password':
          this.errorMessage = 'La contraseña es demasiado débil.';
          break;
        default:
          this.errorMessage = 'Error en el registro. Intenta nuevamente.';
      }
    }
  }

  // Registro/Iniciar sesión con Google
  async continuarConGoogle() {
    try {
      const userCredential = await this.userService.signInWithGoogle();
      console.log('Usuario registrado con Google:', userCredential.user);
      // Opcional: Si deseas guardar también en Firestore los datos de usuarios que se registren con Google,
      // deberás extraer la información necesaria desde userCredential.user y llamar a accountUserService.addUser().
      this.router.navigate(['/home']);
    } catch (error: any) {
      console.error('Error al iniciar sesión con Google:', error);
      this.errorMessage = 'Error al iniciar sesión con Google. Intenta nuevamente.';
    }
  }

  // Método para obtener la URL de la bandera del país
  getCountryFlagUrl(countryCode: string): string {
    return `https://flagcdn.com/48x36/${countryCode.toLowerCase()}.png`;
  }

  // Navegación (volver al login)
  iraInicioSesion() {
    this.router.navigate(['/login']);
  }
}
