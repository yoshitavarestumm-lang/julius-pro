import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';
  const DB_PATH = path.join(process.cwd(), 'database.json');

  app.use(express.json({ limit: '50mb' }));

  // Ensure database.json exists with defaults
  const ensureDatabase = async () => {
    if (!fs.existsSync(DB_PATH)) {
      try {
        const { SEED_EXERCISES } = await import('./src/data/seedExercises.ts');
        const { SEED_ATHLETES } = await import('./src/data/seedAthletes.ts');
        const { SEED_PROGRAMS } = await import('./src/data/seedPrograms.ts');
        const { SEED_ASSESSMENTS, SEED_WORKOUT_LOGS } = await import('./src/data/seedAssessments.ts');
        const { DEFAULT_SPORTS } = await import('./src/data/constants.ts');

        const initial = {
          athletes: SEED_ATHLETES,
          exercises: SEED_EXERCISES,
          programs: SEED_PROGRAMS,
          assessments: SEED_ASSESSMENTS,
          workoutLogs: SEED_WORKOUT_LOGS,
          sports: DEFAULT_SPORTS,
          workoutDraft: {
            targetAthleteId: null,
            programId: null,
            title: 'Novo Programa Personalizado',
            description: 'Prescrição customizada com base nas metas e capacidades do atleta.',
            splitType: 'UpperLower',
            category: 'hipertrofia',
            level: 'intermediario',
            weeklyFrequency: 4,
            isTemplate: false,
            sessions: [
              {
                id: 'sess-draft-1',
                title: 'Treino A - Sessão Principal',
                dayOfWeek: 'Segunda-feira',
                focusGoal: 'hipertrofia',
                estimatedDurationMinutes: 60,
                notes: '',
                exercises: [],
              },
            ],
          },
          selectedAthleteId: SEED_ATHLETES[0]?.id || null,
          updatedAt: new Date().toISOString(),
        };
        fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2), 'utf-8');
      } catch (err) {
        console.error('Erro ao inicializar database.json:', err);
      }
    }
  };

  await ensureDatabase();

  // Route: GET /api/database
  app.get('/api/database', async (_req, res) => {
    try {
      await ensureDatabase();
      const raw = fs.readFileSync(DB_PATH, 'utf-8');
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.send(raw);
    } catch (err: any) {
      res.status(500).json({ error: 'Erro ao ler banco de dados', details: err?.message });
    }
  });

  // Route: POST /api/database
  app.post('/api/database', async (req, res) => {
    try {
      const payload = req.body;
      if (!payload || typeof payload !== 'object') {
        return res.status(400).json({ error: 'Payload JSON inválido' });
      }

      let current: any = {};
      if (fs.existsSync(DB_PATH)) {
        try {
          current = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
        } catch (e) {}
      }

      const updated = {
        ...current,
        ...payload,
        updatedAt: new Date().toISOString(),
      };

      fs.writeFileSync(DB_PATH, JSON.stringify(updated, null, 2), 'utf-8');
      res.setHeader('Content-Type', 'application/json');
      res.json({ success: true, updatedAt: updated.updatedAt });
    } catch (err: any) {
      res.status(500).json({ error: 'Erro ao gravar no banco de dados', details: err?.message });
    }
  });

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Julius Coach Pro Backend Server ativo na porta ${PORT}`);
  });
}

startServer().catch(console.error);
