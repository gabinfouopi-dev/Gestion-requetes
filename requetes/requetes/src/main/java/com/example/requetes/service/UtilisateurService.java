package com.example.requetes.service;

import com.example.requetes.dto.UtilisateurDTO;

import java.util.List;

public interface UtilisateurService {
    List<UtilisateurDTO> getAll();
    UtilisateurDTO getById(Integer id);
    UtilisateurDTO getByEmail(String Email);
    UtilisateurDTO create(UtilisateurDTO dto);
    UtilisateurDTO update(Integer id, UtilisateurDTO dto);
    void delete(Integer id);
}
