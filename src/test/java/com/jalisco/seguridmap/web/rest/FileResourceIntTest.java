package com.jalisco.seguridmap.web.rest;

import com.jalisco.seguridmap.SeguridMapApp;

import com.jalisco.seguridmap.domain.File;
import com.jalisco.seguridmap.repository.FileRepository;

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
import java.time.Instant;
import java.time.ZonedDateTime;
import java.time.ZoneOffset;
import java.time.ZoneId;
import java.util.List;

import static com.jalisco.seguridmap.web.rest.TestUtil.sameInstant;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test class for the FileResource REST controller.
 *
 * @see FileResource
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = SeguridMapApp.class)
public class FileResourceIntTest {

    private static final String DEFAULT_URI = "AAAAAAAAAA";
    private static final String UPDATED_URI = "BBBBBBBBBB";

    private static final ZonedDateTime DEFAULT_CREATION_DATE = ZonedDateTime.ofInstant(Instant.ofEpochMilli(0L), ZoneOffset.UTC);
    private static final ZonedDateTime UPDATED_CREATION_DATE = ZonedDateTime.now(ZoneId.systemDefault()).withNano(0);

    private static final String DEFAULT_FILE_NAME = "AAAAAAAAAA";
    private static final String UPDATED_FILE_NAME = "BBBBBBBBBB";

    @Inject
    private FileRepository fileRepository;

    @Inject
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;

    @Inject
    private PageableHandlerMethodArgumentResolver pageableArgumentResolver;

    @Inject
    private EntityManager em;

    private MockMvc restFileMockMvc;

    private File file;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        FileResource fileResource = new FileResource();
        ReflectionTestUtils.setField(fileResource, "fileRepository", fileRepository);
        this.restFileMockMvc = MockMvcBuilders.standaloneSetup(fileResource)
            .setCustomArgumentResolvers(pageableArgumentResolver)
            .setMessageConverters(jacksonMessageConverter).build();
    }

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static File createEntity(EntityManager em) {
        File file = new File()
                .uri(DEFAULT_URI)
                .creationDate(DEFAULT_CREATION_DATE);
        return file;
    }

    @Before
    public void initTest() {
        file = createEntity(em);
    }

    @Test
    @Transactional
    public void createFile() throws Exception {
        int databaseSizeBeforeCreate = fileRepository.findAll().size();

        // Create the File

        restFileMockMvc.perform(post("/api/files")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(file)))
            .andExpect(status().isCreated());

        // Validate the File in the database
        List<File> fileList = fileRepository.findAll();
        assertThat(fileList).hasSize(databaseSizeBeforeCreate + 1);
        File testFile = fileList.get(fileList.size() - 1);
        assertThat(testFile.getUri()).isEqualTo(DEFAULT_URI);
        assertThat(testFile.getCreationDate()).isEqualTo(DEFAULT_CREATION_DATE);
        assertThat(testFile.getFileName()).isEqualTo(DEFAULT_FILE_NAME);
    }

    @Test
    @Transactional
    public void createFileWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = fileRepository.findAll().size();

        // Create the File with an existing ID
        File existingFile = new File();
        existingFile.setId(1L);

        // An entity with an existing ID cannot be created, so this API call must fail
        restFileMockMvc.perform(post("/api/files")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(existingFile)))
            .andExpect(status().isBadRequest());

        // Validate the Alice in the database
        List<File> fileList = fileRepository.findAll();
        assertThat(fileList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    public void checkUriIsRequired() throws Exception {
        int databaseSizeBeforeTest = fileRepository.findAll().size();
        // set the field null
        file.setUri(null);

        // Create the File, which fails.

        restFileMockMvc.perform(post("/api/files")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(file)))
            .andExpect(status().isBadRequest());

        List<File> fileList = fileRepository.findAll();
        assertThat(fileList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void getAllFiles() throws Exception {
        // Initialize the database
        fileRepository.saveAndFlush(file);

        // Get all the fileList
        restFileMockMvc.perform(get("/api/files?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(file.getId().intValue())))
            .andExpect(jsonPath("$.[*].uri").value(hasItem(DEFAULT_URI.toString())))
            .andExpect(jsonPath("$.[*].creationDate").value(hasItem(sameInstant(DEFAULT_CREATION_DATE))))
            .andExpect(jsonPath("$.[*].fileName").value(hasItem(DEFAULT_FILE_NAME.toString())));
    }

    @Test
    @Transactional
    public void getFile() throws Exception {
        // Initialize the database
        fileRepository.saveAndFlush(file);

        // Get the file
        restFileMockMvc.perform(get("/api/files/{id}", file.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(file.getId().intValue()))
            .andExpect(jsonPath("$.uri").value(DEFAULT_URI.toString()))
            .andExpect(jsonPath("$.creationDate").value(sameInstant(DEFAULT_CREATION_DATE)))
            .andExpect(jsonPath("$.fileName").value(DEFAULT_FILE_NAME.toString()));
    }

    @Test
    @Transactional
    public void getNonExistingFile() throws Exception {
        // Get the file
        restFileMockMvc.perform(get("/api/files/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateFile() throws Exception {
        // Initialize the database
        fileRepository.saveAndFlush(file);
        int databaseSizeBeforeUpdate = fileRepository.findAll().size();

        // Update the file
        File updatedFile = fileRepository.findOne(file.getId());
        updatedFile
                .uri(UPDATED_URI)
                .creationDate(UPDATED_CREATION_DATE);

        restFileMockMvc.perform(put("/api/files")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(updatedFile)))
            .andExpect(status().isOk());

        // Validate the File in the database
        List<File> fileList = fileRepository.findAll();
        assertThat(fileList).hasSize(databaseSizeBeforeUpdate);
        File testFile = fileList.get(fileList.size() - 1);
        assertThat(testFile.getUri()).isEqualTo(UPDATED_URI);
        assertThat(testFile.getCreationDate()).isEqualTo(UPDATED_CREATION_DATE);
        assertThat(testFile.getFileName()).isEqualTo(UPDATED_FILE_NAME);
    }

    @Test
    @Transactional
    public void updateNonExistingFile() throws Exception {
        int databaseSizeBeforeUpdate = fileRepository.findAll().size();

        // Create the File

        // If the entity doesn't have an ID, it will be created instead of just being updated
        restFileMockMvc.perform(put("/api/files")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(file)))
            .andExpect(status().isCreated());

        // Validate the File in the database
        List<File> fileList = fileRepository.findAll();
        assertThat(fileList).hasSize(databaseSizeBeforeUpdate + 1);
    }

    @Test
    @Transactional
    public void deleteFile() throws Exception {
        // Initialize the database
        fileRepository.saveAndFlush(file);
        int databaseSizeBeforeDelete = fileRepository.findAll().size();

        // Get the file
        restFileMockMvc.perform(delete("/api/files/{id}", file.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk());

        // Validate the database is empty
        List<File> fileList = fileRepository.findAll();
        assertThat(fileList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
