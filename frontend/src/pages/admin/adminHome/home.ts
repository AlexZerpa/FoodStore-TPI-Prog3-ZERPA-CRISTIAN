import { checkAuhtUser, logout } from "../../../utils/auth";
import { getCategorias, getPedidos, getProductos, getUsuarios } from "../../../utils/api";
import type { IUser } from "../../../types/IUser";

// 1. Proteger la ruta: solo entra rol ADMIN
checkAuhtUser("/src/pages/auth/login/login.html","/src/pages/client/home/home.html", "ADMIN");

// 2. Mostrar nombre del usuario y conectar boton Cerrar Sesion.
const userRaw = localStorage.getItem("userData");
if (userRaw){
  const user: IUser = JSON.parse(userRaw);
  const nameEl = document.getElementById("admin-name");
if (nameEl) nameEl.textContent = `${user.nombre} ${user.apellido}`;
}

document.getElementById("btn-logout")?.addEventListener("click", () => {
  logout();
});

// 3. Cargar estadisticas desde los 4 archivos JSON
async function cargarEstadisticas(){
  try{
    const [categorias, productos, pedidos, usuarios] = await Promise.all([
      getCategorias(),
      getProductos(),
      getPedidos(),
      getUsuarios()
    ]);

    const catActivas = categorias.filter((c) => !c.eliminado);
    const prodActivos = productos.filter((p) => !p.eliminado);
    const prodDisponibles = prodActivos.filter((p) => p.disponible);
    const prodInactivos = productos.filter((p) => p.eliminado || !p.disponible);

    document.getElementById("stat-categorias")!.textContent = String(catActivas.length);
    document.getElementById("stat-productos")!.textContent = String(prodActivos.length);
    document.getElementById("stat-pedidos")!.textContent = String(pedidos.length);
    document.getElementById("stat-disponibles")!.textContent = String(prodDisponibles.length)

    document.getElementById("res-cat-activas")!.textContent = String(catActivas.length);
    document.getElementById("res-prod-activos")!.textContent = String(prodActivos.length);
    document.getElementById("res-prod-inactivos")!.textContent = String(prodInactivos.length);
    document.getElementById("res-usuarios")!.textContent = String(usuarios.length);

    document.getElementById("res-pendiente")!.textContent = String(pedidos.filter((p) => p.estado === "PENDIENTE").length);
    document.getElementById("res-confirmado")!.textContent = String(pedidos.filter((p) => p.estado === "CONFIRMADO").length);
    document.getElementById("res-terminado")!.textContent = String(pedidos.filter((p) => p.estado === "TERMINADO").length);
    document.getElementById("res-cancelado")!.textContent = String(pedidos.filter((p) => p.estado === "CANCELADO").length);
  } catch (error){
    console.error("Error cargando dashboard: ",error);
  }
}

cargarEstadisticas();
