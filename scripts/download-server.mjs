/**
 * Local HTTP server that receives base64-encoded file data from the browser
 * and saves it to ~/Downloads.
 *
 * Run: node scripts/download-server.mjs
 * Then trigger downloads from the browser via JS.
 */
import { createServer } from 'http'
import { writeFileSync } from 'fs'
import { join } from 'path'

const PORT = 7777
const DOWNLOADS = join(process.env.HOME, 'Downloads')

const server = createServer((req, res) => {
  // CORS headers so Gmail page can POST to us
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  if (req.method === 'POST' && req.url === '/save') {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', () => {
      try {
        const { filename, data } = JSON.parse(body)
        const buf = Buffer.from(data, 'base64')
        const filePath = join(DOWNLOADS, filename)
        writeFileSync(filePath, buf)
        console.log(`✅ Saved: ${filename} (${buf.length} bytes)`)
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ ok: true, filename, size: buf.length }))
      } catch (e) {
        console.error(`❌ Error: ${e.message}`)
        res.writeHead(500)
        res.end(JSON.stringify({ ok: false, error: e.message }))
      }
    })
  } else {
    res.writeHead(404)
    res.end()
  }
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Download server listening on http://127.0.0.1:${PORT}`)
  console.log(`Saving files to: ${DOWNLOADS}`)
})
