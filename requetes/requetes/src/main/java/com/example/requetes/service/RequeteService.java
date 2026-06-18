package com.example.requetes.service;

import com.example.requetes.dto.RequeteDTO;
import com.example.requetes.dto.StatutDTO;
import com.example.requetes.entity.Requete;
import com.example.requetes.enums.StatutRequete;

import java.util.List;

public interface RequeteService {
    List<RequeteDTO> getAll();
    RequeteDTO getById(Integer id);
    List<RequeteDTO> getByUtilisateurId(Integer utilisateurId);
    List<Requete> getByServiceId(Integer serviceId);
    RequeteDTO create(RequeteDTO dto);
    RequeteDTO update(Integer id, RequeteDTO dto);
    void delete(Integer id);
    RequeteDTO soumettre(Integer id);
    RequeteDTO changerStatut(Integer id, StatutDTO statut);
}
