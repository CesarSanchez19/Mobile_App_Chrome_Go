import { Component, OnInit, OnDestroy } from '@angular/core';
import { Platform, ToastController } from '@ionic/angular';
import { Auth } from '@angular/fire/auth';
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

  // Variables para controlar cámara (se usa únicamente getUserMedia)
  stream: MediaStream | null = null;
  currentFacingMode: string = 'environment';
  flashOn: boolean = false;
  // Se mantiene isNative para conservar la estructura, pero se usará la lógica web en todos los casos
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
    // Conservamos la detección, aunque ahora siempre se usará getUserMedia
    this.isNative = this.platform.is('hybrid') || this.platform.is('android') || this.platform.is('ios');
  }

  ngOnInit() {
    // Se elimina la lógica de CameraPreview y se usa únicamente getUserMedia
    this.startCameraWeb();
  }

  ngOnDestroy() {
    this.stopCameraWeb();
  }

  // =======================================================
  // ============== Cámara (getUserMedia) ================
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
          console.error('Error al acceder a la cámara:', err);
          this.presentToast('Error al acceder a la cámara.');
        });
    } else {
      console.error('getUserMedia no es soportado en este navegador.');
      this.presentToast('La cámara no está soportada en este dispositivo.');
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
    // Alterna entre cámara trasera y frontal
    this.currentFacingMode = (this.currentFacingMode === 'environment') ? 'user' : 'environment';
    this.stopCameraWeb();
    this.startCameraWeb();
  }

  toggleFlashWeb() {
    // El flash no está soportado con getUserMedia; se muestra un mensaje
    this.presentToast('El flash no está soportado en esta versión.');
  }

  // =======================================================
  // ================ Botones/Acciones Comunes ===========
  // =======================================================
  capturePhoto() {
    // Se utiliza únicamente la captura web
    this.capturePhotoWeb();
    setTimeout(() => this.processImage(), 500);
  }

  openGallery() {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
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
    // Se utiliza la versión web (flash no soportado)
    this.toggleFlashWeb();
  }

  async switchCamera() {
    this.switchCameraWeb();
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
