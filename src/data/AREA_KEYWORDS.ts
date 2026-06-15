export const AREA_KEYWORDS: Record<number, string[]> = {
  // Família e Sucessões (Art. 1.583-1.590 CC, Lei 13.058/2014, Lei 11.340/2006)
  5: [
    'familia', 'família', 'sucessao', 'sucessão', 'sucessões', 'menor', 'infância', 'infancia', 
    'alimentos', 'guarda', 'pensão', 'pensao', 'divórcio', 'divorcio', 'casamento', 
    'união estável', 'uniao estavel', ' conjugal', 'turma', 'órfão', 'orfão', 'tutela', 
    'curatela', 'interdição', 'interdicao', 'adoção', 'adocao', 'alienacao parental',
    'regime bens', 'partilha', 'inventário', 'inventario', 'herança', 'heranca',
    'mae', 'pai', 'filho', 'filha', 'executor', 'cível', 'civel', 'familiar',
    'violência doméstica', 'violencia domestica', 'maria da penha', 'medida protetiva'
  ],
  // Direito do Trabalho (CLT - Decreto-Lei 5.452/1943)
  6: [
    'trabalhista', 'trabalho', 'emprego', 'clt', 'empregador', 'empregado', 
    'contrato trabalho', 'rescisão', 'rescisao', 'demissão', 'demissao', 'aviso prévio', 
    'aviso previo', 'fgts', 'insalubridade', 'periculosidade', 'hora extra', 'horaextra',
    'assédio', 'assedio', 'moral', 'sexual', 'acidente trabalho', 'acidentário', 
    'acidentario', 'vínculo empregatício', 'vinculo empregaticio', 'terceirização', 
    'terceirizacao', 'equiparação', 'equiparacao', 'estagiário', 'estagiario',
    'sindicato', 'comissão', 'comissao', 'acordo', 'dissídio', 'dissidio', 'vara trabalho'
  ],
  // Cível (Art. 1.639-1.688 CC, CPC)
  1: [
    'cível', 'civel', 'geral', 'obrigações', 'obrigacoes', 'dívida', 'divida', 
    'ação', 'acao', 'indenização', 'indenizacao', 'dano', 'moral', 'material',
    'contrato', 'responsabilidade civil', 'acidente', 'transito', 'trânsito',
    'consumidor', 'fornecedor', 'produto', 'serviço', 'servico', 'vício', 'vicio',
    'defeito', 'garantia', 'prazo', 'prescrição', 'prescricao', 'decadência', 'decadencia'
  ],
  // Direito do Consumidor (CDC - Lei 8.078/1990)
  9: [
    'consumidor', 'procon', 'fornecedor', 'serviço', 'servico', 'produto', 'vício', 
    'vicio', 'defeito', 'garantia', 'arca', 'plano saúde', 'plano saude', 'convênio', 
    'convenio', 'médico', 'medico', 'hospital', 'reembolso', 'cobertura', 'claúsula', 
    'clausula', 'abuso', 'prática', 'pratica', 'cartao', 'cartão', 'crédito', 
    'credito', 'banco', 'financeira', 'cobranca', 'cobrança', 'inadimplência', 
    'inadimplencia', 'fins prunedores', 'publicidade', 'anuncio', 'anúncio'
  ],
  // Direito Imobiliário (Lei 8.245/1991 - Lei do Inquilinato)
  2: [
    'imobiliário', 'imobiliario', 'imovel', 'imóvel', 'locação', 'locacao', 'inquilino', 
    'locador', 'aluguel', 'fiador', 'fiança', 'fianca', 'condomínio', 'condominio', 
    'síndico', 'sindico', 'assembleia', 'rateio', 'despesas condominiais', 'jus possessionis',
    'usucapião', 'usucapiao', 'direito real', 'proprietário', 'proprietario', 'posse',
    'promessa', 'compromisso', 'compra venda', 'escritura', 'registro', 'matrícula', 
    'matricula', 'cartório', 'cartorio', 'itbi', 'transmissão', 'transmissao'
  ],
  // Direito Contratual (Art. 104-122 CC)
  4: [
    'contratual', 'contrato', 'obrigação', 'obligacao', 'par、古amento', 'obrigar',
    'débito', 'debito', 'credor', 'inadimplência', 'inadimplencia', 'multa', 
    'penalidade', 'cláusula', 'clausula', 'termo', 'acordo', 'convênio', 'convenio',
    'parceiro', 'relação comercial', 'relacao comercial', 'fornecimento', 'distrato',
    'resolução', 'resolucao', 'resilição', 'resilicao', 'revogação', 'revogacao',
    'anuência', 'anuencia', 'irrevogável', 'irrevogavel'
  ],
  // Direito Tributário (CTN - Lei 5.172/1966)
  7: [
    'tributário', 'tributario', 'imposto', 'taxa', 'contribuição', 'contribuicao',
    'fiscal', 'fisco', 'receita', 'secretaria', 'municipal', 'estadual', 'federal',
    'ipva', 'iptu', 'iss', 'icms', 'irp', 'irpj', 'irpj', 'csll', 'pis', 'cofins',
    'execução fiscal', 'execucao fiscal', 'dívida ativa', 'divida ativa', 'penhora', 
    'arrematação', 'arrematacao', 'débitos', 'debitos', 'parcelamento', 'incentivo',
    'benefício fiscal', 'beneficio fiscal', 'isenção', 'isencao', 'immunidade'
  ],
  // Direito Penal (CP - Decreto-Lei 2.848/1940)
  8: [
    'criminal', 'penal', 'crime', 'contravenção', 'contravenção', 'contravencao', 
    'policia', 'delegacia', 'inquérito', 'inquérto', 'inquerito', 'flagrante',
    'prisão', 'prisao', 'réu', 'reu', 'p乾', 'acusado', 'defensor', 'promotor',
    'juiz', 'juiz', 'tribunal', 'processo', 'sentença', 'sentenca', 'condenação', 
    'condenacao', 'absolvição', 'absolvicao', 'recurso', 'apelação', 'apelacao',
    'homicídio', 'homicidio', 'lesão', 'lesao', 'roubo', 'furto', 'estelionato',
    'tráfico', 'trafico', 'droga', 'estupro', 'ameaça', 'ameaca', 'calúnia', 
    'calunia', 'difamação', 'diffamacao'
  ],
  // Direito Previdenciário (Lei 8.213/1991)
  3: [
    'previdenciário', 'previdenciario', 'inss', 'benefício', 'beneficio', 'aposentadoria',
    'pensão', 'pensao', 'auxílio', 'auxilio', 'doença', 'doenca', 'acidente', 
    'trabalhador', 'contribuição', 'contribuicao', 'carência', 'carencia', 
    'tempo serviço', 'tempo servico', 'militar', 'rural', 'urban', 'especial',
    'idade', 'tempo', 'invalidez', 'pcd', 'deficiência', 'deficiencia', 'bpc', 
    'loas', 'render', 'cálculo', 'calculo', 'salário benefício', 'salario beneficio'
  ],
  // Direito Público (Constituição Federal, Admin)
  37: [
    'público', 'publico', 'estado', 'governo', 'administração', 'administracao',
    'poder', 'serviço público', 'servico pubblico', 'funcionário', 'funcionario',
    'servidor', 'estatuto', 'licitação', 'licitacao', 'contrato administrativo', 
    'concurso', 'cargo', 'emprego público', 'emprego-publico', 'comissão', 'comissao',
    'tribunal', 'câmara', 'camara', 'senado', 'prefeito', 'vereador', 'secretário',
    'decreto', 'portaria', 'regimento', 'regulamento'
  ],
  // Direito Civil (Art. 1-2.027 CC)
  38: [
    'civil', 'pessoa', 'física', 'fisica', 'jurídica', 'juridica', 'direito', 
    'personalidade', 'capacidade', 'estado', 'família', 'familia', 'patrimônio', 
    'patrimonio', 'bens', 'propriedade', 'posse', 'uso', 'habitação', 'habitacao',
    'usufruto', 'servidão', 'servidao', 'promessa', 'compromisso', 'vício', 'vicio',
    'prescrição', 'prescricao', 'decadência', 'decadencia', 'nulidade', 'anulabilidade'
  ],
  // Direito Empresarial (Lei 6.404/1976 - Lei das S.A.)
  39: [
    'empresarial', 'empresa', 'sociedade', 'ltda', 's.a.', 's/a', 'ei', 'mei',
    'eireli', 'slu', 'ação', 'acao', 'quotas', 'capital', 'social', 'sócio', 
    'socio', 'administrador', 'diretoria', 'conselho', 'assembleia', 'acordão',
    'fusão', 'fusao', 'cisão', 'cis', 'incorporação', 'incorporacao', 'transformação',
    'transformacao', 'liquidação', 'liquidacao', 'falência', 'falencia', 
    'recuperação', 'recuperacao', 'judicial', 'extrajudicial', 'credor', 'devedor'
  ],
  // Direito Internacional
  40: [
    'internacional', 'externo', 'estrangeiro', 'transnacional', 'tratado', 'convenção', 
    'convencao', 'protocolo', 'acordo', 'comunidade', 'europeia', 'mercosul',
    'aladi', 'nafta', 'organização', 'organizacao', 'nações', 'nacoes', 'unidas',
    'direito comparado', 'jurisdição', 'jurisdicao', 'competência', 'competencia',
    'extradição', 'extradição', 'homologação', 'homologacao', 'sentença estrangeira',
    'lançamento', 'lancamento', 'averbação', 'averbacao', 'imposto', 'importação', 
    'importacao', 'exportação', 'exportacao', 'alfândega', 'alfandega', 'aduana'
  ],
  // Direito Areas Especiais
  41: [
    'especial', 'específico', 'especifico', 'particular', 'híbrido', 'hibrido',
    'meio', 'ambiente', 'urbano', 'rural', 'agrário', 'agrario', 'digital',
    'tecnologia', 'informação', 'informacao', 'dados', 'internet', 'eletrônico',
    'eletronico', 'esportivo', 'desportivo', 'cultural', 'artístico', 'artistico',
    'educacional', 'educativo', 'saúde', 'saude', 'médico', 'medico', 'hospitalar'
  ],
};