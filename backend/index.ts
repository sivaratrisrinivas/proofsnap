import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { mintMedia } from './src/controllers/mintController'

const app = new Hono()

app.use('*', cors())

app.get('/', (c) => c.text('Hello ProofSnap!'))
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }))

// NEW: Mint endpoint
app.post('/api/v1/mint', mintMedia)

export default app
