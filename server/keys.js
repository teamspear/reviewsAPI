module.exports = {
  pgUser : process.env.PGUSER || 'tom',
  pgHost : process.env.PGHOST || 'localhost',
  pgDatabase : process.env.PGDATABASE || 'sdc',
  pgPassword : process.env.PGPASSWORD || 'postgres',
  pgPort : process.env.PGPORT || 5432
};