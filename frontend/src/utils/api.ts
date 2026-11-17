import type { ICategoria } from "../types/categoria";
import type { IProduct } from "../types/product";
import type { IUser } from "../types/IUser";
import type { IPedido } from "../types/order";

export async function getCategorias(): Promise<ICategoria[]> {
  const local = localStorage.getItem("localCategorias");
  if (local) return JSON.parse(local);

  // En la próxima iteración se reemplaza por: fetch('/api/categories')
  const res = await fetch("/data/categorias.json");
  if (!res.ok) throw new Error("Error al cargar categorías");
  return res.json();
}

export async function getProductos(): Promise<IProduct[]> {
  const local = localStorage.getItem("localProductos");
  if (local) return JSON.parse(local);

  // En la próxima iteración se reemplaza por: fetch('/api/products')
  const res = await fetch("/data/productos.json");
  if (!res.ok) throw new Error("Error al cargar productos");
  return res.json();
}

export async function getUsuarios(): Promise<IUser[]> {
  // En la próxima iteración se reemplaza por: fetch('/api/users')
  const res = await fetch("/data/usuarios.json");
  if (!res.ok) throw new Error("Error al cargar usuarios");
  const usuariosJson: IUser[] = await res.json();

  const localRaw = localStorage.getItem("localUsuarios");
  const usuariosLocales: IUser[] = localRaw ? JSON.parse(localRaw) : [];

  return [...usuariosJson, ...usuariosLocales];
}

export async function getPedidos(): Promise<IPedido[]> {
  const res = await fetch("/data/pedidos.json");
  if (!res.ok) throw new Error("Error al cargar pedidos");
  return res.json();
}