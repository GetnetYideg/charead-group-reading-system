import express from 'express'
import groupRouter from './routes/group.routes.js'
import authRouter from './routes/auth.routes.js'
import cookieParser from 'cookie-parser';
import invitationRouter from './routes/invite.routes.js';

const port = process.env.PORT
const app = express()
app.use(express.json())
app.use(cookieParser())

app.use('/api/groups', groupRouter)
app.use('/api/auth', authRouter)
app.use('/api/invites', invitationRouter)

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});