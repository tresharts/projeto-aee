package com.art.aee.atendimento;

import com.art.aee.aluno.AlunoRepository;
import com.art.aee.atendimento.dto.AtendimentoRequest;
import com.art.aee.atendimento.dto.AtendimentoResponse;
import com.art.aee.exception.RecursoNaoEncontradoException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

@Service
public class AtendimentoService {

    private final AtendimentoRepository atendimentoRepository;
    private final AlunoRepository alunoRepository;
    private final AtendimentoMapper atendimentoMapper;

    public AtendimentoService(
            AtendimentoRepository atendimentoRepository,
            AlunoRepository alunoRepository,
            AtendimentoMapper atendimentoMapper) {
        this.atendimentoRepository = atendimentoRepository;
        this.alunoRepository = alunoRepository;
        this.atendimentoMapper = atendimentoMapper;
    }

    @Transactional
    public AtendimentoResponse criar(AtendimentoRequest request) {
        validarAluno(request.alunoId());

        Atendimento atendimento = new Atendimento();
        atendimentoMapper.copiarDados(request, atendimento);

        return atendimentoMapper.paraResponse(atendimentoRepository.saveAndFlush(atendimento));
    }

    @Transactional
    public AtendimentoResponse atualizar(UUID id, AtendimentoRequest request) {
        Atendimento atendimento = buscarEntidade(id);

        if (!Objects.equals(atendimento.getAlunoId(), request.alunoId())) {
            validarAluno(request.alunoId());
        }
        atendimentoMapper.copiarDados(request, atendimento);

        return atendimentoMapper.paraResponse(atendimentoRepository.save(atendimento));
    }

    @Transactional(readOnly = true)
    public AtendimentoResponse buscarPorId(UUID id) {
        return atendimentoMapper.paraResponse(buscarEntidade(id));
    }

    @Transactional(readOnly = true)
    public Page<AtendimentoResponse> listar(Pageable pageable, UUID alunoId, LocalDateTime inicio, LocalDateTime fim) {
        if (alunoId != null) {
            if (inicio != null && fim != null) {
                return atendimentoRepository
                        .findByAlunoIdAndDataHoraBetween(alunoId, inicio, fim, pageable)
                        .map(atendimentoMapper::paraResponse);
            }

            return atendimentoRepository.findByAlunoId(alunoId, pageable)
                    .map(atendimentoMapper::paraResponse);
        }

        return atendimentoRepository.findAll(pageable).map(atendimentoMapper::paraResponse);
    }

    private Atendimento buscarEntidade(UUID id) {
        return atendimentoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Atendimento não encontrado"));
    }

    private void validarAluno(UUID alunoId) {
        if (!alunoRepository.existsById(alunoId)) {
            throw new RecursoNaoEncontradoException("Aluno não encontrado");
        }
    }
}
