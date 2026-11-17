import { checkAuhtUser, logout } from "../../../utils/auth";
import { getCategorias } from "../../../utils/api";
import type { ICategoria } from "../../../types/categoria";
import type { IUser } from "../../../types/IUser";

checkAuhtUser("/src/pages/auth/login/login.html", "/src/pages/store/home/home.html", "ADMIN");

const userRaw = localStorage.getItem("userData");
if (userRaw) {
  const user: IUser = JSON.parse(userRaw);
  const nameEl = document.getElementById("admin-name");
  if (nameEl) nameEl.textContent = `${user.nombre} ${user.apellido}`;
}
document.getElementById("btn-logout")?.addEventListener("click", () => logout());

let categorias: ICategoria[] = [];

const tbody = document.getElementById("categories-tbody") as HTMLTableSectionElement;
const modal = document.getElementById("cat-modal") as HTMLDivElement;
const modalTitle = document.getElementById("modal-title") as HTMLHeadingElement;
const form = document.getElementById("cat-form") as HTMLFormElement;
const inputId = document.getElementById("cat-id") as HTMLInputElement;
const inputNombre = document.getElementById("cat-nombre") as HTMLInputElement;
const inputDescripcion = document.getElementById("cat-descripcion") as HTMLTextAreaElement;
const inputImagen = document.getElementById("cat-imagen") as HTMLInputElement;

function guardarCategoriasLocal(): void {
  localStorage.setItem("localCategorias", JSON.stringify(categorias));
}

function renderTabla(): void {
  const activas = categorias.filter((c) => !c.eliminado);
  tbody.innerHTML = activas
    .map(
      (cat) => `
      <tr>
        <td>${cat.id}</td>
        <td><img src="${cat.imagen}" alt="${cat.nombre}" class="thumb" onerror="this.src='https://via.placeholder.com/45'" /></td>
        <td><strong>${cat.nombre}</strong></td>
        <td>${cat.descripcion}</td>
        <td>
          <button class="btn-edit" data-edit="${cat.id}">Editar</button>
          <button class="btn-del" data-del="${cat.id}">Eliminar</button>
        </td>
      </tr>
    `
    )
    .join("");

  tbody.querySelectorAll<HTMLButtonElement>("[data-edit]").forEach((btn) => {
    btn.addEventListener("click", () => abrirModalEditar(Number(btn.dataset.edit)));
  });

  tbody.querySelectorAll<HTMLButtonElement>("[data-del]").forEach((btn) => {
    btn.addEventListener("click", () => eliminarCategoria(Number(btn.dataset.del)));
  });
}

function abrirModalCrear(): void {
  modalTitle.textContent = "Nueva categoría";
  inputId.value = "";
  form.reset();
  modal.style.display = "flex";
}

function abrirModalEditar(id: number): void {
  const cat = categorias.find((c) => c.id === id);
  if (!cat) return;
  modalTitle.textContent = "Editar categoría";
  inputId.value = String(cat.id);
  inputNombre.value = cat.nombre;
  inputDescripcion.value = cat.descripcion;
  inputImagen.value = cat.imagen;
  modal.style.display = "flex";
}

function eliminarCategoria(id: number): void {
  const cat = categorias.find((c) => c.id === id);
  if (!cat) return;
  if (confirm(`¿Seguro que deseas eliminar la categoría "${cat.nombre}"?`)) {
    cat.eliminado = true;
    guardarCategoriasLocal();
    renderTabla();
  }
}

document.getElementById("btn-new-cat")?.addEventListener("click", abrirModalCrear);
document.getElementById("btn-cancel-modal")?.addEventListener("click", () => {
  modal.style.display = "none";
});

form.addEventListener("submit", (e: SubmitEvent) => {
  e.preventDefault();
  const idVal = inputId.value;
  if (idVal) {
    const cat = categorias.find((c) => c.id === Number(idVal));
    if (cat) {
      cat.nombre = inputNombre.value.trim();
      cat.descripcion = inputDescripcion.value.trim();
      cat.imagen = inputImagen.value.trim();
    }
  } else {
    const nuevoId = categorias.length > 0 ? Math.max(...categorias.map((c) => c.id)) + 1 : 1;
    categorias.push({
      id: nuevoId,
      nombre: inputNombre.value.trim(),
      descripcion: inputDescripcion.value.trim(),
      imagen: inputImagen.value.trim(),
      eliminado: false,
    });
  }
  guardarCategoriasLocal();
  modal.style.display = "none";
  renderTabla();
});

async function init(): Promise<void> {
  const saved = localStorage.getItem("localCategorias");
  if (saved) {
    categorias = JSON.parse(saved);
  } else {
    categorias = await getCategorias();
    guardarCategoriasLocal();
  }
  renderTabla();
}

init();