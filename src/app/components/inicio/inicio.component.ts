// Declara el módulo para ColorThief (si no existe @types/colorthief)
declare module 'colorthief';

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Platform, ToastController } from '@ionic/angular';

// Plugins de Capacitor
import { CameraPreview, CameraPreviewOptions, CameraPreviewPictureOptions } from '@capacitor-community/camera-preview';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

import ColorThief from 'colorthief';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.scss'],
  standalone: false
})
export class InicioComponent implements OnInit, OnDestroy {

  // === Control para Web (getUserMedia) ===
  stream: MediaStream | null = null;
  currentFacingMode: string = 'environment'; // Por defecto, cámara trasera en la web

  // === Control para Nativo (Camera Preview) ===
  useFrontCamera: boolean = false; // false = trasera, true = frontal
  flashOn: boolean = false;        // Estado del flash

  // === Datos de la imagen capturada / seleccionada ===
  image: string | undefined; // Base64 o dataURL
  isNative: boolean = false;  // true si se ejecuta en Android/iOS

  // === Resultados de extracción de colores (ColorThief) ===
  colors: { name: string; hex: string }[] = [];
  showModal: boolean = false; // Para mostrar/ocultar la modal

  constructor(
    private platform: Platform,
    private toastCtrl: ToastController
  ) {
    // Se considera nativo si es 'hybrid', 'android' o 'ios'
    this.isNative = this.platform.is('hybrid') || this.platform.is('android') || this.platform.is('ios');
  }

  // Ciclo de vida
  ngOnInit() {
    if (this.isNative) {
      // Inicia la cámara nativa como fondo
      this.startCameraPreviewNative();
    } else {
      // Inicia la cámara web
      this.startCameraWeb();
    }
  }

  ngOnDestroy() {
    if (this.isNative) {
      // Detiene la cámara nativa
      this.stopCameraPreviewNative();
    } else {
      // Detiene la cámara web
      this.stopCameraWeb();
    }
  }

  // =======================================================
  // =============   CÁMARA WEB (getUserMedia)   ===========
  // =======================================================
  startCameraWeb() {
    if (navigator.mediaDevices?.getUserMedia) {
      const constraints = { video: { facingMode: this.currentFacingMode } };
      navigator.mediaDevices.getUserMedia(constraints)
        .then((stream) => {
          this.stream = stream;
          const video = document.getElementById('bg-video') as HTMLVideoElement;
          if (video) {
            video.srcObject = stream;
            video.play();
          }
        })
        .catch((err) => {
          console.error('Error al acceder a la cámara (web):', err);
        });
    } else {
      console.error('getUserMedia no es soportado en este navegador.');
    }
  }

  stopCameraWeb() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
  }

  // Captura en la web: dibuja un <canvas> a partir del <video>
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
        console.log('Foto capturada (web):', this.image);
      }
    }
  }

  // Cambia entre cámara trasera y frontal en la web
  switchCameraWeb() {
    this.currentFacingMode = (this.currentFacingMode === 'environment') ? 'user' : 'environment';
    this.stopCameraWeb();
    this.startCameraWeb();
  }

  // El flash no es soportado en getUserMedia en la mayoría de navegadores
  toggleFlashWeb() {
    this.presentToast('El flash no está soportado en la versión web.');
  }

  // =======================================================
  // ==========   CÁMARA NATIVA (Camera Preview)   =========
  // =======================================================
  async startCameraPreviewNative() {
    try {
      console.log('Dimensiones de pantalla:', {
        width: window.screen.width,
        height: window.screen.height,
        devicePixelRatio: window.devicePixelRatio
      });

      // Verificar permisos de cámara
      const cameraPermission = await Camera.checkPermissions();
      console.log('Estado de permisos de cámara:', cameraPermission);

      if (cameraPermission.camera !== 'granted') {
        const requestResult = await Camera.requestPermissions();
        console.log('Resultado de solicitud de permisos:', requestResult);

        if (requestResult.camera !== 'granted') {
          this.presentToast('Permisos de cámara denegados');
          return;
        }
      }

      const cameraPreviewOpts: CameraPreviewOptions = {
        position: this.useFrontCamera ? 'front' : 'rear',
        toBack: true,
        parent: 'cameraPreview',
        enableZoom: true,
        disableExifHeaderStripping: true,
        width: window.screen.width,
        height: window.screen.height,
      };

      console.log('Opciones de CameraPreview:', cameraPreviewOpts);

      await CameraPreview.start(cameraPreviewOpts);
      console.log('CameraPreview iniciado correctamente');
    } catch (err) {
      console.error('Error detallado en startCameraPreviewNative:', err);
      this.presentToast('Error al iniciar cámara: ' + JSON.stringify(err));
    }
  }

  async stopCameraPreviewNative() {
    try {
      await CameraPreview.stop();
    } catch (err) {
      console.error('Error al detener CameraPreview (nativo):', err);
    }
  }

  // Toma una foto con la cámara nativa, retorna base64
  async capturePhotoNative() {
    try {
      const options: CameraPreviewPictureOptions = {
        quality: 90
      };
      const result = await CameraPreview.capture(options);
      // result.value es base64 sin 'data:image/...'
      this.image = 'data:image/jpeg;base64,' + result.value;
      console.log('Foto capturada (nativo):', this.image);
    } catch (error) {
      console.error('Error al capturar foto (nativo):', error);
    }
  }

  // Cambia entre cámara frontal y trasera en nativo
  async switchCameraNative() {
    this.useFrontCamera = !this.useFrontCamera;
    // Reiniciamos la preview con la nueva posición
    await this.stopCameraPreviewNative();
    await this.startCameraPreviewNative();
  }

  // Enciende o apaga el flash (si el dispositivo lo soporta)
  async toggleFlashNative() {
    try {
      this.flashOn = !this.flashOn;
      await CameraPreview.setFlashMode({ flashMode: this.flashOn ? 'on' : 'off' });
    } catch (err) {
      console.error('Error al cambiar flash (nativo):', err);
      this.presentToast('El flash no está soportado en este dispositivo.');
    }
  }

  // =======================================================
  // =============   BOTONES / ACCIONES COMUNES   ==========
  // =======================================================

  // Usa el mismo botón para tomar la foto (no se modifica tu botón ni la lógica del modal)
  capturePhoto() {
    if (this.isNative) {
      this.capturePhotoNative().then(() => {
        setTimeout(() => this.processImage(), 500);
      });
    } else {
      this.capturePhotoWeb();
      setTimeout(() => this.processImage(), 500);
    }
  }

  // Abre la galería del dispositivo (Android/iOS) o input de archivos (web)
  openGallery() {
    if (this.isNative) {
      // Usamos el plugin oficial de Camera para abrir la galería
      this.openGalleryNative();
    } else {
      const fileInput = document.getElementById('fileInput') as HTMLInputElement;
      if (fileInput) {
        fileInput.click();
      }
    }
  }

  // Abre galería en modo nativo usando @capacitor/camera
  async openGalleryNative() {
    try {
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Photos
      });
      this.image = 'data:image/jpeg;base64,' + photo.base64String;
      console.log('Imagen seleccionada (nativo):', this.image);
      setTimeout(() => this.processImage(), 500);
    } catch (error) {
      console.error('Error al seleccionar imagen (nativo):', error);
    }
  }

  // Input oculto en web
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.image = e.target?.result as string;
        console.log('Imagen seleccionada (web):', this.image);
        this.processImage();
      };
      reader.readAsDataURL(file);
    }
  }

  // Activa/desactiva flash
  async toggleFlash() {
    if (this.isNative) {
      await this.toggleFlashNative();
    } else {
      this.toggleFlashWeb();
    }
  }

  // Cambia cámara (frontal <-> trasera)
  async switchCamera() {
    if (this.isNative) {
      await this.switchCameraNative();
    } else {
      this.switchCameraWeb();
    }
  }

  // =======================================================
  // =============   PROCESAMIENTO CON COLORTHIEF   ========
  // =======================================================
  processImage() {
    if (!this.image) return;

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = this.image;
    img.onload = () => {
      try {
        const colorThief = new ColorThief();
        // Obtiene paleta de 6 colores (array de [r, g, b])
        const palette = colorThief.getPalette(img, 6);
        this.colors = palette.map((rgb: number[]) => {
          const hex = this.rgbToHex(rgb[0], rgb[1], rgb[2]);
          return { hex, name: this.getColorName(hex) };
        });
        console.log('Colores extraídos:', this.colors);
        this.showModal = true;
      } catch (error) {
        console.error('Error extrayendo colores:', error);
      }
    };
    img.onerror = (err) => {
      console.error('Error al cargar la imagen:', err);
    };
  }

  // Convierte [r, g, b] a #rrggbb
  rgbToHex(r: number, g: number, b: number): string {
    return (
      '#' +
      [r, g, b]
        .map(x => {
          const hex = x.toString(16);
          return hex.length === 1 ? '0' + hex : hex;
        })
        .join('')
    );
  }

  // Devuelve un nombre básico según el color dominante
  getColorName(hex: string): string {
    const r = parseInt(hex.substr(1, 2), 16);
    const g = parseInt(hex.substr(3, 2), 16);
    const b = parseInt(hex.substr(5, 2), 16);
    if (r >= g && r >= b) {
      return 'Rojo';
    } else if (g >= r && g >= b) {
      return 'Verde';
    } else if (b >= r && b >= g) {
      return 'Azul';
    }
    return 'Color';
  }

  // Cierra la modal
  closeModal() {
    this.showModal = false;
  }

  // Toast helper
  private async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000
    });
    toast.present();
  }
}
