import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Remessa } from '../types/Remessa';
import { Venda } from '../types/Venda';
import { Configuracao, ConfiguracaoResponse } from '../types/Configuracao';

interface AppState {
  remessaAtiva: Remessa | null;
  vendas: Venda[];
  configuracoes: Record<string, any>;
  loading: boolean;
}

type AppAction = 
  | { type: 'SET_REMESSA_ATIVA'; payload: Remessa | null }
  | { type: 'ADD_VENDA'; payload: Venda }
  | { type: 'UPDATE_VENDA'; payload: Venda }
  | { type: 'SET_VENDAS'; payload: Venda[] }
  | { type: 'UPDATE_CONFIG'; payload: { chave: string; valor: any } }
  | { type: 'SET_CONFIGURACOES'; payload: Record<string, any> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOAD_DATA'; payload: Partial<AppState> };

const initialState: AppState = {
  remessaAtiva: null,
  vendas: [],
  configuracoes: {},
  loading: false,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_REMESSA_ATIVA':
      return { ...state, remessaAtiva: action.payload };
    case 'ADD_VENDA':
      return { ...state, vendas: [action.payload, ...state.vendas] };
    case 'UPDATE_VENDA':
      return { 
        ...state, 
        vendas: state.vendas.map(v => v.id === action.payload.id ? action.payload : v) 
      };
    case 'SET_VENDAS':
      return { ...state, vendas: action.payload };
    case 'UPDATE_CONFIG':
      return { 
        ...state, 
        configuracoes: { 
          ...state.configuracoes, 
          [action.payload.chave]: action.payload.valor 
        } 
      };
    case 'SET_CONFIGURACOES':
      return { ...state, configuracoes: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'LOAD_DATA':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp deve ser usado dentro de um AppProvider');
  }
  return context;
}