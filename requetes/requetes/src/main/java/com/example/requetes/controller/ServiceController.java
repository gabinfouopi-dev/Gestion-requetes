package com.example.requetes.controller;

import com.example.requetes.entity.Service;
import com.example.requetes.service.ServiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class ServiceController {

    private final ServiceService serviceService;

    @GetMapping
    public ResponseEntity<List<Service>> getAll() {
        return ResponseEntity.ok(serviceService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Service> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(serviceService.getById(id));
    }

    @PostMapping
    public ResponseEntity<Service> create(@Valid @RequestBody Service service) {
        return new ResponseEntity<>(serviceService.create(service), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Service> update(@PathVariable Integer id, @Valid @RequestBody Service service) {
        return ResponseEntity.ok(serviceService.update(id, service));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        serviceService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
