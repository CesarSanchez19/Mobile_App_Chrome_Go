import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app'; // Proveedor de Google

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
  errorMessage: string = ''; // Mensaje de error en el login

  // Variables para el modal "Olvidé mi contraseña"
  showForgotModal: boolean = false;
  forgotEmail: string = '';
  forgotErrorMessage: string = '';
  forgotSuccessMessage: string = '';

  constructor(
    private router: Router,
    private afAuth: AngularFireAuth
  ) {}

  ngOnInit() {}

  onSubmit() {
    // Reiniciar mensaje de error
    this.errorMessage = '';

    // Validaciones locales para campos vacíos o incompletos
    if (!this.email && !this.password) {
      this.errorMessage = 'Por favor, ingresa tu correo electrónico y contraseña.';
      return;
    }
    if (!this.email) {
      this.errorMessage = 'Por favor, ingresa tu correo electrónico.';
      return;
    }
    if (!this.password) {
      this.errorMessage = 'Por favor, ingresa tu contraseña.';
      return;
    }

    // Si los campos están completos, se intenta iniciar sesión
    this.afAuth.signInWithEmailAndPassword(this.email, this.password)
      .then(userCredential => {
        console.log('Inicio de sesión exitoso:', userCredential);
        this.router.navigate(['/home']);
      })
      .catch(error => {
        console.error('Error en inicio de sesión:', error);
        switch (error.code) {
          case 'auth/invalid-email':
            this.errorMessage = 'El correo electrónico está mal escrito, por favor introdúcelo correctamente.';
            break;
          case 'auth/wrong-password':
            this.errorMessage = 'La contraseña es incorrecta, por favor verifícala.';
            break;
          case 'auth/user-not-found':
            this.errorMessage = 'El correo electrónico no está registrado.';
            break;
          case 'auth/account-exists-with-different-credential':
            this.errorMessage = 'Este correo está vinculado a un inicio de sesión con Google. Por favor, inicia sesión con Google.';
            break;
          default:
            this.errorMessage = 'Datos inválidos, por favor ingresa datos válidos.';
            break;
        }
      });
  }

  continuarConGoogle() {
    this.errorMessage = '';

    this.afAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
      .then(userCredential => {
        console.log('Inicio de sesión con Google exitoso:', userCredential);
        this.router.navigate(['/home']);
      })
      .catch(error => {
        console.error('Error en inicio de sesión con Google:', error);
        this.errorMessage = 'Error: ' + error.message;
      });
  }

  irARegistro() {
    this.router.navigate(['/signup']);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  // Métodos para el modal "Olvidé mi contraseña"
  openForgotModal() {
    this.showForgotModal = true;
    this.forgotEmail = '';
    this.forgotErrorMessage = '';
    this.forgotSuccessMessage = '';
  }

  closeForgotModal() {
    this.showForgotModal = false;
    this.forgotEmail = '';
    this.forgotErrorMessage = '';
    this.forgotSuccessMessage = '';
  }

  enviarResetPassword() {
    this.forgotErrorMessage = '';
    this.forgotSuccessMessage = '';

    if (!this.forgotEmail) {
      this.forgotErrorMessage = 'Por favor, ingresa tu correo electrónico.';
      return;
    }

    this.afAuth.sendPasswordResetEmail(this.forgotEmail)
      .then(() => {
        this.forgotSuccessMessage = 'Se ha enviado un enlace para restablecer la contraseña a tu correo.';
      })
      .catch(error => {
        console.error('Error al enviar el correo de restablecimiento:', error);
        if (error.code === 'auth/invalid-email') {
          this.forgotErrorMessage = 'El correo electrónico está mal escrito, por favor corrígelo.';
        } else if (error.code === 'auth/user-not-found') {
          this.forgotErrorMessage = 'El correo electrónico no está registrado.';
        } else {
          this.forgotErrorMessage = 'Error al enviar el correo, intenta nuevamente.';
        }
      });
  }
}
