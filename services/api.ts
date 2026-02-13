
import { User, MonthlyReport, ActivityType } from '../types';

const STORAGE_KEY = 'GOOGLE_SCRIPT_URL';
// URL padrão (fallback)
const DEFAULT_URL = 'https://script.google.com/macros/s/AKfycbyJiphkyUooRoSMm9hGTwzZCQLqa8EbWX_KiSjCXS2G-7bZshIa4mWsM_7WyvvHvgvRjQ/exec';

const IS_DEMO = false;

interface InitialData {
  teachers: User[];
  reports: MonthlyReport[];
  activityTypes: ActivityType[];
}

const getBaseUrl = () => {
  return localStorage.getItem(STORAGE_KEY) || DEFAULT_URL;
};

export const api = {
  // Permite salvar a URL configurada pelo usuário
  setBaseUrl: (url: string) => {
    localStorage.setItem(STORAGE_KEY, url);
    // Recarrega a página para garantir que tudo use a nova URL
    window.location.reload(); 
  },

  getBaseUrl: () => getBaseUrl(),

  getInitialData: async (): Promise<InitialData | null> => {
    if (IS_DEMO) return null;
    const url = getBaseUrl();
    try {
      const response = await fetch(`${url}?action=getInitialData`);
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const text = await response.text();
      
      try {
        const data = JSON.parse(text);
        return data;
      } catch (e) {
        console.error("A resposta da API não é um JSON válido.", text);
        return null;
      }
    } catch (error) {
      console.error("Erro ao buscar dados. Verifique a URL do Script:", error);
      return null;
    }
  },

  saveTeacher: async (teacher: User) => {
    if (IS_DEMO) return;
    try {
      await fetch(getBaseUrl(), {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({ action: 'saveTeacher', payload: teacher })
      });
    } catch (e) {
      console.error("Erro ao salvar professor:", e);
    }
  },

  deleteTeacher: async (id: string) => {
    if (IS_DEMO) return;
    try {
      await fetch(getBaseUrl(), {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({ action: 'deleteTeacher', payload: { id } })
      });
    } catch (e) {
      console.error("Erro ao deletar professor:", e);
    }
  },

  saveReport: async (report: MonthlyReport) => {
    if (IS_DEMO) return;
    try {
      await fetch(getBaseUrl(), {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({ action: 'saveReport', payload: report })
      });
    } catch (e) {
      console.error("Erro ao salvar relatório:", e);
    }
  },

  saveActivityType: async (activity: ActivityType) => {
    if (IS_DEMO) return;
    try {
      await fetch(getBaseUrl(), {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({ action: 'saveActivityType', payload: activity })
      });
    } catch (e) {
      console.error("Erro ao salvar atividade:", e);
    }
  },

  deleteActivityType: async (id: string) => {
    if (IS_DEMO) return;
    try {
      await fetch(getBaseUrl(), {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({ action: 'deleteActivityType', payload: { id } })
      });
    } catch (e) {
      console.error("Erro ao deletar atividade:", e);
    }
  }
};
