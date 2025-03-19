import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: false,
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  showPassword: boolean = false;

  constructor(private router: Router) { }

  ngOnInit() {
  }

  onSubmit() {
    // Lógica de inicio de sesión aquí
    console.log('Intento de inicio de sesión', {
      email: this.email,
      password: this.password,
      rememberMe: this.rememberMe
    });

    // Navegar al home después del inicio de sesión exitoso
    this.router.navigate(['/home']);
  }

  continuarConGoogle() {
    // Manejar autenticación de Google
    console.log('Intento de inicio de sesión con Google');

    // Navegar al home después del inicio de sesión con Google exitoso
    this.router.navigate(['/home']);
  }

  irARegistro() {
    this.router.navigate(['/signup']);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
