package com.jalisco.seguridmap.web.rest;

import com.jalisco.seguridmap.SeguridMapApp;

import com.jalisco.seguridmap.domain.ConfigStore;
import com.jalisco.seguridmap.repository.ConfigStoreRepository;

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
 * Test class for the ConfigStoreResource REST controller.
 *
 * @see ConfigStoreResource
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = SeguridMapApp.class)
public class ConfigStoreResourceIntTest {

    private static final String DEFAULT_KEY = "AAAAAAAAAA";
    private static final String UPDATED_KEY = "BBBBBBBBBB";

    private static final String DEFAULT_VALUE = "AAAAAAAAAA";
    private static final String UPDATED_VALUE = "BBBBBBBBBB";

    @Inject
    private ConfigStoreRepository configStoreRepository;

    @Inject
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;

    @Inject
    private PageableHandlerMethodArgumentResolver pageableArgumentResolver;

    @Inject
    private EntityManager em;

    private MockMvc restConfigStoreMockMvc;

    private ConfigStore configStore;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        ConfigStoreResource configStoreResource = new ConfigStoreResource();
        ReflectionTestUtils.setField(configStoreResource, "configStoreRepository", configStoreRepository);
        this.restConfigStoreMockMvc = MockMvcBuilders.standaloneSetup(configStoreResource)
            .setCustomArgumentResolvers(pageableArgumentResolver)
            .setMessageConverters(jacksonMessageConverter).build();
    }

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static ConfigStore createEntity(EntityManager em) {
        ConfigStore configStore = new ConfigStore()
                .key(DEFAULT_KEY)
                .value(DEFAULT_VALUE);
        return configStore;
    }

    @Before
    public void initTest() {
        configStore = createEntity(em);
    }

    @Test
    @Transactional
    public void createConfigStore() throws Exception {
        int databaseSizeBeforeCreate = configStoreRepository.findAll().size();

        // Create the ConfigStore

        restConfigStoreMockMvc.perform(post("/api/config-stores")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(configStore)))
            .andExpect(status().isCreated());

        // Validate the ConfigStore in the database
        List<ConfigStore> configStoreList = configStoreRepository.findAll();
        assertThat(configStoreList).hasSize(databaseSizeBeforeCreate + 1);
        ConfigStore testConfigStore = configStoreList.get(configStoreList.size() - 1);
        assertThat(testConfigStore.getKey()).isEqualTo(DEFAULT_KEY);
        assertThat(testConfigStore.getValue()).isEqualTo(DEFAULT_VALUE);
    }

    @Test
    @Transactional
    public void createConfigStoreWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = configStoreRepository.findAll().size();

        // Create the ConfigStore with an existing ID
        ConfigStore existingConfigStore = new ConfigStore();
        existingConfigStore.setId(1L);

        // An entity with an existing ID cannot be created, so this API call must fail
        restConfigStoreMockMvc.perform(post("/api/config-stores")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(existingConfigStore)))
            .andExpect(status().isBadRequest());

        // Validate the Alice in the database
        List<ConfigStore> configStoreList = configStoreRepository.findAll();
        assertThat(configStoreList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    public void checkKeyIsRequired() throws Exception {
        int databaseSizeBeforeTest = configStoreRepository.findAll().size();
        // set the field null
        configStore.setKey(null);

        // Create the ConfigStore, which fails.

        restConfigStoreMockMvc.perform(post("/api/config-stores")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(configStore)))
            .andExpect(status().isBadRequest());

        List<ConfigStore> configStoreList = configStoreRepository.findAll();
        assertThat(configStoreList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void getAllConfigStores() throws Exception {
        // Initialize the database
        configStoreRepository.saveAndFlush(configStore);

        // Get all the configStoreList
        restConfigStoreMockMvc.perform(get("/api/config-stores?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(configStore.getId().intValue())))
            .andExpect(jsonPath("$.[*].key").value(hasItem(DEFAULT_KEY.toString())))
            .andExpect(jsonPath("$.[*].value").value(hasItem(DEFAULT_VALUE.toString())));
    }

    @Test
    @Transactional
    public void getConfigStore() throws Exception {
        // Initialize the database
        configStoreRepository.saveAndFlush(configStore);

        // Get the configStore
        restConfigStoreMockMvc.perform(get("/api/config-stores/{id}", configStore.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(configStore.getId().intValue()))
            .andExpect(jsonPath("$.key").value(DEFAULT_KEY.toString()))
            .andExpect(jsonPath("$.value").value(DEFAULT_VALUE.toString()));
    }

    @Test
    @Transactional
    public void getNonExistingConfigStore() throws Exception {
        // Get the configStore
        restConfigStoreMockMvc.perform(get("/api/config-stores/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateConfigStore() throws Exception {
        // Initialize the database
        configStoreRepository.saveAndFlush(configStore);
        int databaseSizeBeforeUpdate = configStoreRepository.findAll().size();

        // Update the configStore
        ConfigStore updatedConfigStore = configStoreRepository.findOne(configStore.getId());
        updatedConfigStore
                .key(UPDATED_KEY)
                .value(UPDATED_VALUE);

        restConfigStoreMockMvc.perform(put("/api/config-stores")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(updatedConfigStore)))
            .andExpect(status().isOk());

        // Validate the ConfigStore in the database
        List<ConfigStore> configStoreList = configStoreRepository.findAll();
        assertThat(configStoreList).hasSize(databaseSizeBeforeUpdate);
        ConfigStore testConfigStore = configStoreList.get(configStoreList.size() - 1);
        assertThat(testConfigStore.getKey()).isEqualTo(UPDATED_KEY);
        assertThat(testConfigStore.getValue()).isEqualTo(UPDATED_VALUE);
    }

    @Test
    @Transactional
    public void updateNonExistingConfigStore() throws Exception {
        int databaseSizeBeforeUpdate = configStoreRepository.findAll().size();

        // Create the ConfigStore

        // If the entity doesn't have an ID, it will be created instead of just being updated
        restConfigStoreMockMvc.perform(put("/api/config-stores")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(configStore)))
            .andExpect(status().isCreated());

        // Validate the ConfigStore in the database
        List<ConfigStore> configStoreList = configStoreRepository.findAll();
        assertThat(configStoreList).hasSize(databaseSizeBeforeUpdate + 1);
    }

    @Test
    @Transactional
    public void deleteConfigStore() throws Exception {
        // Initialize the database
        configStoreRepository.saveAndFlush(configStore);
        int databaseSizeBeforeDelete = configStoreRepository.findAll().size();

        // Get the configStore
        restConfigStoreMockMvc.perform(delete("/api/config-stores/{id}", configStore.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk());

        // Validate the database is empty
        List<ConfigStore> configStoreList = configStoreRepository.findAll();
        assertThat(configStoreList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
