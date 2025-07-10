# Diagram Switcher - Variables de Tema

Este documento describe las variables CSS específicas del diagram-switcher que han sido integradas en el sistema de temas centralizado.

## Variables del Diagram Switcher

### Contenedor Principal (`.diagram-switcher`)

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `--switcher-bg` | Color de fondo del contenedor | `#ffffff` |
| `--switcher-border` | Color del borde del contenedor | `#d1d5db` |
| `--switcher-shadow` | Sombra del contenedor | `none` |
| `--switcher-padding` | Padding interno del contenedor | `15px` |
| `--switcher-border-radius` | Radio de borde del contenedor | `12px` |
| `--switcher-gap` | Espaciado entre elementos | `10px` |

### Botones de Diagrama (`.diagram-btn`)

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `--diagram-btn-bg` | Color de fondo del botón | `#ffffff` |
| `--diagram-btn-text` | Color del texto del botón | `#333333` |
| `--diagram-btn-border` | Color del borde del botón | `#d1d5db` |
| `--diagram-btn-border-hover` | Color del borde en hover | `#9ca3af` |
| `--diagram-btn-border-active` | Color del borde cuando está activo | `#1976d2` |
| `--diagram-btn-bg-active` | Color de fondo cuando está activo | `#1976d2` |
| `--diagram-btn-text-active` | Color del texto cuando está activo | `#ffffff` |
| `--diagram-btn-bg-disabled` | Color de fondo cuando está deshabilitado | `#f5f5f5` |
| `--diagram-btn-text-disabled` | Color del texto cuando está deshabilitado | `#9ca3af` |
| `--diagram-btn-border-disabled` | Color del borde cuando está deshabilitado | `#d1d5db` |
| `--diagram-btn-shadow` | Sombra del botón | `none` |
| `--diagram-btn-shadow-hover` | Sombra del botón en hover | `none` |
| `--diagram-btn-border-radius` | Radio de borde del botón | `8px` |
| `--diagram-btn-padding` | Padding del botón | `10px 20px` |
| `--diagram-btn-min-width` | Ancho mínimo del botón | `200px` |

### Botón de Cambio de Tema (`.theme-toggle`)

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `--theme-toggle-bg` | Color de fondo del botón | `#ffffff` |
| `--theme-toggle-border` | Color del borde del botón | `#d1d5db` |
| `--theme-toggle-border-hover` | Color del borde en hover | `#9ca3af` |
| `--theme-toggle-text` | Color del icono | `#333333` |
| `--theme-toggle-shadow` | Sombra del botón | `rgba(0, 0, 0, 0.1)` |
| `--theme-toggle-size` | Tamaño del botón (ancho y alto) | `40px` |
| `--theme-toggle-border-radius` | Radio de borde del botón | `50%` |
| `--theme-icon-size` | Tamaño del icono | `18px` |

### Encabezado del Switcher (`.switcher-header`)

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `--switcher-header-margin` | Margen inferior del encabezado | `10px` |

## Ejemplo de Configuración

```json
{
  "snow": {
    "--switcher-bg": "#ffffff",
    "--switcher-border": "#d1d5db",
    "--diagram-btn-bg": "#ffffff",
    "--diagram-btn-text": "#333333",
    "--diagram-btn-border": "#d1d5db",
    "--diagram-btn-bg-active": "#1976d2",
    "--diagram-btn-text-active": "#ffffff",
    "--theme-toggle-bg": "#ffffff",
    "--theme-toggle-border": "#d1d5db",
    "--theme-toggle-text": "#333333"
  },
  "onyx": {
    "--switcher-bg": "#23272f",
    "--switcher-border": "#333",
    "--diagram-btn-bg": "#23272f",
    "--diagram-btn-text": "#f6f7f9",
    "--diagram-btn-border": "#333",
    "--diagram-btn-bg-active": "#00eaff",
    "--diagram-btn-text-active": "#181c24",
    "--theme-toggle-bg": "#23272f",
    "--theme-toggle-border": "#333",
    "--theme-toggle-text": "#f6f7f9"
  }
}
```

## Estados de los Botones

### Estado Normal
- Fondo: `--diagram-btn-bg`
- Texto: `--diagram-btn-text`
- Borde: `--diagram-btn-border`

### Estado Hover
- Fondo: `--diagram-btn-bg` (sin cambio)
- Borde: `--diagram-btn-border-hover`
- Sombra: `--diagram-btn-shadow-hover`

### Estado Activo
- Fondo: `--diagram-btn-bg-active`
- Texto: `--diagram-btn-text-active`
- Borde: `--diagram-btn-border-active`

### Estado Deshabilitado
- Fondo: `--diagram-btn-bg-disabled`
- Texto: `--diagram-btn-text-disabled`
- Borde: `--diagram-btn-border-disabled`
- Opacidad: `0.5`

## Compatibilidad

Todas las variables tienen valores de fallback que utilizan las variables de control existentes (`--control-bg`, `--control-text`, etc.) para mantener la compatibilidad con temas que no definan estas nuevas variables.

## Implementación

Las variables se aplican automáticamente cuando se carga un tema desde `themes.json`. El sistema de temas centralizado maneja la carga y aplicación de estas variables de la misma manera que las variables existentes.

## Personalización

Para personalizar el diagram-switcher en un tema específico:

1. Abre `src/themes.json`
2. Localiza el tema que quieres modificar
3. Agrega o modifica las variables del diagram-switcher
4. Guarda el archivo
5. Recarga la página para ver los cambios

Las variables no definidas en un tema específico utilizarán los valores de fallback del CSS. 