const path = require('node:path');
const fastify = require('fastify')({ logger: true });

let users = [
  { id: 1, name: 'Шкереберть Шкеребертев', email: 'skerebert@example.com' },
  { id: 2, name: 'Сергей Сизов', email: 'sizov@example.com' }
];

fastify.register(require('@fastify/formbody'));
fastify.register(require('@fastify/view'), {
  engine: { pug: require('pug') },
  root: path.join(__dirname, 'views')
});
fastify.register(require('@fastify/static'), {
  root: path.join(__dirname, 'public'),
  prefix: '/'
});

fastify.get('/users', async (request, reply) => {
  return reply.view('users', { users });
});

fastify.get('/users/create', async (request, reply) => {
  return reply.view('create');
});

fastify.post('/users', async (request, reply) => {
  const { name, email } = request.body;
  const newUser = {
    id: users.length ? Math.max(...users.map(u => u.id)) + 1 : 1,
    name,
    email
  };
  users.push(newUser);
  reply.redirect('/users');
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    fastify.log.info('Server is running on http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();