package com.jalisco.seguridmap.domain;

import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import javax.persistence.*;
import javax.validation.constraints.*;
import java.io.Serializable;
import java.util.Objects;

/**
 * A Wms.
 */
@Entity
@Table(name = "wms")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
public class Wms implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @NotNull
    @Column(name = "nombre", nullable = false)
    private String nombre;

    @NotNull
    @Column(name = "url", nullable = false)
    private String url;

    @NotNull
    @Column(name = "capa", nullable = false)
    private String capa;

    @ManyToOne
    @NotNull
    private User author;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public Wms nombre(String nombre) {
        this.nombre = nombre;
        return this;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getUrl() {
        return url;
    }

    public Wms url(String url) {
        this.url = url;
        return this;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getCapa() {
        return capa;
    }

    public Wms capa(String capa) {
        this.capa = capa;
        return this;
    }

    public void setCapa(String capa) {
        this.capa = capa;
    }

    public User getAuthor() {
        return author;
    }

    public Wms author(User user) {
        this.author = user;
        return this;
    }

    public void setAuthor(User user) {
        this.author = user;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        Wms wms = (Wms) o;
        if (wms.id == null || id == null) {
            return false;
        }
        return Objects.equals(id, wms.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "Wms{" +
            "id=" + id +
            ", nombre='" + nombre + "'" +
            ", url='" + url + "'" +
            ", capa='" + capa + "'" +
            '}';
    }
}
