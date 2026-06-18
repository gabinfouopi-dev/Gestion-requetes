package com.example.requetes.controller;

import com.example.requetes.dto.CategorieDTO;
import com.example.requetes.service.CategorieService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategorieController {

    private final CategorieService categorieService;

    @GetMapping
    public ResponseEntity<List<CategorieDTO>> getAll() {
        return ResponseEntity.ok(categorieService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategorieDTO> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(categorieService.getById(id));
    }

    @GetMapping("/service/{serviceId}")
    public ResponseEntity<List<CategorieDTO>> getByServiceId(@PathVariable Integer serviceId) {
        return ResponseEntity.ok(categorieService.getByServiceId(serviceId));
    }

    @PostMapping
    public ResponseEntity<CategorieDTO> create(@Valid @RequestBody CategorieDTO dto) {
        return new ResponseEntity<>(categorieService.create(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategorieDTO> update(@PathVariable Integer id, @Valid @RequestBody CategorieDTO dto) {
        return ResponseEntity.ok(categorieService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        categorieService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
