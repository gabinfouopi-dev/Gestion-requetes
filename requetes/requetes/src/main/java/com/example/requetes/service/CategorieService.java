package com.example.requetes.service;

import com.example.requetes.dto.CategorieDTO;

import java.util.List;

public interface CategorieService {
    List<CategorieDTO> getAll();
    CategorieDTO getById(Integer id);
    List<CategorieDTO> getByServiceId(Integer serviceId);
    CategorieDTO create(CategorieDTO dto);
    CategorieDTO update(Integer id, CategorieDTO dto);
    void delete(Integer id);
}
