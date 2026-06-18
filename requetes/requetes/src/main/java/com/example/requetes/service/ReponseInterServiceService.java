package com.example.requetes.service;

import com.example.requetes.dto.ReponseInterServiceDTO;

import java.util.List;

public interface ReponseInterServiceService {
    List<ReponseInterServiceDTO> getAll();
    ReponseInterServiceDTO getById(Integer id);
    ReponseInterServiceDTO getByRequeteInterServiceId(Integer requeteInterServiceId);
    ReponseInterServiceDTO create(ReponseInterServiceDTO dto);
    void delete(Integer id);
}
