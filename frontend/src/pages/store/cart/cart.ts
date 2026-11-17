import { logout } from "../../../utils/auth";
import { navigate } from "../../../utils/navigate";
import type { IUser } from "../../../types/IUser";
import type { ICartItem } from "../../../types/product";
import type { IPedido, FormaPago } from "../../../types/order";

export const COSTO_ENVIO = 500;

// 1. Validar sesión y mostrar usuario
const userRaw = localStorage.getItem("userData");
let currentUser: IUser | null = null;

if (!userRaw) {
  navigate("/src/pages/auth/login/login.html");
} else {
  currentUser = JSON.parse(userRaw);
  const userNameEl = document.getElementById("user-name");
  if (userNameEl && currentUser) userNameEl.textContent = currentUser.nombre;

  if (currentUser?.rol === "ADMIN") {
    const adminLink = document.getElementById("admin-panel-link");
    if (adminLink) adminLink.style.display = "inline-block";
  }
}

document.getElementById("btn-logout")?.addEventListener("click", () => {
  logout();
});

// 2. Helpers de localStorage para el carrito
function obtenerCarrito(): ICartItem[] {
  const raw = localStorage.getItem("cart");
  return raw ? JSON.parse(raw) : [];
}

function guardarCarrito(cart: ICartItem[]): void {
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCarrito();
}

function actualizarBadge(cart: ICartItem[]): void {
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const badge = document.getElementById("cart-count");
  if (badge) badge.textContent = String(totalItems);
}

// 3. Elementos del DOM
const cartContentEl = document.getElementById("cart-content") as HTMLDivElement;
const modal = document.getElementById("checkout-modal") as HTMLDivElement;
const modalTotalEl = document.getElementById("modal-total-amount") as HTMLSpanElement;
const checkoutForm = document.getElementById("checkout-form") as HTMLFormElement;
const clearModal = document.getElementById("clear-modal") as HTMLDivElement;

function renderCarrito(): void {
  const cart = obtenerCarrito();
  actualizarBadge(cart);

  if (cart.length === 0) {
    cartContentEl.innerHTML = `
      <div class="empty-state">
        <h2>Tu carrito está vacío</h2>
        <p style="color: #6b7280;">Agregá productos desde el catálogo para realizar tu pedido.</p>
        <a href="../home/home.html" class="btn-back-store">Volver a la tienda</a>
      </div>
    `;
    return;
  }

  const subtotal = cart.reduce((acc, item) => acc + item.product.precio * item.quantity, 0);
  const total = subtotal + COSTO_ENVIO;

  const itemsHtml = cart
    .map(
      (item) => `
      <div class="cart-item-card">
        <div class="item-left">
          <img
            src="${item.product.imagen}"
            alt="${item.product.nombre}"
            class="item-img"
            onerror="this.src='https://via.placeholder.com/68?text=Food'"
          />
          <div class="item-info">
            <h3>${item.product.nombre}</h3>
            <p>$${item.product.precio.toLocaleString("es-AR")} c/u · Subtotal: <strong>$${(
              item.product.precio * item.quantity
            ).toLocaleString("es-AR")}</strong></p>
          </div>
        </div>

        <div class="item-controls">
          <div class="qty-box">
            <button type="button" class="qty-btn" data-dec="${item.product.id}">-</button>
            <span><strong>${item.quantity}</strong></span>
            <button type="button" class="qty-btn" data-inc="${item.product.id}">+</button>
          </div>
          <button type="button" class="btn-remove" data-del="${item.product.id}">Eliminar</button>
        </div>
      </div>
    `
    )
    .join("");

  cartContentEl.innerHTML = `
    <div class="cart-grid">
      <div class="cart-items-list">${itemsHtml}</div>

      <aside class="summary-card">
        <h2>Resumen del Pedido</h2>
        <div class="summary-row">
          <span>Subtotal</span>
          <span>$${subtotal.toLocaleString("es-AR")}</span>
        </div>
        <div class="summary-row">
          <span>Envío</span>
          <span>$${COSTO_ENVIO.toLocaleString("es-AR")}</span>
        </div>
        <div class="summary-total">
          <span>Total</span>
          <span>$${total.toLocaleString("es-AR")}</span>
        </div>

        <button type="button" id="btn-open-checkout" class="btn-checkout">Finalizar compra</button>
        <a href="../home/home.html" class="link-continue">Seguir comprando</a>
        <button type="button" id="btn-clear-cart" class="btn-clear">Vaciar carrito</button>
      </aside>
    </div>
  `;

  cartContentEl.querySelectorAll<HTMLButtonElement>("[data-inc]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.inc);
      const current = obtenerCarrito();
      const target = current.find((i) => i.product.id === id);
      if (target) {
        if (target.quantity < target.product.stock) {
          target.quantity += 1;
          guardarCarrito(current);
        } else {
          alert(`Stock máximo disponible: ${target.product.stock}`);
        }
      }
    });
  });

  cartContentEl.querySelectorAll<HTMLButtonElement>("[data-dec]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.dec);
      let current = obtenerCarrito();
      const target = current.find((i) => i.product.id === id);
      if (target) {
        if (target.quantity > 1) {
          target.quantity -= 1;
        } else {
          current = current.filter((i) => i.product.id !== id);
        }
        guardarCarrito(current);
      }
    });
  });

  cartContentEl.querySelectorAll<HTMLButtonElement>("[data-del]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.del);
      const filtered = obtenerCarrito().filter((i) => i.product.id !== id);
      guardarCarrito(filtered);
    });
  });

  // Abrir modal HTML bonito para vaciar carrito
  document.getElementById("btn-clear-cart")?.addEventListener("click", () => {
    clearModal.style.display = "flex";
  });

  document.getElementById("btn-open-checkout")?.addEventListener("click", () => {
    if (currentUser?.celular) {
      const telInput = document.getElementById("checkout-telefono") as HTMLInputElement;
      if (telInput && !telInput.value) telInput.value = currentUser.celular;
    }
    modalTotalEl.textContent = `$${total.toLocaleString("es-AR")}`;
    modal.style.display = "flex";
  });
}

// Eventos del modal de vaciar carrito
document.getElementById("btn-cancel-clear")?.addEventListener("click", () => {
  clearModal.style.display = "none";
});

document.getElementById("btn-confirm-clear")?.addEventListener("click", () => {
  clearModal.style.display = "none";
  guardarCarrito([]);
});

document.getElementById("btn-close-modal")?.addEventListener("click", () => {
  modal.style.display = "none";
});

// Confirmar pedido y mostrar pantalla de confirmación
checkoutForm.addEventListener("submit", (e: SubmitEvent) => {
  e.preventDefault();
  if (!currentUser) return;

  const cart = obtenerCarrito();
  if (cart.length === 0) return;

  const telefono = (document.getElementById("checkout-telefono") as HTMLInputElement).value.trim();
  const direccion = (document.getElementById("checkout-direccion") as HTMLInputElement).value.trim();
  const formaPago = (document.getElementById("checkout-pago") as HTMLSelectElement).value as FormaPago;
  const notas = (document.getElementById("checkout-notas") as HTMLTextAreaElement).value.trim();

  const subtotal = cart.reduce((acc, item) => acc + item.product.precio * item.quantity, 0);
  const total = subtotal + COSTO_ENVIO;

  const existingRaw = localStorage.getItem("localOrders");
  const existingOrders: IPedido[] = existingRaw ? JSON.parse(existingRaw) : [];

  const maxId = existingOrders.reduce((max, o) => Math.max(max, Number(o.id) || 0), 3);
  const nuevoId = maxId + 1;

  const nuevoPedido: IPedido = {
    id: nuevoId,
    fecha: new Date().toISOString().split("T")[0],
    estado: "PENDIENTE",
    total,
    formaPago,
    idUsuario: currentUser.id,
    telefono,
    direccion,
    notas,
    detalles: cart.map((item) => ({
      idProducto: item.product.id,
      cantidad: item.quantity,
      subtotal: item.product.precio * item.quantity,
    })),
  };

  existingOrders.unshift(nuevoPedido);
  localStorage.setItem("localOrders", JSON.stringify(existingOrders));

  localStorage.removeItem("cart");
  actualizarBadge([]);
  modal.style.display = "none";

  const pageTitle = document.querySelector(".page-title") as HTMLElement;
  if (pageTitle) pageTitle.style.display = "none";

  cartContentEl.innerHTML = `
    <div style="background: #ffffff; border-radius: 16px; padding: 60px 24px; text-align: center; box-shadow: 0 2px 12px rgba(0,0,0,0.06); margin-top: 10px;">
      <div style="width: 56px; height: 56px; background: #22c55e; color: white; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; font-size: 2rem; margin-bottom: 16px;">
        ✓
      </div>
      <h2 style="color: #16a34a; font-size: 1.65rem; margin: 0 0 10px 0;">¡Pedido #${nuevoId} confirmado!</h2>
      <p style="color: #6b7280; font-size: 1rem; margin: 0 0 24px 0;">Te llevamos a tus pedidos en un instante...</p>
      <a href="../../client/orders/orders.html" style="display: inline-block; background-color: #d95d39; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 700;">
        Ir a Mis pedidos
      </a>
    </div>
  `;

  setTimeout(() => {
    navigate("/src/pages/client/orders/orders.html");
  }, 2500);
});

renderCarrito();