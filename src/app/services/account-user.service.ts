import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { Users } from '../interfaces/users';

@Injectable({
  providedIn: 'root'
})
export class AccountUserService {

  constructor(private firestore: Firestore) {}

  addUser(users: Users) {
    const userRef = collection(this.firestore, "users");
    return addDoc(userRef, users);
  }
  async getUser(userId: string) {
    try {
      const userDoc = doc(this.firestore, `users/${userId}`);
      const docSnap = await getDoc(userDoc);
      return docSnap.exists() ? docSnap.data() as Users : null;
    } catch (error) {
      console.error("Error obteniendo el usuario:", error);
      return null;
    }
  }

  async updateUser(userId: string, userData: Partial<Users>) {
    try {
      const userDoc = doc(this.firestore, `users/${userId}`);
      await updateDoc(userDoc, userData);
      console.log("Usuario actualizado correctamente.");
    } catch (error) {
      console.error("Error al actualizar el usuario:", error);
    }
  }
}
