import { logout } from "../../../utils/auth";
import { navigate } from "../../../utils/navigate";
import { getCategorias, getProductos } from "../../../utils/api";
import type { IUser } from "../../../types/IUser";
import type { ICategoria } from "../../../types/categoria";
import type { IProduct, ICartItem } from "../../../types/product";

// 1. Validar sesión y mostrar el nombre del usuario conectado
const userRaw = localStorage.getItem("userData");
if (!userRaw) {
  navigate("/src/pages/auth/login/login.html");
} else {
  const user: IUser = JSON.parse(userRaw);
  const userNameEl = document.getElementById("user-name");
  if (userNameEl) userNameEl.textContent = user.nombre;
  if (user.rol === "ADMIN") {
    const adminLink = document.getElementById("admin-panel-link");
    if (adminLink) adminLink.style.display = "inline-block";
  }
}

document.getElementById("btn-logout")?.addEventListener("click", () => {
  logout();
});

// 2. Gestión del carrito en localStorage y actualización del badge
function obtenerCarrito(): ICartItem[] {
  const raw = localStorage.getItem("cart");
  return raw ? JSON.parse(raw) : [];
}

function guardarCarrito(cart: ICartItem[]): void {
  localStorage.setItem("cart", JSON.stringify(cart));
  actualizarBadgeCarrito();
}

function actualizarBadgeCarrito(): void {
  const cart = obtenerCarrito();
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const badge = document.getElementById("cart-count");
  if (badge) badge.textContent = String(totalItems);
}

function agregarAlCarrito(producto: IProduct): void {
  const cart = obtenerCarrito();
  const existente = cart.find((item) => item.product.id === producto.id);

  if (existente) {
    if (existente.quantity < producto.stock) {
      existente.quantity += 1;
    } else {
      alert(`Stock máximo alcanzado (${producto.stock} disponibles).`);
      return;
    }
  } else {
    if (producto.stock > 0) {
      cart.push({ product: producto, quantity: 1 });
    } else {
      alert("Este producto no tiene stock disponible.");
      return;
    }
  }

  guardarCarrito(cart);
}

// 3. Variables de estado del catálogo
let categorias: ICategoria[] = [];
let productos: IProduct[] = [];
let categoriaSeleccionada: number | "ALL" = "ALL";
let textoBusqueda = "";
let criterioOrden = "default";

const categoryListEl = document.getElementById("category-list") as HTMLDivElement;
const productsGridEl = document.getElementById("products-grid") as HTMLDivElement;
const statusPillEl = document.getElementById("status-pill") as HTMLDivElement;
const searchInputEl = document.getElementById("search-input") as HTMLInputElement;
const sortSelectEl = document.getElementById("sort-select") as HTMLSelectElement;

// Helper para obtener siempre el ID de categoría sin importar el formato del JSON
function getProductCategoryId(prod: IProduct): number | undefined {
  return prod.categoriaId ?? prod.categoria?.id;
}

// 4. Renderizar sidebar de categorías
function renderCategorias(): void {
  const activas = categorias.filter((c) => !c.eliminado);

  let html = `<button class="cat-btn ${categoriaSeleccionada === "ALL" ? "active" : ""}" data-cat="ALL">Todos los productos</button>`;
  html += activas
    .map(
      (cat) =>
        `<button class="cat-btn ${categoriaSeleccionada === cat.id ? "active" : ""}" data-cat="${cat.id}">${cat.nombre}</button>`
    )
    .join("");

  categoryListEl.innerHTML = html;

  categoryListEl.querySelectorAll<HTMLButtonElement>(".cat-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const val = btn.dataset.cat;
      categoriaSeleccionada = val === "ALL" ? "ALL" : Number(val);
      renderCategorias();
      renderProductos();
    });
  });
}

// 5. Filtrar, ordenar y renderizar productos
function renderProductos(): void {
  // Solo productos disponibles y no eliminados
  let filtrados = productos.filter((p) => p.disponible && !p.eliminado);

  let nombreCatActual = "Todos los productos";
  if (categoriaSeleccionada !== "ALL") {
    filtrados = filtrados.filter((p) => getProductCategoryId(p) === categoriaSeleccionada);
    const catObj = categorias.find((c) => c.id === categoriaSeleccionada);
    if (catObj) nombreCatActual = catObj.nombre;
  }

  if (textoBusqueda.trim() !== "") {
    const q = textoBusqueda.toLowerCase().trim();
    filtrados = filtrados.filter((p) => p.nombre.toLowerCase().includes(q));
  }

  // Ordenamiento
  if (criterioOrden === "az") {
    filtrados.sort((a, b) => a.nombre.localeCompare(b.nombre));
  } else if (criterioOrden === "za") {
    filtrados.sort((a, b) => b.nombre.localeCompare(a.nombre));
  } else if (criterioOrden === "price-asc") {
    filtrados.sort((a, b) => a.precio - b.precio);
  } else if (criterioOrden === "price-desc") {
    filtrados.sort((a, b) => b.precio - a.precio);
  }

  statusPillEl.textContent = `Categoría: ${nombreCatActual} · ${filtrados.length} producto(s)`;

  if (filtrados.length === 0) {
    productsGridEl.innerHTML = `<p style="color: #6b7280; grid-column: 1 / -1;">No se encontraron productos.</p>`;
    return;
  }

  productsGridEl.innerHTML = filtrados
    .map((prod) => {
      const catId = getProductCategoryId(prod);
      const cat = categorias.find((c) => c.id === catId);
      const nombreCategoria = cat ? cat.nombre : prod.categoria?.nombre || "General";

      return `
        <article class="product-card" data-id="${prod.id}">
          <img
            src="${prod.imagen}"
            alt="${prod.nombre}"
            class="product-img"
            onerror="this.src='https://via.placeholder.com/300x175?text=FoodStore'"
          />
          <span class="product-cat-tag">${nombreCategoria}</span>
          <h3 class="product-title">${prod.nombre}</h3>
          <p class="product-desc">${prod.descripcion}</p>
          <div class="product-footer">
            <span class="product-price">$${prod.precio.toLocaleString("es-AR")}</span>
            <button type="button" class="btn-add-cart" data-add="${prod.id}">+ Agregar</button>
          </div>
        </article>
      `;
    })
    .join("");

  // Click en la tarjeta -> ir a detalle del producto
  productsGridEl.querySelectorAll<HTMLElement>(".product-card").forEach((card) => {
    card.addEventListener("click", () => {
      const id = card.dataset.id;
      navigate(`/src/pages/store/productDetail/productDetail.html?id=${id}`);
    });
  });

  // Click en "+ Agregar" -> sumar al carrito sin abrir el detalle
  productsGridEl.querySelectorAll<HTMLButtonElement>("[data-add]").forEach((btn) => {
    btn.addEventListener("click", (e: MouseEvent) => {
      e.stopPropagation();
      const id = Number(btn.dataset.add);
      const prod = productos.find((p) => p.id === id);
      if (prod) agregarAlCarrito(prod);
    });
  });
}

// Eventos de búsqueda y ordenamiento
searchInputEl.addEventListener("input", () => {
  textoBusqueda = searchInputEl.value;
  renderProductos();
});

sortSelectEl.addEventListener("change", () => {
  criterioOrden = sortSelectEl.value;
  renderProductos();
});

// Carga inicial
async function init(): Promise<void> {
  actualizarBadgeCarrito();
  try {
    [categorias, productos] = await Promise.all([getCategorias(), getProductos()]);
    renderCategorias();
    renderProductos();
  } catch (error) {
    console.error("Error al cargar datos del catálogo:", error);
    statusPillEl.textContent = "Error al cargar los productos.";
  }
}

init();