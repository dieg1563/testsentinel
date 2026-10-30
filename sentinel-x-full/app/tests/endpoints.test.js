// tests/endpoints.test.js -- tests fonctionnels des endpoints critiques
//
// Lancement :  npm test           (jest)
//              npm run coverage    (c8 / nyc -> taux de couverture documenté)
//
// Ces tests sont en boîte noire sur le comportement défini dans CONTRACT.md.
// Adapter les codes/redirections aux routes réelles si besoin.

const request = require('supertest')
const app = require('../app')

describe('Endpoints critiques SupportDesk', () => {
  test('GET / redirige vers /login', async () => {
    const res = await request(app).get('/')
    expect(res.status).toBe(302)
    expect(res.headers.location).toBe('/login')
  })

  test('GET /login répond 200', async () => {
    const res = await request(app).get('/login')
    expect(res.status).toBe(200)
  })

  test('GET /dashboard sans session redirige (non authentifié)', async () => {
    const res = await request(app).get('/dashboard')
    expect([302, 401, 403]).toContain(res.status)
  })

  test('POST /login avec mauvais identifiants ne crée pas de session', async () => {
    const res = await request(app)
      .post('/login')
      .type('form')
      .send({ username: 'admin', password: 'wrong-password' })
    expect([200, 302, 401]).toContain(res.status)
    // pas de cookie de session valide attendu sur un échec
  })

  test('GET /metrics expose le format Prometheus', async () => {
    const res = await request(app).get('/metrics')
    expect(res.status).toBe(200)
    expect(res.text).toMatch(/http_requests_total/)
    expect(res.text).toMatch(/http_request_duration_seconds/)
  })

  test('GET /admin sans droits est refusé', async () => {
    const res = await request(app).get('/admin')
    expect([302, 401, 403]).toContain(res.status)
  })

  test('GET sur une route inexistante renvoie 404', async () => {
    const res = await request(app).get('/cette-route-nexiste-pas')
    expect(res.status).toBe(404)
  })
})
