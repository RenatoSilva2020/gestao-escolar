
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface LoginFormProps {
  onLogin: (user: User) => void;
  teachers: User[];
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, teachers }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showConfig, setShowConfig] = useState(false);
  const [scriptUrl, setScriptUrl] = useState('');

  useEffect(() => {
    setScriptUrl(api.getBaseUrl());
  }, []);

  const normalize = (val: string) => val.replace(/\D/g, '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Supervisor Login
    if (username === 'supervisor' && password === 'admin') {
      onLogin({ id: 'supervisor', name: 'Supervisor', masp: 'ADMIN', role: UserRole.SUPERVISOR });
      return;
    }

    // Teacher Login
    const normalizedUsername = normalize(username);
    const normalizedPassword = normalize(password);

    if (!normalizedUsername || !normalizedPassword) {
      setError('Por favor, insira o MASP.');
      return;
    }

    const teacher = teachers.find(t => 
      normalize(t.masp) === normalizedUsername && 
      normalizedUsername === normalizedPassword
    );

    if (teacher) {
      onLogin(teacher);
    } else {
      setError('Usuário ou senha inválidos.');
    }
  };

  const handleSaveConfig = () => {
    if (scriptUrl) {
      api.setBaseUrl(scriptUrl);
      setShowConfig(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC] p-4 relative">
      {/* Config Button */}
      <button 
        onClick={() => setShowConfig(true)}
        className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-500 transition-colors"
        title="Configurar Conexão"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
      </button>

      <div className="bg-white p-10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] max-w-md w-full border border-gray-100 relative">
        <div className="text-center mb-10">
          <div className="bg-indigo-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-200">
             <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path>
             </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Módulo II - Relatórios</h1>
          <p className="text-slate-400 mt-2 font-medium">Acesse sua conta para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Usuário / MASP</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
              placeholder="Digite seu MASP"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Senha</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-sm border border-rose-100 font-medium">
              {error}
            </div>
          )}

          <button 
            type="submit"
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-4 px-6 rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] hover:-translate-y-0.5"
          >
            Entrar no Sistema
          </button>
        </form>

        <div className="mt-10 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          Desenvolvido para Escolas Estaduais
        </div>
      </div>

      {/* Config Modal */}
      {showConfig && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[32px] shadow-2xl p-8 w-full max-w-lg border border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Configurar Conexão</h3>
            <p className="text-sm text-slate-400 mb-6">Insira a URL do Web App gerada no Google Apps Script.</p>
            
            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">URL do Script</label>
              <input 
                type="text" 
                value={scriptUrl}
                onChange={(e) => setScriptUrl(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-xs font-mono text-slate-600"
                placeholder="https://script.google.com/macros/s/.../exec"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowConfig(false)}
                className="px-6 py-3 text-slate-400 hover:text-slate-600 font-bold text-[11px] uppercase tracking-widest transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveConfig}
                className="px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-[20px] font-bold text-[11px] uppercase tracking-widest transition-all shadow-lg shadow-indigo-100"
              >
                Salvar e Recarregar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginForm;
