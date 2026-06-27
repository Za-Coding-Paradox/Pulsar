import "dotenv/config";

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

export const Constants = {
  BCRYPT_COST_FACTOR: 12,
  JWT_ACCESS_SECRET: requireEnv("JWT_ACCESS_SECRET"),
  JWT_REFRESH_SECRET: requireEnv("JWT_REFRESH_SECRET"),
  REFRESH_TOKEN_EXPIRY: "1d",
  ACCESS_TOKEN_EXPIRY: "15m",
} as const;
