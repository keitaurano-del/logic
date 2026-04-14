#!/usr/bin/env node
// Increments versionCode in android/app/build.gradle
const fs = require('fs')
const path = require('path')

const gradlePath = path.join(__dirname, '..', 'android', 'app', 'build.gradle')

if (!fs.existsSync(gradlePath)) {
  console.error('Error: android/app/build.gradle not found.')
  console.error('Run: npx cap add android && npx cap sync android')
  process.exit(1)
}

let content = fs.readFileSync(gradlePath, 'utf-8')
const match = content.match(/versionCode\s+(\d+)/)
if (!match) {
  console.error('Error: versionCode not found in build.gradle')
  process.exit(1)
}

const current = parseInt(match[1])
const next = current + 1
content = content.replace(/versionCode\s+\d+/, `versionCode ${next}`)
fs.writeFileSync(gradlePath, content, 'utf-8')
console.log(`✓ versionCode: ${current} → ${next}`)
