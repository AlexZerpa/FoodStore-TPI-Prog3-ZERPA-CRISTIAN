package com.tp.jpa;

import com.tp.jpa.model.Categoria;
import com.tp.jpa.model.DetallePedido;
import com.tp.jpa.model.Pedido;
import com.tp.jpa.model.Producto;
import com.tp.jpa.model.Usuario;
import com.tp.jpa.model.enums.Estado;
import com.tp.jpa.model.enums.FormaPago;
import com.tp.jpa.model.enums.Rol;
import com.tp.jpa.repository.CategoriaRepository;
import com.tp.jpa.repository.PedidoRepository;
import com.tp.jpa.repository.ProductoRepository;
import com.tp.jpa.repository.UsuarioRepository;
import com.tp.jpa.util.JPAUtil;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityTransaction;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Scanner;

public class Main {

    private static final Scanner scanner = new Scanner(System.in);
    private static final CategoriaRepository categoriaRepo = new CategoriaRepository();
    private static final ProductoRepository productoRepo = new ProductoRepository();
    private static final UsuarioRepository usuarioRepo = new UsuarioRepository();
    private static final PedidoRepository pedidoRepo = new PedidoRepository();

    public static void main(String[] args) {
        // Silencia los logs INFO/WARN de Hibernate en consola
        java.util.logging.Logger.getLogger("org.hibernate").setLevel(java.util.logging.Level.SEVERE);

        boolean salir = false;
        while (!salir) {
            System.out.println("\n==============================================");
            System.out.println("   FOOD STORE - SISTEMA DE GESTION JPA");
            System.out.println("==============================================");
            System.out.println("1. Gestionar Categorias");
            System.out.println("2. Gestionar Productos");
            System.out.println("3. Gestionar Usuarios");
            System.out.println("4. Gestionar Pedidos");
            System.out.println("5. Reportes");
            System.out.println("0. Salir");
            System.out.print("Seleccione una opcion: ");

            String opcion = scanner.nextLine().trim();
            switch (opcion) {
                case "1":
                    menuCategorias();
                    break;
                case "2":
                    menuProductos();
                    break;
                case "3":
                    menuUsuarios();
                    break;
                case "4":
                    menuPedidos();
                    break;
                case "5":
                    menuReportes();
                    break;
                case "0":
                    System.out.println("Cerrando recursos y saliendo del sistema...");
                    JPAUtil.close();
                    salir = true;
                    break;
                default:
                    System.out.println("Opcion no valida. Intente nuevamente.");
            }
        }
    }

    // =========================================================================
    // 1. SUBMENU: GESTION DE CATEGORIAS
    // =========================================================================
    private static void menuCategorias() {
        boolean volver = false;
        while (!volver) {
            System.out.println("\n-- Submenu: Categorias --------");
            System.out.println("  1. Alta de categoria");
            System.out.println("  2. Modificar categoria");
            System.out.println("  3. Baja logica de categoria");
            System.out.println("  4. Listar categorias activas");
            System.out.println("  0. Volver al menu principal");
            System.out.println("-------------------------------");
            System.out.print("Opcion: ");

            String op = scanner.nextLine().trim();
            switch (op) {
                case "1":
                    altaCategoria();
                    break;
                case "2":
                    modificarCategoria();
                    break;
                case "3":
                    bajaCategoria();
                    break;
                case "4":
                    listarCategorias();
                    break;
                case "0":
                    volver = true;
                    break;
                default:
                    System.out.println("Opcion incorrecta.");
            }
        }
    }

    private static void altaCategoria() {
        System.out.print("Ingrese nombre de la categoria (obligatorio): ");
        String nombre = scanner.nextLine().trim();
        if (nombre.isEmpty()) {
            System.err.println("Error: El nombre no puede estar vacio.");
            return;
        }
        System.out.print("Ingrese descripcion (opcional): ");
        String descripcion = scanner.nextLine().trim();

        Categoria categoria = Categoria.builder()
                .nombre(nombre)
                .descripcion(descripcion)
                .build();

        Categoria guardada = categoriaRepo.guardar(categoria);
        System.out.println("Categoria dada de alta exitosamente con ID: " + guardada.getId());
    }

    private static void modificarCategoria() {
        List<Categoria> categorias = categoriaRepo.listarActivos();
        if (categorias.isEmpty()) {
            System.out.println("No hay categorias activas para modificar.");
            return;
        }
        listarCategorias();

        System.out.print("\nIngrese el ID de la categoria a modificar: ");
        Long id = leerLong();
        if (id == null) return;

        Optional<Categoria> optCat = categoriaRepo.buscarPorId(id);
        if (optCat.isEmpty() || optCat.get().isEliminado()) {
            System.err.println("Error: La categoria no existe o se encuentra inactiva.");
            return;
        }

        Categoria cat = optCat.get();
        System.out.println("Nombre actual: " + cat.getNombre());
        System.out.print("Nuevo nombre (dejar en blanco para conservar): ");
        String nuevoNombre = scanner.nextLine().trim();
        if (!nuevoNombre.isEmpty()) {
            cat.setNombre(nuevoNombre);
        }

        System.out.println("Descripcion actual: " + cat.getDescripcion());
        System.out.print("Nueva descripcion (dejar en blanco para conservar): ");
        String nuevaDesc = scanner.nextLine().trim();
        if (!nuevaDesc.isEmpty()) {
            cat.setDescripcion(nuevaDesc);
        }

        categoriaRepo.guardar(cat);
        System.out.println("Categoria ID " + cat.getId() + " modificada correctamente.");
    }

    private static void bajaCategoria() {
        System.out.print("Ingrese el ID de la categoria a dar de baja: ");
        Long id = leerLong();
        if (id == null) return;

        Optional<Categoria> optCat = categoriaRepo.buscarPorId(id);
        if (optCat.isEmpty() || optCat.get().isEliminado()) {
            System.err.println("Error: La categoria no existe o ya esta dada de baja.");
            return;
        }

        boolean eliminada = categoriaRepo.eliminarLogico(id);
        if (eliminada) {
            System.out.println("Categoria '" + optCat.get().getNombre() + "' dada de baja correctamente.");
        } else {
            System.err.println("Error al dar de baja la categoria.");
        }
    }

    private static void listarCategorias() {
        List<Categoria> lista = categoriaRepo.listarActivos();
        if (lista.isEmpty()) {
            System.out.println("No se registran categorias activas.");
            return;
        }
        System.out.println("\n>> Listado de Categorias Activas");
        System.out.printf("%-6s %-22s %-35s%n", "ID", "Nombre", "Descripcion");
        System.out.println("-----------------------------------------------------------------");
        for (Categoria c : lista) {
            System.out.printf("%-6d %-22s %-35s%n",
                    c.getId(),
                    c.getNombre(),
                    c.getDescripcion() != null ? c.getDescripcion() : "");
        }
    }

    // =========================================================================
    // 2. SUBMENU: GESTION DE PRODUCTOS
    // =========================================================================
    private static void menuProductos() {
        boolean volver = false;
        while (!volver) {
            System.out.println("\n-- Submenu: Productos ---------");
            System.out.println("  1. Alta de producto");
            System.out.println("  2. Modificar producto");
            System.out.println("  3. Baja logica de producto");
            System.out.println("  4. Listar productos activos");
            System.out.println("  0. Volver al menu principal");
            System.out.println("-------------------------------");
            System.out.print("Opcion: ");

            String op = scanner.nextLine().trim();
            switch (op) {
                case "1":
                    altaProducto();
                    break;
                case "2":
                    modificarProducto();
                    break;
                case "3":
                    bajaProducto();
                    break;
                case "4":
                    listarProductosPorCategorias();
                    break;
                case "0":
                    volver = true;
                    break;
                default:
                    System.out.println("Opcion incorrecta.");
            }
        }
    }

    private static void altaProducto() {
        List<Categoria> categorias = categoriaRepo.listarActivos();
        if (categorias.isEmpty()) {
            System.err.println("Error: No hay categorias activas. Debe dar de alta una categoria antes de registrar un producto.");
            return;
        }

        listarCategorias();
        System.out.print("\nSeleccione el ID de la categoria para el producto: ");
        Long catId = leerLong();
        if (catId == null) return;

        Optional<Categoria> optCat = categoriaRepo.buscarPorId(catId);
        if (optCat.isEmpty() || optCat.get().isEliminado()) {
            System.err.println("Error: La categoria seleccionada no existe o esta inactiva.");
            return;
        }

        System.out.print("Nombre del producto (obligatorio): ");
        String nombre = scanner.nextLine().trim();
        if (nombre.isEmpty()) {
            System.err.println("Error: El nombre no puede estar vacio.");
            return;
        }

        System.out.print("Descripcion: ");
        String descripcion = scanner.nextLine().trim();

        System.out.print("Precio (mayor a 0): ");
        double precio;
        try {
            precio = Double.parseDouble(scanner.nextLine().trim());
            if (precio <= 0) {
                System.err.println("Error: El precio debe ser estrictamente mayor a 0.");
                return;
            }
        } catch (NumberFormatException e) {
            System.err.println("Error: El precio debe ser un numero valido.");
            return;
        }

        System.out.print("Stock (mayor o igual a 0): ");
        int stock;
        try {
            stock = Integer.parseInt(scanner.nextLine().trim());
            if (stock < 0) {
                System.err.println("Error: El stock debe ser mayor o igual a 0.");
                return;
            }
        } catch (NumberFormatException e) {
            System.err.println("Error: El stock debe ser un entero valido.");
            return;
        }

        System.out.print("Imagen URL o ruta (opcional): ");
        String imagen = scanner.nextLine().trim();

        System.out.print("Disponible? (S/N, por defecto S): ");
        String dispInput = scanner.nextLine().trim();
        boolean disponible = !dispInput.equalsIgnoreCase("N");

        Producto producto = Producto.builder()
                .nombre(nombre)
                .descripcion(descripcion)
                .precio(precio)
                .stock(stock)
                .imagen(imagen)
                .disponible(disponible)
                .build();

        try {
            Producto guardado = categoriaRepo.agregarProducto(catId, producto);
            System.out.println("Producto '" + guardado.getNombre() + "' dado de alta con ID " +
                    guardado.getId() + " y asignado a la categoria '" + optCat.get().getNombre() + "'.");
        } catch (Exception e) {
            System.err.println("No se pudo registrar el producto: " + e.getMessage());
        }
    }

    private static void modificarProducto() {
        List<Producto> productos = productoRepo.listarActivos();
        if (productos.isEmpty()) {
            System.out.println("No hay productos activos para modificar.");
            return;
        }

        mostrarTablaProductos(productos);

        System.out.print("\nIngrese ID del producto a modificar: ");
        Long id = leerLong();
        if (id == null) return;

        Optional<Producto> optProd = productoRepo.buscarPorId(id);
        if (optProd.isEmpty() || optProd.get().isEliminado()) {
            System.err.println("Error: El producto no existe o se encuentra inactivo.");
            return;
        }

        Producto prod = optProd.get();
        System.out.println("Nombre actual: " + prod.getNombre());
        System.out.print("Nuevo nombre (dejar en blanco para conservar): ");
        String nuevoNombre = scanner.nextLine().trim();
        if (!nuevoNombre.isEmpty()) {
            prod.setNombre(nuevoNombre);
        }

        System.out.println("Precio actual: " + prod.getPrecio());
        System.out.print("Nuevo precio (dejar en blanco para conservar): ");
        String nuevoPrecioStr = scanner.nextLine().trim();
        if (!nuevoPrecioStr.isEmpty()) {
            try {
                double nuevoPrecio = Double.parseDouble(nuevoPrecioStr);
                if (nuevoPrecio <= 0) {
                    System.err.println("Error: El precio debe ser mayor a 0. Modificacion cancelada.");
                    return;
                }
                prod.setPrecio(nuevoPrecio);
            } catch (NumberFormatException e) {
                System.err.println("Error: Formato numerico incorrecto. Modificacion cancelada.");
                return;
            }
        }

        System.out.println("Stock actual: " + prod.getStock());
        System.out.print("Nuevo stock (dejar en blanco para conservar): ");
        String nuevoStockStr = scanner.nextLine().trim();
        if (!nuevoStockStr.isEmpty()) {
            try {
                int nuevoStock = Integer.parseInt(nuevoStockStr);
                if (nuevoStock < 0) {
                    System.err.println("Error: El stock no puede ser negativo. Modificacion cancelada.");
                    return;
                }
                prod.setStock(nuevoStock);
            } catch (NumberFormatException e) {
                System.err.println("Error: Formato numerico incorrecto. Modificacion cancelada.");
                return;
            }
        }

        productoRepo.guardar(prod);
        System.out.println("Producto ID " + prod.getId() + " modificado correctamente.");
    }

    private static void bajaProducto() {
        System.out.print("Ingrese el ID del producto a dar de baja: ");
        Long id = leerLong();
        if (id == null) return;

        Optional<Producto> optProd = productoRepo.buscarPorId(id);
        if (optProd.isEmpty() || optProd.get().isEliminado()) {
            System.err.println("Error: El producto no existe o ya esta dado de baja.");
            return;
        }

        boolean ok = productoRepo.eliminarLogico(id);
        if (ok) {
            System.out.println("Producto '" + optProd.get().getNombre() + "' dado de baja con exito.");
        } else {
            System.err.println("Error al procesar la baja logica del producto.");
        }
    }

    private static void listarProductosPorCategorias() {
        List<Categoria> categorias = categoriaRepo.listarActivos();
        if (categorias.isEmpty()) {
            System.out.println("No hay categorias registradas.");
            return;
        }

        System.out.println("\n>> Listado de Productos Activos");
        System.out.printf("%-6s %-26s %-12s %-8s %-12s %-20s%n",
                "ID", "Nombre", "Precio", "Stock", "Disponible", "Categoria");
        System.out.println("--------------------------------------------------------------------------------------");

        boolean hayProductos = false;
        for (Categoria cat : categorias) {
            List<Producto> productos = categoriaRepo.buscarProductosPorCategoria(cat.getId());
            for (Producto p : productos) {
                hayProductos = true;
                String dispTexto = (p.getDisponible() != null && p.getDisponible()) ? "Si" : "No";
                System.out.printf("%-6d %-26s $%-11.2f %-8d %-12s %-20s%n",
                        p.getId(),
                        p.getNombre(),
                        p.getPrecio(),
                        p.getStock(),
                        dispTexto,
                        cat.getNombre());
            }
        }

        if (!hayProductos) {
            System.out.println("No se registran productos activos en el catalogo.");
        }
    }

    private static void mostrarTablaProductos(List<Producto> productos) {
        System.out.println("\n>> Listado de Productos Activos");
        System.out.printf("%-6s %-26s %-12s %-8s %-12s%n", "ID", "Nombre", "Precio", "Stock", "Disponible");
        System.out.println("--------------------------------------------------------------------");
        for (Producto p : productos) {
            String disp = (p.getDisponible() != null && p.getDisponible()) ? "Si" : "No";
            System.out.printf("%-6d %-26s $%-11.2f %-8d %-12s%n",
                    p.getId(), p.getNombre(), p.getPrecio(), p.getStock(), disp);
        }
    }

    // =========================================================================
    // 3. SUBMENU: GESTION DE USUARIOS
    // =========================================================================
    private static void menuUsuarios() {
        boolean volver = false;
        while (!volver) {
            System.out.println("\n-- Submenu: Usuarios ----------");
            System.out.println("  1. Alta de usuario");
            System.out.println("  2. Modificar usuario");
            System.out.println("  3. Baja logica de usuario");
            System.out.println("  4. Listar usuarios activos");
            System.out.println("  5. Buscar usuario por mail");
            System.out.println("  0. Volver al menu principal");
            System.out.println("-------------------------------");
            System.out.print("Opcion: ");

            String op = scanner.nextLine().trim();
            switch (op) {
                case "1":
                    altaUsuario();
                    break;
                case "2":
                    modificarUsuario();
                    break;
                case "3":
                    bajaUsuario();
                    break;
                case "4":
                    listarUsuarios();
                    break;
                case "5":
                    buscarUsuarioPorMail();
                    break;
                case "0":
                    volver = true;
                    break;
                default:
                    System.out.println("Opcion incorrecta.");
            }
        }
    }

    private static void altaUsuario() {
        System.out.print("Nombre (obligatorio): ");
        String nombre = scanner.nextLine().trim();
        System.out.print("Apellido (obligatorio): ");
        String apellido = scanner.nextLine().trim();
        System.out.print("Mail (obligatorio): ");
        String mail = scanner.nextLine().trim();

        if (nombre.isEmpty() || apellido.isEmpty() || mail.isEmpty()) {
            System.err.println("Error: Nombre, apellido y mail son obligatorios.");
            return;
        }

        if (usuarioRepo.buscarPorMail(mail).isPresent()) {
            System.err.println("Error: Ya existe un usuario activo registrado con el mail '" + mail + "'.");
            return;
        }

        System.out.print("Celular (opcional): ");
        String celular = scanner.nextLine().trim();

        System.out.print("Contrasena (obligatoria): ");
        String contrasena = scanner.nextLine().trim();
        if (contrasena.isEmpty()) {
            System.err.println("Error: La contrasena no puede estar vacia.");
            return;
        }

        System.out.println("Seleccione el Rol:");
        System.out.println("  1. ADMIN");
        System.out.println("  2. USUARIO");
        System.out.print("Opcion (por defecto 2 - USUARIO): ");
        String rolOp = scanner.nextLine().trim();
        Rol rol = "1".equals(rolOp) ? Rol.ADMIN : Rol.USUARIO;

        Usuario usuario = Usuario.builder()
                .nombre(nombre)
                .apellido(apellido)
                .mail(mail)
                .celular(celular)
                .contrasena(contrasena)
                .rol(rol)
                .build();

        try {
            Usuario guardado = usuarioRepo.guardar(usuario);
            System.out.println("Usuario '" + guardado.getNombre() + " " + guardado.getApellido() +
                    "' dado de alta con ID: " + guardado.getId() + " (Rol: " + guardado.getRol() + ")");
        } catch (Exception e) {
            System.err.println("Error al registrar el usuario: " + e.getMessage());
        }
    }

    private static void modificarUsuario() {
        List<Usuario> usuarios = usuarioRepo.listarActivos();
        if (usuarios.isEmpty()) {
            System.out.println("No hay usuarios activos para modificar.");
            return;
        }
        listarUsuarios();

        System.out.print("\nIngrese el ID del usuario a modificar: ");
        Long id = leerLong();
        if (id == null) return;

        Optional<Usuario> optUser = usuarioRepo.buscarPorId(id);
        if (optUser.isEmpty() || optUser.get().isEliminado()) {
            System.err.println("Error: El usuario no existe o esta dado de baja.");
            return;
        }

        Usuario u = optUser.get();
        System.out.println("Nombre actual: " + u.getNombre());
        System.out.print("Nuevo nombre (Enter para conservar): ");
        String nuevoNombre = scanner.nextLine().trim();
        if (!nuevoNombre.isEmpty()) u.setNombre(nuevoNombre);

        System.out.println("Apellido actual: " + u.getApellido());
        System.out.print("Nuevo apellido (Enter para conservar): ");
        String nuevoApellido = scanner.nextLine().trim();
        if (!nuevoApellido.isEmpty()) u.setApellido(nuevoApellido);

        System.out.println("Mail actual: " + u.getMail());
        System.out.print("Nuevo mail (Enter para conservar): ");
        String nuevoMail = scanner.nextLine().trim();
        if (!nuevoMail.isEmpty() && !nuevoMail.equalsIgnoreCase(u.getMail())) {
            Optional<Usuario> existente = usuarioRepo.buscarPorMail(nuevoMail);
            if (existente.isPresent() && !existente.get().getId().equals(u.getId())) {
                System.err.println("Error: El mail ingresado ya pertenece a otro usuario activo.");
                return;
            }
            u.setMail(nuevoMail);
        }

        System.out.println("Celular actual: " + (u.getCelular() != null ? u.getCelular() : ""));
        System.out.print("Nuevo celular (Enter para conservar): ");
        String nuevoCelular = scanner.nextLine().trim();
        if (!nuevoCelular.isEmpty()) u.setCelular(nuevoCelular);

        System.out.print("Nueva contrasena (Enter para conservar): ");
        String nuevaPass = scanner.nextLine().trim();
        if (!nuevaPass.isEmpty()) u.setContrasena(nuevaPass);

        usuarioRepo.guardar(u);
        System.out.println("Usuario ID " + u.getId() + " actualizado correctamente.");
    }

    private static void bajaUsuario() {
        System.out.print("Ingrese el ID del usuario a dar de baja: ");
        Long id = leerLong();
        if (id == null) return;

        Optional<Usuario> optUser = usuarioRepo.buscarPorId(id);
        if (optUser.isEmpty() || optUser.get().isEliminado()) {
            System.err.println("Error: El usuario no existe o ya esta dado de baja.");
            return;
        }

        boolean ok = usuarioRepo.eliminarLogico(id);
        if (ok) {
            Usuario u = optUser.get();
            System.out.println("Usuario '" + u.getNombre() + " " + u.getApellido() + "' dado de baja correctamente.");
        } else {
            System.err.println("Error al dar de baja el usuario.");
        }
    }

    private static void listarUsuarios() {
        List<Usuario> lista = usuarioRepo.listarActivos();
        if (lista.isEmpty()) {
            System.out.println("No hay usuarios activos registrados.");
            return;
        }
        System.out.println("\n>> Listado de Usuarios Activos");
        System.out.printf("%-6s %-26s %-28s %-12s%n", "ID", "Nombre Completo", "Mail", "Rol");
        System.out.println("----------------------------------------------------------------------------");
        for (Usuario u : lista) {
            System.out.printf("%-6d %-26s %-28s %-12s%n",
                    u.getId(),
                    u.getNombre() + " " + u.getApellido(),
                    u.getMail(),
                    u.getRol());
        }
    }

    private static void buscarUsuarioPorMail() {
        System.out.print("Ingrese el mail a buscar: ");
        String mail = scanner.nextLine().trim();
        if (mail.isEmpty()) {
            System.err.println("Error: Debe ingresar un mail.");
            return;
        }

        Optional<Usuario> opt = usuarioRepo.buscarPorMail(mail);
        if (opt.isPresent()) {
            Usuario u = opt.get();
            System.out.println("\n>> Usuario Encontrado:");
            System.out.println("  ID:       " + u.getId());
            System.out.println("  Nombre:   " + u.getNombre() + " " + u.getApellido());
            System.out.println("  Mail:     " + u.getMail());
            System.out.println("  Celular:  " + (u.getCelular() != null && !u.getCelular().isEmpty() ? u.getCelular() : "-"));
            System.out.println("  Rol:      " + u.getRol());
        } else {
            System.out.println("No existe ningun usuario activo con el mail: " + mail);
        }
    }

    // =========================================================================
    // 4. SUBMENU: GESTION DE PEDIDOS
    // =========================================================================
    private static void menuPedidos() {
        boolean volver = false;
        while (!volver) {
            System.out.println("\n-- Submenu: Pedidos -----------");
            System.out.println("  1. Alta de pedido");
            System.out.println("  2. Cambiar estado de pedido");
            System.out.println("  3. Baja logica de pedido");
            System.out.println("  4. Listar pedidos activos");
            System.out.println("  5. Pedidos por usuario");
            System.out.println("  6. Pedidos por estado");
            System.out.println("  0. Volver al menu principal");
            System.out.println("-------------------------------");
            System.out.print("Opcion: ");

            String op = scanner.nextLine().trim();
            switch (op) {
                case "1":
                    altaPedido();
                    break;
                case "2":
                    cambiarEstadoPedido();
                    break;
                case "3":
                    bajaPedido();
                    break;
                case "4":
                    listarTodosPedidos();
                    break;
                case "5":
                    reportePedidosPorUsuario();
                    break;
                case "6":
                    reportePedidosPorEstado();
                    break;
                case "0":
                    volver = true;
                    break;
                default:
                    System.out.println("Opcion incorrecta.");
            }
        }
    }

    private static void altaPedido() {
        List<Usuario> usuarios = usuarioRepo.listarActivos();
        if (usuarios.isEmpty()) {
            System.err.println("Error: No hay usuarios activos. Registre un usuario antes de crear un pedido.");
            return;
        }

        listarUsuarios();
        System.out.print("\nSeleccione el ID del usuario para el pedido: ");
        Long idUsuario = leerLong();
        if (idUsuario == null) return;

        Optional<Usuario> optUsuario = usuarioRepo.buscarPorId(idUsuario);
        if (optUsuario.isEmpty() || optUsuario.get().isEliminado()) {
            System.err.println("Error: El usuario seleccionado no existe o esta dado de baja.");
            return;
        }

        FormaPago formaPago = seleccionarFormaPago();
        if (formaPago == null) return;

        // Lista temporal en memoria: idProducto -> cantidad acumulada
        Map<Long, Integer> itemsSeleccionados = new LinkedHashMap<>();
        boolean agregarMas = true;

        while (agregarMas) {
            List<Producto> productos = productoRepo.listarActivos();
            if (productos.isEmpty()) {
                System.err.println("No hay productos activos en el catalogo.");
                break;
            }

            mostrarTablaProductos(productos);
            System.out.print("\nIngrese el ID del producto a agregar: ");
            Long idProd = leerLong();
            if (idProd == null) continue;

            Optional<Producto> optProd = productoRepo.buscarPorId(idProd);
            if (optProd.isEmpty() || optProd.get().isEliminado()) {
                System.err.println("Error: El producto no existe o esta dado de baja.");
                continue;
            }

            Producto prod = optProd.get();
            if (prod.getDisponible() == null || !prod.getDisponible()) {
                System.err.println("Error: El producto '" + prod.getNombre() + "' no se encuentra disponible.");
                continue;
            }

            System.out.print("Ingrese cantidad (mayor a 0): ");
            int cantidad;
            try {
                cantidad = Integer.parseInt(scanner.nextLine().trim());
                if (cantidad <= 0) {
                    System.err.println("Error: La cantidad debe ser mayor a 0.");
                    continue;
                }
            } catch (NumberFormatException e) {
                System.err.println("Error: Cantidad invalida.");
                continue;
            }

            int yaAgregado = itemsSeleccionados.getOrDefault(idProd, 0);
            if (yaAgregado + cantidad > prod.getStock()) {
                System.err.println("Error: Stock insuficiente para '" + prod.getNombre() +
                        "'. Stock disponible: " + prod.getStock() +
                        (yaAgregado > 0 ? " (ya agregaste " + yaAgregado + ")" : ""));
                continue;
            }

            itemsSeleccionados.put(idProd, yaAgregado + cantidad);
            System.out.println("Agregado: " + cantidad + " x " + prod.getNombre());

            System.out.print("¿Desea agregar otro producto al pedido? (S/N): ");
            String resp = scanner.nextLine().trim();
            if (!resp.equalsIgnoreCase("S")) {
                agregarMas = false;
            }
        }

        if (itemsSeleccionados.isEmpty()) {
            System.err.println("Operacion cancelada: El pedido debe tener al menos un detalle.");
            return;
        }

        // Unica transaccion atomica para persistir Pedido, Detalles, vincular al Usuario y descontar stock
        EntityManager em = JPAUtil.getEntityManager();
        EntityTransaction tx = em.getTransaction();
        try {
            tx.begin();

            Usuario usuarioGestionado = em.find(Usuario.class, idUsuario);
            if (usuarioGestionado == null || usuarioGestionado.isEliminado()) {
                throw new IllegalStateException("Usuario no disponible al confirmar la transaccion.");
            }

            Pedido pedido = Pedido.builder()
                    .fecha(LocalDate.now())
                    .estado(Estado.PENDIENTE)
                    .formaPago(formaPago)
                    .build();

            for (Map.Entry<Long, Integer> entry : itemsSeleccionados.entrySet()) {
                Producto prodGestionado = em.find(Producto.class, entry.getKey());
                int cant = entry.getValue();

                if (prodGestionado == null || prodGestionado.isEliminado()
                        || prodGestionado.getDisponible() == null || !prodGestionado.getDisponible()) {
                    throw new IllegalStateException("El producto ID " + entry.getKey() + " ya no esta disponible.");
                }
                if (prodGestionado.getStock() < cant) {
                    throw new IllegalStateException("Stock insuficiente para '" + prodGestionado.getNombre() + "'.");
                }

                pedido.addDetallePedido(cant, prodGestionado);
                prodGestionado.setStock(prodGestionado.getStock() - cant);
            }

            pedido.calcularTotal();
            usuarioGestionado.addPedido(pedido);
            em.persist(pedido);

            tx.commit();

            // Mostrar resumen exitoso
            System.out.println("\n==============================================");
            System.out.println("   PEDIDO CONFIRMADO EXITOSAMENTE");
            System.out.println("==============================================");
            System.out.println("ID Pedido:     #" + pedido.getId());
            System.out.println("Fecha:         " + pedido.getFecha());
            System.out.println("Cliente:       " + usuarioGestionado.getNombre() + " " + usuarioGestionado.getApellido());
            System.out.println("Estado:        " + pedido.getEstado());
            System.out.println("Forma de Pago: " + pedido.getFormaPago());
            System.out.println("----------------------------------------------");
            for (DetallePedido det : pedido.getDetalles()) {
                System.out.printf("  - %-24s x%-3d  $%.2f%n",
                        det.getProducto().getNombre(),
                        det.getCantidad(),
                        det.getSubtotal());
            }
            System.out.println("----------------------------------------------");
            System.out.printf(Locale.US, "TOTAL DEL PEDIDO: $%.2f%n", pedido.getTotal());
            System.out.println("==============================================");

        } catch (Exception e) {
            if (tx.isActive()) {
                tx.rollback();
            }
            System.err.println("Error al procesar el pedido (se realizo rollback completo): " + e.getMessage());
        } finally {
            em.close();
        }
    }

    private static void cambiarEstadoPedido() {
        listarTodosPedidos();
        System.out.print("\nIngrese el ID del pedido a actualizar: ");
        Long id = leerLong();
        if (id == null) return;

        Optional<Pedido> optPed = pedidoRepo.buscarPorId(id);
        if (optPed.isEmpty() || optPed.get().isEliminado()) {
            System.err.println("Error: El pedido no existe o esta dado de baja.");
            return;
        }

        Pedido pedido = optPed.get();
        System.out.println("Estado actual del Pedido #" + pedido.getId() + ": " + pedido.getEstado());
        Estado nuevoEstado = seleccionarEstado();
        if (nuevoEstado == null) return;

        pedido.setEstado(nuevoEstado);
        pedidoRepo.guardar(pedido);
        System.out.println("Pedido #" + pedido.getId() + " actualizado a estado: " + pedido.getEstado());
    }

    private static void bajaPedido() {
        System.out.print("Ingrese el ID del pedido a dar de baja: ");
        Long id = leerLong();
        if (id == null) return;

        Optional<Pedido> optPed = pedidoRepo.buscarPorId(id);
        if (optPed.isEmpty() || optPed.get().isEliminado()) {
            System.err.println("Error: El pedido no existe o ya esta dado de baja.");
            return;
        }

        Pedido p = optPed.get();
        boolean ok = pedidoRepo.eliminarLogico(id);
        if (ok) {
            System.out.printf(Locale.US, "Pedido #%d (Total: $%.2f) dado de baja correctamente. El stock no fue restaurado.%n",
                    p.getId(), p.getTotal());
        } else {
            System.err.println("Error al dar de baja el pedido.");
        }
    }

    private static void listarTodosPedidos() {
        List<Pedido> pedidos = pedidoRepo.listarActivos();
        if (pedidos.isEmpty()) {
            System.out.println("No se registran pedidos activos.");
            return;
        }

        // Mapa auxiliar pedidoId -> nombre completo del usuario dueño
        Map<Long, String> duenos = obtenerMapaDuenosPedidos();

        System.out.println("\n>> Listado de Pedidos Activos");
        System.out.printf("%-6s %-12s %-13s %-15s %-22s %-12s%n",
                "ID", "Fecha", "Estado", "Forma Pago", "Cliente", "Total");
        System.out.println("--------------------------------------------------------------------------------------");
        for (Pedido p : pedidos) {
            String cliente = duenos.getOrDefault(p.getId(), "Sin asignar");
            System.out.printf(Locale.US, "%-6d %-12s %-13s %-15s %-22s $%-11.2f%n",
                    p.getId(), p.getFecha(), p.getEstado(), p.getFormaPago(), cliente, p.getTotal());
        }
    }

    // =========================================================================
    // 5. SUBMENU: REPORTES (CONSULTAS JPQL)
    // =========================================================================
    private static void menuReportes() {
        boolean volver = false;
        while (!volver) {
            System.out.println("\n-- Submenu: Reportes JPQL -----");
            System.out.println("  1. Productos por categoria");
            System.out.println("  2. Pedidos por usuario");
            System.out.println("  3. Pedidos por estado");
            System.out.println("  4. Total facturado (Pedidos TERMINADO)");
            System.out.println("  0. Volver al menu principal");
            System.out.println("-------------------------------");
            System.out.print("Opcion: ");

            String op = scanner.nextLine().trim();
            switch (op) {
                case "1":
                    reporteProductosPorCategoria();
                    break;
                case "2":
                    reportePedidosPorUsuario();
                    break;
                case "3":
                    reportePedidosPorEstado();
                    break;
                case "4":
                    reporteTotalFacturado();
                    break;
                case "0":
                    volver = true;
                    break;
                default:
                    System.out.println("Opcion incorrecta.");
            }
        }
    }

    private static void reporteProductosPorCategoria() {
        List<Categoria> categorias = categoriaRepo.listarActivos();
        if (categorias.isEmpty()) {
            System.out.println("No hay categorias activas registradas.");
            return;
        }

        listarCategorias();
        System.out.print("\nSeleccione el ID de la categoria a consultar: ");
        Long catId = leerLong();
        if (catId == null) return;

        Optional<Categoria> optCat = categoriaRepo.buscarPorId(catId);
        if (optCat.isEmpty() || optCat.get().isEliminado()) {
            System.err.println("Error: Categoria no encontrada o dada de baja.");
            return;
        }

        List<Producto> productos = categoriaRepo.buscarProductosPorCategoria(catId);
        System.out.println("\n>> Productos de la categoria '" + optCat.get().getNombre() + "'");
        if (productos.isEmpty()) {
            System.out.println("No se registran productos activos en esta categoria.");
        } else {
            System.out.printf("%-6s %-24s %-12s %-8s%n", "ID", "Nombre", "Precio", "Stock");
            System.out.println("------------------------------------------------------");
            for (Producto p : productos) {
                System.out.printf(Locale.US, "%-6d %-24s $%-11.2f %-8d%n",
                        p.getId(), p.getNombre(), p.getPrecio(), p.getStock());
            }
        }
    }

    private static void reportePedidosPorUsuario() {
        List<Usuario> usuarios = usuarioRepo.listarActivos();
        if (usuarios.isEmpty()) {
            System.out.println("No hay usuarios activos registrados.");
            return;
        }

        listarUsuarios();
        System.out.print("\nSeleccione el ID del usuario a consultar: ");
        Long uid = leerLong();
        if (uid == null) return;

        Optional<Usuario> optUser = usuarioRepo.buscarPorId(uid);
        if (optUser.isEmpty() || optUser.get().isEliminado()) {
            System.err.println("Error: Usuario no encontrado o dado de baja.");
            return;
        }

        List<Pedido> pedidos = usuarioRepo.buscarPedidosPorUsuario(uid);
        System.out.println("\n>> Pedidos activos de " + optUser.get().getNombre() + " " + optUser.get().getApellido());
        if (pedidos.isEmpty()) {
            System.out.println("El usuario seleccionado no tiene pedidos activos registrados.");
        } else {
            System.out.printf("%-6s %-12s %-13s %-15s %-12s%n", "ID", "Fecha", "Estado", "Forma Pago", "Total");
            System.out.println("--------------------------------------------------------------");
            for (Pedido p : pedidos) {
                System.out.printf(Locale.US, "%-6d %-12s %-13s %-15s $%-11.2f%n",
                        p.getId(), p.getFecha(), p.getEstado(), p.getFormaPago(), p.getTotal());
            }
        }
    }

    private static void reportePedidosPorEstado() {
        Estado estado = seleccionarEstado();
        if (estado == null) return;

        List<Pedido> pedidos = pedidoRepo.buscarPorEstado(estado);
        System.out.println("\n>> Pedidos en estado: " + estado);
        if (pedidos.isEmpty()) {
            System.out.println("No hay pedidos activos con el estado " + estado + ".");
        } else {
            Map<Long, String> duenos = obtenerMapaDuenosPedidos();
            System.out.printf("%-6s %-12s %-24s %-12s%n", "ID", "Fecha", "Cliente", "Total");
            System.out.println("----------------------------------------------------------");
            for (Pedido p : pedidos) {
                String cliente = duenos.getOrDefault(p.getId(), "Sin asignar");
                System.out.printf(Locale.US, "%-6d %-12s %-24s $%-11.2f%n",
                        p.getId(), p.getFecha(), cliente, p.getTotal());
            }
        }
    }

    private static void reporteTotalFacturado() {
        List<Pedido> terminados = pedidoRepo.buscarPorEstado(Estado.TERMINADO);
        double totalFacturado = terminados.stream()
                .mapToDouble(p -> p.getTotal() != null ? p.getTotal() : 0.0)
                .sum();

        System.out.println("\n>> Reporte de Facturacion (Pedidos TERMINADO)");
        System.out.println("Cantidad de pedidos terminados: " + terminados.size());
        System.out.println(String.format(Locale.US, "Total facturado: $%.2f", totalFacturado));
    }

    // =========================================================================
    // HELPERS DE CONSOLA
    // =========================================================================
    private static Long leerLong() {
        try {
            return Long.parseLong(scanner.nextLine().trim());
        } catch (NumberFormatException e) {
            System.err.println("Error: Debe ingresar un ID numerico valido.");
            return null;
        }
    }

    private static FormaPago seleccionarFormaPago() {
        System.out.println("Seleccione Forma de Pago:");
        System.out.println("  1. TARJETA");
        System.out.println("  2. TRANSFERENCIA");
        System.out.println("  3. EFECTIVO");
        System.out.print("Opcion: ");
        switch (scanner.nextLine().trim()) {
            case "1":
                return FormaPago.TARJETA;
            case "2":
                return FormaPago.TRANSFERENCIA;
            case "3":
                return FormaPago.EFECTIVO;
            default:
                System.err.println("Error: Forma de pago no valida.");
                return null;
        }
    }

    private static Estado seleccionarEstado() {
        System.out.println("Seleccione Estado:");
        System.out.println("  1. PENDIENTE");
        System.out.println("  2. CONFIRMADO");
        System.out.println("  3. TERMINADO");
        System.out.println("  4. CANCELADO");
        System.out.print("Opcion: ");
        switch (scanner.nextLine().trim()) {
            case "1":
                return Estado.PENDIENTE;
            case "2":
                return Estado.CONFIRMADO;
            case "3":
                return Estado.TERMINADO;
            case "4":
                return Estado.CANCELADO;
            default:
                System.err.println("Error: Estado no valido.");
                return null;
        }
    }

    private static Map<Long, String> obtenerMapaDuenosPedidos() {
        Map<Long, String> mapa = new LinkedHashMap<>();
        for (Usuario u : usuarioRepo.listarActivos()) {
            List<Pedido> peds = usuarioRepo.buscarPedidosPorUsuario(u.getId());
            for (Pedido p : peds) {
                mapa.put(p.getId(), u.getNombre() + " " + u.getApellido());
            }
        }
        return mapa;
    }
}