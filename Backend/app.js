import express from 'express'
import cookieParser from 'cookie-parser';

import groupRouter from './routes/group.routes.js'
import authRouter from './routes/auth.routes.js'
import invitationRouter from './routes/invite.routes.js';
import fileRouter from './routes/file.routes.js'
import chatRouter from './routes/chat.routes.js';
import aiRouter from './routes/ai.routes.js';

const port = process.env.PORT
const app = express()
app.use(express.json())
app.use(cookieParser())


app.use('/api/groups', groupRouter)
app.use('/api/auth', authRouter)
app.use('/api/invites', invitationRouter)
app.use('/api/file', fileRouter)
app.use('/api/chat', chatRouter)
app.use('/api/ai', aiRouter)

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});