
import React from 'react';
import { User, WeeklyActivity, ActivityType } from '../types';
import { MONTHS } from '../constants';

interface ReportGridProps {
  user: User;
  month: string;
  weeks: WeeklyActivity[];
  activityTypes: ActivityType[];
  onUpdateWeek?: (weekId: string, field: 'startDate' | 'endDate' | 'descriptions', value: any, index?: number) => void;
  onRemoveWeek?: (id: string) => void;
  readonly?: boolean;
}

const ReportGrid: React.FC<ReportGridProps> = ({ 
  user, 
  month, 
  weeks, 
  activityTypes,
  onUpdateWeek,
  onRemoveWeek,
  readonly = false
}) => {
  const monthIndex = MONTHS.indexOf(month);
  const year = new Date().getFullYear();
  
  const minDate = monthIndex !== -1 ? `${year}-${(monthIndex + 1).toString().padStart(2, '0')}-01` : undefined;
  const maxDate = monthIndex !== -1 ? new Date(year, monthIndex + 1, 0).toISOString().split('T')[0] : undefined;

  return (
    <div 
      className="w-[850px] min-h-[1150px] border border-black bg-white shadow-sm print:shadow-none mx-auto text-gray-900 flex flex-col relative"
      id="report-capture-area"
    >
      {/* Cabeçalho Oficial */}
      <div className="w-full border-b border-black bg-white flex items-center justify-center min-h-[110px] p-6 text-center flex-col relative">
        {/* Logotipo Posicionado à Esquerda */}
        <div className="absolute left-6 top-1/2 transform -translate-y-1/2 hidden print:block md:block">
           <img 
             src="https://i.ibb.co/VdSsLWY/Screenshot-5.png" 
             alt="LogoEESP" 
             className="h-24 w-auto object-contain"
             crossOrigin="anonymous"
           />
        </div>

        <h1 className="font-bold text-2xl uppercase tracking-tighter text-black">Secretaria de Estado de Educação de Minas Gerais</h1>
        <h2 className="font-black text-3xl uppercase mt-2 text-black">ESCOLA ESTADUAL SEGISMUNDO PEREIRA</h2>
      </div>

      {/* Título */}
      <div className="flex border-b border-black p-3 items-center bg-gray-50 print:bg-transparent">
        <div className="flex-1 text-center">
          <h2 className="font-bold text-lg uppercase tracking-tight">Registros de Atividades Extra-Classe (Módulo II) do Professor</h2>
        </div>
      </div>

      {/* Info Professor */}
      <div className="grid grid-cols-10 border-b border-black">
        <div className="col-span-4 p-2 border-r border-black">
          <label className="block text-[12px] text-gray-600 font-bold uppercase mb-1">Professor(a)</label>
          <div className="font-bold uppercase truncate text-[13px]">{user.name}</div>
        </div>
        <div className="col-span-2 p-2 border-r border-black">
          <label className="block text-[12px] text-gray-600 font-bold uppercase mb-1">Masp</label>
          <div className="font-bold text-[13px]">{user.masp}</div>
        </div>
        <div className="col-span-2 p-2 border-r border-black">
          <label className="block text-[12px] text-gray-600 font-bold uppercase mb-1">Conteúdo</label>
          <div className="font-bold uppercase truncate text-[13px]">{user.subject}</div>
        </div>
        <div className="col-span-1 p-2 border-r border-black flex flex-col items-center justify-center">
          <label className="block text-[11px] text-gray-600 font-bold uppercase mb-1 text-center leading-tight">RB (AULAS)</label>
          <div className="font-bold text-[13px]">{user.chRegimeBasico}</div>
        </div>
        <div className="col-span-1 p-2 flex flex-col items-center justify-center">
          <label className="block text-[11px] text-gray-600 font-bold uppercase mb-1 text-center leading-tight">CH MÓDULO</label>
          <div className="font-bold text-[13px]">{user.chExtraClasse}</div>
        </div>
      </div>

      {/* Mês e Horário */}
      <div className="grid grid-cols-10 border-b border-black">
        <div className="col-span-2 p-2 border-r border-black bg-blue-50/30 print:bg-transparent flex flex-col justify-center">
          <label className="block text-[12px] text-gray-600 font-bold uppercase mb-1">Mês Referência</label>
          <div className="font-bold text-blue-800 print:text-black uppercase text-[13px]">{month}</div>
        </div>
        <div className="col-span-8 flex flex-col">
          <div className="border-b border-black p-1 text-center bg-gray-50/30 print:bg-transparent">
             <label className="text-[11px] text-gray-600 font-bold uppercase">Horário de Cumprimento do Módulo</label>
          </div>
          <div className="grid grid-cols-5 flex-1">
            {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'].map((day, idx) => {
              const dayKeys = ['segunda', 'terca', 'quarta', 'quinta', 'sexta'];
              return (
                <div key={day} className={`${idx < 4 ? 'border-r' : ''} border-black flex flex-col items-center justify-center p-1.5`}>
                   <span className="text-[11px] font-bold text-gray-700 uppercase mb-0.5">{day}-Feira</span>
                   <span className="text-[12px] font-medium">{(user.schedule as any)?.[dayKeys[idx]] || '--'}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Atividades Semanais - O flex-1 fará esta div crescer para preencher o espaço até o rodapé */}
      <div className="flex-1 flex flex-col">
        {weeks.length === 0 ? (
          <div className="p-16 text-center text-gray-400 italic text-base">Nenhuma semana registrada. Clique em "Adicionar Semana".</div>
        ) : (
          weeks.map((week, index) => {
            const displayDescriptions = readonly 
              ? week.descriptions.filter(d => d && d.trim() !== '') 
              : week.descriptions;

            if (readonly && displayDescriptions.length === 0) return null;

            return (
              <React.Fragment key={week.id}>
                {/* Cabeçalho da Semana - Ajustado para col-span-12 total */}
                <div className="grid grid-cols-12 border-b border-black bg-gray-100/50 font-bold text-[12px] print:bg-transparent">
                  <div className="col-span-3 border-r border-black p-1.5 text-center uppercase">DATA</div>
                  <div className={`${readonly ? 'col-span-9 border-r border-white' : 'col-span-8 border-r border-black'} p-1.5 text-center uppercase tracking-wider`}>TIPO DE ATIVIDADE / DESCRIÇÃO</div>
                  {!readonly && <div className="col-span-1 p-1.5 text-center no-print">AÇÃO</div>}
                </div>

                {/* Conteúdo da Semana - Borda sempre preta para fechar a grade */}
                <div className="grid grid-cols-12 border-b border-black bg-white group/row relative">
                  <div className="col-span-3 border-r border-black p-2 flex flex-col justify-center items-center bg-gray-50/20 print:bg-transparent min-h-[80px]">
                    {readonly ? (
                      <div className="text-center font-normal text-[13px] leading-relaxed">
                        <p>{week.startDate ? new Date(week.startDate + 'T12:00:00').toLocaleDateString('pt-BR') : '---'}</p>
                        <p className="py-0.5 text-[11px] text-gray-500 uppercase font-bold">a</p>
                        <p>{week.endDate ? new Date(week.endDate + 'T12:00:00').toLocaleDateString('pt-BR') : '---'}</p>
                      </div>
                    ) : (
                      <div className="flex flex-col space-y-1 items-center">
                        <input 
                          type="date"
                          min={minDate}
                          max={maxDate}
                          className="text-[12px] border border-gray-300 rounded p-1 outline-none focus:border-indigo-400"
                          value={week.startDate}
                          onChange={(e) => onUpdateWeek?.(week.id, 'startDate', e.target.value)}
                        />
                        <span className="text-[11px] text-gray-500 font-extrabold uppercase">a</span>
                        <input 
                          type="date"
                          min={minDate}
                          max={maxDate}
                          className="text-[12px] border border-gray-300 rounded p-1 outline-none focus:border-indigo-400"
                          value={week.endDate}
                          onChange={(e) => onUpdateWeek?.(week.id, 'endDate', e.target.value)}
                        />
                      </div>
                    )}
                  </div>

                  {/* Removemos 'divide-y divide-black' daqui para tirar as linhas internas */}
                  <div className={`${readonly ? 'col-span-9 border-r border-white' : 'col-span-8 border-r border-black'} flex flex-col`}>
                    {displayDescriptions.map((desc, i) => (
                      <div key={i} className="p-1 flex items-center min-h-[25px]">
                        {readonly ? (
                          <span className="text-[13px] uppercase px-2 leading-none text-gray-900 font-medium">{desc || ''}</span>
                        ) : (
                          <select 
                            className={`w-full text-[13px] p-0.5 border border-transparent hover:border-gray-200 rounded bg-transparent outline-none uppercase appearance-none cursor-pointer transition-colors ${!desc ? 'text-gray-300 italic' : 'text-gray-900 font-medium'}`}
                            value={desc}
                            onChange={(e) => onUpdateWeek?.(week.id, 'descriptions', e.target.value, i)}
                          >
                            <option value="" className="text-gray-300 italic">SELECIONE A ATIVIDADE...</option>
                            {activityTypes.map(t => <option key={t.id} value={t.name} className="text-gray-900 not-italic font-bold">{t.name}</option>)}
                          </select>
                        )}
                      </div>
                    ))}
                  </div>

                  {!readonly && (
                    <div className="col-span-1 flex items-center justify-center no-print bg-white relative z-10">
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onRemoveWeek) {
                             onRemoveWeek(week.id);
                          }
                        }}
                        className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer border border-transparent hover:border-red-100"
                        title="Excluir Semana"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </React.Fragment>
            );
          })
        )}
      </div>

      {/* Assinaturas - mt-auto garante que fique sempre no rodapé do container */}
      {/* ALTERAÇÃO AQUI: pt-10 pb-6 para empurrar o conteúdo para baixo, próximo da borda inferior */}
      <div className="grid grid-cols-2 gap-20 px-20 pt-10 pb-6 mt-auto border-t border-white">
        <div className="flex flex-col items-center">
          <div className="w-full border-t border-black pt-2"></div>
          <p className="text-[12px] font-bold uppercase tracking-tight text-gray-800">Assinatura do(a) Especialista</p>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-full border-t border-black pt-2"></div>
          <p className="text-[12px] font-bold uppercase tracking-tight text-gray-800">Assinatura do(a) Professor(a)</p>
        </div>
      </div>
    </div>
  );
};

export default ReportGrid;
