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

  /**
   * Crea (C) - Guarda un color en la subcolección "colors" del usuario.
   * Incluimos 'timestamp' para poder ordenarlos luego.
   */
  async addColor(uid: string, color: Color) {
    const colorsRef = collection(this.firestore, `users/${uid}/colors`);
    // Asignamos timestamp si no existe
    const dataToSave = {
      ...color,
      timestamp: color.timestamp ?? new Date()
    };
    return await addDoc(colorsRef, dataToSave);
  }

  /**
   * Obtiene (R) - Retorna los colores del usuario ordenados por timestamp desc,
   * y limitados a los primeros 6. Se hace manualmente tras la obtención.
   */
  async getColors(uid: string): Promise<Color[]> {
    const colorsRef = collection(this.firestore, `users/${uid}/colors`);
    const snapshot = await getDocs(colorsRef);

    // Convertimos cada documento en objeto Color
    let allColors = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    } as Color));

    // Ordenamos por timestamp desc y limitamos a 6
    allColors = allColors.sort((a, b) => {
      // Aseguramos que 'timestamp' sea Date u objeto con 'seconds'
      const timeA = a.timestamp?.seconds
        ? new Date(a.timestamp.seconds * 1000).getTime()
        : new Date(a.timestamp).getTime();

      const timeB = b.timestamp?.seconds
        ? new Date(b.timestamp.seconds * 1000).getTime()
        : new Date(b.timestamp).getTime();

      return timeB - timeA; // Orden descendente
    }).slice(0, 200);

    return allColors;
  }

  /**
   * Actualiza (U) - Actualiza un color en la subcolección "colors".
   */
  async updateColor(uid: string, colorId: string, data: Partial<Color>): Promise<void> {
    const colorDocRef = doc(this.firestore, `users/${uid}/colors/${colorId}`);
    return await updateDoc(colorDocRef, data);
  }

  /**
   * Elimina (D) - Elimina un color de la subcolección "colors".
   */
  async deleteColor(uid: string, colorId: string): Promise<void> {
    const colorDocRef = doc(this.firestore, `users/${uid}/colors/${colorId}`);
    return await deleteDoc(colorDocRef);
  }
}
