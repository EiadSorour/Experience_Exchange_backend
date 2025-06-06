// db-init.ts
import { Client } from 'pg';

export async function ensureDatabaseExists() {
  const client = new Client({
    user: process.env.DIALECT_USERNAME,
    host: process.env.HOST,
    password: process.env.PASSWORD,
    port: Number(process.env.PORT),
    database: 'postgres',
  });

  try {
    await client.connect();

    const dbName = process.env.DATABASE;
    const res = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName],
    );

    if (res.rowCount === 0) {
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database "${dbName}" created successfully.`);
    } else {
      console.log(`Database "${dbName}" already exists.`);
    }
  } catch (error) {
    console.error('Error checking or creating database:', error);
    throw error;
  } finally {
    await client.end();
  }
}
