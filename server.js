require('dotenv').config();

const client = require('./lib/client');

// Initiate database connection
client.connect();

const app = require('./lib/app');

const PORT = process.env.PORT || 7890;

const ensureAuth = require('./lib/auth/ensure-auth');
const createAuthRoutes = require('./lib/auth/create-auth-routes');

const authRoutes = createAuthRoutes({
  selectUser(email) {
    return client.query(`
            SELECT id, email, hash 
            FROM users
            WHERE email = $1;
        `,
    [email]
    ).then(result => result.rows[0]);
  },
  insertUser(user, hash) {
    console.log(user);
    return client.query(`
            INSERT into users (email, hash)
            VALUES ($1, $2)
            RETURNING id, email;
        `,
    [user.email, hash]
    ).then(result => result.rows[0]);
  }
});

// setup authentication routes to give user an auth token
// creates a /signin and a /signup route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});

app.get('/api/todos', async(req, res) => {
  const data = await client.query('SELECT * from todos where owner_id=$1', [req.userId]);

  res.json(data.rows);
});

app.post('/api/todos', async(req, res) => {
  const data = await client.query(`
    insert into todos (name, priority, completed, owner_id)
    values ($1, $2, $3, $4)
    returning *
  `, [req.body.name, req.body.priority, req.body.completed, req.userId]);

  res.json(data.rows);
});

app.put('/api/todos/:id', async(req, res) => {
  const data = await client.query(`
    UPDATE todos
    SET completed=true
    WHERE id=$1 AND owner_id=$2
    returning *;
  `, [req.params.id, req.userId]);

  res.json(data.rows);
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Started on ${PORT}`);
});

module.exports = app;
