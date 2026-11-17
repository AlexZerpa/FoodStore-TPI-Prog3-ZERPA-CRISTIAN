import { checkAuhtUser, logout } from "../../../utils/auth";
import { getCategorias, getProductos } from "../../../utils/api";
import type { ICategoria } from "../../../types/categoria";
import type { IProduct } from "../../../types/product";
import type { IUser } from "../../../types/IUser";

checkAuhtUser("/src/pages/auth/login/login.html", "/src/pages/store/home/home.html", "ADMIN");

const userRaw = localStorage.getItem("userData");
if (userRaw) {
  const user: IUser = JSON.parse(userRaw);
  const nameEl = document.getElementById("admin-name");
  if (nameEl) nameEl.textContent = `${user.nombre} ${user.apellido}`;
}
document.getElementById("btn-logout")?.addEventListener("click", () => logout());

let productos: IProduct[] = [];
let categorias: ICategoria[] = [];

const tbody = document.getElementById("products-tbody") as HTMLTableSectionElement;
const modal = document.getElementById("prod-modal") as HTMLDivElement;
const modalTitle = document.getElementById("modal-title") as HTMLHeadingElement;
const form = document.getElementById("prod-form") as HTMLFormElement;

const inputId = document.getElementById("prod-id") as HTMLInputElement;
const inputNombre = document.getElementById("prod-nombre") as HTMLInputElement;
const inputDescripcion = document.getElementById("prod-descripcion") as HTMLTextAreaElement;
const inputPrecio = document.getElementById("prod-precio") as HTMLInputElement;
const inputStock = document.getElementById("prod-stock") as HTMLInputElement;
const selectCategoria = document.getElementById("prod-categoria") as HTMLSelectElement;
const inputImagen = document.getElementById("prod-imagen") as HTMLInputElement;
const checkDisponible = document.getElementById("prod-disponible") as HTMLInputElement;

function guardarProductosLocal(): void {
  localStorage.setItem("localProductos", JSON.stringify(productos));
}

function getCatId(prod: IProduct): number | undefined {
  return prod.categoriaId ?? prod.categoria?.id;
}

function cargarSelectCategorias(): void {
  const activas = categorias.filter((c) => !c.eliminado);
  selectCategoria.innerHTML =
    `<option value="">Seleccioná una categoría</option>` +
    activas.map((c) => `<option value="${c.id}">${c.nombre}</option>`).join("");
}

function renderTabla(): void {
  const activos = productos.filter((p) => !p.eliminado);

  tbody.innerHTML = activos
    .map((prod) => {
      const catId = getCatId(prod);
      const catObj = categorias.find((c) => c.id === catId);
      const catNombre = catObj ? catObj.nombre : prod.categoria?.nombre || "Sin categoría";

      return `
        <tr>
          <td>${prod.id}</td>
          <td><img src="${prod.imagen}" alt="${prod.nombre}" class="thumb" onerror="this.src='https://via.placeholder.com/45'" /></td>
          <td><strong>${prod.nombre}</strong></td>
          <td>${prod.descripcion}</td>
          <td><strong>$${prod.precio.toLocaleString("es-AR")}</strong></td>
          <td>${catNombre}</td>
          <td>${prod.stock}</td>
          <td>
            ${
              prod.disponible
                ? `<span class="badge-ok">Disponible</span>`
                : `<span class="badge-no">No disponible</span>`
            }
          </td>
          <td style="white-space: nowrap;">
            <button class="btn-edit" data-edit="${prod.id}">Editar</button>
            <button class="btn-del" data-del="${prod.id}">Eliminar</button>
          </td>
        </tr>
      `;
    })
    .join("");

  tbody.querySelectorAll<HTMLButtonElement>("[data-edit]").forEach((btn) => {
    btn.addEventListener("click", () => abrirModalEditar(Number(btn.dataset.edit)));
  });

  tbody.querySelectorAll<HTMLButtonElement>("[data-del]").forEach((btn) => {
    btn.addEventListener("click", () => eliminarProducto(Number(btn.dataset.del)));
  });
}

function abrirModalCrear(): void {
  modalTitle.textContent = "Nuevo producto";
  inputId.value = "";
  form.reset();
  checkDisponible.checked = true;
  cargarSelectCategorias();
  modal.style.display = "flex";
}

function abrirModalEditar(id: number): void {
  const prod = productos.find((p) => p.id === id);
  if (!prod) return;

  modalTitle.textContent = "Editar producto";
  cargarSelectCategorias();

  inputId.value = String(prod.id);
  inputNombre.value = prod.nombre;
  inputDescripcion.value = prod.descripcion;
  inputPrecio.value = String(prod.precio);
  inputStock.value = String(prod.stock);
  selectCategoria.value = String(getCatId(prod) ?? "");
  inputImagen.value = prod.imagen;
  checkDisponible.checked = prod.disponible;

  modal.style.display = "flex";
}

function eliminarProducto(id: number): void {
  const prod = productos.find((p) => p.id === id);
  if (!prod) return;
  if (confirm(`¿Seguro que deseas eliminar el producto "${prod.nombre}"?`)) {
    prod.eliminado = true;
    guardarProductosLocal();
    renderTabla();
  }
}

document.getElementById("btn-new-prod")?.addEventListener("click", abrirModalCrear);
document.getElementById("btn-cancel-modal")?.addEventListener("click", () => {
  modal.style.display = "none";
});

form.addEventListener("submit", (e: SubmitEvent) => {
  e.preventDefault();

  const precio = Number(inputPrecio.value);
  const stock = Number(inputStock.value);
  const categoriaId = Number(selectCategoria.value);

  if (isNaN(precio) || precio <= 0) {
    alert("El precio debe ser mayor a 0.");
    return;
  }
  if (isNaN(stock) || stock < 0) {
    alert("El stock debe ser mayor o igual a 0.");
    return;
  }
  if (!categoriaId || !categorias.some((c) => c.id === categoriaId && !c.eliminado)) {
    alert("Debés seleccionar una categoría válida.");
    return;
  }

  const idVal = inputId.value;
  if (idVal) {
    const prod = productos.find((p) => p.id === Number(idVal));
    if (prod) {
      prod.nombre = inputNombre.value.trim();
      prod.descripcion = inputDescripcion.value.trim();
      prod.precio = precio;
      prod.stock = stock;
      prod.categoriaId = categoriaId;
      prod.imagen = inputImagen.value.trim();
      prod.disponible = checkDisponible.checked;
    }
  } else {
    const nuevoId = productos.length > 0 ? Math.max(...productos.map((p) => p.id)) + 1 : 1;
    productos.push({
      id: nuevoId,
      nombre: inputNombre.value.trim(),
      descripcion: inputDescripcion.value.trim(),
      precio,
      stock,
      categoriaId,
      imagen: inputImagen.value.trim(),
      disponible: checkDisponible.checked,
      eliminado: false,
    });
  }

  guardarProductosLocal();
  modal.style.display = "none";
  renderTabla();
});

async function init(): Promise<void> {
  const savedCats = localStorage.getItem("localCategorias");
  categorias = savedCats ? JSON.parse(savedCats) : await getCategorias();

  const savedProds = localStorage.getItem("localProductos");
  if (savedProds) {
    productos = JSON.parse(savedProds);
  } else {
    productos = await getProductos();
    guardarProductosLocal();
  }

  renderTabla();
}

init();