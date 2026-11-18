package com.tp.jpa.repository;

import com.tp.jpa.model.Pedido;
import com.tp.jpa.model.enums.Estado;
import com.tp.jpa.util.JPAUtil;
import jakarta.persistence.EntityManager;

import java.util.Collections;
import java.util.List;

public class PedidoRepository extends BaseRepository<Pedido> {

    public PedidoRepository() {
        super(Pedido.class);
    }

    /**
     * Retorna todos los pedidos activos que coincidan con el estado indicado.
     */
    public List<Pedido> buscarPorEstado(Estado estado) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            // Consulta JPQL: retorna todos los pedidos activos con un estado específico
            // (PENDIENTE, CONFIRMADO, TERMINADO o CANCELADO) excluyendo las bajas lógicas.
            String jpql = "SELECT p FROM Pedido p WHERE p.estado = :estado AND p.eliminado = false";
            return em.createQuery(jpql, Pedido.class)
                    .setParameter("estado", estado)
                    .getResultList();
        } catch (Exception e) {
            System.err.println("Error al buscar pedidos por estado: " + e.getMessage());
            return Collections.emptyList();
        } finally {
            em.close();
        }
    }
}