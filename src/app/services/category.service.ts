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

/**
 * Interfaz para representar un color escaneado.
 */
export interface ScannedColor {
  hex: string;  // Código hexadecimal (ej. "#FF0000")
  name: string; // Nombre del color (ej. "Rojo")
}

/**
 * Interfaz para representar una categoría.
 * Cada categoría contiene un nombre y un arreglo de colores escaneados.
 */
export interface Category {
  id?: string;              // ID del documento en Firestore
  name: string;             // Nombre de la categoría
  colors?: ScannedColor[];  // Arreglo de colores escaneados (puede estar vacío)
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(private firestore: Firestore) {}

  /**
   * Crea (C) - Guarda una categoría en la subcolección "categories" del usuario.
   * @param uid - UID del usuario.
   * @param category - Objeto con los campos { name, colors }.
   * @returns Referencia al documento agregado.
   */
  async addCategory(uid: string, category: Category) {
    const categoriesRef = collection(this.firestore, `users/${uid}/categories`);
    return await addDoc(categoriesRef, category);
  }

  /**
   * Obtiene (R) - Retorna todas las categorías guardadas para el usuario.
   * @param uid - UID del usuario.
   * @returns Promise<Category[]> con la lista de categorías.
   */
  async getCategories(uid: string): Promise<Category[]> {
    const categoriesRef = collection(this.firestore, `users/${uid}/categories`);
    const snapshot = await getDocs(categoriesRef);
    return snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    } as Category));
  }

  /**
   * Actualiza (U) - Actualiza una categoría existente en la subcolección "categories".
   * @param uid - UID del usuario.
   * @param categoryId - ID del documento de la categoría a actualizar.
   * @param data - Campos a actualizar (pueden ser parciales).
   * @returns Promise<void>.
   */
  async updateCategory(uid: string, categoryId: string, data: Partial<Category>): Promise<void> {
    const categoryDocRef = doc(this.firestore, `users/${uid}/categories/${categoryId}`);
    return await updateDoc(categoryDocRef, data);
  }

  /**
   * Elimina (D) - Elimina una categoría de la subcolección "categories".
   * @param uid - UID del usuario.
   * @param categoryId - ID del documento de la categoría a eliminar.
   * @returns Promise<void>.
   */
  async deleteCategory(uid: string, categoryId: string): Promise<void> {
    const categoryDocRef = doc(this.firestore, `users/${uid}/categories/${categoryId}`);
    return await deleteDoc(categoryDocRef);
  }
}
