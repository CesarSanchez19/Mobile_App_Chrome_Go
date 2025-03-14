import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component'; // Componente home
import { AppRoutingModule } from './app-routing.module';

//! Importación de componentes Home, login, sign-up, galeria y perfil:
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { LoginComponent } from './components/login/login.component';
import { GaleriaComponent } from './components/galeria/galeria.component';
import { PerfilComponent } from './components/perfil/perfil.component'

@NgModule({
  declarations: [
    AppComponent,
    SignUpComponent,
    LoginComponent,
    GaleriaComponent,
    PerfilComponent,
  ],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
