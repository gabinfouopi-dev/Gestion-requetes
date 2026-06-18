package com.example.requetes.service;

import com.example.requetes.entity.Service;

import java.util.List;

public interface ServiceService {
    List<Service> getAll();
    Service getById(Integer id);
    Service create(Service service);
    Service update(Integer id, Service service);
    void delete(Integer id);
}
