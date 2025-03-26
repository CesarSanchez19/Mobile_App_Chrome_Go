// app.module.ts
import { NgModule } from '@angular/core';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'; // Asegúrate de importar CUSTOM_ELEMENTS_SCHEMA
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms'; // Asegúrate de que ReactiveFormsModule esté aquí

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { LoginComponent } from './components/login/login.component';
import { GaleriaComponent } from './components/galeria/galeria.component';
import { PerfilComponent } from './components/perfil/perfil.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { InicioComponent } from './components/inicio/inicio.component';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    GaleriaComponent,
    PerfilComponent,
    SignUpComponent,
    InicioComponent,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideFirebaseApp(() => initializeApp({
      projectId: "chrome-go-c87ce",
      appId: "1:789896777211:web:63197c45321b298d2a4f5e",
      storageBucket: "chrome-go-c87ce.firebasestorage.app",
      apiKey: "AIzaSyBDaJY8VFf0qTYG4CperxfH5ch3MmeQrd0",
      authDomain: "chrome-go-c87ce.firebaseapp.com",
      messagingSenderId: "789896777211"
    })),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore())
  ],
  bootstrap: [AppComponent] // Agregado para indicar el componente raíz
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // Asegúrate de que esto esté aquí
})
export class AppModule { }
