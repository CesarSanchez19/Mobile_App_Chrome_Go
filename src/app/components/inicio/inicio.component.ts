import { Component, OnInit, OnDestroy } from '@angular/core';
import { Platform, ToastController } from '@ionic/angular';
// Importamos el plugin de Capacitor para cámara
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

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
  // Variable para almacenar la imagen capturada o seleccionada
  image: string | undefined;
  // Determina si se está en un entorno nativo (celular)
  isNative: boolean = false;

  constructor(private platform: Platform, private toastCtrl: ToastController) {
    // Se considera nativo si es 'hybrid' o Android/iOS
    this.isNative = this.platform.is('hybrid') || this.platform.is('android') || this.platform.is('ios');
  }

  ngOnInit() {
    if (!this.isNative) {
      this.startCamera();
    }
  }

  ngOnDestroy() {
    if (!this.isNative) {
      this.stopCamera();
    }
  }

  /**
   * =============================
   * Funciones para versión WEB
   * =============================
   */

  /**
   * Inicia la cámara usando getUserMedia (web)
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
   * Detiene la cámara (web)
   */
  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
  }

  /**
   * Captura una foto del video en web
   */
  capturePhotoWeb() {
    const video = document.getElementById('bg-video') as HTMLVideoElement;
    if (video) {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        this.image = canvas.toDataURL('image/png');
        console.log('Foto capturada:', this.image);
      }
    }
  }

  /**
   * =============================
   * Funciones para versión Nativa (Capacitor)
   * =============================
   */

  /**
   * Captura una foto usando el plugin de Capacitor (celular)
   */
  async capturePhotoNative() {
    try {
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera
      });
      this.image = photo.webPath;
      console.log('Foto capturada (nativo):', this.image);
    } catch (error) {
      console.error('Error al capturar foto (nativo):', error);
    }
  }

  /**
   * Selecciona una imagen desde la galería usando Capacitor (celular)
   */
  async openGalleryNative() {
    try {
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos
      });
      this.image = photo.webPath;
      console.log('Imagen seleccionada (nativo):', this.image);
    } catch (error) {
      console.error('Error al seleccionar imagen (nativo):', error);
    }
  }

  /**
   * =============================
   * Funciones Comunes
   * =============================
   */

  /**
   * Captura foto: según el entorno, usa método nativo o web.
   */
  capturePhoto() {
    if (this.isNative) {
      this.capturePhotoNative();
    } else {
      this.capturePhotoWeb();
    }
  }

  /**
   * Abre la galería o explorador de archivos para seleccionar una imagen.
   * En móvil se usa el plugin, en web se simula el click en el input.
   */
  openGallery() {
    if (this.isNative) {
      this.openGalleryNative();
    } else {
      const fileInput = document.getElementById('fileInput') as HTMLInputElement;
      if (fileInput) {
        fileInput.click();
      }
    }
  }

  /**
   * Maneja la selección de imagen desde la galería (web)
   */
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log('Imagen seleccionada (web):', e.target?.result);
        this.image = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Activa o desactiva el flash (torch) si el dispositivo lo soporta en web.
   * En móvil se muestra advertencia ya que el plugin no provee esta funcionalidad.
   */
  async toggleFlash() {
    if (!this.isNative && this.stream) {
      const videoTrack = this.stream.getVideoTracks()[0];
      if (videoTrack) {
        const capabilities = videoTrack.getCapabilities?.();
        if (capabilities && (capabilities as any).torch !== undefined) {
          this.flashOn = !this.flashOn;
          // Se castea el objeto de constraints a any para incluir la propiedad "torch"
          videoTrack.applyConstraints({ advanced: [{ torch: this.flashOn }] } as any)
            .catch((err) => console.error('Error al cambiar el flash:', err));
        } else {
          console.warn('El dispositivo no soporta el flash.');
        }
      }
    } else {
      const toast = await this.toastCtrl.create({
        message: 'Funcionalidad de flash no soportada en modo nativo.',
        duration: 2000
      });
      toast.present();
    }
  }

  /**
   * Alterna entre la cámara trasera y la frontal (solo web).
   * En modo nativo se recomienda usar la interfaz propia del plugin.
   */
  async switchCamera() {
    if (!this.isNative) {
      this.currentFacingMode = this.currentFacingMode === 'environment' ? 'user' : 'environment';
      this.stopCamera();
      this.startCamera();
    } else {
      const toast = await this.toastCtrl.create({
        message: 'Cambiar cámara en modo nativo debe hacerse mediante la interfaz propia del plugin.',
        duration: 2000
      });
      toast.present();
    }
  }
}
