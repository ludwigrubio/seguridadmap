package com.jalisco.seguridmap.repository;

import com.jalisco.seguridmap.domain.ConfigStore;

import org.springframework.data.jpa.repository.*;

import java.util.List;

/**
 * Spring Data JPA repository for the ConfigStore entity.
 */
@SuppressWarnings("unused")
public interface ConfigStoreRepository extends JpaRepository<ConfigStore,Long> {

    ConfigStore findOneByKey(String key);

}
