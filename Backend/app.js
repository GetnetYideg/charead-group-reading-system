import express from 'express'
import { login, register } from './controllers/auth.controller.js'
const app = express()
app.use(express.json())

app.post('/users', register)
app.post('/login', login)

app.listen(3000, () => {
  console.log('Server running on port 3000');
});