package com.jalisco.seguridmap.repository;

import com.jalisco.seguridmap.domain.File;

import org.springframework.data.jpa.repository.*;

import java.util.List;

/**
 * Spring Data JPA repository for the File entity.
 */
@SuppressWarnings("unused")
public interface FileRepository extends JpaRepository<File,Long> {

    @Query("select file from File file where file.fileAuthor.login = ?#{principal.username}")
    List<File> findByFileAuthorIsCurrentUser();

}
