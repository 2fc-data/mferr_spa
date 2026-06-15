import React from 'react';

interface LGPDMinorPrivacyTermProps {
  user: {
    name: string;
    document: string;
    email: string;
    birth_date?: string;
    responsible?: {
      name: string;
      document: string;
      responsible_relation: string;
    };
  };
}

export const LGPDMinorPrivacyTerm: React.FC<LGPDMinorPrivacyTermProps> = ({ user }) => {
  const currentDate = new Date().toLocaleDateString('pt-BR');
  const birthDate = user.birth_date ? new Date(user.birth_date).toLocaleDateString('pt-BR') : '________________';

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white text-slate-900 font-serif leading-relaxed print:p-0">
      <div className="text-center mb-10 border-b-2 border-slate-200 pb-6">
        <h1 className="text-2xl font-bold uppercase tracking-widest text-slate-800">Protocolo LGPD e Documentação (Menores)</h1>
        <p className="text-sm text-slate-500 mt-2 italic">Autorização para Tratamento de Dados de Menores (Art. 14 da Lei nº 13.709/2018)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl">
          <h2 className="text-sm font-bold mb-4 uppercase tracking-wider text-primary border-b border-primary/20 pb-2">1. Identificação do Menor</h2>
          <div className="space-y-3 text-sm">
            <p><strong>Nome:</strong> {user.name || '________________'}</p>
            <p><strong>Data de Nascimento:</strong> {birthDate}</p>
            <p><strong>CPF (se houver):</strong> {user.document || '________________'}</p>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl">
          <h2 className="text-sm font-bold mb-4 uppercase tracking-wider text-primary border-b border-primary/20 pb-2">2. Representante Legal</h2>
          <div className="space-y-3 text-sm">
            <p><strong>Nome:</strong> {user.responsible?.name || '________________'}</p>
            <p><strong>CPF:</strong> {user.responsible?.document || '________________'}</p>
            <p><strong>Parentesco/Vínculo:</strong> {user.responsible?.responsible_relation || '________________'}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 text-justify text-sm">
        <p>
          O <strong>REPRESENTANTE LEGAL</strong>, acima identificado, na qualidade de detentor das responsabilidades parentais ou tutelares, 
          autoriza expressamente o escritório <strong>MARCELL FERREIRA - ADVOCACIA</strong> a realizar o tratamento de dados pessoais 
          e dados pessoais sensíveis da criança/adolescente acima identificada, em estrita observância à Lei Geral de Proteção de Dados (LGPD).
        </p>

        <div>
          <h3 className="font-bold mb-2 uppercase text-xs tracking-wider">3. Finalidades Específicas</h3>
          <div className="text-sm">
            O tratamento dos dados do menor destina-se exclusivamente a:
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Peticionamento judicial e administrativo em favor do menor;</li>
              <li>Identificação perante órgãos públicos, tribunais e instituições de ensino;</li>
              <li>Habilitação de benefícios e direitos decorrentes da lide jurídica;</li>
              <li>Gestão de prontuários processuais e arquivamento legal.</li>
            </ul>
          </div>
        </div>

        <div>
          <h3 className="font-bold mb-2 uppercase text-xs tracking-wider">4. Melhor Interesse do Menor</h3>
          <p>
            O tratamento dos dados será realizado em conformidade com o princípio do melhor interesse da criança/adolescente, 
            garantindo a segurança e a privacidade, com a implementação de medidas técnicas de proteção contra acessos não autorizados.
          </p>
        </div>

        <p className="p-4 bg-primary/5 border-l-4 border-primary rounded-r-lg italic text-[13px]">
          "A autorização poderá ser revogada a qualquer momento pelo representante legal, mediante solicitação formal, 
          ressalvadas as hipóteses de conservação previstas legalmente para o cumprimento de obrigações judiciais."
        </p>
      </div>

      <div className="mt-16 text-center space-y-16">
        <p className="text-sm">Belo Horizonte, {currentDate}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="flex flex-col items-center">
            <div className="w-64 border-t border-slate-400 mb-2"></div>
            <p className="text-sm font-bold uppercase">{user.responsible?.name || 'Assinatura do Responsável'}</p>
            <p className="text-xs text-slate-500">REPRESENTANTE LEGAL</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-64 border-t border-slate-400 mb-2"></div>
            <p className="text-sm font-bold uppercase">MARCELL FERREIRA - ADVOCACIA</p>
            <p className="text-xs text-slate-500">CONTROLADOR</p>
          </div>
        </div>
      </div>

      <footer className="mt-12 pt-6 border-t border-slate-100 text-[10px] text-slate-400 text-center italic">
        Documento gerado eletronicamente para fins de consentimento específico para menores de idade.
      </footer>
    </div>
  );
};
