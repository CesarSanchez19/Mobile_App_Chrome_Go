import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.scss'],
  standalone: false,
})
export class InicioComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    // Solicita acceso a la cámara usando la API getUserMedia
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(stream => {
          const video = document.getElementById('bg-video') as HTMLVideoElement;
          if (video) {
            video.srcObject = stream;
            video.play();
          }
        })
        .catch(err => {
          console.error("Error al acceder a la cámara: ", err);
        });
    } else {
      console.error("getUserMedia no es soportado en este navegador.");
    }
  }
}
