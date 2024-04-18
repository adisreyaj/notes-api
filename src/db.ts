import * as dotenv from 'dotenv';
import mysql, { RowDataPacket } from 'mysql2/promise';

dotenv.config();

const DATABASE_HOST = process.env.DATABASE_HOST;
const DATABASE_USER = process.env.DATABASE_USER;
const DATABASE_NAME = process.env.DATABASE_NAME;
const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD;
const DATABASE_PORT = process.env.DATABASE_PORT;

if (
  !DATABASE_HOST ||
  !DATABASE_USER ||
  !DATABASE_NAME ||
  !DATABASE_PASSWORD ||
  !DATABASE_PORT
) {
  throw new Error(
    'Please set DATABASE_HOST,DATABASE_PORT, DATABASE_USER, DATABASE_NAME, DATABASE_PASSWORD in .env.example file',
  );
}

export const database = async () => {
  const connection = await mysql.createConnection({
    host: DATABASE_HOST,
    user: DATABASE_USER,
    database: DATABASE_NAME,
    password: DATABASE_PASSWORD,
    port: +DATABASE_PORT,
  });

  const [rows] = await connection.query<RowDataPacket[]>({
    sql: `SHOW TABLES LIKE 'notes'`,
    rowsAsArray: true,
  });

  // Create table notes if it does not exist
  if (rows.length === 0) {
    console.log('Creating table notes...');
    await connection.query(`
      CREATE TABLE notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        note TEXT
      );
    `);
  } else {
    console.log('Table notes already exists');
  }

  return connection;
};
