package com.jalisco.seguridmap.web.rest;

import com.codahale.metrics.annotation.Timed;
import com.jalisco.seguridmap.domain.File;

import com.jalisco.seguridmap.domain.PersistentAuditEvent;
import com.jalisco.seguridmap.repository.FileRepository;
import com.jalisco.seguridmap.repository.PersistenceAuditEventRepository;
import com.jalisco.seguridmap.security.AuthoritiesConstants;
import com.jalisco.seguridmap.security.SecurityUtils;
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
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

import javax.inject.Inject;
import javax.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;

/**
 * REST controller for managing File.
 */
@RestController
@RequestMapping("/api")
public class FileResource {

    private final Logger log = LoggerFactory.getLogger(FileResource.class);

    @Inject
    private FileRepository fileRepository;

    @Inject
    private PersistenceAuditEventRepository persistenceAuditEventRepository;

    /**
     * POST  /files : Create a new file.
     *
     * @param file the file to create
     * @return the ResponseEntity with status 201 (Created) and with body the new file, or with status 400 (Bad Request) if the file has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/files")
    @Timed
    @Secured({AuthoritiesConstants.ADMIN})
    public ResponseEntity<File> createFile(@Valid @RequestBody File file) throws URISyntaxException {
        log.debug("REST request to save File : {}", file);
        if (file.getId() != null) {
            return ResponseEntity.badRequest().headers(HeaderUtil.createFailureAlert("file", "idexists", "A new file cannot already have an ID")).body(null);
        }
        File result = fileRepository.save(file);
        if (persistenceAuditEventRepository != null ) {
            //Add audit event
            PersistentAuditEvent persistentAuditEvent = new PersistentAuditEvent();
            persistentAuditEvent.setAuditEventDate(LocalDateTime.now());
            persistentAuditEvent.setAuditEventType("FILE_CREATED");
            persistentAuditEvent.setPrincipal(SecurityUtils.getCurrentUserLogin());
            HashMap<String, String> event = new HashMap<>();
            event.put("message", "ID: " + file.getId().toString());
            persistentAuditEvent.setData(event);
            persistenceAuditEventRepository.save(persistentAuditEvent);
        }
        return ResponseEntity.created(new URI("/api/files/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert("file", result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /files : Updates an existing file.
     *
     * @param file the file to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated file,
     * or with status 400 (Bad Request) if the file is not valid,
     * or with status 500 (Internal Server Error) if the file couldnt be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/files")
    @Timed
    @Secured({AuthoritiesConstants.ADMIN})
    public ResponseEntity<File> updateFile(@Valid @RequestBody File file) throws URISyntaxException {
        log.debug("REST request to update File : {}", file);
        if (file.getId() == null) {
            return createFile(file);
        }
        File result = fileRepository.save(file);
        if (persistenceAuditEventRepository != null ) {
            //Add audit event
            PersistentAuditEvent persistentAuditEvent = new PersistentAuditEvent();
            persistentAuditEvent.setAuditEventDate(LocalDateTime.now());
            persistentAuditEvent.setAuditEventType("FILE_UPDATED");
            persistentAuditEvent.setPrincipal(SecurityUtils.getCurrentUserLogin());
            HashMap<String, String> event = new HashMap<>();
            event.put("message", "ID: " + file.getId().toString());
            persistentAuditEvent.setData(event);
            persistenceAuditEventRepository.save(persistentAuditEvent);
        }
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert("file", file.getId().toString()))
            .body(result);
    }

    /**
     * GET  /files : get all the files.
     *
     * @param pageable the pagination information
     * @return the ResponseEntity with status 200 (OK) and the list of files in body
     * @throws URISyntaxException if there is an error to generate the pagination HTTP headers
     */
    @GetMapping("/files")
    @Timed
    @Secured({AuthoritiesConstants.ADMIN})
    public ResponseEntity<List<File>> getAllFiles(@ApiParam Pageable pageable)
        throws URISyntaxException {
        log.debug("REST request to get a page of Files");
        Page<File> page = fileRepository.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/files");
        return new ResponseEntity<>(page.getContent(), headers, HttpStatus.OK);
    }

    /**
     * GET  /files/:id : get the "id" file.
     *
     * @param id the id of the file to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the file, or with status 404 (Not Found)
     */
    @GetMapping("/files/{id}")
    @Timed
    @Secured({AuthoritiesConstants.ADMIN})
    public ResponseEntity<File> getFile(@PathVariable Long id) {
        log.debug("REST request to get File : {}", id);
        File file = fileRepository.findOne(id);
        return Optional.ofNullable(file)
            .map(result -> new ResponseEntity<>(
                result,
                HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * DELETE  /files/:id : delete the "id" file.
     *
     * @param id the id of the file to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/files/{id}")
    @Timed
    @Secured({AuthoritiesConstants.ADMIN})
    public ResponseEntity<Void> deleteFile(@PathVariable Long id) {
        log.debug("REST request to delete File : {}", id);
        fileRepository.delete(id);
        if (persistenceAuditEventRepository != null ) {
            //Add audit event
            PersistentAuditEvent persistentAuditEvent = new PersistentAuditEvent();
            persistentAuditEvent.setAuditEventDate(LocalDateTime.now());
            persistentAuditEvent.setAuditEventType("FILE_DELETED");
            persistentAuditEvent.setPrincipal(SecurityUtils.getCurrentUserLogin());
            HashMap<String, String> event = new HashMap<>();
            event.put("message", "ID: " + id.toString());
            persistentAuditEvent.setData(event);
            persistenceAuditEventRepository.save(persistentAuditEvent);
        }
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert("file", id.toString())).build();
    }

}
