import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { detectIntakeContradictions } from "@/src/lib/intake/contradictions";
import {
  createDefaultIntakeDraft,
  mergeIntakeDraft,
  toValidatedIntakeJson,
  type IntakeJson,
} from "@/src/lib/intake/schema";
import type {
  IntakeAssetRecord,
  IntakeDraft,
  IntakeStoreRecord,
  ProjectRecord,
} from "@/src/lib/intake/types";

const STORE_PATH = process.env.VERCEL
  ? "/tmp/element-intakes.json"
  : path.join(process.cwd(), "data", "intakes.json");
const INTAKE_FINAL_STEP = 12;

type JsonStore = {
  intakes: Record<string, IntakeDraft>;
  projects: Record<string, ProjectRecord>;
};

type QueryablePool = {
  query: <T = unknown>(
    text: string,
    values?: unknown[],
  ) => Promise<{ rows: T[]; rowCount: number | null }>;
};

declare global {
  var __elementIntakePool: QueryablePool | undefined;
  var __elementIntakeStore: IntakeStore | undefined;
}

const defaultStore: JsonStore = {
  intakes: {},
  projects: {},
};

const nowIso = () => new Date().toISOString();

function summarizeIntake(intake: IntakeJson, contradictions: string[]): ProjectRecord["summary"] {
  return {
    title: `Projekt ${intake.basics.city || "bez naziva"}`,
    city: intake.basics.city,
    propertyType: intake.basics.propertyType,
    style: intake.style.selectedStyles,
    mood: intake.mood.selectedMoods,
    palette: intake.color.palette,
    lightingPreset: intake.lighting.presetSuggestion,
    qualityTier: intake.furniture.qualityTier,
    budget: {
      min: intake.budget.minTotal,
      max: intake.budget.maxTotal,
      currency: intake.budget.currency,
    },
    contradictions,
  };
}

class JsonIntakeStore {
  private async ensureStore() {
    await mkdir(path.dirname(STORE_PATH), { recursive: true });

    try {
      await readFile(STORE_PATH, "utf-8");
    } catch {
      await writeFile(STORE_PATH, JSON.stringify(defaultStore, null, 2), "utf-8");
    }
  }

  private async readStore() {
    await this.ensureStore();

    try {
      const raw = await readFile(STORE_PATH, "utf-8");
      const parsed = JSON.parse(raw) as Partial<JsonStore>;

      return {
        intakes: parsed.intakes ?? {},
        projects: parsed.projects ?? {},
      } satisfies JsonStore;
    } catch {
      return defaultStore;
    }
  }

  private async writeStore(store: JsonStore) {
    await writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
  }

  async createDraft() {
    const store = await this.readStore();
    const draft = createDefaultIntakeDraft();

    store.intakes[draft.id] = draft;
    await this.writeStore(store);

    return draft;
  }

  async getIntake(id: string): Promise<IntakeDraft | null> {
    const store = await this.readStore();
    return store.intakes[id] ?? null;
  }

  async saveDraft(id: string, patch: Partial<IntakeDraft>) {
    const store = await this.readStore();
    const current = store.intakes[id] ?? createDefaultIntakeDraft({ id });
    const next = mergeIntakeDraft(current, patch);

    store.intakes[id] = {
      ...next,
      id,
      updatedAt: nowIso(),
    };

    await this.writeStore(store);

    return store.intakes[id];
  }

  async addAsset(id: string, asset: IntakeAssetRecord) {
    const store = await this.readStore();
    const current = store.intakes[id] ?? createDefaultIntakeDraft({ id });

    const assets = [...current.assets.filter((item) => item.id !== asset.id), asset];

    const next = mergeIntakeDraft(current, {
      assets,
      floorplan: {
        ...current.floorplan,
        planAssetIds:
          asset.kind === "plan"
            ? [...new Set([...current.floorplan.planAssetIds, asset.id])]
            : current.floorplan.planAssetIds,
      },
    });

    store.intakes[id] = {
      ...next,
      id,
      updatedAt: nowIso(),
    };

    await this.writeStore(store);

    return asset;
  }

  async submitDraft(id: string, confirmContradictions: boolean) {
    const store = await this.readStore();
    const current = store.intakes[id] ?? createDefaultIntakeDraft({ id });
    const validated = toValidatedIntakeJson({
      ...current,
      status: "submitted",
      currentStep: INTAKE_FINAL_STEP,
      updatedAt: nowIso(),
    });

    const contradictions = detectIntakeContradictions(validated);

    if (contradictions.length > 0 && !confirmContradictions) {
      return {
        status: "needs_confirmation" as const,
        contradictions,
        intake: current,
        project: null,
      };
    }

    const confirmedIntake = {
      ...validated,
      contradictionsConfirmed: contradictions.length > 0 || validated.contradictionsConfirmed,
      updatedAt: nowIso(),
    } satisfies IntakeJson;

    const project: ProjectRecord = {
      id,
      intakeId: id,
      status: "intake_completed",
      summary: summarizeIntake(confirmedIntake, contradictions),
      createdAt: store.projects[id]?.createdAt ?? nowIso(),
      updatedAt: nowIso(),
    };

    store.intakes[id] = confirmedIntake;
    store.projects[id] = project;

    await this.writeStore(store);

    return {
      status: "submitted" as const,
      contradictions,
      intake: confirmedIntake,
      project,
    };
  }

  async getProject(id: string): Promise<ProjectRecord | null> {
    const store = await this.readStore();
    return store.projects[id] ?? null;
  }

  async getIntakeWithProject(id: string): Promise<IntakeStoreRecord | null> {
    const store = await this.readStore();
    const intake = store.intakes[id];

    if (!intake) {
      return null;
    }

    return {
      intake,
      project: store.projects[id] ?? null,
    };
  }
}

type DbIntakeRow = {
  id: string;
  status: IntakeDraft["status"];
  current_step: number;
  draft_json: IntakeDraft;
  intake_json: IntakeJson | null;
  contradictions: string[] | null;
  created_at: string;
  updated_at: string;
};

type DbProjectRow = {
  id: string;
  intake_id: string;
  status: ProjectRecord["status"];
  summary_json: ProjectRecord["summary"];
  created_at: string;
  updated_at: string;
};

class PostgresIntakeStore {
  private initialized = false;

  constructor(private readonly pool: QueryablePool) {}

  private async ensureSchema() {
    if (this.initialized) {
      return;
    }

    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS intakes (
        id UUID PRIMARY KEY,
        status TEXT NOT NULL,
        current_step INT NOT NULL,
        draft_json JSONB NOT NULL,
        intake_json JSONB,
        contradictions JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS intake_assets (
        id UUID PRIMARY KEY,
        intake_id UUID NOT NULL REFERENCES intakes(id) ON DELETE CASCADE,
        kind TEXT NOT NULL,
        room_type TEXT,
        label TEXT,
        original_url TEXT NOT NULL,
        thumbnail_url TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        size_bytes INT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY,
        intake_id UUID UNIQUE NOT NULL REFERENCES intakes(id) ON DELETE CASCADE,
        status TEXT NOT NULL,
        summary_json JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    this.initialized = true;
  }

  async createDraft() {
    await this.ensureSchema();

    const draft = createDefaultIntakeDraft();

    await this.pool.query(
      `
        INSERT INTO intakes (id, status, current_step, draft_json, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
      `,
      [draft.id, draft.status, draft.currentStep, JSON.stringify(draft)],
    );

    return draft;
  }

  async getIntake(id: string) {
    await this.ensureSchema();

    const result = await this.pool.query<DbIntakeRow>(
      `
        SELECT id, status, current_step, draft_json, intake_json, contradictions, created_at, updated_at
        FROM intakes
        WHERE id = $1
      `,
      [id],
    );

    if (!result.rowCount) {
      return null;
    }

    const row = result.rows[0];
    return createDefaultIntakeDraft({
      ...(row.intake_json ?? row.draft_json),
      id: row.id,
      status: row.status,
      currentStep: row.current_step,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  async saveDraft(id: string, patch: Partial<IntakeDraft>) {
    await this.ensureSchema();

    const current = (await this.getIntake(id)) ?? createDefaultIntakeDraft({ id });
    const next = mergeIntakeDraft(current, patch);

    await this.pool.query(
      `
        INSERT INTO intakes (id, status, current_step, draft_json, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        ON CONFLICT (id)
        DO UPDATE SET
          status = EXCLUDED.status,
          current_step = EXCLUDED.current_step,
          draft_json = EXCLUDED.draft_json,
          updated_at = NOW()
      `,
      [id, next.status, next.currentStep, JSON.stringify({ ...next, id, updatedAt: nowIso() })],
    );

    return next;
  }

  async addAsset(id: string, asset: IntakeAssetRecord) {
    await this.ensureSchema();

    const current = (await this.getIntake(id)) ?? createDefaultIntakeDraft({ id });

    const next = mergeIntakeDraft(current, {
      assets: [...current.assets.filter((item) => item.id !== asset.id), asset],
      floorplan: {
        ...current.floorplan,
        planAssetIds:
          asset.kind === "plan"
            ? [...new Set([...current.floorplan.planAssetIds, asset.id])]
            : current.floorplan.planAssetIds,
      },
    });

    await this.saveDraft(id, next);

    await this.pool.query(
      `
        INSERT INTO intake_assets (
          id,
          intake_id,
          kind,
          room_type,
          label,
          original_url,
          thumbnail_url,
          mime_type,
          size_bytes,
          created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        ON CONFLICT (id)
        DO UPDATE SET
          kind = EXCLUDED.kind,
          room_type = EXCLUDED.room_type,
          label = EXCLUDED.label,
          original_url = EXCLUDED.original_url,
          thumbnail_url = EXCLUDED.thumbnail_url,
          mime_type = EXCLUDED.mime_type,
          size_bytes = EXCLUDED.size_bytes
      `,
      [
        asset.id,
        id,
        asset.kind,
        asset.roomType,
        asset.label,
        asset.originalUrl,
        asset.thumbnailUrl,
        asset.mimeType,
        asset.sizeBytes,
      ],
    );

    return asset;
  }

  async submitDraft(id: string, confirmContradictions: boolean) {
    await this.ensureSchema();

    const current = (await this.getIntake(id)) ?? createDefaultIntakeDraft({ id });

    const validated = toValidatedIntakeJson({
      ...current,
      id,
      status: "submitted",
      currentStep: INTAKE_FINAL_STEP,
      updatedAt: nowIso(),
    });

    const contradictions = detectIntakeContradictions(validated);

    if (contradictions.length > 0 && !confirmContradictions) {
      return {
        status: "needs_confirmation" as const,
        contradictions,
        intake: current,
        project: null,
      };
    }

    const confirmedIntake = {
      ...validated,
      contradictionsConfirmed: contradictions.length > 0 || validated.contradictionsConfirmed,
      updatedAt: nowIso(),
    } satisfies IntakeJson;

    const summary = summarizeIntake(confirmedIntake, contradictions);

    await this.pool.query(
      `
        UPDATE intakes
        SET
          status = 'submitted',
          current_step = $4,
          draft_json = $2,
          intake_json = $2,
          contradictions = $3,
          updated_at = NOW()
        WHERE id = $1
      `,
      [id, JSON.stringify(confirmedIntake), JSON.stringify(contradictions), INTAKE_FINAL_STEP],
    );

    await this.pool.query(
      `
        INSERT INTO projects (id, intake_id, status, summary_json, created_at, updated_at)
        VALUES ($1, $1, 'intake_completed', $2, NOW(), NOW())
        ON CONFLICT (id)
        DO UPDATE SET
          status = EXCLUDED.status,
          summary_json = EXCLUDED.summary_json,
          updated_at = NOW()
      `,
      [id, JSON.stringify(summary)],
    );

    const project = await this.getProject(id);

    return {
      status: "submitted" as const,
      contradictions,
      intake: confirmedIntake,
      project,
    };
  }

  async getProject(id: string): Promise<ProjectRecord | null> {
    await this.ensureSchema();

    const result = await this.pool.query<DbProjectRow>(
      `
        SELECT id, intake_id, status, summary_json, created_at, updated_at
        FROM projects
        WHERE id = $1
      `,
      [id],
    );

    if (!result.rowCount) {
      return null;
    }

    const row = result.rows[0];

    return {
      id: row.id,
      intakeId: row.intake_id,
      status: row.status,
      summary: row.summary_json,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async getIntakeWithProject(id: string): Promise<IntakeStoreRecord | null> {
    const intake = await this.getIntake(id);

    if (!intake) {
      return null;
    }

    const project = await this.getProject(id);

    return {
      intake,
      project,
    };
  }
}

async function createPostgresStore() {
  const connectionString =
    process.env.DATABASE_URL?.trim() || process.env.POSTGRES_URL?.trim();

  if (!connectionString) {
    return null;
  }

  if (globalThis.__elementIntakeStore) {
    return globalThis.__elementIntakeStore;
  }

  if (!globalThis.__elementIntakePool) {
    const { Pool } = await import("pg");

    globalThis.__elementIntakePool = new Pool({
      connectionString,
      ssl: connectionString.includes("localhost")
        ? false
        : { rejectUnauthorized: false },
    });
  }

  globalThis.__elementIntakeStore = new IntakeStore(
    new PostgresIntakeStore(globalThis.__elementIntakePool),
    new JsonIntakeStore(),
  );

  return globalThis.__elementIntakeStore;
}

class IntakeStore {
  constructor(
    private readonly primary: PostgresIntakeStore | JsonIntakeStore,
    private readonly fallback: JsonIntakeStore,
  ) {}

  async createDraft() {
    try {
      return await this.primary.createDraft();
    } catch {
      return this.fallback.createDraft();
    }
  }

  async getIntake(id: string) {
    try {
      return await this.primary.getIntake(id);
    } catch {
      return this.fallback.getIntake(id);
    }
  }

  async saveDraft(id: string, patch: Partial<IntakeDraft>) {
    try {
      return await this.primary.saveDraft(id, patch);
    } catch {
      return this.fallback.saveDraft(id, patch);
    }
  }

  async addAsset(id: string, asset: IntakeAssetRecord) {
    try {
      return await this.primary.addAsset(id, asset);
    } catch {
      return this.fallback.addAsset(id, asset);
    }
  }

  async submitDraft(id: string, confirmContradictions: boolean) {
    try {
      return await this.primary.submitDraft(id, confirmContradictions);
    } catch {
      return this.fallback.submitDraft(id, confirmContradictions);
    }
  }

  async getProject(id: string) {
    try {
      return await this.primary.getProject(id);
    } catch {
      return this.fallback.getProject(id);
    }
  }

  async getIntakeWithProject(id: string) {
    try {
      return await this.primary.getIntakeWithProject(id);
    } catch {
      return this.fallback.getIntakeWithProject(id);
    }
  }
}

const jsonFallbackStore = new JsonIntakeStore();

async function buildStore() {
  const postgresStore = await createPostgresStore();

  if (postgresStore) {
    return postgresStore;
  }

  return new IntakeStore(jsonFallbackStore, jsonFallbackStore);
}

export const intakeStore = {
  async createDraft() {
    const store = await buildStore();
    return store.createDraft();
  },
  async getIntake(id: string) {
    const store = await buildStore();
    return store.getIntake(id);
  },
  async saveDraft(id: string, patch: Partial<IntakeDraft>) {
    const store = await buildStore();
    return store.saveDraft(id, patch);
  },
  async addAsset(id: string, asset: IntakeAssetRecord) {
    const store = await buildStore();
    return store.addAsset(id, asset);
  },
  async submitDraft(id: string, confirmContradictions: boolean) {
    const store = await buildStore();
    return store.submitDraft(id, confirmContradictions);
  },
  async getProject(id: string) {
    const store = await buildStore();
    return store.getProject(id);
  },
  async getIntakeWithProject(id: string) {
    const store = await buildStore();
    return store.getIntakeWithProject(id);
  },
};
