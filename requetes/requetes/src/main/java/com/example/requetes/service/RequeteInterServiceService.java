package com.example.requetes.service;

import com.example.requetes.dto.RequeteInterServiceDTO;
import com.example.requetes.dto.StatutDTO;

import java.util.List;

public interface RequeteInterServiceService {
    List<RequeteInterServiceDTO> getAll();
    RequeteInterServiceDTO getById(Integer id);
    List<RequeteInterServiceDTO> getByEmetteurId(Integer serviceId);
    List<RequeteInterServiceDTO> getByRecepteurId(Integer serviceId);
    RequeteInterServiceDTO create(RequeteInterServiceDTO dto);
    RequeteInterServiceDTO update(Integer id, RequeteInterServiceDTO dto);
    void delete(Integer id);
    RequeteInterServiceDTO changerStatut(Integer id, StatutDTO statut);
}
