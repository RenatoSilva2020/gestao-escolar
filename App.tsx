
import React, { useState, useEffect } from 'react';
import { User, UserRole, MonthlyReport, ActivityType } from './types';
import { INITIAL_TEACHERS, INITIAL_ACTIVITY_TYPES } from './constants';
import LoginForm from './components/LoginForm';
import TeacherDashboard from './components/TeacherDashboard';
import SupervisorDashboard from './components/SupervisorDashboard';
import { api } from './services/api';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      // Tenta buscar do Google Sheets
      const cloudData = await api.getInitialData();

      if (cloudData) {
        setTeachers(cloudData.teachers || []);
        setReports(cloudData.reports || []);
        
        // Se a lista de atividades da nuvem estiver vazia (primeiro uso), carrega os padrões APENAS na memória
        // Não forçamos o salvamento em lote para evitar erro 429 (Too Many Requests) do Google Script
        if (cloudData.activityTypes && cloudData.activityTypes.length > 0) {
          setActivityTypes(cloudData.activityTypes);
        } else {
          setActivityTypes(INITIAL_ACTIVITY_TYPES);
        }

      } else {
        // Fallback para LocalStorage/Constantes se a API falhar ou não estiver configurada
        const storedTeachers = localStorage.getItem('teachers');
        const storedActivities = localStorage.getItem('activityTypes');
        const storedReports = localStorage.getItem('reports');

        if (storedTeachers) setTeachers(JSON.parse(storedTeachers));
        else setTeachers(INITIAL_TEACHERS);

        if (storedActivities) setActivityTypes(JSON.parse(storedActivities));
        else setActivityTypes(INITIAL_ACTIVITY_TYPES);

        if (storedReports) setReports(JSON.parse(storedReports));
      }
      
      setIsLoading(false);
    };

    loadData();
  }, []);

  // Save data locally as backup whenever it changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('teachers', JSON.stringify(teachers));
      localStorage.setItem('activityTypes', JSON.stringify(activityTypes));
      localStorage.setItem('reports', JSON.stringify(reports));
    }
  }, [teachers, activityTypes, reports, isLoading]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const saveReport = async (report: MonthlyReport) => {
    // Atualiza estado local imediatamente (Optimistic UI)
    setReports(prev => {
      const filtered = prev.filter(r => !(r.teacherId === report.teacherId && r.month === report.month && r.year === report.year));
      return [...filtered, report];
    });
    // Envia para o Google Sheets
    await api.saveReport(report);
  };

  const addActivityType = async (name: string) => {
    const newActivity = { id: Date.now().toString(), name: name.toUpperCase() };
    setActivityTypes(prev => [...prev, newActivity]);
    await api.saveActivityType(newActivity);
  };

  const deleteActivityType = async (id: string) => {
    if (confirm('Deseja realmente excluir este tipo de atividade?')) {
      setActivityTypes(prev => prev.filter(a => a.id !== id));
      await api.deleteActivityType(id);
    }
  };

  const addTeacher = async (teacher: User) => {
    setTeachers(prev => [...prev, teacher]);
    await api.saveTeacher(teacher);
  };

  const handleUpdateTeacher = async (updatedTeacher: User) => {
    setTeachers(prev => prev.map(t => t.id === updatedTeacher.id ? updatedTeacher : t));
    if (currentUser?.id === updatedTeacher.id) {
      setCurrentUser(updatedTeacher);
    }
    await api.saveTeacher(updatedTeacher);
  };

  const handleDeleteTeacher = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este professor? Todos os seus relatórios salvos também serão perdidos.')) {
      setTeachers(prev => prev.filter(t => t.id !== id));
      setReports(prev => prev.filter(r => r.teacherId !== id));
      await api.deleteTeacher(id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <h2 className="text-gray-600 font-bold uppercase tracking-widest text-sm">Conectando ao banco de dados...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {!currentUser ? (
        <LoginForm onLogin={handleLogin} teachers={teachers} />
      ) : currentUser.role === UserRole.SUPERVISOR ? (
        <SupervisorDashboard 
          user={currentUser} 
          onLogout={handleLogout}
          teachers={teachers}
          reports={reports}
          activityTypes={activityTypes}
          onAddActivity={addActivityType}
          onDeleteActivity={deleteActivityType}
          onAddTeacher={addTeacher}
          onUpdateTeacher={handleUpdateTeacher}
          onDeleteTeacher={handleDeleteTeacher}
        />
      ) : (
        <TeacherDashboard 
          user={currentUser} 
          onLogout={handleLogout}
          reports={reports}
          onSaveReport={saveReport}
          activityTypes={activityTypes}
          onAddActivityType={addActivityType}
          onUpdateProfile={handleUpdateTeacher}
        />
      )}
    </div>
  );
};

export default App;
