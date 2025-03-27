import { Component, OnInit, OnDestroy } from '@angular/core';
import { Platform, ToastController } from '@ionic/angular';
import { Auth } from '@angular/fire/auth';
import { CameraPreview, CameraPreviewOptions, CameraPreviewPictureOptions } from '@capacitor-community/camera-preview';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import ColorThief from 'colorthief';
import { ColorService, Color } from '../../services/color.service'; // Ajusta la ruta según tu estructura

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.scss'],
  standalone: false,
})
export class InicioComponent implements OnInit, OnDestroy {

  // Variables para controlar cámara web/nativa
  stream: MediaStream | null = null;
  currentFacingMode: string = 'environment';
  useFrontCamera: boolean = false;
  flashOn: boolean = false;
  isNative: boolean = false;

  // Datos de la imagen capturada y colores extraídos
  image: string | undefined;
  colors: { name: string; hex: string }[] = [];
  showModal: boolean = false;

  constructor(
    private platform: Platform,
    private toastCtrl: ToastController,
    private auth: Auth,
    private colorService: ColorService
  ) {
    // Se considera nativo si es 'hybrid', 'android' o 'ios'
    this.isNative = this.platform.is('hybrid') || this.platform.is('android') || this.platform.is('ios');
  }

  ngOnInit() {
    if (this.isNative) {
      this.startCameraPreviewNative();
    } else {
      this.startCameraWeb();
    }
  }

  ngOnDestroy() {
    if (this.isNative) {
      this.stopCameraPreviewNative();
    } else {
      this.stopCameraWeb();
    }
  }

  // =======================================================
  // ============== Cámara Web (getUserMedia) =============
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

  switchCameraWeb() {
    this.currentFacingMode = (this.currentFacingMode === 'environment') ? 'user' : 'environment';
    this.stopCameraWeb();
    this.startCameraWeb();
  }

  toggleFlashWeb() {
    this.presentToast('El flash no está soportado en la versión web.');
  }

  // =======================================================
  // ============= Cámara Nativa (Camera Preview) ==========
  // =======================================================
  async startCameraPreviewNative() {
    try {
      const cameraPermission = await Camera.checkPermissions();
      if (cameraPermission.camera !== 'granted') {
        const requestResult = await Camera.requestPermissions();
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

      await CameraPreview.start(cameraPreviewOpts);
      console.log('CameraPreview iniciado correctamente');
    } catch (err) {
      console.error('Error en startCameraPreviewNative:', err);
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

  async capturePhotoNative() {
    try {
      const options: CameraPreviewPictureOptions = { quality: 90 };
      const result = await CameraPreview.capture(options);
      this.image = 'data:image/jpeg;base64,' + result.value;
      console.log('Foto capturada (nativo):', this.image);
    } catch (error) {
      console.error('Error al capturar foto (nativo):', error);
    }
  }

  async switchCameraNative() {
    this.useFrontCamera = !this.useFrontCamera;
    await this.stopCameraPreviewNative();
    await this.startCameraPreviewNative();
  }

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
  // ================ Botones/Acciones Comunes =============
  // =======================================================
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

  async toggleFlash() {
    if (this.isNative) {
      await this.toggleFlashNative();
    } else {
      this.toggleFlashWeb();
    }
  }

  async switchCamera() {
    if (this.isNative) {
      await this.switchCameraNative();
    } else {
      this.switchCameraWeb();
    }
  }

  // =======================================================
  // ===== Procesamiento con ColorThief y Almacenado ======
  // =======================================================
  processImage() {
    if (!this.image) return;

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = this.image;
    img.onload = async () => {
      try {
        const colorThief = new ColorThief();
        // Extrae una paleta de 6 colores (array de [r, g, b])
        const palette = colorThief.getPalette(img, 6);
        this.colors = palette.map((rgb: number[]) => {
          const hex = this.rgbToHex(rgb[0], rgb[1], rgb[2]);
          return { hex, name: this.getColorName(hex) };
        });
        console.log('Colores extraídos:', this.colors);

        // Guarda cada color en Firestore asociado al usuario autenticado
        const user = this.auth.currentUser;
        if (user) {
          for (const color of this.colors) {
            await this.colorService.addColor(user.uid, color as Color);
          }
          console.log('Colores guardados en Firestore.');
        } else {
          console.error('No se encontró un usuario autenticado.');
        }

        this.showModal = true;
      } catch (error) {
        console.error('Error extrayendo colores:', error);
      }
    };
    img.onerror = (err) => {
      console.error('Error al cargar la imagen:', err);
    };
  }

  // Convierte valores RGB a HEX (#rrggbb)
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

  // Asigna un nombre básico al color según su componente dominante
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

  closeModal() {
    this.showModal = false;
  }

  private async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000
    });
    toast.present();
  }
}
