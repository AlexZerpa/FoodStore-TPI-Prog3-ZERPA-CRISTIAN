import { checkAuhtUser, logout } from "../../../utils/auth";
import { getPedidos, getProductos, getUsuarios } from "../../../utils/api";
import type { IUser } from "../../../types/IUser";
import type { IProduct } from "../../../types/product";
import type { EstadoPedido } from "../../../types/order";

checkAuhtUser("/src/pages/auth/login/login.html", "/src/pages/store/home/home.html", "ADMIN");

const userRaw = localStorage.getItem("userData");
if (userRaw) {
  const user: IUser = JSON.parse(userRaw);
  const nameEl = document.getElementById("admin-name");
  if (nameEl) nameEl.textContent = `${user.nombre} ${user.apellido}`;
}
document.getElementById("btn-logout")?.addEventListener("click", () => logout());

let todosPedidos: any[] = [];
let usuarios: IUser[] = [];
let productos: IProduct[] = [];
let estadoFiltro = "ALL";

const gridEl = document.getElementById("orders-grid") as HTMLDivElement;
const filterSelect = document.getElementById("status-filter") as HTMLSelectElement;
const modal = document.getElementById("order-modal") as HTMLDivElement;
const modalTitle = document.getElementById("modal-title") as HTMLHeadingElement;
const modalBody = document.getElementById("modal-body") as HTMLDivElement;

function normalizarEstado(estadoRaw: string): EstadoPedido {
  const upper = String(estadoRaw || "").toUpperCase();
  if (upper === "EN_PREPARACION" || upper === "CONFIRMADO") return "CONFIRMADO";
  if (upper === "ENTREGADO" || upper === "TERMINADO") return "TERMINADO";
  if (upper === "CANCELADO") return "CANCELADO";
  return "PENDIENTE";
}

function getNombreCliente(pedido: any): string {
  if (pedido.usuario?.nombre) {
    return `${pedido.usuario.nombre} ${pedido.usuario.apellido || ""}`.trim();
  }
  const userId = pedido.idUsuario ?? pedido.usuarioId ?? pedido.usuario?.id;
  const user = usuarios.find((u) => u.id === userId);
  return user ? `${user.nombre} ${user.apellido}` : "Juan Pérez";
}

function getInfoProducto(detalle: any): { nombre: string; imagen: string } {
  const idProd = detalle.idProducto ?? detalle.productoId ?? detalle.producto?.id;
  const prod = productos.find((p) => p.id === idProd);

  return {
    nombre: detalle.producto?.nombre || prod?.nombre || `Producto #${idProd ?? ""}`,
    imagen: detalle.producto?.imagen || prod?.imagen || "https://via.placeholder.com/45?text=Food",
  };
}

function guardarCambioEstado(idPedido: number, nuevoEstado: EstadoPedido): void {
  const overridesRaw = localStorage.getItem("orderStatusOverrides");
  const overrides: Record<string, EstadoPedido> = overridesRaw ? JSON.parse(overridesRaw) : {};
  overrides[String(idPedido)] = nuevoEstado;
  localStorage.setItem("orderStatusOverrides", JSON.stringify(overrides));

  const localRaw = localStorage.getItem("localOrders");
  if (localRaw) {
    const locales: any[] = JSON.parse(localRaw);
    const encontrado = locales.find((o) => o.id === idPedido);
    if (encontrado) {
      encontrado.estado = nuevoEstado;
      localStorage.setItem("localOrders", JSON.stringify(locales));
    }
  }
}

function renderPedidos(): void {
  if (!gridEl) return;

  let lista = [...todosPedidos];

  if (estadoFiltro !== "ALL") {
    lista = lista.filter((p) => p.estado === estadoFiltro);
  }

  lista.sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));

  if (lista.length === 0) {
    gridEl.innerHTML = `<p style="color: #78716c;">No hay pedidos para el estado seleccionado.</p>`;
    return;
  }

  gridEl.innerHTML = lista
    .map((ped) => {
      const detalles: any[] = ped.detalles || [];
      const cantProductos = detalles.reduce((acc, d) => acc + (d.cantidad || 1), 0);

      return `
        <article class="order-card" data-id="${ped.id}">
          <div class="order-top">
            <h3>Pedido #${ped.id}</h3>
            <span class="badge badge-${ped.estado}">${ped.estado}</span>
          </div>
          <p class="client-name">${getNombreCliente(ped)}</p>
          <p class="order-meta">${ped.fecha} · ${cantProductos} producto(s)</p>
          <div class="order-bottom">
            <span style="color: #78716c; font-weight: 500;">Total</span>
            <span style="font-size: 1.15rem;">$ ${Number(ped.total).toLocaleString("es-AR")}</span>
          </div>
        </article>
      `;
    })
    .join("");

  gridEl.querySelectorAll<HTMLElement>(".order-card").forEach((card) => {
    card.addEventListener("click", () => {
      const id = Number(card.dataset.id);
      const pedido = todosPedidos.find((p) => p.id === id);
      if (pedido) abrirModalPedido(pedido);
    });
  });
}

function abrirModalPedido(pedido: any): void {
  modalTitle.textContent = `Detalle del Pedido #${pedido.id}`;
  const detalles: any[] = pedido.detalles || [];

  const detallesHtml = detalles
    .map((d) => {
      const info = getInfoProducto(d);
      return `
        <div class="item-row" style="align-items: center;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <img
              src="${info.imagen}"
              alt="${info.nombre}"
              style="width: 44px; height: 44px; object-fit: cover; border-radius: 8px; background: #f5f5f4;"
              onerror="this.src='https://via.placeholder.com/44?text=Food'"
            />
            <span><strong>${info.nombre}</strong> (x${d.cantidad})</span>
          </div>
          <strong>$${Number(d.subtotal || 0).toLocaleString("es-AR")}</strong>
        </div>
      `;
    })
    .join("");

  modalBody.innerHTML = `
    <div class="info-box">
      <p><strong>Cliente:</strong> ${getNombreCliente(pedido)}</p>
      <p><strong>Fecha:</strong> ${pedido.fecha}</p>
      <p><strong>Método de pago:</strong> ${pedido.formaPago}</p>
      ${pedido.telefono ? `<p><strong>Teléfono:</strong> ${pedido.telefono}</p>` : ""}
      ${pedido.direccion ? `<p><strong>Dirección:</strong> ${pedido.direccion}</p>` : ""}
    </div>

    <h4 style="margin: 0 0 8px 0;">Productos</h4>
    ${detallesHtml}

    <div class="item-row" style="border: none; margin-top: 12px; font-size: 1.15rem; font-weight: 800;">
      <span>Total:</span>
      <span style="color: #ea580c;">$${Number(pedido.total).toLocaleString("es-AR")}</span>
    </div>

    <div style="margin-top: 16px;">
      <label for="modal-status-select" style="display: block; font-weight: 600; margin-bottom: 6px;">Cambiar Estado:</label>
      <select id="modal-status-select" style="width: 100%; padding: 9px; border-radius: 8px; border: 1px solid #d6d3d1;">
        <option value="PENDIENTE" ${pedido.estado === "PENDIENTE" ? "selected" : ""}>PENDIENTE</option>
        <option value="CONFIRMADO" ${pedido.estado === "CONFIRMADO" ? "selected" : ""}>CONFIRMADO</option>
        <option value="TERMINADO" ${pedido.estado === "TERMINADO" ? "selected" : ""}>TERMINADO</option>
        <option value="CANCELADO" ${pedido.estado === "CANCELADO" ? "selected" : ""}>CANCELADO</option>
      </select>
      <button type="button" id="btn-save-status" class="btn-primary">Actualizar Estado</button>
    </div>
  `;

  document.getElementById("btn-save-status")?.addEventListener("click", () => {
    const select = document.getElementById("modal-status-select") as HTMLSelectElement;
    const nuevoEstado = select.value as EstadoPedido;
    pedido.estado = nuevoEstado;
    guardarCambioEstado(pedido.id, nuevoEstado);
    modal.style.display = "none";
    renderPedidos();
  });

  modal.style.display = "flex";
}

document.getElementById("btn-close-modal")?.addEventListener("click", () => {
  modal.style.display = "none";
});

filterSelect?.addEventListener("change", () => {
  estadoFiltro = filterSelect.value;
  renderPedidos();
});

async function init(): Promise<void> {
  try {
    const [pedidosJson, usersJson, prodsJson] = await Promise.all([
      getPedidos(),
      getUsuarios(),
      getProductos(),
    ]);

    const localRaw = localStorage.getItem("localOrders");
    const pedidosLocales: any[] = localRaw ? JSON.parse(localRaw) : [];

    const overridesRaw = localStorage.getItem("orderStatusOverrides");
    const overrides: Record<string, EstadoPedido> = overridesRaw ? JSON.parse(overridesRaw) : {};

    todosPedidos = [...pedidosLocales, ...pedidosJson].map((ped) => ({
      ...ped,
      estado: overrides[String(ped.id)] ?? normalizarEstado(ped.estado),
    }));

    usuarios = usersJson;
    productos = prodsJson;

    renderPedidos();
  } catch (error) {
    console.error("Error cargando pedidos en Admin:", error);
    if (gridEl) gridEl.innerHTML = `<p style="color: #dc2626;">Error al cargar los pedidos.</p>`;
  }
}

init();