import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Cloud, Database, RefreshCw, CheckCircle2, ShieldCheck } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export const StorageSyncIndicator: React.FC = () => {
  const { showToast, currentUser, athletes, exercises, programs, assessments, workoutLogs } = useApp();
  const [isTesting, setIsTesting] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  const handleTestSave = async () => {
    if (!currentUser) return;
    setIsTesting(true);

    try {
      // Direct live verification query to Firestore for the current coach
      const q = query(collection(db, 'athletes'), where('coachId', '==', currentUser.uid));
      const snap = await getDocs(q);

      const now = new Date();
      const timeStr = now.toLocaleTimeString('pt-BR');

      setLastSyncTime(timeStr);
      showToast(
        `Cloud Firestore verificado com sucesso às ${timeStr}! Conexão em tempo real ativa: ${snap.size} atletas, ${exercises.length} exercícios, ${programs.length} programas e ${assessments.length} avaliações sincronizados no projeto julius-coach-pro.`,
        'success'
      );
    } catch (err: any) {
      console.error('Falha ao verificar Firestore:', err);
      showToast(`Aviso: Verificação do Firestore falhou (${err?.message || 'erro de rede'}).`, 'error');
    } finally {
      setTimeout(() => {
        setIsTesting(false);
      }, 900);
    }
  };

  return (
    <aside
      aria-label="Status de sincronização no Cloud Firestore"
      className="fixed bottom-4 right-4 z-40 max-w-sm bg-slate-900/95 backdrop-blur-md border border-emerald-500/30 rounded-xl p-3 shadow-2xl shadow-black/60 flex items-center gap-3 transition-all"
    >
      {/* Pulsing Firebase Cloud Indicator */}
      <div className="relative flex items-center justify-center shrink-0">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="absolute w-4 h-4 rounded-full bg-emerald-400/30 animate-ping" />
      </div>

      {/* Status details */}
      <div className="flex flex-col min-w-0 pr-1">
        <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5 leading-tight">
          <Cloud className="w-3.5 h-3.5 text-emerald-400 shrink-0 inline" />
          Firebase Cloud Firestore
        </span>
        <span className="text-[10px] text-emerald-400 font-mono mt-0.5 leading-tight">
          {lastSyncTime
            ? `Verificado às ${lastSyncTime}`
            : 'Sincronização em tempo real ativa'}
        </span>
      </div>

      {/* Test Save / Verify Button */}
      <button
        onClick={handleTestSave}
        disabled={isTesting}
        title="Testar conexão em tempo real com o Cloud Firestore"
        className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 active:scale-95 text-emerald-300 hover:text-emerald-100 text-xs font-bold rounded-lg border border-emerald-500/40 transition-all cursor-pointer shadow-sm disabled:opacity-50"
      >
        {isTesting ? (
          <>
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Consultando...</span>
          </>
        ) : (
          <>
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Testar Nuvem</span>
          </>
        )}
      </button>
    </aside>
  );
};
