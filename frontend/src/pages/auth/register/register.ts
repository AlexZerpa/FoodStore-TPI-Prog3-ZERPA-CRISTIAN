import { getUsuarios } from "../../../utils/api";
import { navigate } from "../../../utils/navigate";
import type { IUser } from "../../../types/IUser";

const form = document.getElementById("register-form") as HTMLFormElement;
const inputNombre = document.getElementById("reg-nombre") as HTMLInputElement;
const inputApellido = document.getElementById("reg-apellido") as HTMLInputElement;
const inputEmail = document.getElementById("reg-email") as HTMLInputElement;
const inputCelular = document.getElementById("reg-celular") as HTMLInputElement;
const inputPassword = document.getElementById("reg-password") as HTMLInputElement;
const errorEl = document.getElementById("reg-error") as HTMLParagraphElement;
const authCard = document.querySelector(".auth-card") as HTMLDivElement;

function mostrarError(mensaje: string): void {
  errorEl.textContent = mensaje;
  errorEl.style.display = "block";
}

form.addEventListener("submit", async (e: SubmitEvent) => {
  e.preventDefault();
  errorEl.style.display = "none";

  const nombre = inputNombre.value.trim();
  const apellido = inputApellido.value.trim();
  const mail = inputEmail.value.trim();
  const celular = inputCelular.value.trim();
  const password = inputPassword.value.trim();

  if (!nombre || !apellido || !mail || !password) {
    mostrarError("Todos los campos obligatorios deben completarse.");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(mail)) {
    mostrarError("Ingresá un formato de email válido.");
    return;
  }

  if (password.length < 6) {
    mostrarError("La contraseña debe tener al menos 6 caracteres.");
    return;
  }

  try {
    const usuariosJson = await getUsuarios();
    const localRaw = localStorage.getItem("localUsuarios");
    const usuariosLocales: IUser[] = localRaw ? JSON.parse(localRaw) : [];

    const todosUsuarios = [...usuariosJson, ...usuariosLocales];

    // Verificar que el email no exista ni en usuarios.json ni en localStorage
    const existe = todosUsuarios.some((u) => u.mail.toLowerCase() === mail.toLowerCase());
    if (existe) {
      mostrarError("Ese correo electrónico ya está registrado.");
      return;
    }

    const nuevoId = todosUsuarios.length > 0 ? Math.max(...todosUsuarios.map((u) => u.id)) + 1 : 3;
    const nuevoUsuario: IUser = {
      id: nuevoId,
      nombre,
      apellido,
      mail,
      celular: celular || undefined,
      password,
      rol: "USUARIO",
    };

    // Guardar en la lista local para futuros inicios de sesión
    usuariosLocales.push(nuevoUsuario);
    localStorage.setItem("localUsuarios", JSON.stringify(usuariosLocales));

    // Auto-login: guardar sesión activa en userData (sin contraseña)
    const { password: _, ...usuarioSesion } = nuevoUsuario;
    localStorage.setItem("userData", JSON.stringify(usuarioSesion));

    // Mostrar mensaje de registro exitoso y redirigir directo al catálogo
    authCard.innerHTML = `
      <div style="text-align: center; padding: 20px 10px;">
        <div style="width: 54px; height: 54px; background: #22c55e; color: white; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; font-size: 1.8rem; margin-bottom: 14px;">
          ✓
        </div>
        <h2 style="color: #16a34a; margin: 0 0 10px 0;">¡Registro exitoso!</h2>
        <p style="color: #6b7280; margin: 0 0 22px 0;">Bienvenido ${nombre}, ingresando a la tienda...</p>
        <a href="../../store/home/home.html" style="display: inline-block; width: 100%; box-sizing: border-box; background-color: #1a3c34; color: #ffffff; text-decoration: none; padding: 11px; border-radius: 6px; font-weight: 600;">
          Ir a la Tienda
        </a>
      </div>
    `;

    setTimeout(() => {
      navigate("/src/pages/store/home/home.html");
    }, 2000);
  } catch (error) {
    console.error("Error en el registro:", error);
    mostrarError("Ocurrió un error al validar el registro.");
  }
});