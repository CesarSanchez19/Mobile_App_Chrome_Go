import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PerfilService } from '../../components/perfil/perfil.service';
import { Users } from 'src/app/interfaces/users';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss'],
  standalone: false
})
export class PerfilComponent implements OnInit {
  userProfile: Users = {
    fullName: '',
    username: '',
    email: '',
    phone: '',
    birthday: '',
    password: '',
    confirmPassword: ''
  };

  editing = {
    username: false,
    fullName: false,
    email: false,
    phone: false,
    birthday: false
  };

  emailError: string = ''; // Agregado para evitar error
  phoneError: string = ''; // Agregado para evitar error
  birthdayError: string = ''; // Agregado para evitar error

  constructor(
    private perfilService: PerfilService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.userProfile = { ...this.userProfile, ...this.perfilService.getProfile() };
    console.log("✅ Perfil cargado:", this.userProfile);
  }

  async saveChanges(): Promise<void> {
    console.log("✅ Datos guardados:", this.userProfile);
  }

  logout(): void {
    localStorage.removeItem('loggedUserId');
    this.router.navigate(['/login']);
  }
}
