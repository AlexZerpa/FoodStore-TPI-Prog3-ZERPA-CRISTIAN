# 🍔 Food Store — Frontend Web (TPI Programación III)

**Alumno:** Zerpa Cristian  
**Carrera:** Tecnicatura Universitaria en Programación — UTN  
**Materia:** Programación III (Trabajo Práctico Integrador - Parte 1)


## ENLACE AL VIDEO
....

## ENLACE A GITHUB
https://github.com/AlexZerpa/FoodStore-Prog3-ZERPA-CRISTIAN


## ✍️ Descripción

Aplicación web frontend del sistema de gestión de pedidos de comida **Food Store**, desarrollada con **Vite**, **TypeScript**, **HTML5** y **CSS3**.

En esta iteración, el frontend opera de manera independiente al backend consumiendo los recursos desde archivos `.json` locales ubicados en `public/data/` mediante `fetch()` aislado en `src/utils/api.ts`, lo que permite reemplazar fácilmente dichas rutas por endpoints de una API REST en una etapa posterior.

---

## 🔐 Credenciales de Prueba

Para evaluar ambos roles del sistema, utilizá las siguientes cuentas definidas en `public/data/usuarios.json`:

### Rol Administrador (`ADMIN`)
- **Email:** `admin@admin.com`
- **Contraseña:** `123456`

### Rol Cliente (`USUARIO`)
- **Email:** `cliente@food.com`
- **Contraseña:** `cliente123`

*(También es posible registrar nuevos clientes con rol `USUARIO` desde la pantalla de registro, con validación de email único y auto-login).*

---

## 🚚 Configuración de Envío

- **Constante de envío (`COSTO_ENVIO`):** `$500` (definida en `src/pages/store/cart/cart.ts`).
- El total de cada pedido se calcula automáticamente como `total = subtotal + COSTO_ENVIO`.

---

## ⚠️ ¡Importante! Nivel de Seguridad

La autenticación, la gestión de sesión (userData), el carrito (cart) y las operaciones en memoria se gestionan en el navegador mediante localStorage con fines exclusivamente académicos.

Las contraseñas se validan en texto plano contra usuarios.json y se excluyen antes de almacenar la sesión en localStorage.

---

## 🚀 Instalación y Uso

Asegurate de tener instalado **Node.js** (v18 o superior) y ejecutá los siguientes comandos dentro de la carpeta `frontend/`:

### 1. Instalar dependencias
```bash
npm install

### 3. Ejecutar el Proyecto

Para iniciar el servidor de desarrollo de Vite, ejecuta:

```bash
npm run dev
```

La aplicación estará disponible en la URL que aparezca en la terminal (generalmente `http://localhost:5173`).

---



## 📁 Estructura del Proyecto

frontend/
├── public/
│   └── data/                     # Fuente de datos JSON locales
│       ├── categorias.json
│       ├── productos.json
│       ├── usuarios.json
│       └── pedidos.json
├── src/
│   ├── pages/
│   │   ├── admin/                # Panel de Administración (solo rol ADMIN)
│   │   │   ├── adminHome/        # Dashboard con estadísticas
│   │   │   ├── categories/       # CRUD de categorías en memoria
│   │   │   ├── products/         # CRUD de productos en memoria
│   │   │   └── orders/           # Gestión y cambio de estado de pedidos
│   │   ├── auth/                 # Autenticación
│   │   │   ├── login/            # Inicio de sesión
│   │   │   └── register/         # Registro con validaciones y auto-login
│   │   ├── client/
│   │   │   └── orders/           # Historial de pedidos del cliente
│   │   └── store/                # Tienda del cliente
│   │       ├── home/             # Catálogo con filtros, búsqueda y ordenamiento
│   │       ├── productDetail/    # Detalle de producto y validación de stock
│   │       └── cart/             # Carrito de compras y checkout
│   ├── types/                    # Interfaces y tipos TypeScript
│   ├── utils/                    # Capa fetch (api.ts), auth, storage y navegación
│   ├── main.ts
│   └── style.css
├── index.html                    # Redirección inicial al login
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
