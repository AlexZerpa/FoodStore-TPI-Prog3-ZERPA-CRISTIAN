package com.tp.jpa.repository;

import com.tp.jpa.model.Pedido;
import com.tp.jpa.model.Usuario;
import com.tp.jpa.util.JPAUtil;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

public class UsuarioRepository extends BaseRepository<Usuario> {

    public UsuarioRepository() {
        super(Usuario.class);
    }

    /**
     * Busca un usuario activo por su dirección de correo electrónico.
     */
    public Optional<Usuario> buscarPorMail(String mail) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            // Consulta JPQL: busca un usuario activo por su dirección de correo electrónico.
            // Filtra por el parámetro nombrado :mail y u.eliminado = false para excluir bajas lógicas.
            // Retorna Optional para manejar de forma segura el caso en que el mail no esté registrado.
            String jpql = "SELECT u FROM Usuario u WHERE u.mail = :mail AND u.eliminado = false";
            TypedQuery<Usuario> q = em.createQuery(jpql, Usuario.class);
            q.setParameter("mail", mail);
            List<Usuario> res = q.getResultList();
            return res.isEmpty() ? Optional.empty() : Optional.of(res.get(0));
        } catch (Exception e) {
            System.err.println("Error al buscar usuario por mail: " + e.getMessage());
            return Optional.empty();
        } finally {
            em.close();
        }
    }

    /**
     * Retorna todos los pedidos activos asociados a un usuario específico.
     */
    public List<Pedido> buscarPedidosPorUsuario(Long idUsuario) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            // Consulta JPQL: retorna los pedidos activos de un usuario.
            // Como la relación es unidireccional y Usuario es el dueño, se navega
            // desde Usuario hacia su colección u.pedidos mediante JOIN.
            // Se filtra por el id del usuario (:uid) y por p.eliminado = false para excluir bajas lógicas.
            String jpql = "SELECT p FROM Usuario u JOIN u.pedidos p WHERE u.id = :uid AND p.eliminado = false";
            return em.createQuery(jpql, Pedido.class)
                    .setParameter("uid", idUsuario)
                    .getResultList();
        } catch (Exception e) {
            System.err.println("Error al buscar pedidos por usuario: " + e.getMessage());
            return Collections.emptyList();
        } finally {
            em.close();
        }
    }
}