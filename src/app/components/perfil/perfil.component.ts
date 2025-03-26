import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PerfilService } from './perfil.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss'],
  standalone: false,
})
export class PerfilComponent implements OnInit {
  profile: any;
  profileForm!: FormGroup;
  editMode = false;
  profileItems: any[] = [];

  constructor(private perfilService: PerfilService, private fb: FormBuilder) {}

  ngOnInit() {
    // 1. Obtener los datos del perfil
    this.profile = this.perfilService.getProfile();

    // 2. Luego parsear la fecha
    const birthdate = this.profile.birthdate; // Ya viene en formato ISO del servicio

    // 3. Inicializar el formulario
    this.profileForm = this.fb.group({
      username: [this.profile.username, Validators.required],
      fullName: [this.profile.fullName, Validators.required],
      email: [this.profile.email, [Validators.required, Validators.email]],
      phone: [this.profile.phone, Validators.required],
      birthdate: [birthdate, Validators.required],
    });

    // 4. Inicializar profileItems (sin fecha de nacimiento)
    this.profileItems = [
      {
        label: 'Correo Electrónico',
        value: this.profile.email,
        icon: 'mail-outline',
      },
      { label: 'Teléfono', value: this.profile.phone, icon: 'call-outline' },
    ];
  }

  formatBirthdate(dateString: string): string {
    if (!dateString) return 'No especificada';
    
    // Asumimos que siempre viene en formato YYYY-MM-DD
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
  }

  onDateChange(event: any) {
    const selectedDate = event.detail.value; // Esto ya viene en formato YYYY-MM-DD
    this.profileForm.patchValue({
      birthdate: selectedDate
    });
  }

  
  saveChanges() {
    if (this.profileForm.valid) {
      // Usamos directamente el valor del formulario (ya está en formato correcto)
      this.profile = {
        ...this.profile,
        ...this.profileForm.value
      };
      this.toggleEditMode();
    }
  }
  
}
