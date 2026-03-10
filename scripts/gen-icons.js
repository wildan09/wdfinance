const fs = require('fs')
const path = require('path')

const iconsDir = path.join(__dirname, '..', 'public')
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir)
}

// 1x1 transparent PNG base64
const validPng1x1 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="

const buf = Buffer.from(validPng1x1, 'base64')

const files = [
  'favicon.ico',
  'apple-touch-icon.png',
  'pwa-64x64.png',
  'pwa-192x192.png',
  'pwa-512x512.png',
  'maskable-icon-512x512.png'
]

files.forEach(file => {
  fs.writeFileSync(path.join(iconsDir, file), buf)
  console.log('Generated placeholder icon:', file)
})
