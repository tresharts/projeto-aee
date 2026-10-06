# [Relatorio] Implementar geração de PDF consolidado (OpenPDF)

## Descrição
Implementar o service que gera o PDF consolidado do aluno (Aba 4 - Relatórios): dados do aluno + atendimentos do período + lista de documentos.

## Arquivos a criar/modificar
- `backend/pom.xml` (adicionar `com.github.librepdf:openpdf`, versão estável recente do Maven Central)
- `backend/src/main/java/com/art/aee/relatorio/RelatorioService.java`

## Detalhes técnicos

### Dependências do Service
- `AlunoRepository`, `AtendimentoRepository`, `DocumentoRepository`

### Método
#### `gerarRelatorioAluno(UUID alunoId, LocalDateTime inicio, LocalDateTime fim): byte[]`
1. Buscar aluno ou lançar "Aluno não encontrado"
2. Buscar atendimentos do período (ordenado cronológico)
3. Buscar documentos do aluno
4. Montar PDF com OpenPDF (`Document`, `PdfWriter`, fonte padrão):
   - Cabeçalho: nome do aluno, escola/turma, período
   - Seção Atendimentos: data, presença, humor, foco, observações
   - Seção Documentos: nome, tipo, data de upload
   - Rodapé: data de geração
5. Retornar `byte[]` (via `ByteArrayOutputStream`)

Período padrão se não informado: últimos 6 meses até agora.

## Critérios de aceite
- [ ] PDF abre corretamente (sem corrupção)
- [ ] Contém as 3 seções (aluno, atendimentos, documentos)
- [ ] Período filtra os atendimentos (documentos listam todos)
- [ ] Aluno inexistente → 404 via exceção customizada

## Dependências
- Issues #17 (AtendimentoService/Repository) e #21 (DocumentoService/Repository)
