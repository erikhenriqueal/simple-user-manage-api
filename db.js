import { config as _envConfig } from 'dotenv'
_envConfig()

import mysql from 'mysql2/promise'

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  namedPlaceholders: true
})

/**
 * Gets all users registered to the database.
 * @returns { Promise<{ id: Number; username: String; email: String; password: String; }[]> }
 */
export async function getUsers() {
  const connection = await pool.getConnection()
  const [ rows ] = await connection.execute('SELECT * FROM `users`')
  connection.release()
  return rows
}
/**
 * Gets some user from database by its `id`.
 * @param { Number } id Target user iD.
 * @returns { Promise<null | { id: Number; username: String; email: String; password: String; }> }
 */
export async function getUser(id) {
  const connection = await pool.getConnection()
  const [[ user ]] = await connection.execute('SELECT * FROM `users` WHERE `id`=?', [ id ])
  connection.release()
  return user || null
}
/**
 * Verifies if some user is on the database.
 * @param { Number } id Target user iD.
 * @returns { Promise<boolean> }
 */
export async function hasUser(id) {
  const connection = await pool.getConnection()
  const [[{ size }]] = await connection.execute('SELECT COUNT(*) AS `size` FROM `users` WHERE `id`=?', [ id ])
  connection.release()
  return size > 0
}
/**
 * Adds `user` to database.
 * @param { { username: String; email: String; password: String; } } user User's object.
 * @returns { Promise<{ id: Number; username: String; email: String; password: String; }> }
 */
export async function addUser(user) {
  if (!user.username || typeof user.username != 'string' || user.username.length < 4 || user.username.length > 32)
    throw TypeError('Invalid user\'s username.')
  if (!user.email || typeof user.email != 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email))
    throw TypeError('Invalid user\'s e-mail.')
  if (!user.password || typeof user.password != 'string' || user.password.length < 8 || user.password.length > 256)
    throw TypeError('Invalid user\'s password length.')

  const { username, email, password } = user

  const connection = await pool.getConnection()
  const [{ insertId: id }] = await connection.execute('INSERT INTO `users` (`username`, `email`, `password`) VALUES (?,?,?)', [ username, email, password ])
  connection.release()
  
  return await getUser(id);
}
/**
 * Changes an `user` on database.
 * @param { Number } id User's ID.
 * @param { { username?: String; email?: String; password?: String; } } changes User changes object.
 * @returns { Promise<{ id: Number; username: String; email: String; password: String; }> }
 */
export async function changeUser(id, changes) {
  if (changes.username && (typeof changes.username != 'string' || changes.username.length < 4 || changes.username.length > 32))
    throw TypeError('Invalid user\'s changed username.')
  if (changes.email && (typeof changes.email != 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(changes.email)))
    throw TypeError('Invalid user\'s changed e-mail.')
  if (changes.password && (typeof changes.password != 'string' || changes.password.length < 8 || changes.password.length > 256))
    throw TypeError('Invalid user\'s changed password length.')

  const changesDefKeys = Object.keys(changes).filter(k => changes[k] !== undefined),
        changesDefEntries = changesDefKeys.map(k => [k, changes[k]]),
        changesDefChanges = Object.fromEntries(changesDefEntries)

  const connection = await pool.getConnection()
  await connection.execute(
    `UPDATE \`users\` SET ${changesDefKeys.map(k => `\`${k}\`=:${k}`).join(', ')} WHERE \`id\`=:id`
  , { id, ...changesDefChanges })
  connection.release()
  
  return await getUser(id)
}
/**
 * Deletes the specified user from database.
 * @param { Number } id Target user ID
 * @returns { Promise<boolean> }
 */
export async function deleteUser(id) {
  const connection = await pool.getConnection()
  const [{ affectedRows }] = await connection.execute('DELETE FROM `users` WHERE `id`=?', [ id ])
  connection.release()

  return affectedRows > 0;
}