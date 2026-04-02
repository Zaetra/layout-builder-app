# Bootstrap Layout Builder - Angular

Constructor visual de layouts Bootstrap con interfaz drag-and-drop.

## Requisitos

- Node.js 18+ 
- npm o yarn

## Instalación

```bash
cd layout-builder-app
npm install
```

## Ejecución

```bash
npm start
```

Abre tu navegador en `http://localhost:4200`

## Funcionalidades

- **Presets de filas**: Selecciona entre diferentes configuraciones de columnas (1, 2, 3, 4 columnas)
- **Agregar columnas**: Botones rápidos para añadir columnas de diferentes tamaños
- **Vista de diseño**: Editor visual en tiempo real
- **Vista de código**: HTML generado con opción de copiar
- **Gestión de filas**: Agregar/elminar columnas individuales o filas completas

## Estructura del Proyecto

```
src/
├── app/
│   ├── components/
│   │   ├── sidebar/          # Panel lateral con herramientas
│   │   ├── layout-area/      # Área de diseño visual
│   │   └── code-preview/     # Vista de código HTML
│   ├── interfaces/           # Definiciones de tipos
│   ├── services/             # Lógica de negocio (LayoutService)
│   └── app.component.ts      # Componente principal
├── styles.scss               # Estilos globales
└── index.html                # Punto de entrada HTML
```

## Tecnologías

- Angular 17 (standalone components, signals)
- Bootstrap 5.3
- Font Awesome 6
- SCSS
