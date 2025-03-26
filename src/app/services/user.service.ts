import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private auth: Auth) {}

  // Registro de usuario con email y contraseña
  register({ email, password }: { email: string, password: string }) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  // Registro/Iniciar sesión con Google
  signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider);
  }
}
