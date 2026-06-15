import React from 'react';

interface ServiceContractProps {
  cause: {
    number: string;
    description?: string;
    total_value?: number;
    percentage?: number;
    clients?: { name: string; document: string }[];
    court?: string;
  };
}

export const ServiceContract: React.FC<ServiceContractProps> = ({ cause }) => {
  const currentDate = new Date().toLocaleDateString('pt-BR');
  const clientNames = cause.clients?.map(c => c.name).join(', ') || '________________';

  return (
    <div className="p-12 max-w-4xl mx-auto bg-white text-slate-900 font-serif leading-relaxed print:p-0">
      <div className="text-center mb-12 border-b-2 border-slate-300 pb-8">
        <h1 className="text-2xl font-bold uppercase tracking-widest text-slate-800">Contrato de Prestação de Serviços Jurídicos</h1>
        <p className="text-sm text-slate-600 mt-2 font-bold italic">MARCELL FERREIRA - ADVOCACIA</p>
      </div>

      <div className="space-y-6 text-justify text-sm">
        <div>
          <h2 className="font-bold mb-2 uppercase text-xs tracking-wider border-b border-slate-100 pb-1">1. Das Partes</h2>
          <p>
            <strong>CONTRATADO:</strong> MARCELL FERREIRA - ADVOCACIA, com sede em Belo Horizonte/MG, 
            doravante denominado simplesmente CONTRATADO.
          </p>
          <p className="mt-4">
            <strong>CONTRATANTE(S):</strong> {clientNames}, doravante denominado(s) simplesmente CONTRATANTE.
          </p>
        </div>

        <div>
          <h2 className="font-bold mb-2 uppercase text-xs tracking-wider border-b border-slate-100 pb-1">2. Do Objeto</h2>
          <p>
            O presente contrato tem por objeto a prestação de serviços advocatícios para atuação na causa:
            <strong> {cause.description || 'Defesa de Interesses Jurídicos'}</strong>, 
            referente ao processo nº <strong>{cause.number}</strong>, em trâmite no <strong>{cause.court || 'Orgão Competente'}</strong>.
          </p>
        </div>

        <div>
          <h2 className="font-bold mb-2 uppercase text-xs tracking-wider border-b border-slate-100 pb-1">3. Dos Honorários</h2>
          <p>
            Pelos serviços prestados, o CONTRATANTE pagará ao CONTRATADO o percentual de 
            <strong> {cause.percentage || '20'}%</strong> (vinte por cento) sobre o valor total bruto da condenação, 
            acordo ou benefício econômico obtido ao final da lide.
          </p>
        </div>

        <div>
          <h2 className="font-bold mb-2 uppercase text-xs tracking-wider border-b border-slate-100 pb-1">4. Das Obrigações</h2>
          <p>
            O CONTRATADO obriga-se a prestar assistência jurídica com zelo e dedicação, acompanhando o feito em todas as 
            suas fases. O CONTRATANTE obriga-se a fornecer todos os documentos e informações necessárias para o bom 
            andamento da causa, bem como efetuar o pagamento das custas processuais, caso não goze do benefício da justiça gratuita.
          </p>
        </div>

        <div>
          <h2 className="font-bold mb-2 uppercase text-xs tracking-wider border-b border-slate-100 pb-1">5. Do Foro</h2>
          <p>
            Para dirimir quaisquer dúvidas oriundas deste contrato, as partes elegem o foro da comarca de 
            Belo Horizonte/MG, com exclusão de qualquer outro.
          </p>
        </div>
      </div>

      <div className="mt-24 text-center space-y-16">
        <p className="text-sm">Belo Horizonte, {currentDate}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-10">
          <div className="flex flex-col items-center">
            <div className="w-64 border-t border-slate-400 mb-2"></div>
            <p className="text-xs font-bold uppercase">{clientNames}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-tighter">CONTRATANTE</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-64 border-t border-slate-400 mb-2"></div>
            <p className="text-xs font-bold uppercase">MARCELL FERREIRA - ADVOCACIA</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-tighter">CONTRATADO</p>
          </div>
        </div>
      </div>

      <footer className="mt-16 pt-8 border-t border-slate-200 text-[9px] text-slate-400 flex justify-between uppercase tracking-widest italic">
        <span>Confidencial</span>
        <span>Sistema Marcell Ferreira</span>
        <span>Página 1 / 1</span>
      </footer>
    </div>
  );
};
