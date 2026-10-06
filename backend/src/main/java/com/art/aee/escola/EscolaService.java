package com.art.aee.escola;

import com.art.aee.escola.dto.EscolaRequest;
import com.art.aee.escola.dto.EscolaResponse;
import com.art.aee.exception.ConflitoException;
import com.art.aee.exception.RecursoNaoEncontradoException;
import com.art.aee.turma.TurmaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class EscolaService {

    private final EscolaRepository escolaRepository;
    private final TurmaRepository turmaRepository;
    private final EscolaMapper escolaMapper;

    public EscolaService(
            EscolaRepository escolaRepository,
            TurmaRepository turmaRepository,
            EscolaMapper escolaMapper) {
        this.escolaRepository = escolaRepository;
        this.turmaRepository = turmaRepository;
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

        if (turmaRepository.existsByEscolaId(id)) {
            throw new ConflitoException("Não é possível remover escola com turmas vinculadas");
        }

        escolaRepository.delete(escola);
    }

    private Escola buscarEntidade(UUID id) {
        return escolaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Escola não encontrada"));
    }
}
