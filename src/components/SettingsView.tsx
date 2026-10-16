import React, { useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { SEED_EXERCISES } from '../data/seedExercises';
import {
  Settings,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  Database,
  Cloud,
  Dumbbell,
  UserCheck,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { exportDatabaseJSON, importDatabaseJSON, resetToDefaults, showToast, currentUser, addExercise, exercises } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImportingBase, setIsImportingBase] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        await importDatabaseJSON(content);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImportBaseExercises = async () => {
    if (!currentUser) return;
    if (
      !confirm(
        'Deseja carregar a biblioteca base de exercícios profissionais (musculação, pliometria, mobilidade e cardio) para a sua conta no Cloud Firestore?'
      )
    ) {
      return;
    }

    setIsImportingBase(true);
    try {
      let count = 0;
      for (const ex of SEED_EXERCISES) {
        const cleanEx = { ...ex };
        delete (cleanEx as any).id;
        await addExercise(cleanEx);
        count++;
      }
      showToast(`${count} exercícios profissionais carregados na sua conta no Firestore!`);
    } catch (err: any) {
      console.error('Erro ao carregar exercícios:', err);
      showToast('Falha ao carregar exercícios.', 'error');
    } finally {
      setIsImportingBase(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Configurações & Nuvem</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Conexão Firebase Cloud Firestore, autenticação de treinador e exportação de dados.
        </p>
      </div>

      {/* Cloud Firestore & Coach Account Card */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <Cloud className="w-5 h-5 text-emerald-400" />
          <div>
            <h2 className="text-base font-bold text-white">Conta & Conexão Cloud Firestore</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Projeto Firebase: <span className="text-emerald-400 font-mono">julius-coach-pro</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-1 font-medium">Treinador Autenticado:</span>
            <span className="text-white font-bold font-mono text-sm break-all">{currentUser?.email}</span>
          </div>

          <div className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-1 font-medium">Identificador Único (coachId):</span>
            <span className="text-emerald-400 font-mono text-xs break-all">{currentUser?.uid}</span>
          </div>
        </div>
      </div>

      {/* Bootstrap Base Exercise Library */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <Dumbbell className="w-5 h-5 text-emerald-400" />
          <div>
            <h2 className="text-base font-bold text-white">Biblioteca Base de Exercícios</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              A aplicação inicia vazia por padrão. Se desejar, carregue os exercícios padrão com dossiês técnicos completos para o seu Firestore.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1">
          <div className="text-xs text-slate-300">
            Atualmente tem <strong className="text-emerald-400 font-mono">{exercises.length}</strong> exercício(s) registado(s) na sua conta.
          </div>

          <button
            onClick={handleImportBaseExercises}
            disabled={isImportingBase}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 hover:text-white font-bold text-xs rounded-xl border border-emerald-500/30 transition-all cursor-pointer disabled:opacity-50"
          >
            <Dumbbell className="w-4 h-4" />
            <span>{isImportingBase ? 'A carregar na nuvem...' : 'Carregar Biblioteca Base no Firestore'}</span>
          </button>
        </div>
      </div>

      {/* Database Backup & Restore */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <Database className="w-5 h-5 text-emerald-400" />
          <div>
            <h2 className="text-base font-bold text-white">Backup e Exportação de Dados</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Exporte todos os seus atletas, treinos e avaliações do Firestore para um ficheiro JSON local.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={exportDatabaseJSON}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Dados em JSON</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Restaurar de Ficheiro JSON</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json"
            className="hidden"
          />
        </div>
      </div>

      {/* LGPD & Health Data Privacy */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <ShieldCheck className="w-5 h-5 text-sky-400" />
          <div>
            <h2 className="text-base font-bold text-white">Privacidade & Conformidade com a LGPD</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Tratamento ético e seguro de dados sensíveis de saúde e avaliação física.
            </p>
          </div>
        </div>

        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            Em conformidade com a <strong>Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD)</strong>, os dados de saúde, prontuários de anamnese, histórico de lesões e avaliações antropométricas são classificados como <em>dados pessoais sensíveis</em> (Art. 11).
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
              <span className="font-bold text-emerald-400 block mb-1">Isolamento Multi-Coach:</span>
              <span>Todos os dados são guardados com o seu UID único, impedindo que outros utilizadores acedam às suas prescrições.</span>
            </div>
            <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
              <span className="font-bold text-sky-400 block mb-1">Controle Total do Treinador:</span>
              <span>Todos os registos podem ser exportados em JSON ou apagados permanentemente a qualquer momento.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Account Cloud Data */}
      <div className="p-6 bg-slate-900 border border-rose-900/30 rounded-2xl space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <RotateCcw className="w-5 h-5 text-rose-400" />
          <div>
            <h2 className="text-base font-bold text-white">Limpar Dados da Conta no Firestore</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Remove todos os documentos associados ao seu coachId nesta conta.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (confirm('Tem a certeza de que deseja apagar todos os atletas, exercícios e treinos da sua conta no Firestore? Esta ação não pode ser desfeita.')) {
              resetToDefaults();
            }
          }}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Limpar Dados da Conta</span>
        </button>
      </div>
    </div>
  );
};
