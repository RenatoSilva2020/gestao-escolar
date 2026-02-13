
import React, { useState, useEffect, useMemo } from 'react';
import { User, MonthlyReport, ActivityType, WeeklyActivity } from '../types';
import { MONTHS } from '../constants';
import ReportGrid from './ReportGrid';

interface TeacherDashboardProps {
  user: User;
  onLogout: () => void;
  reports: MonthlyReport[];
  onSaveReport: (report: MonthlyReport) => void;
  activityTypes: ActivityType[];
  onAddActivityType: (name: string) => void;
  onUpdateProfile: (updatedUser: User) => void;
}

const DAYS = [
  { key: 'segunda', label: 'Segunda' },
  { key: 'terca', label: 'Terça' },
  { key: 'quarta', label: 'Quarta' },
  { key: 'quinta', label: 'Quinta' },
  { key: 'sexta', label: 'Sexta' }
];

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ 
  user, 
  onLogout, 
  reports, 
  onSaveReport,
  activityTypes,
  onAddActivityType,
  onUpdateProfile
}) => {
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[new Date().getMonth()]);
  const [currentWeeks, setCurrentWeeks] = useState<WeeklyActivity[]>([]);
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [newActivityName, setNewActivityName] = useState('');
  
  // Estado para controlar o modal de exclusão
  const [weekToDelete, setWeekToDelete] = useState<string | null>(null);

  // Profile Edit State
  const [editForm, setEditForm] = useState({
    name: user.name,
    masp: user.masp,
    subject: user.subject || '',
    chRegimeBasico: user.chRegimeBasico || 0,
    schedule: {
      segunda: { start: '', end: '' },
      terca: { start: '', end: '' },
      quarta: { start: '', end: '' },
      quinta: { start: '', end: '' },
      sexta: { start: '', end: '' }
    }
  });

  // Initialize edit form schedule from user object
  useEffect(() => {
    if (showEditProfileModal) {
      const newSchedule: any = {};
      DAYS.forEach(day => {
        const timeStr = (user.schedule as any)?.[day.key] || '';
        const match = timeStr.match(/(\d{2}:\d{2})\s*às\s*(\d{2}:\d{2})/);
        newSchedule[day.key] = {
          start: match ? match[1] : '',
          end: match ? match[2] : ''
        };
      });
      setEditForm({
        name: user.name,
        masp: user.masp,
        subject: user.subject || '',
        chRegimeBasico: user.chRegimeBasico || 0,
        schedule: newSchedule
      });
    }
  }, [showEditProfileModal, user]);

  // Sincroniza o estado local APENAS quando o mês ou o usuário mudam
  useEffect(() => {
    const existingReport = reports.find(r => r.teacherId === user.id && r.month === selectedMonth);
    if (existingReport && existingReport.weeks) {
      setCurrentWeeks(existingReport.weeks);
    } else {
      setCurrentWeeks([]);
    }
  }, [selectedMonth, user.id]);

  // Helpers for schedule calculation
  const timeToMinutes = (time: string): number => {
    if (!time) return 0;
    const [h, m] = time.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return 0;
    return h * 60 + m;
  };

  const calculateDayMinutes = (start: string, end: string): number => {
    const s = timeToMinutes(start);
    const e = timeToMinutes(end);
    return e > s ? e - s : 0;
  };

  const targetMinutes = editForm.chRegimeBasico * 15;
  
  const currentTotalMinutes = useMemo(() => {
    return (Object.values(editForm.schedule) as Array<{start: string, end: string}>).reduce((acc: number, day) => {
      return acc + calculateDayMinutes(day.start, day.end);
    }, 0);
  }, [editForm.schedule]);

  const formatMinutesToHHMM = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const isProfileValid = useMemo(() => {
    return (
      editForm.name.trim() !== '' &&
      editForm.masp.length >= 3 &&
      editForm.subject.trim() !== '' &&
      editForm.chRegimeBasico > 0 &&
      currentTotalMinutes === targetMinutes
    );
  }, [editForm, currentTotalMinutes, targetMinutes]);

  const handleSaveProfile = () => {
    if (!isProfileValid) return;

    const chExtraStr = formatMinutesToHHMM(targetMinutes);
    const formattedSchedule: any = {};
    DAYS.forEach(day => {
      const { start, end } = (editForm.schedule as any)[day.key];
      formattedSchedule[day.key] = start && end ? `${start} às ${end}` : '';
    });

    onUpdateProfile({
      ...user,
      name: editForm.name.toUpperCase(),
      masp: editForm.masp,
      subject: editForm.subject.toUpperCase(),
      chRegimeBasico: editForm.chRegimeBasico,
      chExtraClasse: chExtraStr,
      schedule: formattedSchedule
    });
    setShowEditProfileModal(false);
  };

  const handleSave = () => {
    onSaveReport({
      teacherId: user.id,
      month: selectedMonth,
      year: new Date().getFullYear(),
      weeks: currentWeeks,
      lastUpdated: new Date().toISOString()
    });
    alert('Relatório salvo com sucesso!');
  };

  const handleAddWeek = () => {
    const newWeek: WeeklyActivity = {
      id: Date.now().toString(),
      startDate: '',
      endDate: '',
      descriptions: ['', '', '', '', '', '']
    };
    setCurrentWeeks(prev => [...prev, newWeek]);
  };

  const updateWeek = (weekId: string, field: 'startDate' | 'endDate' | 'descriptions', value: any, index?: number) => {
    setCurrentWeeks(prev => prev.map(w => {
      if (w.id !== weekId) return w;
      if (field === 'descriptions' && typeof index === 'number') {
        const newDescs = [...w.descriptions];
        newDescs[index] = value;
        return { ...w, descriptions: newDescs };
      }
      return { ...w, [field]: value };
    }));
  };

  // Abre o modal de confirmação em vez de usar window.confirm
  const requestDeleteWeek = (id: string) => {
    setWeekToDelete(id);
  };

  // Executa a exclusão de fato
  const confirmDeleteWeek = () => {
    if (weekToDelete) {
      setCurrentWeeks(prev => prev.filter(w => w.id !== weekToDelete));
      setWeekToDelete(null);
    }
  };

  const handleAddNewType = () => {
    if (newActivityName.trim()) {
      onAddActivityType(newActivityName);
      setNewActivityName('');
      setShowAddActivityModal(false);
    }
  };

  const formatMasp = (val: string) => {
    const digits = val.replace(/\D/g, '');
    if (digits.length <= 1) return digits;
    const main = digits.slice(0, -1);
    const dv = digits.slice(-1);
    return `${main}-${dv}`;
  };

  return (
    <div className="bg-[#F1F5F9] min-h-screen">
      <header className="bg-white border-b border-slate-200 px-8 py-5 flex flex-col md:flex-row justify-between items-center sticky top-0 z-10 shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
        <div className="flex items-center space-x-5 mb-4 md:mb-0">
          <div className="bg-indigo-500 p-2.5 rounded-2xl shadow-lg shadow-indigo-100">
             <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
             </svg>
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight leading-none">{user.name}</h2>
              <button 
                onClick={() => setShowEditProfileModal(true)}
                className="text-slate-300 hover:text-indigo-500 transition-colors p-1.5 rounded-xl hover:bg-indigo-50"
                title="Editar Perfil"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">MASP: {user.masp} | {user.subject}</p>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center bg-slate-50 border border-slate-100 rounded-2xl px-2 py-1">
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-xs font-bold text-slate-600 cursor-pointer px-3 py-2 outline-none uppercase tracking-widest"
            >
              {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          
          <button 
            onClick={onLogout}
            className="text-slate-400 hover:text-rose-500 transition-all p-2.5 rounded-2xl hover:bg-rose-50 border border-transparent hover:border-rose-100"
            title="Sair"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 md:p-10">
        <div className="bg-white rounded-[32px] shadow-[0_10px_40px_rgba(0,0,0,0.03)] overflow-hidden border border-slate-100">
          <div className="px-8 py-6 border-b border-slate-50 flex flex-wrap gap-5 items-center justify-between bg-slate-50/30">
             <div className="flex flex-wrap gap-3">
                <button 
                  onClick={handleAddWeek}
                  className="flex items-center space-x-2.5 bg-sky-50 text-sky-700 border border-sky-100 hover:bg-sky-100 px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all active:scale-95"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <span>Adicionar Semana</span>
                </button>
                <button 
                  onClick={() => setShowAddActivityModal(true)}
                  className="flex items-center space-x-2.5 bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all active:scale-95"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  <span>Adicionar Atividade</span>
                </button>
             </div>
             
             <button 
               onClick={handleSave}
               className="flex items-center space-x-2.5 bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-indigo-100 active:scale-95"
             >
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
               <span>Salvar Relatório</span>
             </button>
          </div>

          <div className="p-10 overflow-x-auto flex justify-center">
            <ReportGrid 
              user={user} 
              month={selectedMonth} 
              weeks={currentWeeks} 
              activityTypes={activityTypes}
              onUpdateWeek={updateWeek}
              onRemoveWeek={requestDeleteWeek}
            />
          </div>
        </div>
      </main>
      
      {/* Modal de Confirmação de Exclusão */}
      {weekToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] shadow-2xl p-6 w-full max-w-sm border border-slate-100 animate-in fade-in zoom-in duration-200">
             <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 ring-8 ring-red-50/50">
               <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
             </div>
             <h3 className="text-lg font-bold text-slate-800 text-center mb-2">Excluir Semana?</h3>
             <p className="text-sm text-slate-500 text-center mb-6 px-4">Esta ação irá remover permanentemente os registros desta semana. Não é possível desfazer.</p>
             <div className="flex space-x-3">
               <button onClick={() => setWeekToDelete(null)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors">Cancelar</button>
               <button onClick={confirmDeleteWeek} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors shadow-lg shadow-red-100">Sim, Excluir</button>
             </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-3xl my-8 border border-slate-100 animate-in fade-in zoom-in duration-300">
            <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 rounded-t-[40px]">
               <h3 className="text-2xl font-bold text-slate-800">Editar Perfil</h3>
               <button onClick={() => setShowEditProfileModal(false)} className="text-slate-300 hover:text-slate-600 transition-colors p-2 rounded-2xl hover:bg-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
            </div>
            <div className="p-10 space-y-10 max-h-[70vh] overflow-y-auto">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="col-span-2">
                     <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Nome Completo</label>
                     <input 
                       type="text" 
                       className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 uppercase focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-slate-700 font-medium"
                       value={editForm.name}
                       onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                     />
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">MASP</label>
                     <input 
                       type="text" 
                       className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-slate-700 font-medium"
                       value={editForm.masp}
                       onChange={(e) => setEditForm({...editForm, masp: formatMasp(e.target.value)})}
                       maxLength={10}
                     />
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Conteúdo / Matéria</label>
                     <input 
                       type="text" 
                       className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 uppercase focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-slate-700 font-medium"
                       value={editForm.subject}
                       onChange={(e) => setEditForm({...editForm, subject: e.target.value})}
                     />
                  </div>
                  <div className="col-span-2">
                     <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Aulas Semanais (Regime Básico)</label>
                     <input 
                       type="number" 
                       className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-slate-700 font-medium"
                       value={editForm.chRegimeBasico || ''}
                       onChange={(e) => setEditForm({...editForm, chRegimeBasico: parseInt(e.target.value) || 0})}
                     />
                     <div className="flex items-center space-x-2 mt-3 ml-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                        <p className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider">CH Extra necessária: {formatMinutesToHHMM(targetMinutes)}</p>
                     </div>
                  </div>
               </div>

               <div className="space-y-6 pt-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-5">
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Horário do Módulo</h4>
                    <div className={`text-[11px] font-bold px-4 py-2 rounded-2xl transition-colors ${currentTotalMinutes === targetMinutes ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                      {formatMinutesToHHMM(currentTotalMinutes)} / {formatMinutesToHHMM(targetMinutes)}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                     {DAYS.map(day => (
                       <div key={day.key} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl border border-slate-50 bg-slate-50/20 group hover:border-slate-200 transition-colors">
                         <div className="w-24 text-[11px] font-bold text-slate-400 uppercase tracking-widest">{day.label}</div>
                         <div className="flex items-center space-x-3">
                            <input 
                              type="time" 
                              className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                              value={(editForm.schedule as any)[day.key].start}
                              onChange={(e) => setEditForm(prev => ({
                                ...prev,
                                schedule: { ...prev.schedule, [day.key]: { ...(prev.schedule as any)[day.key], start: e.target.value } }
                              }))}
                            />
                            <span className="text-slate-300 font-bold text-xs uppercase">às</span>
                            <input 
                              type="time" 
                              className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                              value={(editForm.schedule as any)[day.key].end}
                              onChange={(e) => setEditForm(prev => ({
                                ...prev,
                                schedule: { ...prev.schedule, [day.key]: { ...(prev.schedule as any)[day.key], end: e.target.value } }
                              }))}
                            />
                         </div>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
            <div className="p-10 border-t border-slate-50 flex justify-end space-x-4 bg-slate-50/50 rounded-b-[40px]">
               <button onClick={() => setShowEditProfileModal(false)} className="px-8 py-3 text-slate-400 hover:text-slate-600 font-bold uppercase tracking-widest text-[11px] transition-colors">
                 Cancelar
               </button>
               <button 
                 disabled={!isProfileValid}
                 onClick={handleSaveProfile}
                 className={`px-10 py-4 rounded-[20px] font-bold uppercase tracking-widest text-[11px] shadow-xl transition-all ${
                   isProfileValid 
                     ? 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-indigo-100 hover:-translate-y-0.5' 
                     : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                 }`}
               >
                 Salvar Alterações
               </button>
            </div>
          </div>
        </div>
      )}

      {showAddActivityModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[40px] shadow-2xl p-10 w-full max-w-md border border-slate-100">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Nova Atividade</h3>
            <p className="text-sm font-medium text-slate-400 mb-8">Esta atividade será adicionada à lista de seleção.</p>
            <input 
              type="text" 
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 mb-8 uppercase focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-slate-700 font-semibold"
              placeholder="Ex: REUNIÃO DE PAIS"
              value={newActivityName}
              onChange={(e) => setNewActivityName(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end space-x-4">
              <button 
                onClick={() => setShowAddActivityModal(false)}
                className="px-6 py-3 text-slate-400 hover:text-slate-600 font-bold text-[11px] uppercase tracking-widest transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleAddNewType}
                className="px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-[20px] font-bold text-[11px] uppercase tracking-widest transition-all shadow-lg shadow-indigo-100"
              >
                Cadastrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
