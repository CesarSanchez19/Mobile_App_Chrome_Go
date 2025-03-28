# Chroma Go

Chroma Go es una aplicación web y móvil diseñada para identificar y extraer los colores principales de una imagen seleccionada por el usuario. Su propósito es proporcionar una herramienta rápida y eficiente para diseñadores, artistas y cualquier persona interesada en analizar los colores de una imagen.

## 📌 Características
- Extrae el color dominante de cualquier imagen.
- Genera una paleta de colores basada en los tonos predominantes.
- Compatible con dispositivos móviles y navegadores web.
- Usa **Color Thief** para analizar imágenes y extraer sus colores principales.
- Permite almacenar datos en **Firebase Firestore**.
- Desarrollado con **Ionic**, **Angular** y **Capacitor**, lo que facilita su despliegue tanto en web como en dispositivos Android.
- Interfaz intuitiva y amigable para una experiencia de usuario fluida.

## 🚀 Tecnologías utilizadas

| Tecnología | Descripción | Logo |
|------------|-------------|------|
| [Ionic Framework](https://ionicframework.com/) | Framework para el desarrollo de aplicaciones híbridas, que permite crear aplicaciones móviles y web desde una única base de código. | ![Ionic](https://ionicframework.com/img/meta/ionic-framework-og.png) |
| [Angular](https://angular.io/) | Framework para construir interfaces web dinámicas y escalables con arquitectura modular. | ![Angular](https://angular.io/assets/images/logos/angular/angular.svg) |
| [Capacitor](https://capacitorjs.com/) | Plataforma que facilita la conversión de aplicaciones web en aplicaciones nativas móviles. | ![Capacitor](https://capacitorjs.com/assets/img/logo-docs.svg) |
| [Color Thief](https://lokeshdhakar.com/projects/color-thief/) | Biblioteca en JavaScript que permite extraer colores dominantes de imágenes mediante análisis de píxeles. | No tiene logo oficial |
| [Firebase Firestore](https://firebase.google.com/products/firestore) | Base de datos NoSQL en la nube que permite almacenamiento y sincronización de datos en tiempo real. | ![Firestore](https://firebase.google.com/static/downloads/brand-guidelines/PNG/logo-built_black.png) |

## 🎨 ¿Cómo funciona?
1. **Selección de imagen:** El usuario carga una imagen desde su dispositivo o toma una foto en tiempo real.
2. **Análisis de colores:** La aplicación utiliza **Color Thief** para analizar los píxeles de la imagen y extraer los colores dominantes.
3. **Generación de paleta:** Se presentan los colores obtenidos en una interfaz limpia y fácil de visualizar.
4. **Almacenamiento de datos:** Si el usuario desea guardar su análisis, los datos pueden ser almacenados en **Firebase Firestore**, permitiendo consultarlos posteriormente.

## 🏗️ Componentes de la aplicación

La aplicación está dividida en varios componentes clave:

### 1️⃣ **LoginComponent**
- Permite a los usuarios iniciar sesión en la aplicación con sus credenciales.
- Autenticación integrada con Firebase.

### 2️⃣ **SignUpComponent**
- Permite a los nuevos usuarios registrarse en la plataforma.
- Validación de datos y almacenamiento seguro en Firebase.

### 3️⃣ **InicioComponent**
- Pantalla principal donde el usuario puede cargar una imagen para analizar sus colores.
- Muestra una breve guía de uso y opciones rápidas.

### 4️⃣ **GaleriaComponent**
- Contiene el historial de imágenes analizadas previamente por el usuario.
- Organiza las imágenes en categorías según su contenido y uso.

### 5️⃣ **PerfilComponent**
- Muestra la información del usuario registrado.
- Permite editar datos personales y cambiar configuraciones de la aplicación.

## 📂 Instalación y ejecución

Para ejecutar la aplicación en versión web o móvil, sigue estos pasos:

### 1️⃣ Clonar el repositorio
```sh
git clone https://github.com/CesarSanchez19/Mobile_App_Chrome_Go.git
cd Mobile_App_Chrome_Go
```

### 2️⃣ Instalar dependencias
```sh
npm install --legacy-peer-deps
```

### 3️⃣ Ejecutar en versión web
```sh
ionic serve
```

### 4️⃣ Ejecutar en versión móvil (Android)
> Si deseas probar la aplicación en un dispositivo móvil, asegúrate de tener **Android Studio** instalado.

```sh
ionic build
npx cap sync android
npx cap copy android
npx cap open android
```

## 👨‍💻 Creadores del proyecto
- Avilés Pérez Jorge Tadeo
- Balbuena Caballero Diego
- Castillo Rodríguez Enrique
- Guzmán Pérez Yair Gamaliel
- Sánchez Trejo Cesar David
- Santos Absalón Aaron de Jesús
- Tamay Balam Jesús Iván

## 📜 Licencia
Este proyecto está bajo la licencia MIT. Puedes usarlo y modificarlo libremente respetando los términos de la licencia.
