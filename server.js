const path = require('node:path');
const fastify = require('fastify')({ logger: true });
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

let db;

// РЕГИСТРАЦИЯ ПЛАГИНОВ – порядок важен
fastify.register(require('@fastify/formbody'));

fastify.register(require('@fastify/view'), {
  engine: {
    pug: require('pug')
  },
  root: path.join(__dirname, 'views'), // Убедитесь, что папка views существует
  options: { pretty: true } // для читаемого HTML
});

fastify.register(require('@fastify/static'), {
  root: path.join(__dirname, 'public'),
  prefix: '/public/' // лучше указать префикс, чтобы не конфликтовать с маршрутами
});

// Инициализация БД
async function initDB() {
  db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE
    )
  `);
  const row = await db.get('SELECT COUNT(*) as count FROM users');
  if (row.count === 0) {
    await db.run(`
      INSERT INTO users (name, email) VALUES
      ('Шкереберть Шкеребертев', 'skerebert@example.com'),
      ('Сергей Сизов', 'sizov@example.com')
    `);
  }
}

// Маршруты
fastify.get('/', async (req, reply) => {
  reply.redirect('/users');
});

fastify.get('/users', async (req, reply) => {
  try {
    const users = await db.all('SELECT * FROM users ORDER BY id');
    console.log('Sending users:', users); // отладка
    return reply.view('users', { users });
  } catch (err) {
    console.error(err);
    reply.status(500).send('Ошибка сервера: ' + err.message);
  }
});

fastify.get('/users/create', async (req, reply) => {
  return reply.view('create');
});

fastify.post('/users', async (req, reply) => {
  const { name, email } = req.body;
  try {
    await db.run('INSERT INTO users (name, email) VALUES (?, ?)', name, email);
    reply.redirect('/users');
  } catch (err) {
    reply.status(400).send('Пользователь с таким email уже существует');
  }
});

fastify.get('/users/edit/:id', async (req, reply) => {
  const user = await db.get('SELECT * FROM users WHERE id = ?', req.params.id);
  if (!user) return reply.status(404).send('Не найден');
  return reply.view('edit', { user });
});

fastify.post('/users/update/:id', async (req, reply) => {
  const { name, email } = req.body;
  try {
    await db.run('UPDATE users SET name = ?, email = ? WHERE id = ?', name, email, req.params.id);
    reply.redirect('/users');
  } catch (err) {
    reply.status(400).send('Ошибка обновления (возможно, email занят)');
  }
});

fastify.post('/users/delete/:id', async (req, reply) => {
  await db.run('DELETE FROM users WHERE id = ?', req.params.id);
  reply.redirect('/users');
});

fastify.get('/api', async (req, reply) => {
  reply.type('text/plain').send('Запрос прошел успешно');
});

// Запуск
const start = async () => {
  await initDB();
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Server running on http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();