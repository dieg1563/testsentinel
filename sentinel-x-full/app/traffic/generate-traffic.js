// traffic/generate-traffic.js -- script de trafic réaliste
//
// Sert de référence pour mesurer le taux de faux positifs (étape 3).
// Outil + volume + durée à figer en équipe (cf. rapport de qualification).
//
// Usage :
//   TARGET=http://localhost:3000 DURATION=300 RPS=5 node traffic/generate-traffic.js
//
//   TARGET   : URL de base de l'app (défaut http://localhost:3000)
//   DURATION : durée en secondes (défaut 120)
//   RPS      : requêtes par seconde approximatives (défaut 3)
//   ATTACK_RATIO : fraction de requêtes "anormales" (défaut 0 = trafic normal pur)
//
// Node 18+ (fetch natif). Aucune dépendance.

const TARGET = process.env.TARGET || 'http://localhost:3000'
const DURATION = parseInt(process.env.DURATION || '120', 10)
const RPS = parseInt(process.env.RPS || '3', 10)
const ATTACK_RATIO = parseFloat(process.env.ATTACK_RATIO || '0')

// Parcours "normaux" plausibles d'un utilisateur légitime
const NORMAL = [
  { method: 'GET', path: '/login' },
  { method: 'GET', path: '/kb' },
  { method: 'GET', path: '/dashboard' },
  { method: 'GET', path: '/tickets' },
  { method: 'GET', path: '/profile' },
  { method: 'POST', path: '/login', body: { username: 'user', password: 'correct-horse' } }
]

// Requêtes "anormales" (pour tester que le trafic normal ne les contient pas)
const ABNORMAL = [
  { method: 'GET', path: '/admin' },
  { method: 'POST', path: '/login', body: { username: "admin' OR '1'='1", password: 'x' } },
  { method: 'GET', path: '/tickets?q=1%20UNION%20SELECT%20password%20FROM%20users' }
]

function pick (arr) { return arr[Math.floor(Math.random() * arr.length)] }

async function fire () {
  const scenario = Math.random() < ATTACK_RATIO ? pick(ABNORMAL) : pick(NORMAL)
  const opts = { method: scenario.method, redirect: 'manual' }
  if (scenario.body) {
    opts.headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
    opts.body = new URLSearchParams(scenario.body).toString()
  }
  try {
    await fetch(TARGET + scenario.path, opts)
  } catch (e) { /* app non joignable : on ignore pour ne pas casser la boucle */ }
}

async function main () {
  console.log(`Trafic vers ${TARGET} | ${DURATION}s | ~${RPS} req/s | attaque=${ATTACK_RATIO}`)
  const end = Date.now() + DURATION * 1000
  let count = 0
  while (Date.now() < end) {
    const batch = []
    for (let i = 0; i < RPS; i++) batch.push(fire())
    await Promise.all(batch)
    count += RPS
    await new Promise(r => setTimeout(r, 1000))
  }
  console.log(`Terminé. ~${count} requêtes envoyées.`)
}

main()
