package com.example.requetes.service.impl;

import com.example.requetes.entity.Service;
import com.example.requetes.exception.ResourceNotFoundException;
import com.example.requetes.repository.ServiceRepository;
import lombok.RequiredArgsConstructor;

import java.util.List;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
public class ServiceServiceImpl implements com.example.requetes.service.ServiceService {

    private final ServiceRepository serviceRepository;

    @Override
    public List<Service> getAll() {
        return serviceRepository.findAll();
    }

    @Override
    public Service getById(Integer id) {
        return serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service non trouve avec l'id : " + id));
    }

    @Override
    public Service create(Service service) {
        return serviceRepository.save(service);
    }

    @Override
    public Service update(Integer id, Service service) {
        Service existing = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service non trouve avec l'id : " + id));

        existing.setNom(service.getNom());
        existing.setDescription(service.getDescription());

        return serviceRepository.save(existing);
    }

    @Override
    public void delete(Integer id) {
        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service non trouve avec l'id : " + id));
        serviceRepository.delete(service);
    }
}
