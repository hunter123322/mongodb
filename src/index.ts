import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import mongoose, { Schema, Document, Model } from 'mongoose'

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

  console.log('MongoDB connected')
}

interface BeachDocument extends Document {
  slug: string
  title: string
  cover_image: string
  description: string
  category: string[]
  municipality: string
  geo_lat: number
  geo_lng: number
  activity_tags: string[]
  contact_info: {
    phone: string
    email: string
    website: string
  }
  social_links: {
    facebook: string
    instagram: string
  }
  pricing_lowest: number | null
  operating_hours: string
  rating: number | null
  is_premium: boolean
  view_count: number
  fullURLMap?: string
  fileSizeMB: number
  pictureCredits?: string
  creditsName?: string
  createdAt: Date
  updatedAt: Date
}

const BeachesSchema = new Schema<BeachDocument>(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    cover_image: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: [String], required: true },
    municipality: { type: String, required: true },

    geo_lat: { type: Number, default: 13.243772 },
    geo_lng: { type: Number, default: 123.672333 },

    activity_tags: { type: [String], required: true },

    contact_info: {
      phone: { type: String, default: '+63 9000000000' },
      email: { type: String, default: 'albaytourist@gmail.com' },
      website: {
        type: String,
        default: 'https://www.albaytourist.com/beaches',
      },
    },

    social_links: {
      facebook: {
        type: String,
        default:
          'https://www.facebook.com/profile.php?id=61585599752475',
      },
      instagram: {
        type: String,
        default:
          'https://www.facebook.com/profile.php?id=61585599752475',
      },
    },

    pricing_lowest: { type: Number, default: null },
    operating_hours: { type: String, default: '8am-5pm' },
    rating: { type: Number, default: null },
    is_premium: { type: Boolean, default: false },
    view_count: { type: Number, default: 0 },

    fullURLMap: { type: String },
    fileSizeMB: { type: Number, default: 0 },

    pictureCredits: {
      type: String,
      trim: true,
    },

    creditsName: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

const Beach: Model<BeachDocument> =
  mongoose.models.Beach ||
  mongoose.model<BeachDocument>(
    'Beach',
    BeachesSchema,
    'beaches'
  )

app.get('/', (req, res) => {
  res.send('Home')
})

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
      error:
        error instanceof Error
          ? error.message
          : 'Unknown error',
    })
  }
})

app.get('/healthz', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
})

export default app