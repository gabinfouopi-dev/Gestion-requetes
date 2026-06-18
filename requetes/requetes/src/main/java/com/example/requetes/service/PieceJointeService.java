package com.example.requetes.service;

import com.example.requetes.dto.PieceJointesDTO;
import com.example.requetes.entity.PieceJointe;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface PieceJointeService {
    List<PieceJointe> getAllByReqId(Integer id);
    List<PieceJointe> getAllByRepId(Integer id);
    List<PieceJointe> getAllByIsReqId(Integer id);
    List<PieceJointe> getAllByIsRepId(Integer id);
    List<PieceJointe> getAll();
    PieceJointe getById(Integer id);
    PieceJointe upload(MultipartFile file, String requeteId, Integer reponseId, String risId, Integer reponseInterServiceId )throws IOException;
    void delete(Integer id);
}
