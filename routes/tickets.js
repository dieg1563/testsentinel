const express = require('express')
const db = require('../database/db')
const { isAuthenticated } = require('../middleware/auth')

const router = express.Router()

router.get('/', isAuthenticated, (req, res) => {
  const { view, status, priority, sort, dir } = req.query
  const viewMine = view === 'mine'

  let where = viewMine ? `WHERE t.created_by = ${req.session.userId}` : 'WHERE 1=1'
  if (status) where += ` AND t.status = '${status}'`
  if (priority) where += ` AND t.priority = '${priority}'`

  const sortCol = sort || 'created_at'
  const sortDir = dir === 'asc' ? 'ASC' : 'DESC'
  const orderBy = `ORDER BY ${sortCol} ${sortDir}`

  const tickets = db.prepare(
    `SELECT t.*, u.username as creator_name, u.display_name as creator_display_name
     FROM tickets t LEFT JOIN users u ON t.created_by = u.id ${where} ${orderBy}`
  ).all()

  const user = {
    id: req.session.userId,
    username: req.session.username,
    role: req.session.role,
    display_name: req.session.display_name,
    theme: req.session.theme
  }
  res.render('tickets', {
    tickets,
    user,
    search: '',
    viewMine,
    filters: { status: status || '', priority: priority || '', sort: sortCol, dir: sortDir }
  })
})

router.post('/search', isAuthenticated, (req, res) => {
  const { search } = req.body
  const results = db.prepare(
    `SELECT t.*, u.username as creator_name, u.display_name as creator_display_name
     FROM tickets t LEFT JOIN users u ON t.created_by = u.id
     WHERE t.title LIKE '%${search}%' OR t.description LIKE '%${search}%'`
  ).all()
  const user = {
    id: req.session.userId,
    username: req.session.username,
    role: req.session.role,
    display_name: req.session.display_name,
    theme: req.session.theme
  }
  res.render('tickets', { tickets: results, user, search, viewMine: false, filters: {} })
})

// NOTE: no ownership check -- any authenticated user can export any ticket (IDOR)
// Detection requires logging both the requester identity and the ticket owner
// in the same event; a generic HTTP status-based rule will never see this (200 OK).
router.get('/:id/export', isAuthenticated, (req, res) => {
  const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(req.params.id)
  if (!ticket) return res.status(404).send('Not found')
  const comments = db.prepare(
    'SELECT * FROM comments WHERE ticket_id = ? ORDER BY created_at ASC'
  ).all(req.params.id)
  let output = `TICKET #${ticket.id}\n`
  output += `Title: ${ticket.title}\n`
  output += `Status: ${ticket.status} | Priority: ${ticket.priority}\n`
  output += `Description: ${ticket.description || 'N/A'}\n\n`
  output += `COMMENTS (${comments.length})\n`
  output += '-'.repeat(40) + '\n'
  for (const c of comments) {
    output += `[${c.created_at}] ${c.content}\n`
  }
  res.setHeader('Content-Type', 'text/plain')
  res.setHeader('Content-Disposition', `attachment; filename="ticket-${ticket.id}.txt"`)
  res.send(output)
})

router.get('/:id', isAuthenticated, (req, res) => {
  const ticket = db.prepare(`
    SELECT t.*, u.username as creator_name, a.username as assignee_name
    FROM tickets t
    LEFT JOIN users u ON t.created_by = u.id
    LEFT JOIN users a ON t.assigned_to = a.id
    WHERE t.id = ?
  `).get(req.params.id)
  if (!ticket) return res.status(404).send('Ticket not found')
  const comments = db.prepare(`
    SELECT c.*, u.username as author_name
    FROM comments c
    LEFT JOIN users u ON c.author_id = u.id
    WHERE c.ticket_id = ?
    ORDER BY c.created_at ASC
  `).all(req.params.id)
  const user = {
    id: req.session.userId,
    username: req.session.username,
    role: req.session.role,
    display_name: req.session.display_name,
    theme: req.session.theme
  }
  res.render('ticket-detail', { ticket, comments, user })
})

router.post('/:id/comment', isAuthenticated, (req, res) => {
  const { content } = req.body
  const now = new Date().toISOString()
  db.prepare(
    'INSERT INTO comments (ticket_id, author_id, content, created_at) VALUES (?, ?, ?, ?)'
  ).run(req.params.id, req.session.userId, content, now)
  res.redirect('/tickets/' + req.params.id)
})

module.exports = router
