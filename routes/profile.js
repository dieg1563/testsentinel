const express = require('express')
const db = require('../database/db')
const { isAuthenticated } = require('../middleware/auth')

const router = express.Router()

router.get('/', isAuthenticated, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.userId)
  user.theme = user.theme || 'light'
  res.render('profile', { user })
})

router.post('/', isAuthenticated, (req, res) => {
  const { display_name, theme } = req.body
  db.prepare(
    'UPDATE users SET display_name = ?, theme = ? WHERE id = ?'
  ).run(display_name || null, theme || 'light', req.session.userId)
  req.session.display_name = display_name || null
  req.session.theme = theme || 'light'
  res.redirect('/profile')
})

module.exports = router
