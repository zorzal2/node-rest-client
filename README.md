# Typescript empty project

Es un proyecto de typescript preconfigurado con scripts, TSLint, Jest, .gitignore, etc. para usar como base de aplicaciones y librerías.

## Uso

### 1.Fork

Hacer un fork de este proyecto y usar como base.

### 2. Adecuar package.json

Poner los valores adecuados en los campos:

- name: ejemplo, "@zorzal2/mi-proyecto",
- "version": "0.1.0" está bien para empezar. Usar las reglas de [versionado semántico](https://semver.org/lang/es/),
- "description": Una descripción corta,
- "author"
- "bugs"
- "repository"

### Instalar dependencias

Ejecutar `npm install`.

### Codear

Respetar la estructura. Todo el código fuente debe quedar dentro de la carpeta src.
- `src/index.ts`: El punto de entrada del proyecto.
- `src/conf/index.ts`: Configuración.
- `test/`: Los tests van acá.
- `dist/`: acá se guardan los archivos compilados.

### Usar los scripts

Los principales:

`npm test`
Ejecuta todos los tests y cobertura.

`npm run-script build`
Compilación y validación de fuentes.

`npm start`
Ejecuta el proyecto (sin compilarlo antes)

`npm run-script launch`
Compila y luego ejecuta el proyecto.

### Reemplazar este archivo

Documentar en este archivo (respetando la sintaxis de Markdown) lo necesario para que pueda ser usado.

