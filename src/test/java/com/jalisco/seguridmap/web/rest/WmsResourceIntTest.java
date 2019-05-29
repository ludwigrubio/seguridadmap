package com.jalisco.seguridmap.web.rest;

import com.jalisco.seguridmap.SeguridMapApp;

import com.jalisco.seguridmap.domain.Wms;
import com.jalisco.seguridmap.domain.User;
import com.jalisco.seguridmap.repository.WmsRepository;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.MockitoAnnotations;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;

import javax.inject.Inject;
import javax.persistence.EntityManager;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test class for the WmsResource REST controller.
 *
 * @see WmsResource
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = SeguridMapApp.class)
public class WmsResourceIntTest {

    private static final String DEFAULT_NOMBRE = "AAAAAAAAAA";
    private static final String UPDATED_NOMBRE = "BBBBBBBBBB";

    private static final String DEFAULT_URL = "AAAAAAAAAA";
    private static final String UPDATED_URL = "BBBBBBBBBB";

    private static final String DEFAULT_CAPA = "AAAAAAAAAA";
    private static final String UPDATED_CAPA = "BBBBBBBBBB";

    @Inject
    private WmsRepository wmsRepository;

    @Inject
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;

    @Inject
    private PageableHandlerMethodArgumentResolver pageableArgumentResolver;

    @Inject
    private EntityManager em;

    private MockMvc restWmsMockMvc;

    private Wms wms;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        WmsResource wmsResource = new WmsResource();
        ReflectionTestUtils.setField(wmsResource, "wmsRepository", wmsRepository);
        this.restWmsMockMvc = MockMvcBuilders.standaloneSetup(wmsResource)
            .setCustomArgumentResolvers(pageableArgumentResolver)
            .setMessageConverters(jacksonMessageConverter).build();
    }

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Wms createEntity(EntityManager em) {
        Wms wms = new Wms()
                .nombre(DEFAULT_NOMBRE)
                .url(DEFAULT_URL)
                .capa(DEFAULT_CAPA);
        // Add required entity
        User author = UserResourceIntTest.createEntity(em);
        em.persist(author);
        em.flush();
        wms.setAuthor(author);
        return wms;
    }

    @Before
    public void initTest() {
        wms = createEntity(em);
    }

    @Test
    @Transactional
    public void createWms() throws Exception {
        int databaseSizeBeforeCreate = wmsRepository.findAll().size();

        // Create the Wms

        restWmsMockMvc.perform(post("/api/wms")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(wms)))
            .andExpect(status().isCreated());

        // Validate the Wms in the database
        List<Wms> wmsList = wmsRepository.findAll();
        assertThat(wmsList).hasSize(databaseSizeBeforeCreate + 1);
        Wms testWms = wmsList.get(wmsList.size() - 1);
        assertThat(testWms.getNombre()).isEqualTo(DEFAULT_NOMBRE);
        assertThat(testWms.getUrl()).isEqualTo(DEFAULT_URL);
        assertThat(testWms.getCapa()).isEqualTo(DEFAULT_CAPA);
    }

    @Test
    @Transactional
    public void createWmsWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = wmsRepository.findAll().size();

        // Create the Wms with an existing ID
        Wms existingWms = new Wms();
        existingWms.setId(1L);

        // An entity with an existing ID cannot be created, so this API call must fail
        restWmsMockMvc.perform(post("/api/wms")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(existingWms)))
            .andExpect(status().isBadRequest());

        // Validate the Alice in the database
        List<Wms> wmsList = wmsRepository.findAll();
        assertThat(wmsList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    public void checkNombreIsRequired() throws Exception {
        int databaseSizeBeforeTest = wmsRepository.findAll().size();
        // set the field null
        wms.setNombre(null);

        // Create the Wms, which fails.

        restWmsMockMvc.perform(post("/api/wms")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(wms)))
            .andExpect(status().isBadRequest());

        List<Wms> wmsList = wmsRepository.findAll();
        assertThat(wmsList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void checkUrlIsRequired() throws Exception {
        int databaseSizeBeforeTest = wmsRepository.findAll().size();
        // set the field null
        wms.setUrl(null);

        // Create the Wms, which fails.

        restWmsMockMvc.perform(post("/api/wms")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(wms)))
            .andExpect(status().isBadRequest());

        List<Wms> wmsList = wmsRepository.findAll();
        assertThat(wmsList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void checkCapaIsRequired() throws Exception {
        int databaseSizeBeforeTest = wmsRepository.findAll().size();
        // set the field null
        wms.setCapa(null);

        // Create the Wms, which fails.

        restWmsMockMvc.perform(post("/api/wms")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(wms)))
            .andExpect(status().isBadRequest());

        List<Wms> wmsList = wmsRepository.findAll();
        assertThat(wmsList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void getAllWms() throws Exception {
        // Initialize the database
        wmsRepository.saveAndFlush(wms);

        // Get all the wmsList
        restWmsMockMvc.perform(get("/api/wms?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(wms.getId().intValue())))
            .andExpect(jsonPath("$.[*].nombre").value(hasItem(DEFAULT_NOMBRE.toString())))
            .andExpect(jsonPath("$.[*].url").value(hasItem(DEFAULT_URL.toString())))
            .andExpect(jsonPath("$.[*].capa").value(hasItem(DEFAULT_CAPA.toString())));
    }

    @Test
    @Transactional
    public void getWms() throws Exception {
        // Initialize the database
        wmsRepository.saveAndFlush(wms);

        // Get the wms
        restWmsMockMvc.perform(get("/api/wms/{id}", wms.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(wms.getId().intValue()))
            .andExpect(jsonPath("$.nombre").value(DEFAULT_NOMBRE.toString()))
            .andExpect(jsonPath("$.url").value(DEFAULT_URL.toString()))
            .andExpect(jsonPath("$.capa").value(DEFAULT_CAPA.toString()));
    }

    @Test
    @Transactional
    public void getNonExistingWms() throws Exception {
        // Get the wms
        restWmsMockMvc.perform(get("/api/wms/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateWms() throws Exception {
        // Initialize the database
        wmsRepository.saveAndFlush(wms);
        int databaseSizeBeforeUpdate = wmsRepository.findAll().size();

        // Update the wms
        Wms updatedWms = wmsRepository.findOne(wms.getId());
        updatedWms
                .nombre(UPDATED_NOMBRE)
                .url(UPDATED_URL)
                .capa(UPDATED_CAPA);

        restWmsMockMvc.perform(put("/api/wms")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(updatedWms)))
            .andExpect(status().isOk());

        // Validate the Wms in the database
        List<Wms> wmsList = wmsRepository.findAll();
        assertThat(wmsList).hasSize(databaseSizeBeforeUpdate);
        Wms testWms = wmsList.get(wmsList.size() - 1);
        assertThat(testWms.getNombre()).isEqualTo(UPDATED_NOMBRE);
        assertThat(testWms.getUrl()).isEqualTo(UPDATED_URL);
        assertThat(testWms.getCapa()).isEqualTo(UPDATED_CAPA);
    }

    @Test
    @Transactional
    public void updateNonExistingWms() throws Exception {
        int databaseSizeBeforeUpdate = wmsRepository.findAll().size();

        // Create the Wms

        // If the entity doesn't have an ID, it will be created instead of just being updated
        restWmsMockMvc.perform(put("/api/wms")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(wms)))
            .andExpect(status().isCreated());

        // Validate the Wms in the database
        List<Wms> wmsList = wmsRepository.findAll();
        assertThat(wmsList).hasSize(databaseSizeBeforeUpdate + 1);
    }

    @Test
    @Transactional
    public void deleteWms() throws Exception {
        // Initialize the database
        wmsRepository.saveAndFlush(wms);
        int databaseSizeBeforeDelete = wmsRepository.findAll().size();

        // Get the wms
        restWmsMockMvc.perform(delete("/api/wms/{id}", wms.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk());

        // Validate the database is empty
        List<Wms> wmsList = wmsRepository.findAll();
        assertThat(wmsList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
