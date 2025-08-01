import pg from "pg";
const { Pool } = pg;

import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST, // Supabase host (e.g., p.xyz.supabase.co)
  port: Number(process.env.DB_PORT), // Supabase port (likely 6543)
  user: process.env.DB_USERNAME, // Supabase username
  password: process.env.DB_PASSWORD, // Supabase password
  database: process.env.DB_DATABASE, // Supabase database
  ssl: { rejectUnauthorized: false }, // Required for Supabase
});

console.log("Pool created successfully"); // Optional log

export default pool;



// import pg from "pg";
// const { Pool } = pg;

// import dotenv from "dotenv";
// dotenv.config();

// const pool = new Pool({
//   host: process.env.DB_HOST, // Supabase host
//   port: process.env.DB_PORT, // Default PostgreSQL port
//   user: process.env.DB_USERNAME, // Supabase username
//   password: process.env.DB_PASSWORD, // Supabase password
//   database: process.env.DB_DATABASE, // Supabase database
//   ssl: { rejectUnauthorized: false }, // Required for Supabase connection
// });


// (async () => {
//   try {
//     await pool.connect();
//     console.log("Database connected successfully via Session Pooler");
//   } catch (error) {
//     console.error("Database connection error:", error.message);
//   }
// })();

// export default pool;