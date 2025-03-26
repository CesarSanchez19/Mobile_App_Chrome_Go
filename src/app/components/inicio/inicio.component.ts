import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.scss'],
  standalone: false,
})
export class InicioComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

  prueba = console.log("Inicio works! HOME funcionando correctamente !!!")

}
