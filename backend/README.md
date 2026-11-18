# ☕ Food Store — Backend JPA + Hibernate + H2 (TPI Programación III)

**Alumno:** Zerpa Cristian  
**Carrera:** Tecnicatura Universitaria en Programación — UTN  
**Materia:** Programación III (Trabajo Práctico Integrador - Parte 2)

---

## ✍️ Descripción

Sistema de gestión de pedidos de comida **Food Store** implementado en **Java** utilizando **JPA / Hibernate** y base de datos embebida **H2 en archivo** (`./data/jpa_db`), operado íntegramente mediante un menú de consola interactivo.

Incluye:
- Modelo de dominio con herencia (`@MappedSuperclass` en `Base`), interfaz `Calculable` y relaciones unidireccionales (`Categoria → Producto`, `Usuario → Pedido`, `Pedido → DetallePedido`, `DetallePedido → Producto`).
- Repositorio genérico abstracto `BaseRepository<T>` y repositorios especializados (`CategoriaRepository`, `ProductoRepository`, `UsuarioRepository`, `PedidoRepository`).
- Consultas JPQL tipadas con parámetros nombrados y filtro de baja lógica (`eliminado = false`).
- Transacción atómica única para el alta de pedidos con validación y descuento automático de stock.

---

## 🚀 Requisitos y Ejecución

- **Java JDK 17** o superior.
- **Gradle** (el proyecto incluye Gradle Wrapper `./gradlew` / `gradlew.bat`).

### Ejecutar desde IntelliJ IDEA
1. Abrir la carpeta `backend/` en IntelliJ IDEA y esperar a que Gradle sincronice las dependencias.
2. Ejecutar el método `main` de la clase `com.tp.jpa.Main`.

### Ejecutar desde línea de comandos (Terminal)
Dentro de la carpeta `backend/`:
```bash
# Compilar el proyecto
./gradlew build

# Ejecutar la aplicación de consola
./gradlew run

