package com.art.aee.escola;

import com.art.aee.escola.dto.EscolaAccessCodeResponse;
import com.art.aee.escola.dto.EscolaRequest;
import com.art.aee.escola.dto.EscolaResponse;
import com.art.aee.exception.ConflitoException;
import com.art.aee.exception.RecursoNaoEncontradoException;
import com.art.aee.turma.TurmaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
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
        escola.setCodigoCadastro(novoCodigoCadastro());

        return escolaMapper.paraResponse(escolaRepository.save(escola));
    }

    @Transactional
    public EscolaResponse atualizar(UUID id, EscolaRequest request, UUID escolaUsuarioId) {
        Escola escola = buscarEntidade(id, escolaUsuarioId);
        escolaMapper.copiarDados(request, escola);

        return escolaMapper.paraResponse(escolaRepository.save(escola));
    }

    @Transactional(readOnly = true)
    public EscolaResponse buscarPorId(UUID id, UUID escolaUsuarioId) {
        return escolaMapper.paraResponse(buscarEntidade(id, escolaUsuarioId));
    }

    @Transactional(readOnly = true)
    public EscolaAccessCodeResponse buscarCodigoCadastro(UUID id) {
        if (id == null) throw new ConflitoException("A conta admin precisa estar vinculada a uma escola.");
        Escola escola = buscarEntidade(id, id);
        return new EscolaAccessCodeResponse(escola.getId(), escola.getNome(), escola.getCodigoCadastro());
    }

    @Transactional(readOnly = true)
    public Page<EscolaResponse> listar(Pageable pageable, String nome, UUID escolaUsuarioId) {
        if (escolaUsuarioId == null) throw new ConflitoException("A conta precisa estar vinculada a uma escola.");
        Escola escola = buscarEntidade(escolaUsuarioId, escolaUsuarioId);
        if (nome != null && !nome.isBlank() && !escola.getNome().toLowerCase().contains(nome.trim().toLowerCase())) {
            return Page.empty(pageable);
        }
        return new PageImpl<>(List.of(escolaMapper.paraResponse(escola)), pageable, 1);
    }

    @Transactional
    public void remover(UUID id, UUID escolaUsuarioId) {
        Escola escola = buscarEntidade(id, escolaUsuarioId);

        if (turmaRepository.existsByEscolaId(id)) {
            throw new ConflitoException("Não é possível remover escola com turmas vinculadas");
        }

        escolaRepository.delete(escola);
    }

    private Escola buscarEntidade(UUID id, UUID escolaUsuarioId) {
        if (escolaUsuarioId == null) throw new ConflitoException("A conta precisa estar vinculada a uma escola.");
        return escolaRepository.findById(id)
                .filter(escola -> escola.getId().equals(escolaUsuarioId))
                .orElseThrow(() -> new RecursoNaoEncontradoException("Escola não encontrada"));
    }

    private String novoCodigoCadastro() {
        String codigo;
        do {
            codigo = CodigoCadastroEscola.gerar();
        } while (escolaRepository.existsByCodigoCadastro(codigo));
        return codigo;
    }
}
