import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type MicroleadRecord = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  location: string;
  utmCampaign: string;
  utmContent: string;
  utmTerm: string;
};

type StoreShape = {
  records: MicroleadRecord[];
};

const STORE_PATH = process.env.VERCEL
  ? "/tmp/element-microleads.json"
  : path.join(process.cwd(), "data", "microleads.json");

const defaultStore: StoreShape = {
  records: [],
};

async function ensureStore() {
  await mkdir(path.dirname(STORE_PATH), { recursive: true });

  try {
    await readFile(STORE_PATH, "utf-8");
  } catch {
    await writeFile(STORE_PATH, JSON.stringify(defaultStore, null, 2), "utf-8");
  }
}

async function readStore() {
  await ensureStore();

  try {
    const raw = await readFile(STORE_PATH, "utf-8");
    const parsed = JSON.parse(raw) as Partial<StoreShape>;

    return {
      records: Array.isArray(parsed.records) ? parsed.records : [],
    } satisfies StoreShape;
  } catch {
    return defaultStore;
  }
}

async function writeStore(store: StoreShape) {
  await writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

export async function saveMicrolead(record: Omit<MicroleadRecord, "id" | "createdAt">) {
  const store = await readStore();

  const nextRecord: MicroleadRecord = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...record,
  };

  store.records.unshift(nextRecord);
  await writeStore(store);

  return nextRecord;
}
