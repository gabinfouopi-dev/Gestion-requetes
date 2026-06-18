package com.example.requetes.service;

import com.example.requetes.dto.ReponseDTO;
import com.example.requetes.entity.Reponse;

import java.util.List;

public interface ReponseService {
    List<ReponseDTO> getAll();
    List<Reponse> getMyReponses(Integer UserId);
    ReponseDTO getById(Integer id);
    ReponseDTO getByRequeteId(Integer requeteId);
    ReponseDTO create(ReponseDTO dto);
    void delete(Integer id);
}
