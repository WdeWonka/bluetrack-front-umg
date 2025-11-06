# Bluetrack Frontend - UMG

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css)
![HeroUI](https://img.shields.io/badge/HeroUI-Components-purple)
![pnpm](https://img.shields.io/badge/pnpm-Package%20Manager-F69220?logo=pnpm)
![Status](https://img.shields.io/badge/Status-Stable-brightgreen)

Frontend de Bluetrack, desarrollado con Next.js, TypeScript y HeroUI.  
Interfaz moderna y responsiva para la gestión de inventarios y distribución de agua.

---

## Project Status

Bluetrack Frontend se encuentra en **versión estable inicial**.  
Colaboradores deben crear ramas separadas para nuevas funcionalidades y enviar pull requests para revisión antes de mergear a `main`.  
¡Happy coding! 🚀

---

## Requirements

Antes de levantar el proyecto asegúrate de tener instalados:

- **Node.js 18+** (recomendado: 20 LTS)
- **pnpm** (gestor de paquetes)
- **Git**
- Opcional: editor como **VS Code** para desarrollo

### Instalar pnpm

Si no tienes pnpm instalado:

```bash
npm install -g pnpm
```

---

## Installation

1. Clonar el repositorio:

```bash
git clone https://github.com/<tu-usuario>/bluetrack-frontend-umg.git
```

2. Navegar al directorio del proyecto:

```bash
cd bluetrack-frontend-umg
```

3. Instalar dependencias:

```bash
pnpm install
```

---

## Configuration

4. Dentro de root `./`, crear el archivo `.env.local` para configurar las variables de entorno:

```bash
cp .env.example .env.local
```

**Guiarse del archivo `env.example`**

### Variables de entorno requeridas:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
# Agregar otras variables según sea necesario
```

---

## Usage

### Development

Para correr el proyecto en modo desarrollo:

```bash
pnpm dev
```

El proyecto estará disponible en [http://localhost:3000](http://localhost:3000)

### Build

Para crear una versión de producción:

```bash
pnpm build
```

### Production

Para correr la versión de producción:

```bash
pnpm start
```

### Linting

Para verificar el código:

```bash
pnpm lint
```

---

## Tech Stack

- **[Next.js](https://nextjs.org/)** - Framework de React para producción
- **[TypeScript](https://www.typescriptlang.org/)** - Tipado estático para JavaScript
- **[HeroUI](https://www.heroui.com/)** - Biblioteca de componentes UI
- **[Tailwind CSS](https://tailwindcss.com/)** - Framework de CSS utility-first
- **[pnpm](https://pnpm.io/)** - Gestor de paquetes rápido y eficiente

---



## Contributing

1. Crear una nueva rama desde `main`:
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```

2. Hacer commits descriptivos:
   ```bash
   git commit -m "feat: agregar nueva funcionalidad"
   ```

3. Push a tu rama:
   ```bash
   git push origin feature/nueva-funcionalidad
   ```

4. Crear un Pull Request para revisión

---

## License

Este proyecto es parte de un proyecto académico de la Universidad Mariano Gálvez.

---

## Contact

Para dudas o sugerencias, contactar al equipo de desarrollo.
