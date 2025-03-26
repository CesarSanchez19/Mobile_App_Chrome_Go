export class CreateCategoryPage {
  categoryName: string = '';
  selectedColor: string = '';

  colors: string[] = [
    '#FF0000',  // Rojo
    '#0000FF',  // Azul
    '#008000',  // Verde
    '#FFA500'   // Naranja
  ];

  // Añade este método
  selectColor(color: string) {
    this.selectedColor = color;
  }

  createCategory() {
    if (this.categoryName && this.selectedColor) {
      console.log('Categoría creada:', {
        name: this.categoryName,
        color: this.selectedColor
      });
    } else {
      console.log('Por favor, complete todos los campos');
    }
  }
}