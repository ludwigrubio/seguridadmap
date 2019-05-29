package com.jalisco.seguridmap.repository;

import com.jalisco.seguridmap.domain.Panel;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.PagingAndSortingRepository;

public interface PanelSpecRepository extends PagingAndSortingRepository<Panel, Long>, JpaSpecificationExecutor<Panel> {

}
