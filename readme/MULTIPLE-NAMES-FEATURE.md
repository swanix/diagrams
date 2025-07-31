# Multiple Names Feature

## Descripción

Esta funcionalidad permite que cuando una columna de auto imagen contenga múltiples nombres separados por comas, el sistema los trate como personas individuales, cada una con el rol correspondiente a la columna.

## Funcionalidad Implementada

### 1. División de Nombres Múltiples

Cuando el sistema encuentra una columna configurada para auto imágenes con múltiples nombres separados por comas, automáticamente:

- Divide la cadena por comas
- Elimina espacios en blanco de cada nombre
- Filtra nombres vacíos
- Crea un miembro del equipo individual para cada nombre

### 2. Asignación de Roles

Cada nombre individual hereda el rol de la columna donde aparece:

- **Columna "Developer"** → Rol: "Developer"
- **Columna "Designer"** → Rol: "Designer"  
- **Columna "Writer"** → Rol: "Writer"
- **Columna "Manager"** → Rol: "Manager"

### 3. Imágenes Automáticas

Cada nombre individual:
- Busca su imagen automática correspondiente
- Usa `default.png` como fallback si no encuentra imagen
- Muestra la imagen en el sidebar del equipo

## Ejemplo de Uso

### Datos de Entrada
```csv
ID,Name,Developer,Designer,Writer
1,Proyecto A,Alice Thompson, Bob Martinez,Emily Johnson
```

### Resultado en el Sidebar
El sidebar mostrará 3 miembros del equipo:

1. **Alice Thompson** - Developer
2. **Bob Martinez** - Designer  
3. **Emily Johnson** - Writer

Cada uno con su imagen automática correspondiente.

## Configuración

### Habilitar la Funcionalidad
```javascript
options: {
  autoImages: true,
  autoImageColumns: ["Developer", "Designer", "Writer", "Manager"]
}
```

### Formato de Datos
Los nombres pueden estar separados por comas con o sin espacios:
- `"Alice Thompson, Bob Martinez,Emily Johnson"`
- `"Alice Thompson,Bob Martinez,Emily Johnson"`
- `"Alice Thompson, Bob Martinez , Emily Johnson"`

## Archivos de Prueba

### `src/data/test-multiple-names.csv`
Archivo de prueba que demuestra:
- Múltiples nombres por columna
- Diferentes roles (Developer, Designer, Writer, Manager)
- Varios proyectos con equipos diferentes

## Beneficios

- **Flexibilidad**: Permite múltiples personas por rol
- **Escalabilidad**: Fácil de agregar o quitar personas
- **Claridad**: Cada persona tiene su rol claramente definido
- **Consistencia**: Mantiene el sistema de imágenes automáticas

## Compatibilidad

Esta funcionalidad es compatible con:
- Todas las configuraciones existentes de auto imágenes
- El sistema de fallback a `default.png`
- El cache global de imágenes automáticas
- Todas las funcionalidades del sidebar existentes

## Flujo de Procesamiento

1. **Lectura**: Se lee el valor de la columna configurada
2. **División**: Se divide por comas y se limpian los nombres
3. **Creación**: Se crea un objeto por cada nombre individual
4. **Búsqueda**: Se busca la imagen automática para cada nombre
5. **Renderizado**: Se genera el HTML para cada miembro del equipo 