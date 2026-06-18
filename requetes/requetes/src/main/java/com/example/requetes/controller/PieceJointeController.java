package com.example.requetes.controller;

import com.example.requetes.dto.PieceJointesDTO;
import com.example.requetes.entity.PieceJointe;
import com.example.requetes.service.PieceJointeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/pieces-jointes")
@RequiredArgsConstructor
public class PieceJointeController {

    private final PieceJointeService pieceJointeService;

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> download(@PathVariable Integer id)
            throws IOException {

        PieceJointe pj = pieceJointeService.getById(id);

        Path path = Paths.get(pj.getChemin());

        Resource resource = new UrlResource(path.toUri());

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + pj.getNomFichier() + "\""
                )
                .body(resource);
    }

    @GetMapping
    public ResponseEntity<List<PieceJointe>> getAll() {
        return ResponseEntity.ok(pieceJointeService.getAll());
    }

    @GetMapping("/requetes/{id}")
    public ResponseEntity<List<PieceJointe>> getAllByReqId(@PathVariable Integer id) {
        return ResponseEntity.ok(pieceJointeService.getAllByReqId(id));
    }

    @GetMapping("/reponses/{id}")
    public ResponseEntity<List<PieceJointe>> getAllByRepId(@PathVariable Integer id) {
        return ResponseEntity.ok(pieceJointeService.getAllByRepId(id));
    }

    @GetMapping("/isrequetes/{id}")
    public ResponseEntity<List<PieceJointe>> getAllByIsReqId(@PathVariable Integer id) {
        return ResponseEntity.ok(pieceJointeService.getAllByIsReqId(id));
    }

    @GetMapping("/isreponses/{id}")
    public ResponseEntity<List<PieceJointe>> getAllByIsRepId(@PathVariable Integer id) {
        return ResponseEntity.ok(pieceJointeService.getAllByIsRepId(id));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PieceJointe> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(pieceJointeService.getById(id));
    }

    @GetMapping("/{id}/preview")
    public ResponseEntity<Resource> preview(
            @PathVariable Integer id) throws IOException {

        PieceJointe pj = pieceJointeService.getById(id);
        Path path = Paths.get(pj.getChemin());

        Resource resource = new UrlResource(path.toUri());

        String contentType =
                Files.probeContentType(path);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
    }

    @PostMapping("/upload")
    public ResponseEntity<PieceJointe> upload(@RequestParam MultipartFile file,
                                              @RequestParam(required = false) String requeteId,
                                              @RequestParam(required = false) Integer reponseId,
                                              @RequestParam(required = false) String risId,
                                              @RequestParam(required = false) Integer reponseInterServiceId) throws IOException {
        System.out.println("id1" + requeteId);
        System.out.println("id2" + reponseId);
        System.out.println("id3" + risId);
        System.out.println("id4" + reponseInterServiceId);
        return new ResponseEntity<>(pieceJointeService.upload(file, requeteId, reponseId, risId, reponseInterServiceId), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        pieceJointeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
