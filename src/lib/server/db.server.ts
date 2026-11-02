import fs from "fs";
import path from "path";

const DB_PATH = process.env.NODE_ENV === "production" ? "/data/db.json" : path.join(process.cwd(), "db.json");

export interface User {
  id: number;
  username: string | null;
  firstName: string;
  balance: number;
  isAdmin: boolean;
  wins: number;
  losses: number;
}

export interface PromoCode {
  code: string;
  reward: number;
  maxUses: number;
  usedBy: number[];
}

export interface DBStructure {
  users: Record<string, User>;
  promos: Record<string, PromoCode>;
  admins: string[];
}

function getDefaultDB(): DBStructure {
  return {
    users: {},
    promos: {},
    admins: ["Egor_marki"],
  };
}

export function readDB(): DBStructure {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(getDefaultDB(), null, 2));
      return getDefaultDB();
    }
    const data = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(data);
  } catch (e) {
    console.error("Ошибка чтения БД:", e);
    return getDefaultDB();
  }
}

export function writeDB(data: DBStructure) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Ошибка записи БД:", e);
  }
}
