import express from 'express'
import { getUsers, register } from './controllers/userController.js'
const app = express()
app.use(express.json())

app.get('/users', getUsers)
app.post('/users', register)

app.listen(3000, () => {
  console.log('Server running on port 3000');
});