export type RolUsuario = 'ADMIN' | 'USUARIO';

export interface IUser {
  id: number;
  nombre: string;
  apellido: string;
  mail: string;
  celular?: string;
  rol: RolUsuario;
  password?: string; // Opcional 
}