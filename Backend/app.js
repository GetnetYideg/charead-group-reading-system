import express from 'express'
import { register } from './controllers/auth.controller.js'
const app = express()
app.use(express.json())

app.post('/users', register)

app.listen(3000, () => {
  console.log('Server running on port 3000');
});