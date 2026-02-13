
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { User, MonthlyReport, ActivityType, UserRole } from '../types';
import { MONTHS } from '../constants';
import ReportGrid from './ReportGrid';

interface SupervisorDashboardProps {
  user: User;
  onLogout: () => void;
  teachers: User[];
  reports: MonthlyReport[];
  activityTypes: ActivityType[];
  onAddActivity: (name: string) => void;
  onDeleteActivity: (id: string) => void;
  onAddTeacher: (teacher: User) => void;
  onUpdateTeacher: (teacher: User) => void;
  onDeleteTeacher: (id: string) => void;
}

const DAYS = [
  { key: 'segunda', label: 'Segunda' },
  { key: 'terca', label: 'Terça' },
  { key: 'quarta', label: 'Quarta' },
  { key: 'quinta', label: 'Quinta' },
  { key: 'sexta', label: 'Sexta' }
];

const SupervisorDashboard: React.FC<SupervisorDashboardProps> = ({ 
  user, 
  onLogout, 
  teachers, 
  reports,
  activityTypes,
  onAddActivity,
  onDeleteActivity,
  onAddTeacher,
  onUpdateTeacher,
  onDeleteTeacher
}) => {
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[new Date().getMonth()]);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [manageTab, setManageTab] = useState<'teachers' | 'activities'>('teachers');
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
  const [newActivityName, setNewActivityName] = useState('');
  
  const reportRef = useRef<HTMLDivElement>(null);

  const selectedTeacher = teachers.find(t => t.id === selectedTeacherId);
  const activeReport = reports.find(r => r.teacherId === selectedTeacherId && r.month === selectedMonth);

  const [teacherForm, setTeacherForm] = useState({
    name: '',
    masp: '',
    subject: '',
    chRegimeBasico: 0,
    schedule: {
      segunda: { start: '', end: '' },
      terca: { start: '', end: '' },
      quarta: { start: '', end: '' },
      quinta: { start: '', end: '' },
      sexta: { start: '', end: '' }
    }
  });

  useEffect(() => {
    if (editingTeacherId) {
      const teacher = teachers.find(t => t.id === editingTeacherId);
      if (teacher) {
        const newSchedule: any = {};
        DAYS.forEach(day => {
          const timeStr = (teacher.schedule as any)?.[day.key] || '';
          const match = timeStr.match(/(\d{2}:\d{2})\s*às\s*(\d{2}:\d{2})/);
          newSchedule[day.key] = {
            start: match ? match[1] : '',
            end: match ? match[2] : ''
          };
        });
        setTeacherForm({
          name: teacher.name,
          masp: teacher.masp,
          subject: teacher.subject || '',
          chRegimeBasico: teacher.chRegimeBasico || 0,
          schedule: newSchedule
        });
      }
    } else {
      setTeacherForm({
        name: '', masp: '', subject: '', chRegimeBasico: 0,
        schedule: {
          segunda: { start: '', end: '' },
          terca: { start: '', end: '' },
          quarta: { start: '', end: '' },
          quinta: { start: '', end: '' },
          sexta: { start: '', end: '' }
        }
      });
    }
  }, [editingTeacherId, teachers, showTeacherModal]);

  const handleDownloadPDF = async () => {
    if (!selectedTeacher) return;
    
    const element = document.getElementById('report-capture-area');
    if (!element) return;

    setIsGenerating(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));

      const canvas = await (window as any).html2canvas(element, {
        scale: 4, // Aumentado para 4 para melhor resolução na impressão
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const { jsPDF } = (window as any).jspdf;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      
      const margin = 10;
      const imgWidth = pageWidth - (margin * 2); 
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const yOffset = margin;
      
      pdf.addImage(imgData, 'PNG', margin, yOffset, imgWidth, imgHeight);
      
      const filename = `Relatorio_${selectedTeacher.name.replace(/\s+/g, '_')}_${selectedMonth}.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      alert('Ocorreu um erro ao gerar o PDF. Verifique se o cabeçalho foi carregado ou tente novamente em alguns segundos.');
    } finally {
      setIsGenerating(false);
    }
  };

  const formatMasp = (val: string) => {
    const digits = val.replace(/\D/g, '');
    if (digits.length <= 1) return digits;
    const main = digits.slice(0, -1);
    const dv = digits.slice(-1);
    return `${main}-${dv}`;
  };

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

  const targetMinutes = teacherForm.chRegimeBasico * 15;
  
  const currentTotalMinutes = useMemo(() => {
    return (Object.values(teacherForm.schedule) as Array<{start: string, end: string}>).reduce((acc: number, day) => {
      return acc + calculateDayMinutes(day.start, day.end);
    }, 0);
  }, [teacherForm.schedule]);

  const formatMinutesToHHMM = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const isFormValid = useMemo(() => {
    return (
      teacherForm.name.trim() !== '' &&
      teacherForm.masp.length >= 3 &&
      teacherForm.subject.trim() !== '' &&
      teacherForm.chRegimeBasico > 0 &&
      currentTotalMinutes === targetMinutes
    );
  }, [teacherForm, currentTotalMinutes, targetMinutes]);

  const handleSaveTeacher = () => {
    if (!isFormValid) return;

    const chExtraStr = formatMinutesToHHMM(targetMinutes);
    const formattedSchedule: any = {};
    DAYS.forEach(day => {
      const { start, end } = (teacherForm.schedule as any)[day.key];
      formattedSchedule[day.key] = start && end ? `${start} às ${end}` : '';
    });

    if (editingTeacherId) {
      const updatedT: User = {
        id: editingTeacherId,
        name: teacherForm.name.toUpperCase(),
        masp: teacherForm.masp,
        role: UserRole.TEACHER,
        subject: teacherForm.subject.toUpperCase(),
        chRegimeBasico: teacherForm.chRegimeBasico,
        chExtraClasse: chExtraStr,
        schedule: formattedSchedule
      };
      onUpdateTeacher(updatedT);
    } else {
      const newT: User = {
        id: Date.now().toString(),
        name: teacherForm.name.toUpperCase(),
        masp: teacherForm.masp,
        role: UserRole.TEACHER,
        subject: teacherForm.subject.toUpperCase(),
        chRegimeBasico: teacherForm.chRegimeBasico,
        chExtraClasse: chExtraStr,
        schedule: formattedSchedule
      };
      onAddTeacher(newT);
    }

    setShowTeacherModal(false);
    setEditingTeacherId(null);
  };

  const handleEditTeacher = (teacher: User) => {
    setEditingTeacherId(teacher.id);
    setShowTeacherModal(true);
  };

  const updateDaySchedule = (dayKey: string, field: 'start' | 'end', value: string) => {
    setTeacherForm(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [dayKey]: {
          ...(prev.schedule as any)[dayKey],
          [field]: value
        }
      }
    }));
  };

  const handleAddNewActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (newActivityName.trim()) {
      onAddActivity(newActivityName);
      setNewActivityName('');
    }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <header className="bg-white border-b border-slate-100 px-8 py-5 flex justify-between items-center sticky top-0 z-20 shadow-[0_2px_15px_rgba(0,0,0,0.02)] no-print">
        <div className="flex items-center space-x-4">
          <div className="bg-indigo-500 p-2.5 rounded-2xl shadow-lg shadow-indigo-100">
             <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
             </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight leading-none uppercase">Painel Supervisor</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">Módulo II - Gestão Escolar</p>
          </div>
        </div>

        <button onClick={onLogout} className="text-slate-300 hover:text-rose-500 transition-all p-2.5 rounded-2xl hover:bg-rose-50 border border-transparent hover:border-rose-100">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </header>

      <main className="p-8 md:p-12">
        <div className="max-w-7xl mx-auto mb-10 grid grid-cols-1 lg:grid-cols-4 gap-8 no-print">
          <div className="lg:col-span-3 bg-white p-8 rounded-[32px] shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-slate-50">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Filtros de Relatório</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Professor</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-semibold uppercase text-slate-600"
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                >
                  <option value="">Selecione um professor...</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Mês Referência</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-semibold uppercase text-slate-600"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[32px] shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-slate-50 flex flex-col space-y-4">
             <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Ações Rápidas</h3>
             <button 
               onClick={() => { setEditingTeacherId(null); setShowTeacherModal(true); }}
               className="w-full bg-teal-50 text-teal-700 border border-teal-100 hover:bg-teal-100 font-bold py-3.5 rounded-2xl text-[11px] uppercase tracking-widest transition-all flex items-center justify-center space-x-2.5 active:scale-95 shadow-sm"
             >
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
               <span>Novo Professor</span>
             </button>
             <button 
               onClick={() => setShowManageModal(true)}
               className="w-full bg-orange-50 text-orange-700 border border-orange-100 hover:bg-orange-100 font-bold py-3.5 rounded-2xl text-[11px] uppercase tracking-widest transition-all flex items-center justify-center space-x-2.5 active:scale-95 shadow-sm"
             >
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
               <span>EDITAR DADOS</span>
             </button>
             <button 
               disabled={!selectedTeacherId || isGenerating}
               onClick={handleDownloadPDF}
               className={`w-full font-bold py-3.5 rounded-2xl text-[11px] uppercase tracking-widest transition-all flex items-center justify-center space-x-2.5 shadow-sm ${
                 selectedTeacherId && !isGenerating ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100' : 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none border-transparent'
               }`}
             >
               {isGenerating ? (
                 <svg className="animate-spin h-4 w-4 text-indigo-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
               ) : (
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
               )}
               <span>{isGenerating ? 'Gerando...' : 'Baixar PDF'}</span>
             </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto flex justify-center mb-20 overflow-x-auto">
           {selectedTeacher ? (
             <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-slate-50 print:shadow-none print:border-none print:p-0">
                <div ref={reportRef} className="flex justify-center">
                  <ReportGrid 
                    user={selectedTeacher} 
                    month={selectedMonth} 
                    weeks={activeReport?.weeks || []} 
                    activityTypes={activityTypes}
                    readonly={true}
                  />
                </div>
             </div>
           ) : (
             <div className="w-full text-center py-24 bg-white rounded-[40px] border-2 border-dashed border-slate-200 no-print">
                <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">Selecione um filtro para visualizar o relatório</p>
             </div>
           )}
        </div>
      </main>

      {/* Modal Novo/Editar Professor */}
      {showTeacherModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto no-print">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-3xl my-8 border border-slate-100 animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
            <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 rounded-t-[40px]">
               <h3 className="text-2xl font-bold text-slate-800">{editingTeacherId ? 'Editar Professor' : 'Novo Professor'}</h3>
               <button onClick={() => setShowTeacherModal(false)} className="text-slate-300 hover:text-slate-600 transition-colors p-2 rounded-2xl hover:bg-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
            </div>
            
            <div className="p-10 space-y-8 overflow-y-auto custom-scrollbar">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-2">
                     <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Nome Completo</label>
                     <input 
                       type="text" 
                       className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 uppercase focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-slate-700 font-medium"
                       value={teacherForm.name}
                       onChange={(e) => setTeacherForm({...teacherForm, name: e.target.value})}
                       placeholder="EX: MARIA SILVA"
                     />
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">MASP</label>
                     <input 
                       type="text" 
                       className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-slate-700 font-medium"
                       value={teacherForm.masp}
                       onChange={(e) => setTeacherForm({...teacherForm, masp: formatMasp(e.target.value)})}
                       maxLength={10}
                       placeholder="0000000-0"
                     />
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Conteúdo / Matéria</label>
                     <input 
                       type="text" 
                       className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 uppercase focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-slate-700 font-medium"
                       value={teacherForm.subject}
                       onChange={(e) => setTeacherForm({...teacherForm, subject: e.target.value})}
                       placeholder="EX: MATEMÁTICA"
                     />
                  </div>
                  <div className="col-span-2">
                     <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Aulas Semanais (Regime Básico)</label>
                     <input 
                       type="number" 
                       className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-slate-700 font-medium"
                       value={teacherForm.chRegimeBasico || ''}
                       onChange={(e) => setTeacherForm({...teacherForm, chRegimeBasico: parseInt(e.target.value) || 0})}
                       placeholder="Ex: 16"
                     />
                     <div className="flex items-center space-x-2 mt-3 ml-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                        <p className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider">CH Extra necessária: {formatMinutesToHHMM(targetMinutes)}</p>
                     </div>
                  </div>
               </div>

               <div className="space-y-4 border-t border-slate-100 pt-6">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Horário do Módulo</h4>
                    <div className={`text-[11px] font-bold px-4 py-2 rounded-2xl transition-colors ${currentTotalMinutes === targetMinutes ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                      {formatMinutesToHHMM(currentTotalMinutes)} / {formatMinutesToHHMM(targetMinutes)}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                     {DAYS.map(day => (
                       <div key={day.key} className="flex flex-col md:flex-row md:items-center justify-between p-3 rounded-2xl border border-slate-50 bg-slate-50/30 group hover:border-slate-200 transition-colors">
                         <div className="w-24 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 md:mb-0">{day.label}</div>
                         <div className="flex items-center space-x-3 w-full md:w-auto">
                            <input 
                              type="time" 
                              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all flex-1"
                              value={(teacherForm.schedule as any)[day.key].start}
                              onChange={(e) => updateDaySchedule(day.key, 'start', e.target.value)}
                            />
                            <span className="text-slate-300 font-bold text-[10px] uppercase">às</span>
                            <input 
                              type="time" 
                              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all flex-1"
                              value={(teacherForm.schedule as any)[day.key].end}
                              onChange={(e) => updateDaySchedule(day.key, 'end', e.target.value)}
                            />
                         </div>
                       </div>
                     ))}
                  </div>
               </div>
            </div>

            <div className="p-8 border-t border-slate-50 flex justify-end space-x-4 bg-slate-50/50 rounded-b-[40px]">
               <button onClick={() => setShowTeacherModal(false)} className="px-8 py-3 text-slate-400 hover:text-slate-600 font-bold uppercase tracking-widest text-[11px] transition-colors">
                 Cancelar
               </button>
               <button 
                 disabled={!isFormValid}
                 onClick={handleSaveTeacher}
                 className={`px-10 py-3.5 rounded-[20px] font-bold uppercase tracking-widest text-[11px] shadow-xl transition-all ${
                   isFormValid 
                     ? 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-indigo-100 hover:-translate-y-0.5' 
                     : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                 }`}
               >
                 Salvar Professor
               </button>
            </div>
          </div>
        </div>
      )}

      {showManageModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 no-print">
           <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col border border-slate-100">
              <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 rounded-t-[40px]">
                 <div>
                   <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Painel de Gerenciamento</h3>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Configurações globais do sistema</p>
                 </div>
                 <button onClick={() => setShowManageModal(false)} className="text-slate-300 hover:text-slate-600 transition-colors p-2 rounded-2xl hover:bg-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
              </div>

              <div className="flex px-10 pt-6 space-x-6 border-b border-slate-50">
                 <button 
                   onClick={() => setManageTab('teachers')}
                   className={`pb-4 text-[11px] font-bold uppercase tracking-[0.2em] transition-all relative ${manageTab === 'teachers' ? 'text-indigo-600' : 'text-slate-300 hover:text-slate-400'}`}
                 >
                   Professores
                   {manageTab === 'teachers' && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-500 rounded-full"></div>}
                 </button>
                 <button 
                   onClick={() => setManageTab('activities')}
                   className={`pb-4 text-[11px] font-bold uppercase tracking-[0.2em] transition-all relative ${manageTab === 'activities' ? 'text-indigo-600' : 'text-slate-300 hover:text-slate-400'}`}
                 >
                   Tipos de Atividade
                   {manageTab === 'activities' && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-500 rounded-full"></div>}
                 </button>
              </div>

              <div className="p-8 overflow-y-auto flex-1">
                 {manageTab === 'teachers' ? (
                   <div className="space-y-3">
                     {teachers.map(t => (
                        <div key={t.id} className="flex items-center justify-between p-6 border border-slate-50 rounded-[24px] hover:bg-slate-50/50 hover:border-slate-200 transition-all group">
                           <div className="flex items-center space-x-6">
                              <div className="bg-indigo-50 w-12 h-12 rounded-2xl flex items-center justify-center text-indigo-600 font-bold text-xs shadow-sm">
                                 {t.name.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                 <h4 className="font-bold text-slate-800 uppercase text-sm leading-tight tracking-wide">{t.name}</h4>
                                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">MASP: {t.masp} | {t.subject}</p>
                              </div>
                           </div>
                           <div className="flex space-x-2">
                              <button 
                                onClick={() => handleEditTeacher(t)}
                                className="p-3 text-slate-300 hover:text-indigo-500 hover:bg-white rounded-2xl transition-all shadow-sm border border-transparent hover:border-slate-100"
                                title="Editar"
                              >
                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                              </button>
                              <button 
                                onClick={() => onDeleteTeacher(t.id)}
                                className="p-3 text-slate-300 hover:text-rose-500 hover:bg-white rounded-2xl transition-all shadow-sm border border-transparent hover:border-slate-100"
                                title="Excluir"
                              >
                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                           </div>
                        </div>
                     ))}
                   </div>
                 ) : (
                   <div className="space-y-6">
                      <form onSubmit={handleAddNewActivity} className="flex space-x-4 bg-slate-50/50 p-6 rounded-[28px] border border-slate-100 mb-8">
                         <input 
                           type="text" 
                           placeholder="NOVO TIPO DE ATIVIDADE"
                           className="flex-1 bg-white border border-slate-200 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-semibold uppercase text-slate-600"
                           value={newActivityName}
                           onChange={(e) => setNewActivityName(e.target.value)}
                         />
                         <button 
                           type="submit"
                           className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-indigo-100 transition-all text-[11px] uppercase tracking-widest"
                         >
                           Adicionar
                         </button>
                      </form>

                      <div className="space-y-2">
                        {activityTypes.map(act => (
                          <div key={act.id} className="flex items-center justify-between p-4 px-6 border border-slate-50 rounded-[20px] hover:bg-slate-50/30 transition-all group">
                             <div className="flex items-center space-x-4">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">{act.name}</span>
                             </div>
                             <button 
                               onClick={() => onDeleteActivity(act.id)}
                               className="p-2 text-slate-300 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                             >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                             </button>
                          </div>
                        ))}
                      </div>
                   </div>
                 )}
              </div>
              <div className="p-8 border-t border-slate-50 bg-slate-50/30 flex justify-end rounded-b-[40px]">
                 <button onClick={() => setShowManageModal(false)} className="px-10 py-3.5 bg-indigo-500 text-white rounded-[20px] font-bold text-[11px] uppercase tracking-[0.15em] shadow-lg shadow-indigo-100 hover:bg-indigo-600 transition-all active:scale-95">
                    Concluir
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default SupervisorDashboard;
