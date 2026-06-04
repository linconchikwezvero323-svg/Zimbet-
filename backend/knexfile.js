module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './src/db/zimbet.sqlite3'
    },
    useNullAsDefault: true,
    migrations: {
      directory: './src/db/migrations'
    },
    seeds: {
      directory: './src/db/seeds'
    }
  }
};
