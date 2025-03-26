import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root', // Esto hace que el servicio esté disponible en toda la aplicación
})
export class PerfilService {
  constructor() {}

  getProfile() {
    return {
      username: 'MrCisco19',
      fullName: 'Cesar David Sanchez Trejo',
      email: 'cesar.trejop19@gmail.com',
      phone: '+52 932 456 7890',
      birthdate: '2005-09-19', // Formato YYYY-MM-DD siempre
      avatar: 'https://www.w3schools.com/howto/img_avatar.png',
    };
  }
}