import { Component, OnInit } from '@angular/core';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { ColorService, Color } from '../../services/color.service';
import { CategoryService, Category } from '../../services/category.service';

interface EditingCategoryColor {
  colorId: string;
  newName: string;
}

@Component({
  selector: 'app-galeria',
  templateUrl: './galeria.component.html',
  styleUrls: ['./galeria.component.scss'],
  standalone: false,
})
export class GaleriaComponent implements OnInit {
  // VARIABLES PARA COLORES (HISTORIAL)
  editingColorId: string | null = null;
  editingColorName: string = '';
  colores: Color[] = [];
  isLoading: boolean = false;

  // VARIABLES PARA CATEGORÍAS
  categorias: Category[] = [];
  editingCategoryId: string | null = null;
  editingCategoryName: string = '';
  searchCategoryTerm: string = '';
  filteredCategories: Category[] = [];
  nuevaCategoria: string = '';
  isModalOpen: boolean = false;
  isLoadingCategories: boolean = false;

  // ASIGNAR COLOR A CATEGORÍA
  assignModalOpen: boolean = false;
  currentColor: Color | null = null;
  selectedCategoryIds: string[] = [];
  masterSelected: boolean = false;

  // EDITAR COLORES DENTRO DE UNA CATEGORÍA
  editingCategoryColors: { [categoryId: string]: EditingCategoryColor } = {};

  uid: string = '';

  constructor(
    private auth: Auth,
    private colorService: ColorService,
    private categoryService: CategoryService
  ) {}

  ngOnInit() {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.uid = user.uid;
        this.loadColors();
        this.loadCategories();
      } else {
        console.error('No hay usuario autenticado. No se pueden cargar datos.');
      }
    });
  }

  // =========================
  // MÉTODOS PARA COLORES HISTORIAL
  // =========================
  async loadColors() {
    try {
      this.colores = await this.colorService.getColors(this.uid);
    } catch (error) {
      console.error('Error al obtener los colores:', error);
    }
  }

  async obtenerCambios() {
    this.isLoading = true;
    try {
      await this.loadColors();
    } catch (error) {
      console.error('Error al obtener cambios:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async deleteColor(color: Color) {
    if (!color.id) return;
    try {
      await this.colorService.deleteColor(this.uid, color.id);
      this.colores = this.colores.filter(c => c.id !== color.id);
    } catch (error) {
      console.error('Error al eliminar el color:', error);
    }
  }

  enableEditing(color: Color) {
    this.editingColorId = color.id || null;
    this.editingColorName = color.name;
  }

  async saveEditing(color: Color) {
    if (this.editingColorId && this.editingColorName.trim() !== '') {
      try {
        await this.colorService.updateColor(this.uid, this.editingColorId, {
          name: this.editingColorName
        });
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

  cancelEditing() {
    this.editingColorId = null;
    this.editingColorName = '';
  }

  // =========================
  // MÉTODOS PARA CATEGORÍAS
  // =========================
  async loadCategories() {
    try {
      this.categorias = await this.categoryService.getCategories(this.uid);
      this.filteredCategories = this.categorias;
    } catch (error) {
      console.error('Error al obtener las categorías:', error);
    }
  }

  async obtenerCambiosCategorias() {
    this.isLoadingCategories = true;
    try {
      await this.loadCategories();
    } catch (error) {
      console.error('Error al obtener categorías:', error);
    } finally {
      this.isLoadingCategories = false;
    }
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  async crearCategoria() {
    if (!this.nuevaCategoria.trim()) return;
    const alreadyExists = this.categorias.some(cat =>
      cat.label.toLowerCase() === this.nuevaCategoria.toLowerCase()
    );
    if (alreadyExists) {
      alert('Esta categoría ya existe');
      return;
    }
    try {
      const nueva: Category = {
        label: this.nuevaCategoria,
        content: `Contenido ${this.nuevaCategoria}`,
        colors: []
      };
      await this.categoryService.addCategory(this.uid, nueva);
      await this.loadCategories();
    } catch (error) {
      console.error('Error al crear la categoría:', error);
    }
    this.nuevaCategoria = '';
    this.closeModal();
  }

  async eliminarCategoria(categoria: Category) {
    if (!categoria.id) return;
    try {
      await this.categoryService.deleteCategory(this.uid, categoria.id);
      this.categorias = this.categorias.filter(cat => cat.id !== categoria.id);
      this.filteredCategories = this.filteredCategories.filter(cat => cat.id !== categoria.id);
    } catch (error) {
      console.error('Error al eliminar la categoría:', error);
    }
  }

  enableEditingCategory(categoria: Category) {
    this.editingCategoryId = categoria.id || null;
    this.editingCategoryName = categoria.label;
  }

  async saveEditingCategory(categoria: Category) {
    if (this.editingCategoryId && this.editingCategoryName.trim() !== '') {
      try {
        await this.categoryService.updateCategory(this.uid, this.editingCategoryId, {
          label: this.editingCategoryName
        });
        // Actualizar local
        this.categorias = this.categorias.map(cat => {
          if (cat.id === this.editingCategoryId) {
            return { ...cat, label: this.editingCategoryName };
          }
          return cat;
        });
        this.filteredCategories = this.filteredCategories.map(cat => {
          if (cat.id === this.editingCategoryId) {
            return { ...cat, label: this.editingCategoryName };
          }
          return cat;
        });
      } catch (error) {
        console.error('Error al actualizar la categoría:', error);
      }
    }
    this.cancelEditingCategory();
  }

  cancelEditingCategory() {
    this.editingCategoryId = null;
    this.editingCategoryName = '';
  }

  onSearchCategory(event: any) {
    const term = (event.target.value || '').toLowerCase();
    this.searchCategoryTerm = term;
    if (!term.trim()) {
      this.filteredCategories = this.categorias;
    } else {
      this.filteredCategories = this.categorias.filter(cat =>
        cat.label.toLowerCase().includes(term)
      );
    }
  }

  // =========================
  // MÉTODOS PARA ASIGNAR COLOR A CATEGORÍA
  // =========================
  openAssignModal(color: Color) {
    this.currentColor = color;
    this.assignModalOpen = true;
    this.selectedCategoryIds = [];
    this.masterSelected = false;
  }

  closeAssignModal() {
    this.assignModalOpen = false;
    this.currentColor = null;
    this.selectedCategoryIds = [];
    this.masterSelected = false;
  }

  toggleMasterSelection() {
    this.masterSelected = !this.masterSelected;
    if (this.masterSelected) {
      this.selectedCategoryIds = this.categorias.map(cat => cat.id!);
    } else {
      this.selectedCategoryIds = [];
    }
  }

  toggleCategorySelection(categoryId: string) {
    if (this.selectedCategoryIds.includes(categoryId)) {
      this.selectedCategoryIds = this.selectedCategoryIds.filter(id => id !== categoryId);
    } else {
      this.selectedCategoryIds.push(categoryId);
    }
    this.masterSelected = this.selectedCategoryIds.length === this.categorias.length;
  }

  async confirmAssignColor() {
    if (!this.currentColor) return;
    for (const categoryId of this.selectedCategoryIds) {
      try {
        await this.categoryService.assignColor(this.uid, categoryId, this.currentColor);
      } catch (error) {
        console.error('Error al asignar el color a la categoría:', error);
      }
    }
    await this.loadCategories();
    this.closeAssignModal();
  }

  // =========================
  // EDITAR Y ELIMINAR COLORES DENTRO DE UNA CATEGORÍA
  // =========================
  async deleteColorFromCategory(categoria: Category, color: Color) {
    if (!categoria.id) return;
    try {
      await this.categoryService.removeColor(this.uid, categoria.id, color);
      // Actualizar local
      this.categorias = this.categorias.map(cat => {
        if (cat.id === categoria.id && cat.colors) {
          return { ...cat, colors: cat.colors.filter(c => c.id !== color.id) };
        }
        return cat;
      });
      this.filteredCategories = this.filteredCategories.map(cat => {
        if (cat.id === categoria.id && cat.colors) {
          return { ...cat, colors: cat.colors.filter(c => c.id !== color.id) };
        }
        return cat;
      });
    } catch (error) {
      console.error('Error al remover el color de la categoría:', error);
    }
  }

  // Permite edición del nombre del color asignado
  enableEditingCategoryColor(categoria: Category, color: Color) {
    if (!categoria.id || !color.id) return;
    this.editingCategoryColors[categoria.id] = { colorId: color.id, newName: color.name };
  }

  async saveEditingCategoryColor(categoria: Category) {
    if (!categoria.id || !this.editingCategoryColors[categoria.id] || !categoria.colors) return;
    const { colorId, newName } = this.editingCategoryColors[categoria.id];
    if (!newName.trim()) {
      delete this.editingCategoryColors[categoria.id];
      return;
    }
    // Actualizar localmente la lista de colores
    const updatedColors = categoria.colors.map(c => {
      if (c.id === colorId) {
        return { ...c, name: newName };
      }
      return c;
    });
    try {
      // Se guarda en Firestore
      await this.categoryService.updateCategory(this.uid, categoria.id, { colors: updatedColors });
      categoria.colors = updatedColors;
    } catch (error) {
      console.error('Error al actualizar el color de la categoría:', error);
    }
    delete this.editingCategoryColors[categoria.id];
  }

  cancelEditingCategoryColor(categoria: Category) {
    if (categoria.id) {
      delete this.editingCategoryColors[categoria.id];
    }
  }
}
