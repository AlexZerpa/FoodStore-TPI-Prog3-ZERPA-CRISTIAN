package com.tp.jpa.repository;

import com.tp.jpa.model.Base;
import com.tp.jpa.util.JPAUtil;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityTransaction;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

public abstract class BaseRepository<T extends Base> {
    protected final Class<T> entityClass;

    public BaseRepository(Class<T> entityClass) {
        this.entityClass = entityClass;
    }

    public Class<T> getEntityClass() {
        return entityClass;
    }

    /**
     * Guarda una entidad. Si el ID es null realiza persist(), si ya posee ID realiza merge().
     * Retorna la entidad gestionada (de donde se extrae el ID final).
     */
    public T guardar(T entity) {
        EntityManager em = JPAUtil.getEntityManager();
        EntityTransaction tx = em.getTransaction();
        T managedEntity = null;
        try {
            tx.begin();
            if (entity.getId() == null) {
                em.persist(entity);
                managedEntity = entity;
            } else {
                managedEntity = em.merge(entity);
            }
            tx.commit();
            return managedEntity;
        } catch (Exception e) {
            if (tx.isActive()) {
                tx.rollback();
            }
            System.err.println("Error al guardar entidad: " + e.getMessage());
            throw new RuntimeException("Error al guardar entidad", e);
        } finally {
            em.close();
        }
    }

    /**
     * Busca una entidad activa o inactiva por su ID y la retorna dentro de un Optional.
     */
    public Optional<T> buscarPorId(Long id) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            T entity = em.find(entityClass, id);
            return Optional.ofNullable(entity);
        } finally {
            em.close();
        }
    }

    /**
     * Lista todas las entidades donde eliminado = false usando JPQL polimórfico con simpleName.
     */
    public List<T> listarActivos() {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            String jpql = "SELECT e FROM " + entityClass.getSimpleName() + " e WHERE e.eliminado = false";
            return em.createQuery(jpql, entityClass).getResultList();
        } catch (Exception e) {
            System.err.println("Error al listar entidades activas: " + e.getMessage());
            return Collections.emptyList();
        } finally {
            em.close();
        }
    }

    /**
     * Aplica baja lógica (eliminado = true) sin borrar físicamente el registro (sin em.remove()).
     */
    public boolean eliminarLogico(Long id) {
        EntityManager em = JPAUtil.getEntityManager();
        EntityTransaction tx = em.getTransaction();
        try {
            T entity = em.find(entityClass, id);
            if (entity == null || entity.isEliminado()) {
                return false;
            }
            tx.begin();
            entity.setEliminado(true);
            em.merge(entity);
            tx.commit();
            return true;
        } catch (Exception e) {
            if (tx.isActive()) {
                tx.rollback();
            }
            System.err.println("Error en baja lógica: " + e.getMessage());
            return false;
        } finally {
            em.close();
        }
    }
}
