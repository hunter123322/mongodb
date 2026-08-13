import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

const uri = process.env.MONGODB_URI

if (!uri) {
  throw new Error('MONGODB_URI is not defined')
}

let isConnected = false

async function connectDB() {
  if (isConnected) return

  await mongoose.connect(uri)
  isConnected = true
}

// Beaches Schema
const beachSchema = new mongoose.Schema(
  {},
  {
    collection: 'beaches',
    strict: false,
  }
)

const Beach =
  mongoose.models.Beach || mongoose.model('Beach', beachSchema)

// Home route - HTML
app.get('/', (req, res) => {
  res.type('html').send(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8"/>
        <title>Express on Vercel</title>
        <link rel="stylesheet" href="/style.css" />
      </head>
      <body>
        <nav>
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/api-data">API Data</a>
          <a href="/healthz">Health</a>
          <a href="/db">DB Check</a>
        </nav>
        <h1>Welcome to Express on Vercel 🚀</h1>
        <p>This is a minimal example without a database or forms.</p>
        <img src="/logo.png" alt="Logo" width="120" />
      </body>
    </html>
  `)
})

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'components', 'about.htm'))
})

app.get('/api-data', (req, res) => {
  res.json({
    message: 'Here is some sample API data',
    items: ['apple', 'banana', 'cherry'],
  })
})

// Fetch all beaches
app.get('/db', async (req, res) => {
  try {
    await connectDB()

    const beaches = await Beach.find({}).lean()

    res.status(200).json({
      success: true,
      count: beaches.length,
      data: beaches,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch beaches',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

// Health check
app.get('/healthz', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
})

export default app