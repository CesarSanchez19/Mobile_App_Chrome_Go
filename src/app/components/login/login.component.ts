import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail } from '@angular/fire/auth';
import { AccountUserService } from '../../services/account-user.service';
import { Users } from '../../interfaces/users';

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
  errorMessage: string = '';

  // Variables para el modal "Olvidé mi contraseña"
  showForgotModal: boolean = false;
  forgotEmail: string = '';
  forgotErrorMessage: string = '';
  forgotSuccessMessage: string = '';

  constructor(
    private router: Router,
    private auth: Auth,
    private accountUserService: AccountUserService,
  ) {}

  ngOnInit(): void {}

  async onSubmit() {
    this.errorMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor, ingresa tu correo electrónico y contraseña.';
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, this.email, this.password);
      const uid = userCredential.user.uid;
      console.log('✅ UID del usuario autenticado:', uid);

      localStorage.setItem('loggedUserId', uid);

      // Verificar si el usuario existe en Firestore
      const userData = await this.accountUserService.getUser(uid);
      if (!userData) {
        console.warn("⚠ El usuario no tiene datos en Firestore.");
      }

      this.router.navigate(['/home']);
    } catch (error: any) {
      console.error('❌ Error al iniciar sesión:', error);
      switch (error.code) {
        case 'auth/user-not-found':
          this.errorMessage = 'El usuario no existe.';
          break;
        case 'auth/wrong-password':
          this.errorMessage = 'Contraseña incorrecta.';
          break;
        case 'auth/invalid-email':
          this.errorMessage = 'El correo electrónico no es válido.';
          break;
        default:
          this.errorMessage = 'Error al iniciar sesión. Intenta nuevamente.';
      }
    }
  }

  async continuarConGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(this.auth, provider);
      const uid = userCredential.user.uid;
      console.log('✅ Usuario autenticado con Google:', uid);

      localStorage.setItem('loggedUserId', uid);

      // Verificar si el usuario existe en Firestore
      const userData = await this.accountUserService.getUser(uid);
      if (!userData) {
        console.warn("⚠ El usuario no tiene datos en Firestore.");
      }

      this.router.navigate(['/home']);
    } catch (error: any) {
      console.error('❌ Error al iniciar sesión con Google:', error);
      this.errorMessage = 'Error al iniciar sesión con Google. Intenta nuevamente.';
    }
  }
  
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  // Navegar a la página de registro
  irARegistro() {
    this.router.navigate(['/signup']);
  }

  // Métodos para el modal "Olvidé mi contraseña"
  openForgotModal() {
    this.showForgotModal = true;
    this.resetForgotPasswordFields();
  }

  closeForgotModal() {
    this.showForgotModal = false;
    this.resetForgotPasswordFields();
  }

  private resetForgotPasswordFields() {
    this.forgotEmail = '';
    this.forgotErrorMessage = '';
    this.forgotSuccessMessage = '';
  }

  async enviarResetPassword() {
    this.forgotErrorMessage = '';
    this.forgotSuccessMessage = '';

    if (!this.forgotEmail) {
      this.forgotErrorMessage = 'Por favor, ingresa tu correo electrónico.';
      return;
    }

    try {
      await sendPasswordResetEmail(this.auth, this.forgotEmail);
      this.forgotSuccessMessage = 'Se ha enviado un enlace para restablecer la contraseña a tu correo.';
    } catch (error: any) {
      console.error('Error al enviar email de reseteo:', error);
      this.forgotErrorMessage = 'No se pudo enviar el enlace de reseteo. Intenta nuevamente.';
    }
  }
}
