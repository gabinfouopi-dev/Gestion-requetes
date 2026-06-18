package com.example.requetes.service.impl;

import com.example.requetes.dto.RequeteDTO;
import com.example.requetes.dto.StatutDTO;
import com.example.requetes.entity.Categorie;
import com.example.requetes.entity.Requete;
import com.example.requetes.entity.Utilisateur;
import com.example.requetes.enums.StatutRequete;
import com.example.requetes.exception.ResourceNotFoundException;
import com.example.requetes.repository.CategorieRepository;
import com.example.requetes.repository.RequeteRepository;
import com.example.requetes.repository.UtilisateurRepository;
import com.example.requetes.service.RequeteService;
import lombok.RequiredArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
public class RequeteServiceImpl implements RequeteService {

    private final RequeteRepository requeteRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final CategorieRepository categorieRepository;

    @Override
    public List<RequeteDTO> getAll() {
        return requeteRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public RequeteDTO getById(Integer id) {
        Requete requete = requeteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Requete non trouvee avec l'id : " + id));
        return toDTO(requete);
    }

    @Override
    public List<RequeteDTO> getByUtilisateurId(Integer utilisateurId) {
        return requeteRepository.findByUtilisateurId(utilisateurId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<Requete> getByServiceId(Integer serviceId) {
        return requeteRepository.findByCategorie_ServiceId(serviceId)
                .stream()
                .collect(Collectors.toList());
    }

    @Override
    public RequeteDTO create(RequeteDTO dto) {
        Requete requete = new Requete();

        requete.setObjet(dto.getObjet());
        requete.setDescription(dto.getDescription());
        requete.setDateCreation(dto.getDateCreation() != null ? dto.getDateCreation() : LocalDate.now());
        requete.setDateSoumission(dto.getDateSoumission());
        requete.setStatut(dto.getStatut() != null ? dto.getStatut() : StatutRequete.BROUILLON);

        Utilisateur utilisateur = utilisateurRepository.findById(dto.getUtilisateurId())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouve avec l'id : " + dto.getUtilisateurId()));
        requete.setUtilisateur(utilisateur);

        Categorie categorie = categorieRepository.findById(dto.getCategorieId())
                .orElseThrow(() -> new ResourceNotFoundException("Categorie non trouvee avec l'id : " + dto.getCategorieId()));
        requete.setCategorie(categorie);

        Requete saved = requeteRepository.save(requete);
        return toDTO(saved);
    }

    @Override
    public RequeteDTO update(Integer id, RequeteDTO dto) {
        Requete requete = requeteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Requete non trouvee avec l'id : " + id));

        requete.setObjet(dto.getObjet());
        requete.setDescription(dto.getDescription());

        if (dto.getCategorieId() != null) {
            Categorie categorie = categorieRepository.findById(dto.getCategorieId())
                    .orElseThrow(() -> new ResourceNotFoundException("Categorie non trouvee avec l'id : " + dto.getCategorieId()));
            requete.setCategorie(categorie);
        }

        Requete updated = requeteRepository.save(requete);
        return toDTO(updated);
    }

    @Override
    public void delete(Integer id) {
        Requete requete = requeteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Requete non trouvee avec l'id : " + id));
        requeteRepository.delete(requete);
    }

    @Override
    public RequeteDTO soumettre(Integer id) {
        Requete requete = requeteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Requete non trouvee avec l'id : " + id));

        requete.setStatut(StatutRequete.EN_ATTENTE);
        requete.setDateSoumission(LocalDate.now());

        Requete updated = requeteRepository.save(requete);
        return toDTO(updated);
    }

    @Override
    public RequeteDTO changerStatut(Integer id, StatutDTO statut) {
        Requete requete = requeteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Requete non trouvee avec l'id : " + id));

        requete.setStatut(statut.getStatut());

        Requete updated = requeteRepository.save(requete);
        return toDTO(updated);
    }

    private RequeteDTO toDTO(Requete requete) {
        RequeteDTO dto = new RequeteDTO();
        dto.setId(requete.getId());
        dto.setObjet(requete.getObjet());
        dto.setDescription(requete.getDescription());
        dto.setDateCreation(requete.getDateCreation());
        dto.setDateSoumission(requete.getDateSoumission());
        dto.setStatut(requete.getStatut());

        if (requete.getUtilisateur() != null) {
            dto.setUtilisateurId(requete.getUtilisateur().getId());
            dto.setUtilisateur(requete.getUtilisateur());
            dto.setUtilisateurNom(requete.getUtilisateur().getNom() + " " + requete.getUtilisateur().getPrenom());
        }

        if (requete.getCategorie() != null) {
            dto.setCategorie(requete.getCategorie());
            dto.setCategorieId(requete.getCategorie().getId());
            dto.setCategorieNom(requete.getCategorie().getNom());
        }

        return dto;
    }
}
