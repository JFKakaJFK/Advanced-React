// let's go!
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
require('dotenv').config({ path: 'variables.env' });
const createServer = require('./createServer');
const db = require('./db');

const server = createServer();

// use express middleware to handle cookies (JWT)
server.express.use(cookieParser());

// use express middleware to populate current user
server.express.use((req, res, next) => {
  const { token } = req.cookies
  if (token) {
    const { userId } = jwt.verify(token, process.env.APP_SECRET)
    // put userId on the request
    req.userId = userId
  }
  next()
})

// populate user
server.express.use(async (req, res, next) => {
  // skip if not logged in
  if (!req.userId) return next()

  const user = await db.query.user(
    { where: { id: req.userId } },
    '{ id, permissions, email, name }')

  req.user = user
  next()
})

server.start({
  cors: {
    credentials: true,
    origin: process.env.FRONTEND_URL,
  }
}, details => {
  console.log(`The server is now running on port http://localhost:${details.port}/`)
});