import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc
} from '@angular/fire/firestore';

export interface Color {
  id?: string;   // ID del documento en Firestore
  hex: string;   // Código hexadecimal del color (ej. "#FF0000")
  name: string;  // Nombre del color (ej. "Rojo")
  timestamp?: any; // Fecha/hora de creación (para ordenar)
}

@Injectable({
  providedIn: 'root'
})
export class ColorService {

  constructor(private firestore: Firestore) {}

  async addColor(uid: string, color: Color) {
    const colorsRef = collection(this.firestore, `users/${uid}/colors`);
    const dataToSave = {
      ...color,
      timestamp: color.timestamp ?? new Date()
    };
    return await addDoc(colorsRef, dataToSave);
  }

  async getColors(uid: string): Promise<Color[]> {
    const colorsRef = collection(this.firestore, `users/${uid}/colors`);
    const snapshot = await getDocs(colorsRef);

    let allColors = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    } as Color));

    // Ordenar por timestamp descendente
    allColors = allColors.sort((a, b) => {
      const timeA = a.timestamp?.seconds
        ? new Date(a.timestamp.seconds * 1000).getTime()
        : new Date(a.timestamp).getTime();
      const timeB = b.timestamp?.seconds
        ? new Date(b.timestamp.seconds * 1000).getTime()
        : new Date(b.timestamp).getTime();
      return timeB - timeA;
    }).slice(0, 200);

    return allColors;
  }

  async updateColor(uid: string, colorId: string, data: Partial<Color>): Promise<void> {
    const colorDocRef = doc(this.firestore, `users/${uid}/colors/${colorId}`);
    return await updateDoc(colorDocRef, data);
  }

  async deleteColor(uid: string, colorId: string): Promise<void> {
    const colorDocRef = doc(this.firestore, `users/${uid}/colors/${colorId}`);
    return await deleteDoc(colorDocRef);
  }
}
