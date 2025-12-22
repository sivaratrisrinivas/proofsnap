import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

const app = new Hono()

app.use('*', cors())

app.get('/', (c) => c.text('Hello ProofSnap!'))
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }))

export default app
