const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

let db;

async function initializeDB() {
  db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE
    );
  `);

  // Добавим тестовые данные, если таблица пуста
  const row = await db.get('SELECT COUNT(*) as count FROM users');
  if (row.count === 0) {
    await db.run(`
      INSERT INTO users (name, email) VALUES
      ('Шкереберть Шкеребертев', 'skerebert@example.com'),
      ('Сергей Сизов', 'sizov@example.com')
    `);
  }

  return db;
}

module.exports = { initializeDB };