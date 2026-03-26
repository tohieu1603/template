// Simple DB connection test
const { Client } = require('pg');

const client = new Client({
  host: '192.168.1.5',
  port: 5432,
  database: 'education',
  user: 'duc',
  password: '080103',
  connectionTimeoutMillis: 5000,
});

client.connect()
  .then(() => {
    console.log('DB connected successfully');
    return client.query('SELECT current_database(), version()');
  })
  .then(res => {
    console.log('Database:', res.rows[0].current_database);
    console.log('PostgreSQL:', res.rows[0].version.split(' ').slice(0,2).join(' '));
    client.end();
    process.exit(0);
  })
  .catch(err => {
    console.error('Connection failed:', err.message);
    process.exit(1);
  });
