package com.jalisco.seguridmap.repository;

import com.jalisco.seguridmap.domain.Panel;

import org.springframework.data.jpa.repository.*;

import java.util.List;

/**
 * Spring Data JPA repository for the Panel entity.
 */
@SuppressWarnings("unused")
public interface PanelRepository extends JpaRepository<Panel,Long> {

    @Query("select panel from Panel panel where panel.author.login = ?#{principal.username}")
    List<Panel> findByAuthorIsCurrentUser();

}
