package com.art.aee.escola;

import com.art.aee.escola.dto.EscolaRequest;
import com.art.aee.escola.dto.EscolaResponse;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class EscolaService {

    private final EscolaRepository escolaRepository;
    private final EscolaMapper escolaMapper;

    public EscolaService(EscolaRepository escolaRepository, EscolaMapper escolaMapper) {
        this.escolaRepository = escolaRepository;
        this.escolaMapper = escolaMapper;
    }

    @Transactional
    public EscolaResponse criar(EscolaRequest request) {
        Escola escola = new Escola();
        escolaMapper.copiarDados(request, escola);

        return escolaMapper.paraResponse(escolaRepository.save(escola));
    }

    @Transactional
    public EscolaResponse atualizar(UUID id, EscolaRequest request) {
        Escola escola = buscarEntidade(id);
        escolaMapper.copiarDados(request, escola);

        return escolaMapper.paraResponse(escolaRepository.save(escola));
    }

    @Transactional(readOnly = true)
    public EscolaResponse buscarPorId(UUID id) {
        return escolaMapper.paraResponse(buscarEntidade(id));
    }

    @Transactional(readOnly = true)
    public Page<EscolaResponse> listar(Pageable pageable, String nome) {
        if (nome != null && !nome.isBlank()) {
            return escolaRepository
                    .findByNomeContainingIgnoreCase(nome, pageable)
                    .map(escolaMapper::paraResponse);
        }

        return escolaRepository.findAll(pageable).map(escolaMapper::paraResponse);
    }

    @Transactional
    public void remover(UUID id) {
        Escola escola = buscarEntidade(id);
        escolaRepository.delete(escola);
    }

    private Escola buscarEntidade(UUID id) {
        return escolaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Escola não encontrada"));
    }
}
