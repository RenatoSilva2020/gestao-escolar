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

  return (
    <div 
      className="w-[850px] min-h-[1150px] bg-white text-gray-900 flex flex-col relative mx-auto box-border"
      id="report-capture-area"
      style={{ border: '2px solid black' }}
    >
      {/* CABEÇALHO - Grid de 3 colunas fixas para alinhamento perfeito */}
      <div className="grid grid-cols-[140px_1fr_140px] border-b-2 border-black bg-white h-[140px]">
        {/* Logo (Esquerda) */}
        <div className="flex items-center justify-center p-2 border-r border-black">
           <img 
             src="https://i.ibb.co/VdSsLWY/Screenshot-5.png" 
             alt="Logo EESP" 
             className="max-w-full max-h-[110px] object-contain"
             crossOrigin="anonymous"
           />
        </div>

        {/* Texto (Centro) */}
        <div className="flex flex-col items-center justify-center text-center px-4">
          <h1 className="font-bold text-[16px] uppercase leading-tight text-black mb-1">
            Secretaria de Estado de Educação de Minas Gerais
          </h1>
          <h2 className="font-black text-[20px] uppercase text-black leading-tight">
            ESCOLA ESTADUAL<br/>SEGISMUNDO PEREIRA
          </h2>
        </div>

        {/* Espaço Vazio ou Info Adicional (Direita) */}
        <div className="border-l border-black flex items-center justify-center">
            {/* Espaço reservado para carimbos ou códigos futuros */}
        </div>
      </div>

      {/* Título do Relatório */}
      <div className="border-b border-black bg-gray-100 py-2 text-center print:bg-gray-100">
          <h2 className="font-bold text-[14px] uppercase tracking-wide text-black">
            Registros de Atividades Extra-Classe (Módulo II) do Professor
          </h2>
      </div>

      {/* DADOS DO PROFESSOR */}
      <div className="grid grid-cols-12 border-b border-black bg-white">
        <div className="col-span-5 p-2 border-r border-black flex flex-col justify-center">
          <label className="text-[10px] text-gray-500 font-bold uppercase">Professor(a)</label>
          <div className="font-bold uppercase text-[12px] truncate leading-tight">{user.name}</div>
        </div>
        <div className="col-span-2 p-2 border-r border-black flex flex-col justify-center">
          <label className="text-[10px] text-gray-500 font-bold uppercase">Masp</label>
          <div className="font-bold text-[12px] leading-tight">{user.masp}</div>
        </div>
        <div className="col-span-3 p-2 border-r border-black flex flex-col justify-center">
          <label className="text-[10px] text-gray-500 font-bold uppercase">Conteúdo</label>
          <div className="font-bold uppercase text-[12px] truncate leading-tight">{user.subject}</div>
        </div>
        <div className="col-span-1 p-2 border-r border-black flex flex-col justify-center items-center bg-gray-50">
          <label className="text-[9px] text-gray-500 font-bold uppercase text-center leading-none mb-1">RB<br/>(AULAS)</label>
          <div className="font-bold text-[12px]">{user.chRegimeBasico}</div>
        </div>
        <div className="col-span-1 p-2 flex flex-col justify-center items-center bg-gray-50">
          <label className="text-[9px] text-gray-500 font-bold uppercase text-center leading-none mb-1">CH<br/>MÓDULO</label>
          <div className="font-bold text-[12px]">{user.chExtraClasse}</div>
        </div>
      </div>

      {/* MÊS E HORÁRIOS */}
      <div className="grid grid-cols-12 border-b border-black bg-white min-h-[60px]">
        {/* Mês */}
        <div className="col-span-3 border-r border-black bg-blue-50/30 flex flex-col justify-center items-center p-2">
          <label className="text-[10px] text-gray-500 font-bold uppercase">Mês Referência</label>
          <div className="font-bold text-blue-900 uppercase text-[14px] mt-1">{month}</div>
        </div>

        {/* Horários */}
        <div className="col-span-9 flex flex-col">
          <div className="border-b border-black bg-gray-50 py-1 text-center">
             <label className="text-[10px] font-bold uppercase text-gray-600">Horário de Cumprimento do Módulo</label>
          </div>
          <div className="grid grid-cols-5 flex-1 divide-x divide-black">
            {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'].map((day, idx) => {
              const dayKeys = ['segunda', 'terca', 'quarta', 'quinta', 'sexta'];
              return (
                <div key={day} className="flex flex-col items-center justify-center p-1 bg-white">
                   <span className="text-[9px] font-bold text-gray-500 uppercase">{day}</span>
                   <span className="text-[11px] font-bold text-gray-900">{(user.schedule as any)?.[dayKeys[idx]] || '--'}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* LISTA DE ATIVIDADES */}
      <div className="flex-1 flex flex-col bg-white">
        {weeks.length === 0 ? (
          <div className="p-10 text-center text-gray-400 italic text-sm">
            Nenhuma semana registrada.
          </div>
        ) : (
          weeks.map((week) => {
            const displayDescriptions = readonly 
              ? week.descriptions.filter(d => d && d.trim() !== '') 
              : week.descriptions;

            if (readonly && displayDescriptions.length === 0) return null;

            return (
              <div key={week.id} className="border-b border-black last:border-b-0 break-inside-avoid">
                {/* Cabeçalho da Semana */}
                <div className="grid grid-cols-12 bg-gray-200 border-b border-black text-[10px] font-bold uppercase">
                  <div className="col-span-3 border-r border-black p-1 text-center flex items-center justify-center">DATA</div>
                  <div className={`${readonly ? 'col-span-9' : 'col-span-8'} border-r border-black p-1 text-center flex items-center justify-center`}>ATIVIDADE DESENVOLVIDA</div>
                  {!readonly && <div className="col-span-1 p-1 text-center">AÇÃO</div>}
                </div>

                {/* Linhas da Semana */}
                <div className="grid grid-cols-12 bg-white">
                   {/* Coluna Datas */}
                   <div className="col-span-3 border-r border-black p-2 flex flex-col justify-center items-center bg-white">
                      {readonly ? (
                        <div className="text-center">
                          <p className="font-bold text-[12px]">{week.startDate ? new Date(week.startDate + 'T12:00:00').toLocaleDateString('pt-BR') : '--/--'}</p>
                          <p className="text-[9px] text-gray-400 font-bold my-0.5">ATÉ</p>
                          <p className="font-bold text-[12px]">{week.endDate ? new Date(week.endDate + 'T12:00:00').toLocaleDateString('pt-BR') : '--/--'}</p>
                        </div>
                      ) : (
                        <div className="flex flex-col space-y-2 w-full px-2">
                          <input 
                            type="date"
                            className="text-[11px] border border-gray-300 rounded px-1 py-0.5 w-full text-center bg-transparent"
                            value={week.startDate}
                            onChange={(e) => onUpdateWeek?.(week.id, 'startDate', e.target.value)}
                          />
                          <input 
                            type="date"
                            className="text-[11px] border border-gray-300 rounded px-1 py-0.5 w-full text-center bg-transparent"
                            value={week.endDate}
                            onChange={(e) => onUpdateWeek?.(week.id, 'endDate', e.target.value)}
                          />
                        </div>
                      )}
                   </div>

                   {/* Coluna Descrições */}
                   <div className={`${readonly ? 'col-span-9' : 'col-span-8'} border-r border-black flex flex-col bg-white`}>
                      {displayDescriptions.map((desc, i) => (
                        <div key={i} className="flex-1 flex items-center px-3 py-1 min-h-[28px] border-b border-gray-100 last:border-b-0">
                          {readonly ? (
                            <span className="text-[11px] font-medium text-gray-900 uppercase leading-snug">• {desc}</span>
                          ) : (
                            <select 
                              className="w-full text-[11px] bg-transparent outline-none uppercase font-medium cursor-pointer"
                              value={desc}
                              onChange={(e) => onUpdateWeek?.(week.id, 'descriptions', e.target.value, i)}
                            >
                              <option value="" className="text-gray-400">SELECIONE A ATIVIDADE...</option>
                              {activityTypes.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                            </select>
                          )}
                        </div>
                      ))}
                   </div>

                   {/* Botão Excluir */}
                   {!readonly && (
                     <div className="col-span-1 flex items-center justify-center p-2 bg-gray-50">
                        <button 
                          onClick={() => onRemoveWeek?.(week.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                     </div>
                   )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* RODAPÉ */}
      <div className="mt-auto pt-16 pb-8 px-12 border-t border-black bg-white">
        <div className="flex justify-between items-end gap-16">
          <div className="flex-1 flex flex-col items-center">
            <div className="w-full h-px bg-black mb-2"></div>
            <p className="text-[10px] font-bold uppercase text-gray-800">Assinatura do(a) Especialista</p>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <div className="w-full h-px bg-black mb-2"></div>
            <p className="text-[10px] font-bold uppercase text-gray-800">Assinatura do(a) Professor(a)</p>
          </div>
        </div>
        <div className="text-center mt-6 text-[9px] text-gray-400 font-medium uppercase">
           Módulo II - Gestão Escolar • {month}/{year}
        </div>
      </div>
    </div>
  );
};

export default ReportGrid;