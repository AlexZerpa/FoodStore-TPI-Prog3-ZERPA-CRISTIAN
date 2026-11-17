export interface IProduct {
  id: number;
  nombre: string;
  precio: number;
  descripcion: string;
  stock: number;
  imagen: string;
  disponible: boolean;
  eliminado?: boolean;
  categoriaId?: number;
  categoria?: {
    id: number;
    nombre: string;
    descripcion?: string;
  };
  createdAt?: string;
}

export interface ICartItem {
  product: IProduct;
  quantity: number;
}