package com.jalisco.seguridmap.domain;

import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import javax.persistence.*;
import javax.validation.constraints.*;
import java.io.Serializable;
import java.time.ZonedDateTime;
import java.util.Objects;

/**
 * A File.
 */
@Entity
@Table(name = "file")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
public class File implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @NotNull
    @Column(name = "uri", nullable = false)
    private String uri;

    @Column(name = "creation_date")
    private ZonedDateTime creationDate;

    @Column(name = "file_name")
    private String fileName;

    @ManyToOne
    private User fileAuthor;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUri() {
        return uri;
    }

    public File uri(String uri) {
        this.uri = uri;
        return this;
    }

    public void setUri(String uri) {
        this.uri = uri;
    }

    public ZonedDateTime getCreationDate() {
        return creationDate;
    }

    public File creationDate(ZonedDateTime creationDate) {
        this.creationDate = creationDate;
        return this;
    }

    public void setCreationDate(ZonedDateTime creationDate) {
        this.creationDate = creationDate;
    }

    public String getFileName() {
        return fileName;
    }

    public File fileName(String fileName) {
        this.fileName = fileName;
        return this;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public User getFileAuthor() {
        //Fix recursive rest error - jmrv
        return null;
    }

    public File fileAuthor(User user) {
        this.fileAuthor = user;
        return this;
    }

    public void setFileAuthor(User user) {
        this.fileAuthor = user;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        File file = (File) o;
        if (file.id == null || id == null) {
            return false;
        }
        return Objects.equals(id, file.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "File{" +
            "id=" + id +
            ", uri='" + uri + "'" +
            ", creationDate='" + creationDate + "'" +
            ", fileName='" + fileName + "'" +
            '}';
    }
}
