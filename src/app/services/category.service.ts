import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove
} from '@angular/fire/firestore';
import { Color } from './color.service';

/**
 * Interfaz para representar una categoría en la base de datos.
 * Incluye "label", "content" y "colors" (array de Color).
 */
export interface Category {
  id?: string;         // ID del documento en Firestore
  value?: string;      // Valor opcional (ej. "favoritos")
  label: string;       // Nombre de la categoría (ej: "Favoritos ⭐")
  content: string;     // Descripción (ej: "Contenido Favoritos")
  colors?: Color[];    // Array de colores asignados a esta categoría
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(private firestore: Firestore) {}

  async addCategory(uid: string, category: Category) {
    const categoriesRef = collection(this.firestore, `users/${uid}/categories`);
    return await addDoc(categoriesRef, category);
  }

  async getCategories(uid: string): Promise<Category[]> {
    const categoriesRef = collection(this.firestore, `users/${uid}/categories`);
    const snapshot = await getDocs(categoriesRef);
    return snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    } as Category));
  }

  async updateCategory(uid: string, categoryId: string, data: Partial<Category>): Promise<void> {
    const categoryDocRef = doc(this.firestore, `users/${uid}/categories/${categoryId}`);
    return await updateDoc(categoryDocRef, data);
  }

  async deleteCategory(uid: string, categoryId: string): Promise<void> {
    const categoryDocRef = doc(this.firestore, `users/${uid}/categories/${categoryId}`);
    return await deleteDoc(categoryDocRef);
  }

  async assignColor(uid: string, categoryId: string, color: Color): Promise<void> {
    const categoryDocRef = doc(this.firestore, `users/${uid}/categories/${categoryId}`);
    return await updateDoc(categoryDocRef, {
      colors: arrayUnion(color)
    });
  }

  async removeColor(uid: string, categoryId: string, color: Color): Promise<void> {
    const categoryDocRef = doc(this.firestore, `users/${uid}/categories/${categoryId}`);
    return await updateDoc(categoryDocRef, {
      colors: arrayRemove(color)
    });
  }
}
