package com.jalisco.seguridmap.web.rest;

import com.codahale.metrics.annotation.Timed;
import org.springframework.security.access.annotation.Secured;
import com.jalisco.seguridmap.domain.ConfigStore;

import com.jalisco.seguridmap.repository.ConfigStoreRepository;
import com.jalisco.seguridmap.web.rest.util.HeaderUtil;
import com.jalisco.seguridmap.web.rest.util.PaginationUtil;

import io.swagger.annotations.ApiParam;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.inject.Inject;
import javax.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;

import com.jalisco.seguridmap.security.AuthoritiesConstants;

/**
 * REST controller for managing ConfigStore.
 */
@RestController
@RequestMapping("/api")
public class ConfigStoreResource {

    private final Logger log = LoggerFactory.getLogger(ConfigStoreResource.class);
        
    @Inject
    private ConfigStoreRepository configStoreRepository;

    /**
     * POST  /config-stores : Create a new configStore.
     *
     * @param configStore the configStore to create
     * @return the ResponseEntity with status 201 (Created) and with body the new configStore, or with status 400 (Bad Request) if the configStore has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/config-stores")
    @Secured({AuthoritiesConstants.ADMIN})
    @Timed
    public ResponseEntity<ConfigStore> createConfigStore(@Valid @RequestBody ConfigStore configStore) throws URISyntaxException {
        log.debug("REST request to save ConfigStore : {}", configStore);
        if (configStore.getId() != null) {
            return ResponseEntity.badRequest().headers(HeaderUtil.createFailureAlert("configStore", "idexists", "A new configStore cannot already have an ID")).body(null);
        }
        ConfigStore result = configStoreRepository.save(configStore);
        return ResponseEntity.created(new URI("/api/config-stores/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert("configStore", result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /config-stores : Updates an existing configStore.
     *
     * @param configStore the configStore to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated configStore,
     * or with status 400 (Bad Request) if the configStore is not valid,
     * or with status 500 (Internal Server Error) if the configStore couldnt be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/config-stores")
    @Secured({AuthoritiesConstants.ADMIN})
    @Timed
    public ResponseEntity<ConfigStore> updateConfigStore(@Valid @RequestBody ConfigStore configStore) throws URISyntaxException {
        log.debug("REST request to update ConfigStore : {}", configStore);
        if (configStore.getId() == null) {
            return createConfigStore(configStore);
        }
        ConfigStore result = configStoreRepository.save(configStore);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert("configStore", configStore.getId().toString()))
            .body(result);
    }

    /**
     * GET  /config-stores : get all the configStores.
     *
     * @param pageable the pagination information
     * @return the ResponseEntity with status 200 (OK) and the list of configStores in body
     * @throws URISyntaxException if there is an error to generate the pagination HTTP headers
     */
    @GetMapping("/config-stores")
    @Secured({AuthoritiesConstants.ADMIN})
    @Timed
    public ResponseEntity<List<ConfigStore>> getAllConfigStores(@ApiParam Pageable pageable)
        throws URISyntaxException {
        log.debug("REST request to get a page of ConfigStores");
        Page<ConfigStore> page = configStoreRepository.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/config-stores");
        return new ResponseEntity<>(page.getContent(), headers, HttpStatus.OK);
    }

    /**
     * GET  /config-stores/:id : get the "id" configStore.
     *
     * @param id the id of the configStore to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the configStore, or with status 404 (Not Found)
     */
    @GetMapping("/config-stores/{id}")
    @Secured({AuthoritiesConstants.ADMIN})
    @Timed
    public ResponseEntity<ConfigStore> getConfigStore(@PathVariable Long id) {
        log.debug("REST request to get ConfigStore : {}", id);
        ConfigStore configStore = configStoreRepository.findOne(id);
        return Optional.ofNullable(configStore)
            .map(result -> new ResponseEntity<>(
                result,
                HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * DELETE  /config-stores/:id : delete the "id" configStore.
     *
     * @param id the id of the configStore to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/config-stores/{id}")
    @Secured({AuthoritiesConstants.ADMIN})
    @Timed
    public ResponseEntity<Void> deleteConfigStore(@PathVariable Long id) {
        log.debug("REST request to delete ConfigStore : {}", id);
        configStoreRepository.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert("configStore", id.toString())).build();
    }

    /**
     * GET  /config-stores/by-key/:key : get the configStore object by key.
     *
     * @param key the key of the configStore to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the configStore, or with status 404 (Not Found)
     */
    @GetMapping("/config-stores/by-key/{key}")
    @Timed
    public ResponseEntity<ConfigStore> getConfigStoreByKey(@PathVariable String key) {
        log.debug("REST request to get ConfigStore : {}", key);
        ConfigStore configStore = configStoreRepository.findOneByKey(key);
        return Optional.ofNullable(configStore)
            .map(result -> new ResponseEntity<>(
                result,
                HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.OK));
    }
}
