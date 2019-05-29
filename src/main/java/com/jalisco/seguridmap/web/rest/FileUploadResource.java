package com.jalisco.seguridmap.web.rest;

import com.jalisco.seguridmap.domain.File;
import com.jalisco.seguridmap.domain.PersistentAuditEvent;
import com.jalisco.seguridmap.domain.User;
import com.jalisco.seguridmap.repository.FileRepository;
import com.jalisco.seguridmap.repository.PersistenceAuditEventRepository;
import com.jalisco.seguridmap.repository.UserRepository;
import com.jalisco.seguridmap.security.AuthoritiesConstants;
import com.jalisco.seguridmap.security.SecurityUtils;
import com.jalisco.seguridmap.web.rest.util.HeaderUtil;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.lang3.RandomStringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Date;
import java.util.HashMap;
import java.util.Optional;
import java.util.TimeZone;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api")
public class FileUploadResource {

    private final Logger log = LoggerFactory.getLogger(AccountResource.class);

    @Inject
    FileRepository fileRepository;

    @Inject
    UserRepository userRepository;

    @Inject
    PersistenceAuditEventRepository persistenceAuditEventRepository;

    @Value("${seguridmap.file.allowedExtensions}")
    String allowedExtensions;

    final String UPLOADED_FOLDER = "files";

    @PostMapping("/upload")
    @Secured({AuthoritiesConstants.ADMIN, AuthoritiesConstants.INVESTIGADOR, AuthoritiesConstants.CIUDADANO, AuthoritiesConstants.USER})
    public ResponseEntity singleFileUpload(HttpServletRequest request,@RequestParam("file") MultipartFile file,
                                           RedirectAttributes redirectAttributes) {

        String realPath =  request.getServletContext().getRealPath("/files/");
        if (!(new java.io.File(realPath)).exists()) {
            new java.io.File(realPath).mkdir();
        }

        if (file.isEmpty()) {
            return ResponseEntity.status(500)
                .headers(HeaderUtil.createAlert("global.file.bad",null))
                .body("{\"message\":\"global.file.bad\"}");
        }

        // Validate file extension
        Pattern pattern = null;
        if (allowedExtensions.isEmpty()) {
            pattern = Pattern.compile("([^\\s]+(\\.(?i)(jpg|gif|png))$)");
        }else{
            pattern = Pattern.compile("([^\\s]+(\\.(?i)(" + this.allowedExtensions + "))$)");
        }
				System.out.println(file.getOriginalFilename().replaceAll("\\s+",""));
        if (! pattern.matcher(file.getOriginalFilename().replaceAll("\\s+","")).matches()) {
            return ResponseEntity.status(500)
                .headers(HeaderUtil.createAlert("global.file.extension",null))
                .body("{\"message\":\"global.file.extension\"}");
        }

        try {
            byte[] bytes = file.getBytes();
            // Rename file, remove some bugs
            String fileName = String.format("%s.%s", RandomStringUtils.randomAlphanumeric(8), FilenameUtils.getExtension(file.getOriginalFilename()));
            Path path = Paths.get(realPath +"/"+ fileName);
            //Allows to upload file, if exist
            int cont = 0;
            while (Files.exists(path)){
                fileName = String.format("%s-%s.%s", RandomStringUtils.randomAlphanumeric(8),cont, FilenameUtils.getExtension(file.getOriginalFilename()));
                path = Paths.get(realPath + "/" + fileName);
                cont++;
            }

            Files.write(path, bytes);

            File fileResource = new File();
            Date currentDate = new Date();
            fileResource.setCreationDate(currentDate.toInstant().atZone(ZoneId.systemDefault()));
            fileResource.setUri(path.toUri().toString());
            String login = SecurityUtils.getCurrentUserLogin();
            Optional<User> currentUser = userRepository.findOneByLogin(login);
            if (currentUser.isPresent())
                fileResource.setFileAuthor(currentUser.get());
            fileResource.setFileName(path.getFileName().toString());
            File savedFile = fileRepository.save(fileResource);

            //Add audit event
            if (persistenceAuditEventRepository != null ) {
                PersistentAuditEvent persistentAuditEvent = new PersistentAuditEvent();
                persistentAuditEvent.setAuditEventDate(LocalDateTime.now());
                persistentAuditEvent.setAuditEventType("FILE_UPLOADED");
                persistentAuditEvent.setPrincipal(SecurityUtils.getCurrentUserLogin());
                HashMap<String, String> event = new HashMap<>();
                event.put("message", "ID: " + savedFile.getId().toString());
                persistentAuditEvent.setData(event);
                persistenceAuditEventRepository.save(persistentAuditEvent);
            }

            return ResponseEntity.ok()
                .headers(HeaderUtil.createAlert("global.file.fileSaved",null))
                .body(savedFile);

        } catch (Exception e) {
            return ResponseEntity.status(500)
                .headers(HeaderUtil.createAlert("global.file.error",e.getMessage()))
                .body("{message:'"+e.getMessage()+"'}");
        }
    }

}
