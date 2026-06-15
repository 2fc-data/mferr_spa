import React from 'react';

interface LGPDPrivacyTermProps {
  user: {
    name: string;
    document: string;
    email: string;
    address?: string;
  };
}

export const LGPDPrivacyTerm: React.FC<LGPDPrivacyTermProps> = ({ user }) => {
  const currentDate = new Date().toLocaleDateString('pt-BR');

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white text-slate-900 font-serif leading-relaxed print:p-0">
      <div className="text-center mb-10 border-b-2 border-slate-200 pb-6">
        <h1 className="text-2xl font-bold uppercase tracking-widest text-slate-800">Termo de Consentimento e Privacidade (LGPD)</h1>
        <p className="text-sm text-slate-500 mt-2 italic">Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018)</p>
      </div>

      <div className="mb-8 p-6 bg-slate-50 border border-slate-200 rounded-xl">
        <h2 className="text-lg font-bold mb-4 border-l-4 border-primary pl-3">1. Identificação do Titular</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <p><strong>Nome:</strong> {user.name || '________________'}</p>
          <p><strong>CPF/CNPJ:</strong> {user.document || '________________'}</p>
          <p className="md:col-span-2"><strong>Email:</strong> {user.email || '________________'}</p>
        </div>
      </div>

      <div className="space-y-4 text-justify text-sm">
        <p>
          Eu, acima identificado, doravante denominado <strong>TITULAR</strong>, autorizo o escritório 
          <strong> MARCELL FERREIRA - ADVOCACIA</strong>, a realizar o tratamento de meus dados pessoais, 
          em conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD).
        </p>

        <div>
          <h3 className="font-bold mb-2 uppercase text-xs tracking-wider">2. Finalidade do Tratamento</h3>
          <div className="text-sm">
            O tratamento dos dados pessoais listados neste termo tem as seguintes finalidades:
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Representação jurídica em processos judiciais e administrativos;</li>
              <li>Elaboração de contratos, procurações e documentos acessórios;</li>
              <li>Comunicação sobre o andamento de processos e obrigações legais;</li>
              <li>Cumprimento de obrigações fiscais e regulatórias.</li>
            </ul>
          </div>
        </div>

        <div>
          <h3 className="font-bold mb-2 uppercase text-xs tracking-wider">3. Segurança e Retenção</h3>
          <p>
            O <strong>MARCELL FERREIRA - ADVOCACIA</strong> responsabiliza-se pela manutenção de medidas de segurança, 
            técnicas e administrativas aptas a proteger os dados pessoais de acessos não autorizados. Os dados serão 
            mantidos pelo período necessário para a execução dos serviços e cumprimento de prazos prescricionais legais.
          </p>
        </div>

        <div>
          <h3 className="font-bold mb-2 uppercase text-xs tracking-wider">4. Direitos do Titular</h3>
          <p>
            O Titular tem direito a obter do Controlador, em relação aos dados por ele tratados, a qualquer momento e 
            mediante requisição: confirmação da existência de tratamento; acesso aos dados; correção de dados incompletos ou inexatos; 
            e eliminação dos dados pessoais tratados com o consentimento do titular.
          </p>
        </div>
      </div>

      <div className="mt-20 text-center space-y-12">
        <p className="text-sm">Belo Horizonte, {currentDate}</p>
        
        <div className="flex flex-col items-center">
          <div className="w-64 border-t border-slate-400 mb-2"></div>
          <p className="text-sm font-bold uppercase">{user.name}</p>
          <p className="text-xs text-slate-500">TITULAR DOS DADOS</p>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-64 border-t border-slate-400 mb-2"></div>
          <p className="text-sm font-bold uppercase">MARCELL FERREIRA - ADVOCACIA</p>
          <p className="text-xs text-slate-500">CONTROLADOR</p>
        </div>
      </div>

      <footer className="mt-12 pt-6 border-t border-slate-100 text-[10px] text-slate-400 text-center italic">
        Documento gerado eletronicamente pelo Sistema de Gestão Jurídica Marcell Ferreira.
      </footer>
    </div>
  );
};
