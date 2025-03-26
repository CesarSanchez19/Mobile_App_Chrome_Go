import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { Users } from '../interfaces/users';


@Injectable({
  providedIn: 'root'
})
export class AccountUserService {

  constructor(private firestore: Firestore) { }
  addUser(users: Users) {
    const userRef = collection(this.firestore, "new user");
    return addDoc(userRef, users);
  }
}
