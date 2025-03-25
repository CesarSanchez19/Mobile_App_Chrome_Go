import { Component } from '@angular/core';

@Component({
  selector: 'app-galeria',
  templateUrl: './galeria.component.html',
  styleUrls: ['./galeria.component.scss'],
  standalone: false
})
export class GaleriaComponent {
  nuevaCategoria: string = '';
  isModalOpen: boolean = false;
  
  categorias = [
    { value: 'favoritos', label: 'Favoritos ⭐', content: 'Contenido Favoritos' },
    { value: 'asthetic', label: 'Aesthetic', content: 'Contenido Aesthetic' },
    { value: 'brillante', label: 'Brillante', content: 'Contenido Brillante' }
  ];

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  crearCategoria() {
    if (!this.nuevaCategoria.trim()) return;

    // Verificar si la categoría ya existe
    if (this.categorias.some(cat => 
      cat.label.toLowerCase() === this.nuevaCategoria.toLowerCase())) {
      alert('Esta categoría ya existe');
      return;
    }

    // Crear nueva categoría
    const nuevaCategoria = {
      value: this.nuevaCategoria.toLowerCase().replace(/\s+/g, '-'),
      label: this.nuevaCategoria,
      content: `Contenido ${this.nuevaCategoria}`
    };
    
    this.categorias.push(nuevaCategoria);
    this.nuevaCategoria = '';
    this.closeModal();
  }

  eliminarCategoria(categoria: any) {
    // Eliminar la categoría del array
    this.categorias = this.categorias.filter(cat => cat !== categoria);
  }
}