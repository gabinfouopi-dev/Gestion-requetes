package com.example.requetes.controller;

import com.example.requetes.dto.ReponseDTO;
import com.example.requetes.entity.Reponse;
import com.example.requetes.service.ReponseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reponses")
@RequiredArgsConstructor
public class ReponseController {

    private final ReponseService reponseService;

    @GetMapping
    public ResponseEntity<List<ReponseDTO>> getAll() {
        return ResponseEntity.ok(reponseService.getAll());
    }

    @GetMapping("/moi/{userId}")
    public ResponseEntity<List<Reponse>> getMyReponses(@PathVariable  Integer userId) {
        return ResponseEntity.ok(reponseService.getMyReponses(userId));
    }


    @GetMapping("/{id}")
    public ResponseEntity<ReponseDTO> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(reponseService.getById(id));
    }

    @GetMapping("/requete/{requeteId}")
    public ResponseEntity<ReponseDTO> getByRequeteId(@PathVariable Integer requeteId) {
        return ResponseEntity.ok(reponseService.getByRequeteId(requeteId));
    }

    @PostMapping
    public ResponseEntity<ReponseDTO> create(@Valid @RequestBody ReponseDTO dto) {
        return new ResponseEntity<>(reponseService.create(dto), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        reponseService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
