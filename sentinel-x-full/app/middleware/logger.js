// middleware/logger.js -- logs JSON conformes à CONTRACT.md
//
// - Une ligne JSON par requête (event_type "request").
// - Événements métier émis en plus via logEvent() depuis les routes.
// - Mots de passe / secrets masqués dans le champ body.
//
// Usage dans app.js :
//   const { requestLogger, logEvent } = require('./middleware/logger')
//   app.use(requestLogger)
//   ... puis dans les routes : logEvent(req, { event_type: 'auth_failure', status_code: 401, user })

const fs = require('fs')
const path = require('path')

const LOG_FILE = process.env.LOG_FILE || '/var/log/supportdesk/app.json'

// S'assure que le dossier existe (utile hors Docker aussi)
try {
  fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true })
} catch (e) { /* ignore */ }

const logStream = fs.createWriteStream(LOG_FILE, { flags: 'a' })

const SECRET_KEYS = ['password', 'pass', 'pwd', 'token', 'secret']

// Masque les secrets dans un corps urlencoded ou un objet
function maskBody (body) {
  if (!body || typeof body !== 'object') return ''
  const parts = []
  for (const [k, v] of Object.entries(body)) {
    const isSecret = SECRET_KEYS.some(s => k.toLowerCase().includes(s))
    parts.push(`${k}=${isSecret ? '***' : v}`)
  }
  return parts.join('&')
}

// Récupère l'IP source (cf. CONTRACT.md section 6 : trust proxy actif)
function sourceIp (req) {
  return req.ip || req.connection?.remoteAddress || '-'
}

// Écrit une ligne JSON conforme au contrat
function writeLog (fields) {
  const line = JSON.stringify({
    timestamp: new Date().toISOString(),
    level: fields.level || 'INFO',
    event_type: fields.event_type || 'request',
    source_ip: fields.source_ip || '-',
    user: fields.user || '-',
    endpoint: fields.endpoint || '-',
    method: fields.method || '-',
    status_code: fields.status_code ?? 0,
    message: fields.message || '',
    query: fields.query || '',
    body: fields.body || ''
  })
  logStream.write(line + '\n')
}

// Émet un événement métier depuis une route (auth_failure, access_denied, etc.)
function logEvent (req, fields) {
  writeLog({
    source_ip: sourceIp(req),
    endpoint: req.path,
    method: req.method,
    query: req.url.includes('?') ? req.url.split('?')[1] : '',
    body: maskBody(req.body),
    ...fields
  })
}

// Middleware : un événement "request" par requête terminée
function requestLogger (req, res, next) {
  res.on('finish', () => {
    // Déduit un event_type/level par défaut selon le status
    let event_type = 'request'
    let level = 'INFO'
    if (res.statusCode === 404) { event_type = 'not_found' }
    else if (res.statusCode === 403) { event_type = 'access_denied'; level = 'WARN' }
    else if (res.statusCode >= 500) { event_type = 'server_error'; level = 'ERROR' }

    writeLog({
      level,
      event_type,
      source_ip: sourceIp(req),
      user: req.session?.username || '-',
      endpoint: req.path,
      method: req.method,
      status_code: res.statusCode,
      query: req.url.includes('?') ? req.url.split('?')[1] : '',
      body: maskBody(req.body)
    })
  })
  next()
}

module.exports = { requestLogger, logEvent, writeLog, maskBody, LOG_FILE }
