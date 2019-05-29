package com.jalisco.seguridmap.domain;

import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import javax.persistence.*;
import javax.validation.constraints.*;
import java.io.Serializable;
import java.util.Objects;

/**
 * A ConfigStore.
 */
@Entity
@Table(name = "config_store")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
public class ConfigStore implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @NotNull
    @Column(name = "key", nullable = false)
    private String key;

    @Column(name = "value")
    private String value;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getKey() {
        return key;
    }

    public ConfigStore key(String key) {
        this.key = key;
        return this;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public String getValue() {
        return value;
    }

    public ConfigStore value(String value) {
        this.value = value;
        return this;
    }

    public void setValue(String value) {
        this.value = value;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        ConfigStore configStore = (ConfigStore) o;
        if (configStore.id == null || id == null) {
            return false;
        }
        return Objects.equals(id, configStore.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "ConfigStore{" +
            "id=" + id +
            ", key='" + key + "'" +
            ", value='" + value + "'" +
            '}';
    }
}
