import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';

export interface Color {
  hex: string;
  name: string;
  // Puedes agregar otros campos, por ejemplo, fecha de registro:
  timestamp?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ColorService {

  constructor(private firestore: Firestore) {}

  // Guarda un color en la subcolección "colors" del usuario
  async addColor(uid: string, color: Color) {
    const colorsRef = collection(this.firestore, `users/${uid}/colors`);
    return await addDoc(colorsRef, { ...color, timestamp: new Date() });
  }
}
