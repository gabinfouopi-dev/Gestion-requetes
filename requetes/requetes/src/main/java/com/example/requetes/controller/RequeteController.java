package com.example.requetes.controller;

import com.example.requetes.dto.RequeteDTO;
import com.example.requetes.dto.StatutDTO;
import com.example.requetes.entity.Requete;
import com.example.requetes.enums.StatutRequete;
import com.example.requetes.service.RequeteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/requetes")
@RequiredArgsConstructor
public class RequeteController {

    private final RequeteService requeteService;

    @GetMapping
    public ResponseEntity<List<RequeteDTO>> getAll() {
        return ResponseEntity.ok(requeteService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RequeteDTO> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(requeteService.getById(id));
    }

    @GetMapping("/moi/{id}")
    public ResponseEntity<List<RequeteDTO>> getByUtilisateurId(@PathVariable Integer id) {
        return ResponseEntity.ok(requeteService.getByUtilisateurId(id));
    }

    @GetMapping("/service/{serviceId}")
    public ResponseEntity<List<Requete>> getByServiceId(@PathVariable Integer serviceId) {
        return ResponseEntity.ok(requeteService.getByServiceId(serviceId));
    }

    @PostMapping
    public ResponseEntity<RequeteDTO> create(@Valid @RequestBody RequeteDTO dto) {
        return new ResponseEntity<>(requeteService.create(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RequeteDTO> update(@PathVariable Integer id, @Valid @RequestBody RequeteDTO dto) {
        return ResponseEntity.ok(requeteService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        requeteService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/soumettre")
    public ResponseEntity<RequeteDTO> soumettre(@PathVariable Integer id) {
        return ResponseEntity.ok(requeteService.soumettre(id));
    }

    @PatchMapping("/{id}/statut")
    public ResponseEntity<RequeteDTO> changerStatut(@PathVariable Integer id, @RequestBody StatutDTO newStatut) {
        return ResponseEntity.ok(requeteService.changerStatut(id, newStatut));
    }
}
