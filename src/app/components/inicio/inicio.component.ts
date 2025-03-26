import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.scss'],
  standalone: false,
})
export class InicioComponent implements OnInit, OnDestroy {
  stream: MediaStream | null = null;
  currentFacingMode: string = 'environment'; // Cámara trasera por defecto
  flashOn: boolean = false;

  constructor() {}

  ngOnInit() {
    this.startCamera();
  }

  ngOnDestroy() {
    this.stopCamera();
  }

  /**
   * Inicia la cámara usando la constraint de 'facingMode'
   */
  startCamera() {
    if (navigator.mediaDevices?.getUserMedia) {
      const constraints = {
        video: { facingMode: this.currentFacingMode }
      };
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => {
          this.stream = stream;
          const video = document.getElementById('bg-video') as HTMLVideoElement;
          if (video) {
            video.srcObject = stream;
            video.play();
          }
        })
        .catch((err) => {
          console.error('Error al acceder a la cámara:', err);
        });
    } else {
      console.error('getUserMedia no es soportado en este navegador.');
    }
  }

  /**
   * Detiene la cámara
   */
  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
  }

  /**
   * Abre la galería o explorador de archivos para seleccionar una imagen
   */
  openGallery() {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  /**
   * Activa o desactiva el flash (torch) si el dispositivo lo soporta
   * (funcionalidad experimental, no en todos los navegadores)
   */
  toggleFlash() {
    if (this.stream) {
      const videoTrack = this.stream.getVideoTracks()[0];
      if (videoTrack) {
        const capabilities = videoTrack.getCapabilities?.();
        // Verifica si se soporta 'torch'
        if (capabilities && (capabilities as any).torch !== undefined) {
          this.flashOn = !this.flashOn;
          videoTrack
            .applyConstraints({
              advanced: [{ torch: this.flashOn } as any]
            })
            .catch((err) => console.error('Error al cambiar el flash:', err));
        } else {
          console.warn('El dispositivo no soporta el flash.');
        }
      }
    }
  }

  /**
   * Alterna entre la cámara trasera y la frontal
   */
  switchCamera() {
    this.currentFacingMode =
      this.currentFacingMode === 'environment' ? 'user' : 'environment';
    this.stopCamera();
    this.startCamera();
  }

  /**
   * Captura una foto del video de fondo
   */
  capturePhoto() {
    const video = document.getElementById('bg-video') as HTMLVideoElement;
    if (video) {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        console.log('Foto capturada:', dataUrl);
        // Aquí puedes agregar la lógica para usar la imagen (mostrarla, subirla, etc.)
      }
    }
  }

  /**
   * Maneja la selección de imagen desde la galería o explorador de archivos
   */
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log('Imagen seleccionada:', e.target?.result);
        // Aquí puedes agregar la lógica para usar la imagen
      };
      reader.readAsDataURL(file);
    }
  }
}
