package com.example.requetes.controller;

import com.example.requetes.dto.RequeteDTO;
import com.example.requetes.dto.RequeteInterServiceDTO;
import com.example.requetes.dto.StatutDTO;
import com.example.requetes.service.RequeteInterServiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requetes-inter-services")
@RequiredArgsConstructor
public class RequeteInterServiceController {

    private final RequeteInterServiceService requeteInterServiceService;

    @GetMapping
    public ResponseEntity<List<RequeteInterServiceDTO>> getAll() {
        return ResponseEntity.ok(requeteInterServiceService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RequeteInterServiceDTO> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(requeteInterServiceService.getById(id));
    }

    @GetMapping("/emetteur/{serviceId}")
    public ResponseEntity<List<RequeteInterServiceDTO>> getByEmetteurId(@PathVariable Integer serviceId) {
        return ResponseEntity.ok(requeteInterServiceService.getByEmetteurId(serviceId));
    }

    @GetMapping("/recepteur/{serviceId}")
    public ResponseEntity<List<RequeteInterServiceDTO>> getByRecepteurId(@PathVariable Integer serviceId) {
        return ResponseEntity.ok(requeteInterServiceService.getByRecepteurId(serviceId));
    }

    @PostMapping
    public ResponseEntity<RequeteInterServiceDTO> create(@Valid @RequestBody RequeteInterServiceDTO dto) {
        return new ResponseEntity<>(requeteInterServiceService.create(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RequeteInterServiceDTO> update(@PathVariable Integer id, @Valid @RequestBody RequeteInterServiceDTO dto) {
        return ResponseEntity.ok(requeteInterServiceService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        requeteInterServiceService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/statut")
    public ResponseEntity<RequeteInterServiceDTO> changerStatut(@PathVariable Integer id, @RequestBody StatutDTO newStatut) {
        return ResponseEntity.ok(requeteInterServiceService.changerStatut(id, newStatut));
    }
}
