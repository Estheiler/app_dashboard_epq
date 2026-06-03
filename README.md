# Dashboard EPQ - Flujo Seguro de Desarrollo y Despliegues

Este proyecto utiliza **React** y **Vite** para el frontend, estructurando un laboratorio de desarrollo seguro y despliegues automáticos (CI/CD) a través de GitHub Actions.

---

## 1. Estrategia de Ramas en Git

Para garantizar la estabilidad del sitio en producción, se implementa el siguiente flujo de trabajo:

1. **`main` (Producción)**:
   * Representa la versión estable del dashboard desplegada en producción.
   * **Protegida**: No se permiten push directos. Todo cambio debe llegar mediante un **Pull Request (PR)** aprobado desde la rama `develop`.
2. **`develop` (Desarrollo / Laboratorio)**:
   * Rama base de integración y pruebas generales.
   * Al recibir cambios (push o merge), despliega automáticamente al entorno de pruebas (Staging) sin afectar el sitio de producción.
3. **`feature/*` (Nuevas Funcionalionalidades)**:
   * Ramas temporales creadas a partir de `develop` para trabajar en tareas específicas (ej. `feature/nueva-grafica`, `feature/mejoras-kpi`).
   * Al terminar, se crea un PR para fusionarse de vuelta en `develop`.

### Flujo Típico de Trabajo:
```bash
# 1. Asegúrate de estar en develop y actualizado
git checkout develop
git pull origin develop

# 2. Crea tu rama feature
git checkout -b feature/nombre-de-tu-mejora

# 3. Realiza tus cambios y haz commits descriptivos
git add .
git commit -m "Detalle de los cambios en español"

# 4. Sube la rama a GitHub
git push -u origin feature/nombre-de-tu-mejora

# 5. En GitHub, abre un PR de 'feature/nombre-de-tu-mejora' hacia 'develop'
# 6. Una vez probado en staging (rama develop), abre un PR de 'develop' hacia 'main'
```

---

## 2. Variables de Entorno

El proyecto soporta variables de entorno nativas de Vite utilizando el prefijo `VITE_`. Se han creado dos archivos de configuración base:

* **`.env.development`**: Configuración para desarrollo local y pruebas (Staging).
  * `VITE_API_URL`: Apunta al servidor local de desarrollo o al backend de pruebas (ej. `http://localhost:8000`).
* **`.env.production`**: Configuración para producción.
  * `VITE_API_URL`: Apunta al servidor backend productivo desplegado en Hostinger (ej. `https://api.tu-dominio-hostinger.com`).

*Nota: Para consumir las variables en el código de React se usa `import.meta.env.VITE_API_URL`.*

---

## 3. Despliegues Automáticos (CI/CD)

El repositorio cuenta con dos flujos de GitHub Actions en la carpeta `.github/workflows/`:

### A. Despliegue de Producción (`deploy.yml`)
* **Disparador**: Push o combinación de PR en la rama `main`.
* **Acción**: Construye el proyecto en modo producción (`npm run build`) y sube la carpeta `dist` a la raíz del hosting productivo mediante FTP.
* **Secretos requeridos**:
  * `FTP_SERVER`: IP o host del servidor FTP productivo.
  * `FTP_USERNAME`: Usuario FTP de producción.
  * `FTP_PASSWORD`: Contraseña FTP de producción.

### B. Despliegue de Pruebas / Staging (`deploy-develop.yml`)
* **Disparador**: Push o combinación de PR en la rama `develop`.
* **Acción**: Construye el proyecto usando las variables de desarrollo (`npm run build -- --mode development`) y sube la carpeta `dist` al directorio de desarrollo mediante FTP.
* **Secretos requeridos** (deben crearse en Settings > Secrets and variables > Actions en tu repositorio de GitHub):
  * `FTP_DEVELOP_SERVER`: Host FTP del entorno de pruebas.
  * `FTP_DEVELOP_USERNAME`: Usuario FTP del entorno de pruebas.
  * `FTP_DEVELOP_PASSWORD`: Contraseña FTP del entorno de pruebas.
  * `FTP_DEVELOP_SERVER_DIR`: Directorio destino en el FTP de pruebas (ej. `./staging/` o la ruta de tu subdominio).

---

## 4. Comandos Locales Útiles

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo local
npm run dev

# Compilar proyecto para producción
npm run build

# Compilar proyecto para desarrollo / pruebas (carga .env.development)
npm run build -- --mode development

# Previsualizar la compilación localmente
npm run preview
```
