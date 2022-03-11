module.exports = {
  "type": "postgres",
  "host": process.env.DATABASE_HOST || "localhost",
  "port": parseInt(process.env.DATABASE_PORT, 10) || 5432,
  "username": process.env.DATABASE_USER || "postgres",
  "password": process.env.DATABASE_PASSWORD || "postgres",
  "database": process.env.DATABASE_NAME || "mydatabase",
  "synchronize": false,
  "logging": true,
  "entities": [
    "src/db/entities/*.ts"
  ],
  "migrations": [
    "src/db/migrations/*.ts"
  ],
  "cli": {
    "entitiesDir": "src/db/entities",
    "migrationsDir": "src/db/migrations"
  }
}