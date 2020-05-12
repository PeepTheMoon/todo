# Create Alchemy SQL BE

## Getting started
1. Change all the files in the `data` directory to match the data model of your app.
1. Run `heroku create`
1. Run `npm run setup-heroku` to create a heroku SQL database in the cloud to go with your heroku app.
1. Run `heroku config:get DATABASE_URL` to get your heroku sql database url from the cloud. Put this in your .env file, under `DATABASE_URL`
1. Run `npm run setup-db`
1. Run `npm run start:watch` to start the dev server

## Adding auth routes and protecting routes:

At the top of `server.js`:

```js
// Auth
const ensureAuth = require('./lib/auth/ensure-auth');
const createAuthRoutes = require('./lib/auth/create-auth-routes');
const authRoutes = createAuthRoutes({
    selectUser(email) {
        return client.query(`
            SELECT id, email, hash, display_name as "displayName" 
            FROM users
            WHERE email = $1;
        `,
        [email]
        ).then(result => result.rows[0]);
    },
    insertUser(user, hash) {
        console.log(user);
        return client.query(`
            INSERT into users (email, hash, display_name)
            VALUES ($1, $2, $3)
            RETURNING id, email, display_name as "displayName";
        `,
        [user.email, hash, user.displayName]
        ).then(result => result.rows[0]);
    }
});


// setup authentication routes to give user an auth token
// creates a /signin and a /signup route. 
// each requires a POST body with a .email and a .password
app.use('/api/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

app.get('/api/test', (req, res) => {
    res.json({
        message: `in this proctected route, we get the user's id like so: ${req.userId}`
    });
});
```
