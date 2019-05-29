package com.jalisco.seguridmap.repository;

import com.jalisco.seguridmap.domain.Wms;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.PagingAndSortingRepository;

public interface WmsSpecRepository extends PagingAndSortingRepository<Wms, Long>, JpaSpecificationExecutor<Wms> {

}
