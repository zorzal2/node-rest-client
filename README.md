# Typescript empty project

Es un proyecto de typescript preconfigurado con scripts, TSLint, Jest, .gitignore, etc. para usar como base de aplicaciones y librerías.

## Uso

### 1.Copiá este proyecto en un repositorio nuevo

Estando logueado en GitHub, navegá a la url [https://github.com/new/import](https://github.com/new/import).

En el primer campo de texto, poné la URL de este repositorio: https://github.com/zorzal2/typescript-empty-project

Elegí un owner. Para los proyectos de Zorzal 2, hay que elegir la opción `Zorzal2`, que debería estar disponible para los miembros. Usá tu nombre de usuario para proyectos propios o pruebas.

Escribí un nombre de proyecto con estos criterios:
- Usá un nombre corto. 
- Como el proyecto ya tiene el prefijo `zorzal2`, no incluyas "zorzal", "anpcyt" o "agencia" en el nombre porque no es necesario. 
- Si el proyecto es una librería genérica de la que puede haber versiones para distintas plataformas, usá un prefijo (por ejemplo `node-` o `java-`) para identificar a qué plataforma está dirijido.
- Usá un nombre en inglés.

Ejemplos de nombres buenos y malos:
- `zorzal-rest-client`: **mal**. El nombre completo es redundante: `zorzal2/zorzal-rest-client`.
- `rest-client`: **mal**. No está claro para qué plataforma sirve. Es más correcto: `node-rest-client`
- `validador-de-proyectos`: **mal** y peor todavía `validador-proyectos`. Usá `project-validator` a menos que tengas buenas razones.
- `node-string-util`: **bien**.
- `bpm`: **bien**. Es corto y conciso y, como tiene el prefijo zorzal2, se entiende que es la aplicación que implementa un BPM para Zorzal 2. Como no es una librería, no se espera tener una versión paralela en otra tecnología.

Privacidad: los proyectos de Zorzal 2 usan, por ahora, la opción Public, mientras no tengamos una cuenta paga.

### 2. Adecuá el package.json

Poné los valores adecuados en los campos:

- **name:** ejemplo, "@zorzal2/rest-client". Usá el mismo nombre del proyecto en GitHub, salvo si tiene prefijo que identifica la plataforma. En este caso, sacale el prefijo, porque este es el nombre para NPM que es específicamente para NodeJs.
- **version:** El valor `0.1.0` es el correcto para la primera versión. Usar las reglas de [versionado semántico](https://semver.org/lang/es/).
- **description:** Una descripción corta.
- **author:** Tu nombre, username o apodo.
- **bugs**
- **repository** 

### Instalá las dependencias

Ejecutá `npm install` en la raíz del proyecto.

### Empezá a codear

Respetá la estructura a menos que tengas muy buenas razones para hacer las cosas de forma diferente. Todo el código fuente debe quedar dentro de la carpeta src.

- `src/index.ts`: El punto de entrada del proyecto.
- `src/conf/index.ts`: Configuración.
- `test/`: Los tests van acá. La sintaxis de tests es la de [Jest](https://jestjs.io/).
- `dist/`: acá se guardán los archivos compilados.

### Usá los scripts

Los principales:

`npm test`
Ejecuta todos los tests y cobertura.

`npm run-script build`
Compilación y validación de fuentes.

`npm start`
Ejecuta el proyecto (sin compilarlo antes)

`npm run-script launch`
Compila y luego ejecuta el proyecto.

### Publicá

Si estás escribiendo una librería, tenés que publicarla en NPM para que se pueda usar desde otro proyecto. Para esto ejecutá `npm publish --access public` en la raíz del proyecto.

### Reemplazá este archivo

Documentá en este archivo (respetando la sintaxis de Markdown) lo necesario para que pueda ser entendido por los demás.

