import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Activity,
  Users,
  Dumbbell,
  ClipboardList,
  FolderGit2,
  Sliders,
  LineChart,
  FileCheck2,
  Plus,
  Download,
  Settings,
  ChevronDown,
  LogOut,
} from 'lucide-react';

export type NavTab =
  | 'painel'
  | 'atletas'
  | 'exercicios'
  | 'montar_treino'
  | 'programas'
  | 'fluxos_objetivos'
  | 'avaliacoes'
  | 'evolucao'
  | 'configuracoes';

interface NavigationProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenNewAthleteModal: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewAthleteModal,
}) => {
  const { athletes, selectedAthleteId, setSelectedAthleteId, exportDatabaseJSON, currentUser, logout } = useApp();

  const navItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'painel', label: 'Painel', icon: Activity },
    { id: 'atletas', label: 'Atletas', icon: Users },
    { id: 'exercicios', label: 'Exercícios', icon: Dumbbell },
    { id: 'montar_treino', label: 'Montar Treino', icon: ClipboardList },
    { id: 'programas', label: 'Programas', icon: FolderGit2 },
    { id: 'fluxos_objetivos', label: 'Fluxos', icon: Sliders },
    { id: 'avaliacoes', label: 'Avaliações', icon: FileCheck2 },
    { id: 'evolucao', label: 'Evolução', icon: LineChart },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-8 h-16">
        {/* Zone 1: Brand title, single element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm tracking-wider">
            J
          </div>
          <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
            JULIUS <span className="text-emerald-400 font-semibold">PRO</span>
          </span>
        </div>

        {/* Zone 2: Concise single-line navigation links */}
        <nav className="hidden lg:flex items-center gap-1 overflow-x-auto py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-emerald-400 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action & Athlete context switch */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Active Athlete Quick Switcher */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60">
            <span className="text-xs text-slate-400 whitespace-nowrap">Atleta:</span>
            <select
              value={selectedAthleteId || ''}
              onChange={(e) => setSelectedAthleteId(e.target.value)}
              className="bg-transparent text-xs font-medium text-slate-200 focus:outline-none cursor-pointer max-w-[130px] truncate"
            >
              {athletes.map((ath) => (
                <option key={ath.id} value={ath.id} className="bg-slate-900 text-slate-100">
                  {ath.name}
                </option>
              ))}
            </select>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={() => setActiveTab('montar_treino')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap shadow-sm shadow-emerald-500/10"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Prescrever Treino</span>
          </button>

          {/* Settings / Backup icon button */}
          <button
            onClick={() => setActiveTab('configuracoes')}
            title="Configurações e Backup"
            className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors ${
              activeTab === 'configuracoes' ? 'text-emerald-400 bg-slate-800' : ''
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Coach User Profile & Logout */}
          {currentUser && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="hidden xl:flex flex-col text-right">
                <span className="text-[11px] font-bold text-slate-200 truncate max-w-[130px]">
                  {currentUser.email}
                </span>
                <span className="text-[9px] text-emerald-400 font-mono">Treinador Conectado</span>
              </div>
              <button
                onClick={logout}
                title="Terminar Sessão (Logout)"
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 rounded-lg transition-colors border border-rose-500/30 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline font-semibold">Sair</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="lg:hidden flex items-center gap-1 overflow-x-auto px-4 py-2 border-t border-slate-800/80 bg-slate-900/90 scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
                isActive
                  ? 'bg-slate-800 text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
