package com.example.requetes.service.impl;

import com.example.requetes.dto.CategorieDTO;
import com.example.requetes.entity.Categorie;
import com.example.requetes.entity.Service;
import com.example.requetes.exception.ResourceNotFoundException;
import com.example.requetes.repository.CategorieRepository;
import com.example.requetes.repository.ServiceRepository;
import com.example.requetes.service.CategorieService;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
public class CategorieServiceImpl implements CategorieService {

    private final CategorieRepository categorieRepository;
    private final ServiceRepository serviceRepository;

    @Override
    public List<CategorieDTO> getAll() {
        return categorieRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public CategorieDTO getById(Integer id) {
        Categorie categorie = categorieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categorie non trouvee avec l'id : " + id));
        return toDTO(categorie);
    }

    @Override
    public List<CategorieDTO> getByServiceId(Integer serviceId) {
        return categorieRepository.findByServiceId(serviceId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public CategorieDTO create(CategorieDTO dto) {
        Categorie categorie = toEntity(dto);
        Categorie saved = categorieRepository.save(categorie);
        return toDTO(saved);
    }

    @Override
    public CategorieDTO update(Integer id, CategorieDTO dto) {
        Categorie categorie = categorieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categorie non trouvee avec l'id : " + id));

        categorie.setNom(dto.getNom());
        categorie.setDescription(dto.getDescription());
        categorie.setPriorite(dto.getPriorite());

        Service service = serviceRepository.findById(dto.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Service non trouve avec l'id : " + dto.getServiceId()));
        categorie.setService(service);

        Categorie updated = categorieRepository.save(categorie);
        return toDTO(updated);
    }

    @Override
    public void delete(Integer id) {
        Categorie categorie = categorieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categorie non trouvee avec l'id : " + id));
        categorieRepository.delete(categorie);
    }

    private CategorieDTO toDTO(Categorie categorie) {
        CategorieDTO dto = new CategorieDTO();
        dto.setId(categorie.getId());
        dto.setNom(categorie.getNom());
        dto.setDescription(categorie.getDescription());
        dto.setPriorite(categorie.getPriorite());

        if (categorie.getService() != null) {
            dto.setServiceId(categorie.getService().getId());
            dto.setServiceNom(categorie.getService().getNom());
        }

        return dto;
    }

    private Categorie toEntity(CategorieDTO dto) {
        Categorie categorie = new Categorie();
        categorie.setId(dto.getId());
        categorie.setNom(dto.getNom());
        categorie.setDescription(dto.getDescription());
        categorie.setPriorite(dto.getPriorite());

        Service service = serviceRepository.findById(dto.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Service non trouve avec l'id : " + dto.getServiceId()));
        categorie.setService(service);

        return categorie;
    }
}
