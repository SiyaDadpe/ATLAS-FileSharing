import dotenv from 'dotenv'
import fs from 'fs'

const envPath = './.env'
if (fs.existsSync(envPath)) {
  console.log(`Loading .env from ${envPath}`)
  dotenv.config({ path: envPath })
} else {
  console.warn(`.env file not found at ${envPath}`)
  dotenv.config()
}

;(async () => {
  const express = (await import('express')).default
  const cors = (await import('cors')).default
  const helmet = (await import('helmet')).default
  const net = (await import('node:net')).default
  const { apiLimiter } = await import('./middleware/rateLimit.js')
  const { errorHandler, notFound } = await import('./middleware/errorHandler.js')
  const vaultRoutes = (await import('./routes/vaultRoutes.js')).default
  const { supabase } = await import('./config/supabase.js')

  const app = express()
  const preferredPort = Number(process.env.PORT) || 5000
  const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173'

  if (!supabase) {
    console.warn('TempVault server started without Supabase config. Create server/.env from server/.env.example to enable vault APIs.')
  }

  app.set('trust proxy', 1)
  app.use(helmet())
  app.use(cors({
    origin: clientOrigin,
    credentials: false,
  }))
  app.use(express.json({ limit: '2mb' }))
  app.use(express.urlencoded({ extended: true }))
  app.use(apiLimiter)

  app.get('/', (req, res) => {
    res.json({ success: true, message: 'TempVault API is running' })
  })

  app.use('/api/vault', vaultRoutes)
  app.use(notFound)
  app.use(errorHandler)

  function isPortFree(port) {
    return new Promise((resolve) => {
      const tester = net.createServer()
        .once('error', () => resolve(false))
        .once('listening', () => {
          tester.close(() => resolve(true))
        })
        .listen(port, '0.0.0.0')
    })
  }

  async function pickPort(startPort) {
    for (let port = startPort; port < startPort + 20; port += 1) {
      if (await isPortFree(port)) return port
    }
    return startPort
  }

  const port = await pickPort(preferredPort)

  app.listen(port, () => {
    if (port !== preferredPort) {
      console.warn(`Port ${preferredPort} was busy, using ${port} instead.`)
    }
    console.log(`TempVault server running on port ${port}`)
  })
})()

