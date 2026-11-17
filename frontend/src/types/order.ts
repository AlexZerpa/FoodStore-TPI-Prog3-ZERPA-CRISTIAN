export type EstadoPedido = 'PENDIENTE' | 'CONFIRMADO' | 'TERMINADO' | 'CANCELADO';
export type FormaPago = 'TARJETA' | 'TRANSFERENCIA' | 'EFECTIVO';

export interface IDetallePedido {
  idProducto: number;
  cantidad: number;
  subtotal: number;
}

export interface IPedido {
  id: number;
  fecha: string;
  estado: EstadoPedido;
  total: number;
  formaPago: FormaPago;
  idUsuario: number;
  telefono?: string;
  direccion?: string;
  notas?: string;
  detalles: IDetallePedido[];
}