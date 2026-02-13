
import { User, UserRole, ActivityType } from './types';

export const INITIAL_TEACHERS: User[] = [
  {
    id: '1',
    name: 'RENATO PEREIRA SILVA',
    masp: '1324749-9',
    role: UserRole.TEACHER,
    subject: 'QUÍMICA',
    chRegimeBasico: 22,
    chExtraClasse: '05:30',
    schedule: {
      segunda: '16:00 às 17:00',
      terca: '15:00 às 18:00',
      quarta: '16:00 às 17:00',
      quinta: '17:00 às 18:00',
      sexta: '18:00 às 19:00'
    }
  },
  {
    id: '2',
    name: 'MARIO COSTA',
    masp: '1223895-2',
    role: UserRole.TEACHER,
    subject: 'MATEMÁTICA',
    chRegimeBasico: 20,
    chExtraClasse: '05:00',
    schedule: {
      segunda: '',
      terca: '',
      quarta: '',
      quinta: '07:00 às 12:00',
      sexta: ''
    }
  },
  {
    id: '3',
    name: 'SARA DE SOUZA',
    masp: '554545-5',
    role: UserRole.TEACHER,
    subject: 'HISTÓRIA',
    chRegimeBasico: 16,
    chExtraClasse: '04:00',
    schedule: {
      segunda: '',
      terca: '',
      quarta: '',
      quinta: '07:00 às 12:00',
      sexta: ''
    }
  }
];

export const INITIAL_ACTIVITY_TYPES: ActivityType[] = [
  { id: '1', name: 'REPASSES GERAIS DO SUPERVISOR' },
  { id: '2', name: 'ORIENTAÇÕES SOBRE AS TURMAS COM O SUPERVISOR' },
  { id: '3', name: 'LANÇAMENTOS E REGISTROS NO DED' },
  { id: '4', name: 'ORGANIZAÇÃO DAS ATIVIDADES APLICADAS' },
  { id: '5', name: 'ATUALIZAÇÃO DO DED E REGISTROS DE FREQUÊNCIA' },
  { id: '6', name: 'AVALIAÇÃO DIAGNÓSTICA' },
  { id: '7', name: 'PREENCHIMENTO PLANILHA DE CONTROLE TRIMESTRAL' },
  { id: '8', name: 'REUNIÃO ADM/PEDAGÓGICA' },
  { id: '9', name: 'CONSELHO DE CLASSE' },
  { id: '10', name: 'PLANEJAMENTO TRIMESTRAL' },
  { id: '11', name: 'LANÇAMENTO RESULTADOS SIMAVE' },
  { id: '12', name: 'CORREÇÃO DE AVALIAÇÃO' },
  { id: '13', name: 'PRODUÇÃO DE AVALIAÇÃO' },
  { id: '14', name: 'LANÇAMENTO SIMADE' },
  { id: '15', name: 'REGISTRO DE ATA' },
  { id: '16', name: 'ORGANIZAÇÃO DIDÁTICA DE CONCEITOS' }
];

export const MONTHS = [
  'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
  'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
];
