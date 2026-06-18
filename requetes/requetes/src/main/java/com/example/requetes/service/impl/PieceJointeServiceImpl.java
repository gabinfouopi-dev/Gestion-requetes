package com.example.requetes.service.impl;

import com.example.requetes.dto.PieceJointesDTO;
import com.example.requetes.entity.PieceJointe;
import com.example.requetes.exception.ResourceNotFoundException;
import com.example.requetes.repository.*;
import com.example.requetes.service.PieceJointeService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.method.P;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
public class PieceJointeServiceImpl implements PieceJointeService {

    private final PieceJointeRepository pieceJointeRepository;
    private final RequeteRepository requeteRepository;
    private  final ReponseRepository reponseRepository;
    private final RequeteInterServiceRepository requeteInterServiceRepository;
    private final ReponseInterServiceRepository reponseInterServiceRepository;

    @Override
    public List<PieceJointe> getAllByReqId(Integer id) {
        return pieceJointeRepository.findAllByReqId(id);
    }

    @Override
    public List<PieceJointe> getAllByRepId(Integer id) {
        return pieceJointeRepository.findAllByRepId(id);
    }

    @Override
    public List<PieceJointe> getAllByIsReqId(Integer id) {
        return pieceJointeRepository.findAllByIsReqId(id);
    }

    @Override
    public List<PieceJointe> getAllByIsRepId(Integer id) {
        return pieceJointeRepository.findAllByIsRepId(id);
    }

    @Override
    public List<PieceJointe> getAll() {
        return pieceJointeRepository.findAll();
    }

    @Override
    public PieceJointe getById(Integer id) {
        return pieceJointeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Piece jointe non trouvee avec l'id : " + id));
    }

    @Override
    public void delete(Integer id) {
        PieceJointe pieceJointe = pieceJointeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Piece jointe non trouvee avec l'id : " + id));
        pieceJointeRepository.delete(pieceJointe);
    }

    private final String UPLOAD_DIR = "uploads/";

    @Override
    public PieceJointe upload(MultipartFile file, String requeteId, Integer reponseId, String risId, Integer reponseInterServiceId ) throws IOException {
        int count = 0;
        if (requeteId != null) count++;
        if (reponseId != null) count++;
        if (risId != null) count++;
        if (reponseInterServiceId != null) count++;
        if (count != 1) {
            throw new IllegalArgumentException("Une pièce jointe doit être associée à un seul parent.");
        }
        Files.createDirectories(Paths.get(UPLOAD_DIR));
        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path destination = Paths.get(UPLOAD_DIR, fileName);
        Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
        PieceJointe pieceJointe = new PieceJointe();
        pieceJointe.setNomFichier(file.getOriginalFilename());
        pieceJointe.setChemin(destination.toString());
        if (requeteId != null){
            Integer id = Integer.parseInt(requeteId);
            pieceJointe.setRequete(requeteRepository.findById(id)
                    .orElseThrow(() -> new  ResourceNotFoundException("Requete introuvable !"))
            );
        }

        if (reponseId != null){

            pieceJointe.setReponse(reponseRepository.findById(reponseId)
                    .orElseThrow(() -> new  ResourceNotFoundException("Reponse introuvable !"))
            );

        }

        if (risId != null){
            Integer rid = Integer.parseInt(risId);
            pieceJointe.setRequeteInterService(requeteInterServiceRepository.findById(rid)
                    .orElseThrow(() -> new  ResourceNotFoundException("Requete introuvable !"))
            );

        }

        if (reponseInterServiceId != null){

            pieceJointe.setReponseInterService(reponseInterServiceRepository.findById(reponseInterServiceId)
                    .orElseThrow(() -> new  ResourceNotFoundException("Reponse introuvable !"))
            );
        }
        return pieceJointeRepository.save(pieceJointe);
    }
}
