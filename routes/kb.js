const express = require('express')
const fs = require('fs')
const path = require('path')
const { isAuthenticated } = require('../middleware/auth')

const router = express.Router()

router.get('/', isAuthenticated, (req, res) => {
  const kbDir = path.join(__dirname, '..', 'public', 'kb')
  const files = fs.readdirSync(kbDir).filter(f => f.endsWith('.html'))
  const user = {
    id: req.session.userId,
    username: req.session.username,
    role: req.session.role,
    display_name: req.session.display_name,
    theme: req.session.theme
  }
  res.render('kb', { user, files })
})

router.get('/view', isAuthenticated, (req, res) => {
  const { doc } = req.query
  const filePath = path.join(__dirname, '..', 'public', 'kb', doc)
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const user = {
      id: req.session.userId,
      username: req.session.username,
      role: req.session.role,
      display_name: req.session.display_name,
      theme: req.session.theme
    }
    res.render('kb-view', { user, content, doc })
  } catch (err) {
    res.status(404).send('Document not found')
  }
})

module.exports = router
