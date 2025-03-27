import { Component, OnInit } from '@angular/core';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { ColorService, Color } from '../../services/color.service';

@Component({
  selector: 'app-galeria',
  templateUrl: './galeria.component.html',
  styleUrls: ['./galeria.component.scss'],
  standalone: false,
})
export class GaleriaComponent implements OnInit {
  // Variables para controlar la edición del nombre
  editingColorId: string | null = null;
  editingColorName: string = '';

  // Lista de colores obtenidos desde Firestore (limitados a 6)
  colores: Color[] = [];

  // Categorías (sin cambios en estructura/diseño)
  categorias = [
    { value: 'favoritos', label: 'Favoritos ⭐', content: 'Contenido Favoritos' },
    { value: 'asthetic',  label: 'Aesthetic',    content: 'Contenido Aesthetic' },
    { value: 'brillante', label: 'Brillante',    content: 'Contenido Brillante' }
  ];

  nuevaCategoria: string = '';
  isModalOpen: boolean = false;

  uid: string = ''; // Almacenará el UID del usuario autenticado

  constructor(
    private auth: Auth,
    private colorService: ColorService
  ) {}

  ngOnInit() {
    // Verificamos el estado de autenticación para obtener el UID del usuario
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.uid = user.uid;
        this.loadColors();
      } else {
        console.error('No hay usuario autenticado. No se pueden cargar colores.');
      }
    });
  }

  /**
   * Carga la lista de colores desde Firestore (los primeros 6, ordenados desc).
   */
  async loadColors() {
    try {
      this.colores = await this.colorService.getColors(this.uid);
    } catch (error) {
      console.error('Error al obtener los colores:', error);
    }
  }

  /**
   * Elimina el color de Firestore y de la lista local.
   */
  async deleteColor(color: Color) {
    if (!color.id) return;
    try {
      await this.colorService.deleteColor(this.uid, color.id);
      this.colores = this.colores.filter(c => c.id !== color.id);
    } catch (error) {
      console.error('Error al eliminar el color:', error);
    }
  }

  /**
   * Activa el modo edición para un color, al hacer doble clic.
   */
  enableEditing(color: Color) {
    this.editingColorId = color.id || null;
    this.editingColorName = color.name;
  }

  /**
   * Guarda el nuevo nombre en Firestore y desactiva la edición.
   */
  async saveEditing(color: Color) {
    if (this.editingColorId && this.editingColorName.trim() !== '') {
      try {
        await this.colorService.updateColor(this.uid, this.editingColorId, {
          name: this.editingColorName
        });
        // Actualiza localmente
        this.colores = this.colores.map(c => {
          if (c.id === this.editingColorId) {
            return { ...c, name: this.editingColorName };
          }
          return c;
        });
      } catch (error) {
        console.error('Error al actualizar el color:', error);
      }
    }
    this.cancelEditing();
  }

  /**
   * Cancela la edición.
   */
  cancelEditing() {
    this.editingColorId = null;
    this.editingColorName = '';
  }

  // =======================
  // = MÉTODOS CATEGORÍAS =
  // =======================
  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  crearCategoria() {
    if (!this.nuevaCategoria.trim()) return;

    if (this.categorias.some(cat =>
      cat.label.toLowerCase() === this.nuevaCategoria.toLowerCase())) {
      alert('Esta categoría ya existe');
      return;
    }

    const nueva = {
      value: this.nuevaCategoria.toLowerCase().replace(/\s+/g, '-'),
      label: this.nuevaCategoria,
      content: `Contenido ${this.nuevaCategoria}`
    };

    this.categorias.push(nueva);
    this.nuevaCategoria = '';
    this.closeModal();
  }

  eliminarCategoria(categoria: any) {
    this.categorias = this.categorias.filter(cat => cat !== categoria);
  }
}
