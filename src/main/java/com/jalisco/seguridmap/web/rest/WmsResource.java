package com.jalisco.seguridmap.web.rest;

import com.codahale.metrics.annotation.Timed;
import com.jalisco.seguridmap.domain.User;
import com.jalisco.seguridmap.domain.Wms;

import com.jalisco.seguridmap.repository.WmsRepository;
import com.jalisco.seguridmap.repository.UserRepository;
import com.jalisco.seguridmap.repository.WmsSpecRepository;
import com.jalisco.seguridmap.security.AuthoritiesConstants;
import com.jalisco.seguridmap.security.SecurityUtils;
import com.jalisco.seguridmap.web.rest.util.HeaderUtil;
import com.jalisco.seguridmap.web.rest.util.PaginationUtil;

import io.swagger.annotations.ApiParam;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.annotation.Secured;


import javax.inject.Inject;
import javax.validation.Valid;
import java.net.URI;
import javax.persistence.criteria.*;
import java.net.URISyntaxException;
import java.util.*;
import java.util.function.Consumer;


/**
 * REST controller for managing Wms.
 */
@RestController
@RequestMapping("/api")
public class WmsResource {

    private final Logger log = LoggerFactory.getLogger(WmsResource.class);

    @Inject
    private WmsRepository wmsRepository;

    @Inject
    private UserRepository userRepository;

    @Inject
    private WmsSpecRepository wmsSpecRepository;

    /**
     * POST  /wms : Create a new wms.
     *
     * @param wms the wms to create
     * @return the ResponseEntity with status 201 (Created) and with body the new wms, or with status 400 (Bad Request) if the wms has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/wms")
    @Timed
    public ResponseEntity<Wms> createWms(@Valid @RequestBody Wms wms) throws URISyntaxException {
        log.debug("REST request to save Wms : {}", wms);
        if (wms.getId() != null) {
            return ResponseEntity.badRequest().headers(HeaderUtil.createFailureAlert("wms", "idexists", "A new wms cannot already have an ID")).body(null);
        }

        String login = SecurityUtils.getCurrentUserLogin();
        Optional<User> currentUser = userRepository.findOneByLogin(login);
        currentUser.ifPresent(new Consumer<User>() {
            @Override
            public void accept(User user) {
                wms.setAuthor(user);
            }
        });

        Wms result = wmsRepository.save(wms);
        return ResponseEntity.created(new URI("/api/wms/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert("wms", result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /wms : Updates an existing wms.
     *
     * @param wms the wms to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated wms,
     * or with status 400 (Bad Request) if the wms is not valid,
     * or with status 500 (Internal Server Error) if the wms couldnt be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/wms")
    @Secured({AuthoritiesConstants.ADMIN, AuthoritiesConstants.INVESTIGADOR})
    @Timed
    public ResponseEntity<Wms> updateWms(@Valid @RequestBody Wms wms) throws URISyntaxException {
        log.debug("REST request to update Wms : {}", wms);
        if (wms.getId() == null) {
            return createWms(wms);
        }
        Wms result = wmsRepository.save(wms);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert("wms", wms.getId().toString()))
            .body(result);
    }

    /**
     * GET  /wms : get all the wms.
     *
     * @param pageable the pagination information
     * @return the ResponseEntity with status 200 (OK) and the list of wms in body
     * @throws URISyntaxException if there is an error to generate the pagination HTTP headers
     */
    @GetMapping("/wms")
    @Timed
    public ResponseEntity<List<Wms>> getAllWms(@ApiParam Pageable pageable)
        throws URISyntaxException {
        log.debug("REST request to get a page of Wms");
        Page<Wms> page = wmsRepository.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/wms");
        return new ResponseEntity<>(page.getContent(), headers, HttpStatus.OK);
    }

    /**
     * GET  /wms/query : get all messages by query.
     *
     * @param pageable the pagination information
     * @return the ResponseEntity with status 200 (OK) and the list of messages in body
     * @throws URISyntaxException if there is an error to generate the pagination HTTP headers
     */
    @GetMapping("/wms/byuser")
    @Timed
    public ResponseEntity<List<Wms>> getAllWmsByUser(@ApiParam Pageable pageable)
        throws URISyntaxException {

        Specification<Wms> specification = new Specification<Wms>() {
            public Predicate toPredicate(Root<Wms> root, CriteriaQuery<?> query, CriteriaBuilder builder) {
                List<Predicate> predicates = new ArrayList<Predicate>();
                String login = SecurityUtils.getCurrentUserLogin();


                Optional<User> currentUser = userRepository.findOneByLogin(login);
                currentUser.ifPresent(new Consumer<User>() {
                    @Override
                    public void accept(User user) {

                        String authorities= user.getAuthorities().toString();
                        if(!authorities.contains("Authority{name='ROLE_ADMIN'}]"))
                             predicates.add(builder.equal(root.join("author").get("id"),user.getId()));
                    }
                });

               return builder.and(predicates.toArray(new Predicate[predicates.size()]));
            }
        };
        Page<Wms> page = wmsSpecRepository.findAll(specification,pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/wms");
        return new ResponseEntity<>(page.getContent(), headers, HttpStatus.OK);
    }



    /**
     * GET  /wms/:id : get the "id" wms.
     *
     * @param id the id of the wms to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the wms, or with status 404 (Not Found)
     */
    @GetMapping("/wms/{id}")
    @Timed
    public ResponseEntity<Wms> getWms(@PathVariable Long id) {
        log.debug("REST request to get Wms : {}", id);
        Wms wms = wmsRepository.findOne(id);
        return Optional.ofNullable(wms)
            .map(result -> new ResponseEntity<>(
                result,
                HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * DELETE  /wms/:id : delete the "id" wms.
     *
     * @param id the id of the wms to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/wms/{id}")
    @Secured({AuthoritiesConstants.ADMIN, AuthoritiesConstants.INVESTIGADOR})
    @Timed
    public ResponseEntity<Void> deleteWms(@PathVariable Long id) {
        log.debug("REST request to delete Wms : {}", id);
        wmsRepository.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert("wms", id.toString())).build();
    }

}
