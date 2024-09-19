const knex = require('knex')
const dbConfig = {
  client: 'mysql2',
  connection: {
    host: '127.0.0.1',
    port: '3306',
    user: 'skeelo',
    password: 'skeelo',
    database: 'queue_db',
    timezone: '-00:00'
  },
  pool: {
    min: 2,
    max: 5,
    propagateCreateError: false
  }
}
const db = knex(dbConfig)

module.exports = db