import { logout } from "../../../utils/auth";
import { navigate } from "../../../utils/navigate";
import { getProductos } from "../../../utils/api";
import type { IUser } from "../../../types/IUser";
import type { IProduct, ICartItem } from "../../../types/product";

// 1. Validar sesión
const userRaw = localStorage.getItem("userData");
if (!userRaw) {
  navigate("/src/pages/auth/login/login.html");
} else {
  const user: IUser = JSON.parse(userRaw);
  const userNameEl = document.getElementById("user-name");
  if (userNameEl) userNameEl.textContent = user.nombre;
}

document.getElementById("btn-logout")?.addEventListener("click", () => {
  logout();
});

// 2. Helpers del carrito
function obtenerCarrito(): ICartItem[] {
  const raw = localStorage.getItem("cart");
  return raw ? JSON.parse(raw) : [];
}

function actualizarBadgeCarrito(): void {
  const cart = obtenerCarrito();
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const badge = document.getElementById("cart-count");
  if (badge) badge.textContent = String(totalItems);
}

// 3. Cargar detalle del producto según el ?id=... de la URL
const detailContentEl = document.getElementById("detail-content") as HTMLDivElement;

async function init(): Promise<void> {
  actualizarBadgeCarrito();

  const params = new URLSearchParams(window.location.search);
  const idParam = params.get("id");

  if (!idParam) {
    detailContentEl.innerHTML = `<p>Producto no especificado.</p>`;
    return;
  }

  try {
    const productos = await getProductos();
    const producto: IProduct | undefined = productos.find((p) => p.id === Number(idParam));

    if (!producto || producto.eliminado) {
      detailContentEl.innerHTML = `<p>El producto solicitado no existe o no está disponible.</p>`;
      return;
    }

    const puedeComprar = producto.disponible && producto.stock > 0;
    let cantidadSeleccionada = 1;

    detailContentEl.innerHTML = `
      <div class="detail-card">
        <div class="detail-img-box">
          <img
            src="${producto.imagen}"
            alt="${producto.nombre}"
            class="detail-img"
            onerror="this.src='https://via.placeholder.com/400x350?text=FoodStore'"
          />
        </div>

        <div>
          <h1 class="detail-title">${producto.nombre}</h1>
          <p class="detail-desc">${producto.descripcion}</p>
          <div class="detail-price">$ ${producto.precio.toLocaleString("es-AR")}</div>

          <div class="info-row">
            <span>Stock disponible</span>
            <strong>${producto.stock}</strong>
          </div>

          <div class="info-row">
            <span>Estado</span>
            ${
              puedeComprar
                ? `<span class="badge-available">Disponible</span>`
                : `<span class="badge-unavailable">No disponible</span>`
            }
          </div>

          <div class="qty-row">
            <span>Cantidad</span>
            <div class="qty-controls">
              <button type="button" id="btn-dec" class="qty-btn" ${!puedeComprar ? "disabled" : ""}>-</button>
              <span id="qty-display" class="qty-value">1</span>
              <button type="button" id="btn-inc" class="qty-btn" ${!puedeComprar ? "disabled" : ""}>+</button>
            </div>
          </div>

          <p class="stock-hint">
            ${
              puedeComprar
                ? `Podés agregar hasta ${producto.stock} unidades.`
                : "Sin stock disponible en este momento."
            }
          </p>

          <button type="button" id="btn-add-to-cart" class="btn-add-detail" ${!puedeComprar ? "disabled" : ""}>
            Agregar al carrito
          </button>

          <div id="confirm-banner" class="confirm-banner">
            ✓ ¡Producto agregado al carrito!
          </div>
        </div>
      </div>
    `;

    const qtyDisplay = document.getElementById("qty-display") as HTMLSpanElement;
    const confirmBanner = document.getElementById("confirm-banner") as HTMLDivElement;

    document.getElementById("btn-dec")?.addEventListener("click", () => {
      if (cantidadSeleccionada > 1) {
        cantidadSeleccionada -= 1;
        qtyDisplay.textContent = String(cantidadSeleccionada);
      }
    });

    document.getElementById("btn-inc")?.addEventListener("click", () => {
      if (cantidadSeleccionada < producto.stock) {
        cantidadSeleccionada += 1;
        qtyDisplay.textContent = String(cantidadSeleccionada);
      }
    });

    document.getElementById("btn-add-to-cart")?.addEventListener("click", () => {
      if (!puedeComprar) return;

      const cart = obtenerCarrito();
      const existente = cart.find((item) => item.product.id === producto.id);

      if (existente) {
        const nuevaCantidad = existente.quantity + cantidadSeleccionada;
        if (nuevaCantidad > producto.stock) {
          alert(`Ya tenés ${existente.quantity} en el carrito. El stock máximo es ${producto.stock}.`);
          return;
        }
        existente.quantity = nuevaCantidad;
      } else {
        cart.push({ product: producto, quantity: cantidadSeleccionada });
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      actualizarBadgeCarrito();

      confirmBanner.style.display = "block";
      setTimeout(() => {
        confirmBanner.style.display = "none";
      }, 2500);
    });
  } catch (error) {
    console.error("Error cargando detalle:", error);
    detailContentEl.innerHTML = `<p>Error al cargar la información del producto.</p>`;
  }
}

init();