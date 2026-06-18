package com.example.requetes.controller;

import com.example.requetes.dto.ReponseInterServiceDTO;
import com.example.requetes.service.ReponseInterServiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reponses-inter-services")
@RequiredArgsConstructor
public class ReponseInterServiceController {

    private final ReponseInterServiceService reponseInterServiceService;

    @GetMapping
    public ResponseEntity<List<ReponseInterServiceDTO>> getAll() {
        return ResponseEntity.ok(reponseInterServiceService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReponseInterServiceDTO> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(reponseInterServiceService.getById(id));
    }

    @GetMapping("/requete/{id}")
    public ResponseEntity<ReponseInterServiceDTO> getByRequeteInterServiceId(@PathVariable Integer id) {
        return ResponseEntity.ok(reponseInterServiceService.getByRequeteInterServiceId(id));
    }

    @PostMapping
    public ResponseEntity<ReponseInterServiceDTO> create(@Valid @RequestBody ReponseInterServiceDTO dto) {

        System.out.println("auteur" + dto.getAuteurId());
        System.out.println("requete" + dto.getIsrequeteId());
        return new ResponseEntity<>(reponseInterServiceService.create(dto), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        reponseInterServiceService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
