import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PerfilService {
  constructor() {}

  getProfile() {
    return {
      username: 'MrCisco19',
      fullName: 'Cesar David Sanchez Trejo',
      email: 'cesar.trejop19@gmail.com',
      phone: '+52 932 456 7890',
      birthday: '2005-09-19', // Formato YYYY-MM-DD
      avatar: 'https://www.w3schools.com/howto/img_avatar.png',
    };
  }
}
