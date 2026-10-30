// middleware/metrics.js -- métriques Prometheus conformes à CONTRACT.md
//
// Expose : http_requests_total, http_request_duration_seconds, auth_failures_total
// + métriques process/nodejs par défaut.
//
// Usage dans app.js :
//   const { metricsMiddleware, metricsHandler, authFailures } = require('./middleware/metrics')
//   app.use(metricsMiddleware)
//   app.get('/metrics', metricsHandler)
//   ... dans la route login en échec : authFailures.inc()
//
// Dépendance :  npm install prom-client

const client = require('prom-client')

const register = new client.Registry()
client.collectDefaultMetrics({ register })

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Nombre total de requêtes HTTP',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
})

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Durée des requêtes HTTP en secondes',
  labelNames: ['method', 'route'],
  registers: [register]
})

const authFailures = new client.Counter({
  name: 'auth_failures_total',
  help: "Nombre total d'échecs d'authentification",
  registers: [register]
})

// Normalise la route pour limiter la cardinalité (/tickets/42 -> /tickets/:id)
function routeOf (req) {
  if (req.route && req.baseUrl !== undefined) return (req.baseUrl || '') + req.route.path
  return req.path.replace(/\/\d+/g, '/:id')
}

function metricsMiddleware (req, res, next) {
  if (req.path === '/metrics') return next()
  const end = httpRequestDuration.startTimer()
  res.on('finish', () => {
    const route = routeOf(req)
    httpRequestsTotal.inc({ method: req.method, route, status_code: res.statusCode })
    end({ method: req.method, route })
  })
  next()
}

async function metricsHandler (req, res) {
  res.set('Content-Type', register.contentType)
  res.end(await register.metrics())
}

module.exports = { metricsMiddleware, metricsHandler, authFailures, register }
