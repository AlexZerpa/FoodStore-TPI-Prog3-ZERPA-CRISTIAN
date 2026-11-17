import { getUsuarios } from "../../../utils/api";
import { navigate } from "../../../utils/navigate"

const form = document.getElementById("form") as HTMLFormElement;
const inputEmail = document.getElementById("email") as HTMLInputElement;
const inputPassword = document.getElementById("password") as HTMLInputElement;
const errorMsg = document.getElementById("error-msg") as HTMLParagraphElement;

form.addEventListener("submit", async (e: SubmitEvent) => {
  e.preventDefault();
  errorMsg.style.display = "none";

  const valueEmail = inputEmail.value.trim();
  const valuePassword = inputPassword.value.trim();

  try {
    // 1. Traemos los usuarios desde /data/usuarios.json
    const usuarios = await getUsuarios();

    // 2. Buscamos coincidencia de mail y password
    const usuarioEncontrado = usuarios.find(
      (u) => u.mail === valueEmail && u.password === valuePassword
    );
    
    if (!usuarioEncontrado){
      errorMsg.textContent = "Email o contraseña incorrectos.";
      errorMsg.style.display = "block";
      return;
    }

    // 3. Guardamos el usuario en localStorage EXCLUYENDO el password
    const { password, ...usuarioSinPassword } = usuarioEncontrado;
    localStorage.setItem("userData", JSON.stringify(usuarioSinPassword));

    // 4. Redirigimos segun el rol
    if (usuarioEncontrado.rol === "ADMIN"){
      navigate("/src/pages/admin/adminHome/home.html");
    
    }else {
      navigate("/src/pages/store/home/home.html");
    }
  }catch (error){
    console.error(error);
    errorMsg.textContent = "Error al conectar con los datos de usuarios.";
    errorMsg.style.display = "block";
  }
});
