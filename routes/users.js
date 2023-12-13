import * as db from '../db.js'

import express from 'express'
const router = express.Router()

// Getting all users.
router.get('/', async (req, res) => {
  const users = await db.getUsers()
  res.json(users)
})

// Checking users's id parameter.
router.use('/:id', (req, res, next) => {
  const userId = Number(req.params.id)
  if (!Number.isSafeInteger(userId)) return res.status(406).json({ error: { code: 'INVALID_USER_ID' } })
  next()
})
// Adding an user.
router.post('/', async (req, res) => {
  const user = {
    username: req.body['username'],
    email: req.body['email'],
    password: req.body['password']
  }

  if (!user.username || typeof user.username != 'string' || user.username.length < 4 || user.username.length > 32)
    return res.status(406).json({ error: { code: 'INVALID_USER_NAME' } })
  if (!user.email || typeof user.email != 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email))
    return res.status(406).json({ error: { code: 'INVALID_USER_EMAIL' } })
  if (!user.password || typeof user.password != 'string' || user.password.length < 8 || user.password.length > 256)
    return res.status(406).json({ error: { code: 'INVALID_PASSWORD' } })

  const created = await db.addUser(user)
  res.json(created)
})

// Getting specific user.
router.get('/:id', async (req, res) => {
  const userId = Number(req.params.id)

  const target = await db.getUser(userId)
  if (!target) return res.status(404).json(null)

  res.json(target)
})
// Modifying specific user.
router.put('/:id', async (req, res) => {
  const userId = Number(req.params.id)
  if (!(await db.hasUser(userId))) return res.status(404).json({ error: { code: 'INEXISTING_USER' } })

  const data = {
    username: req.body['username'],
    email: req.body['email'],
    password: req.body['password']
  }

  if (data.username && (typeof data.username != 'string' || data.username.length < 4 || data.username.length > 32))
    return res.status(406).json({ error: { code: 'INVALID_USER_NAME' } })
  if (data.email && (typeof data.email != 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)))
    return res.status(406).json({ error: { code: 'INVALID_USER_EMAIL' } })
  if (data.password && (typeof data.password != 'string' || data.password.length < 8 || data.password.length > 256))
    return res.status(406).json({ error: { code: 'INVALID_PASSWORD' } })

  const changed = await db.changeUser(userId, data)
  res.json(changed)
})
// Deleting specific user.
router.delete('/:id', async (req, res) => {
  const userId = Number(req.params.id)
  if (!(await db.hasUser(userId))) return res.status(404).json({ error: { code: 'INEXISTING_USER' } })

  const deleted = await db.getUser(userId)
  await db.deleteUser(userId)

  res.json(deleted)
})

export default router