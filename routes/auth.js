const express = require('express')
const db = require('../database/db')

const router = express.Router()

router.get('/login', (req, res) => {
  if (req.session && req.session.userId) return res.redirect('/dashboard')
  res.render('login', { error: req.query.error === '1' })
})

router.post('/login', (req, res) => {
  const { email, password } = req.body
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
  if (!user || user.password !== password) {
    // NOTE: failed login redirects to /login?error=1 (HTTP 302, not 401)
    // A generic logging middleware that only reads res.statusCode will NOT
    // distinguish a failed login from a successful one -- both return 302.
    // To emit an auth_failure event, either instrument this block explicitly
    // or check res.getHeader('Location') in your middleware via res.on('finish').
    return res.redirect('/login?error=1')
  }
  req.session.userId = user.id
  req.session.role = user.role
  req.session.username = user.username
  req.session.display_name = user.display_name || null
  req.session.theme = user.theme || 'light'
  res.redirect('/dashboard')
})

router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'))
})

module.exports = router
