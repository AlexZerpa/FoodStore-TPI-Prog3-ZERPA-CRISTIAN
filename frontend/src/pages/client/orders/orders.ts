import { logout } from "../../../utils/auth";
import { navigate } from "../../../utils/navigate";
import { getPedidos, getProductos } from "../../../utils/api";
import type { IUser } from "../../../types/IUser";
import type { IPedido } from "../../../types/order";
import type { IProduct, ICartItem } from "../../../types/product";

const COSTO_ENVIO = 500;

// 1. Validar sesión
const userRaw = localStorage.getItem("userData");
let currentUser: IUser | null = null;

if (!userRaw) {
  navigate("/src/pages/auth/login/login.html");
} else {
  currentUser = JSON.parse(userRaw);
  const userNameEl = document.getElementById("user-name");
  if (userNameEl && currentUser) userNameEl.textContent = currentUser.nombre;
}

document.getElementById("btn-logout")?.addEventListener("click", () => {
  logout();
});

// Badge del carrito
const cartRaw = localStorage.getItem("cart");
const cart: ICartItem[] = cartRaw ? JSON.parse(cartRaw) : [];
const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
const badge = document.getElementById("cart-count");
if (badge) badge.textContent = String(totalItems);

// 2. Elementos del DOM
const ordersContentEl = document.getElementById("orders-content") as HTMLDivElement;
const modal = document.getElementById("order-modal") as HTMLDivElement;
const modalTitleEl = document.getElementById("modal-order-title") as HTMLHeadingElement;
const modalBodyEl = document.getElementById("modal-order-body") as HTMLDivElement;

let productosCatalogo: IProduct[] = [];

function normalizarEstado(estadoRaw: string): string {
  const upper = String(estadoRaw || "").toUpperCase();
  if (upper === "EN_PREPARACION" || upper === "CONFIRMADO") return "CONFIRMADO";
  if (upper === "ENTREGADO" || upper === "TERMINADO") return "TERMINADO";
  if (upper === "CANCELADO") return "CANCELADO";
  return "PENDIENTE";
}

function obtenerInfoProducto(detalle: any): { nombre: string; imagen: string } {
  const idProd = detalle.idProducto ?? detalle.productoId ?? detalle.producto?.id;
  const prod = productosCatalogo.find((p) => p.id === idProd);
  return {
    nombre: detalle.producto?.nombre || prod?.nombre || `Producto #${idProd ?? ""}`,
    imagen: detalle.producto?.imagen || prod?.imagen || "https://via.placeholder.com/44?text=Food",
  };
}

function obtenerUserIdPedido(pedido: any): number | undefined {
  return pedido.idUsuario ?? pedido.usuarioId ?? pedido.usuario?.id;
}

function abrirModalDetalle(pedido: any): void {
  modalTitleEl.textContent = `Pedido #${pedido.id}`;

  const detalles: any[] = pedido.detalles || [];
  const subtotalProductos = detalles.reduce((acc, d) => acc + (d.subtotal || 0), 0);
  const envio = pedido.total > subtotalProductos ? pedido.total - subtotalProductos : COSTO_ENVIO;

  const detallesHtml = detalles
    .map((d) => {
      const info = obtenerInfoProducto(d);
      return `
        <div class="detail-item-row" style="align-items: center;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <img
              src="${info.imagen}"
              alt="${info.nombre}"
              style="width: 44px; height: 44px; object-fit: cover; border-radius: 8px; background: #f3f4f6;"
              onerror="this.src='https://via.placeholder.com/44?text=Food'"
            />
            <span>${d.cantidad} × <strong>${info.nombre}</strong></span>
          </div>
          <strong>$${Number(d.subtotal || 0).toLocaleString("es-AR")}</strong>
        </div>
      `;
    })
    .join("");

  modalBodyEl.innerHTML = `
    <div class="detail-info-box">
      <p><strong>Estado:</strong> <span class="badge badge-${pedido.estado}">${pedido.estado}</span></p>
      <p><strong>Fecha:</strong> ${pedido.fecha}</p>
      <p><strong>Forma de pago:</strong> ${pedido.formaPago}</p>
      ${pedido.telefono ? `<p><strong>Teléfono:</strong> ${pedido.telefono}</p>` : ""}
      ${pedido.direccion ? `<p><strong>Dirección:</strong> ${pedido.direccion}</p>` : ""}
      ${pedido.notas ? `<p><strong>Notas:</strong> ${pedido.notas}</p>` : ""}
    </div>

    <h4 style="margin: 0 0 8px 0;">Productos</h4>
    ${detallesHtml}

    <div style="margin-top: 16px; border-top: 1px solid #e5e7eb; padding-top: 12px;">
      <div class="detail-item-row" style="border: none;">
        <span>Subtotal</span>
        <span>$${subtotalProductos.toLocaleString("es-AR")}</span>
      </div>
      <div class="detail-item-row" style="border: none;">
        <span>Envío</span>
        <span>$${envio.toLocaleString("es-AR")}</span>
      </div>
      <div class="detail-item-row" style="border: none; font-size: 1.15rem; font-weight: 800; color: #d95d39;">
        <span>Total</span>
        <span>$${Number(pedido.total).toLocaleString("es-AR")}</span>
      </div>
    </div>
  `;

  modal.style.display = "flex";
}

document.getElementById("btn-close-modal")?.addEventListener("click", () => {
  modal.style.display = "none";
});

async function init(): Promise<void> {
  if (!currentUser) return;

  try {
    const [pedidosJson, productos] = await Promise.all([getPedidos(), getProductos()]);
    productosCatalogo = productos;

    const localRaw = localStorage.getItem("localOrders");
    const pedidosLocales: IPedido[] = localRaw ? JSON.parse(localRaw) : [];

    const overridesRaw = localStorage.getItem("orderStatusOverrides");
    const overrides: Record<string, string> = overridesRaw ? JSON.parse(overridesRaw) : {};

    const todosPedidos: any[] = [...pedidosLocales, ...pedidosJson].map((ped) => ({
      ...ped,
      estado: overrides[String(ped.id)] ?? normalizarEstado(ped.estado),
    }));

    const misPedidos = todosPedidos.filter((p) => obtenerUserIdPedido(p) === currentUser!.id);
    misPedidos.sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));

    if (misPedidos.length === 0) {
      ordersContentEl.innerHTML = `
        <div class="empty-state">
          <h2>Todavía no realizaste pedidos</h2>
          <p style="color: #6b7280;">Explorá nuestro catálogo y hacé tu primera compra.</p>
          <a href="../../store/home/home.html" class="btn-store">Ir a la tienda</a>
        </div>
      `;
      return;
    }

    ordersContentEl.innerHTML = `
      <div class="orders-grid">
        ${misPedidos
          .map((ped) => {
            const detalles: any[] = ped.detalles || [];
            const primerosTres = detalles
              .slice(0, 3)
              .map((d) => `<li>${d.cantidad} × ${obtenerInfoProducto(d).nombre}</li>`)
              .join("");

            return `
              <article class="order-card" data-order-id="${ped.id}">
                <div class="order-card-header">
                  <h3>Pedido #${ped.id}</h3>
                  <span class="badge badge-${ped.estado}">${ped.estado}</span>
                </div>
                <p class="order-date">${ped.fecha}</p>
                <ul class="order-items-preview">${primerosTres}</ul>
                <div class="order-card-footer">
                  <span style="color: #6b7280; font-weight: 500;">Total</span>
                  <span style="font-size: 1.15rem; color: #111827;">$${Number(ped.total).toLocaleString("es-AR")}</span>
                </div>
              </article>
            `;
          })
          .join("")}
      </div>
    `;

    ordersContentEl.querySelectorAll<HTMLElement>(".order-card").forEach((card) => {
      card.addEventListener("click", () => {
        const id = Number(card.dataset.orderId);
        const pedido = misPedidos.find((p) => p.id === id);
        if (pedido) abrirModalDetalle(pedido);
      });
    });
  } catch (error) {
    console.error("Error cargando pedidos:", error);
    ordersContentEl.textContent = "Error al cargar tus pedidos.";
  }
}

init();