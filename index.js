import { config as _envConfig } from 'dotenv'
_envConfig()

import usersRouter from './routes/users.js'

import express from 'express'
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/users', usersRouter)

const { SERVER_PORT } = process.env
app.listen(SERVER_PORT, () => {
  console.log(`Listening on port ${SERVER_PORT}\nDirect URL: http://localhost:${SERVER_PORT}`)
})