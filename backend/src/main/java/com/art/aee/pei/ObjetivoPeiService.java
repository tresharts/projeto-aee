package com.art.aee.pei;

import com.art.aee.aluno.Aluno;
import com.art.aee.aluno.AlunoRepository;
import com.art.aee.documento.Documento;
import com.art.aee.documento.DocumentoRepository;
import com.art.aee.documento.TipoDocumento;
import com.art.aee.exception.ConflitoException;
import com.art.aee.exception.RecursoNaoEncontradoException;
import com.art.aee.pei.dto.ObjetivoPeiRequest;
import com.art.aee.pei.dto.ObjetivoPeiResponse;
import com.art.aee.turma.TurmaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ObjetivoPeiService {

    private final ObjetivoPeiRepository objetivoRepository;
    private final AlunoRepository alunoRepository;
    private final TurmaRepository turmaRepository;
    private final DocumentoRepository documentoRepository;

    public ObjetivoPeiService(ObjetivoPeiRepository objetivoRepository,
                              AlunoRepository alunoRepository,
                              TurmaRepository turmaRepository,
                              DocumentoRepository documentoRepository) {
        this.objetivoRepository = objetivoRepository;
        this.alunoRepository = alunoRepository;
        this.turmaRepository = turmaRepository;
        this.documentoRepository = documentoRepository;
    }

    @Transactional(readOnly = true)
    public List<ObjetivoPeiResponse> listar(UUID alunoId, UUID escolaId, boolean incluirInativos) {
        validarAlunoDaEscola(alunoId, escolaId);
        List<ObjetivoPei> objetivos = incluirInativos
                ? objetivoRepository.findByAlunoIdOrderByDataCadastroDesc(alunoId)
                : objetivoRepository.findByAlunoIdAndAtivoTrueOrderByDataCadastroDesc(alunoId);
        return objetivos.stream().map(this::paraResponse).toList();
    }

    @Transactional
    public ObjetivoPeiResponse criar(UUID alunoId, ObjetivoPeiRequest request, UUID escolaId) {
        validarAlunoDaEscola(alunoId, escolaId);
        validarDocumentoPei(alunoId, request.documentoPeiId());
        ObjetivoPei objetivo = new ObjetivoPei();
        objetivo.setAlunoId(alunoId);
        objetivo.setDocumentoPeiId(request.documentoPeiId());
        objetivo.setDescricao(request.descricao().trim());
        return paraResponse(objetivoRepository.saveAndFlush(objetivo));
    }

    @Transactional
    public ObjetivoPeiResponse atualizar(UUID alunoId, UUID objetivoId, ObjetivoPeiRequest request, UUID escolaId) {
        validarAlunoDaEscola(alunoId, escolaId);
        ObjetivoPei objetivo = buscarDoAluno(alunoId, objetivoId);
        validarDocumentoPei(alunoId, request.documentoPeiId());
        objetivo.setDocumentoPeiId(request.documentoPeiId());
        objetivo.setDescricao(request.descricao().trim());
        return paraResponse(objetivoRepository.save(objetivo));
    }

    @Transactional
    public void desativar(UUID alunoId, UUID objetivoId, UUID escolaId) {
        validarAlunoDaEscola(alunoId, escolaId);
        ObjetivoPei objetivo = buscarDoAluno(alunoId, objetivoId);
        objetivo.setAtivo(false);
        objetivoRepository.save(objetivo);
    }

    private ObjetivoPei buscarDoAluno(UUID alunoId, UUID objetivoId) {
        ObjetivoPei objetivo = objetivoRepository.findById(objetivoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Objetivo do PEI não encontrado"));
        if (!objetivo.getAlunoId().equals(alunoId)) {
            throw new RecursoNaoEncontradoException("Objetivo do PEI não encontrado");
        }
        return objetivo;
    }

    private void validarDocumentoPei(UUID alunoId, UUID documentoId) {
        if (documentoId == null) return;
        Documento documento = documentoRepository.findById(documentoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Documento do PEI não encontrado"));
        if (!documento.getAlunoId().equals(alunoId) || documento.getTipoDocumento() != TipoDocumento.PEI) {
            throw new RecursoNaoEncontradoException("Documento do PEI não encontrado");
        }
    }

    private void validarAlunoDaEscola(UUID alunoId, UUID escolaId) {
        if (escolaId == null) throw new ConflitoException("A conta precisa estar vinculada a uma escola.");
        Aluno aluno = alunoRepository.findById(alunoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Aluno não encontrado"));
        if (!turmaRepository.existsByIdAndEscolaId(aluno.getTurmaId(), escolaId)) {
            throw new RecursoNaoEncontradoException("Aluno não encontrado");
        }
    }

    private ObjetivoPeiResponse paraResponse(ObjetivoPei objetivo) {
        return new ObjetivoPeiResponse(objetivo.getId(), objetivo.getAlunoId(), objetivo.getDocumentoPeiId(),
                objetivo.getDescricao(), objetivo.isAtivo(), objetivo.getDataCadastro());
    }
}
