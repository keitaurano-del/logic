#!/usr/bin/env node
// Increments versionCode in android/app/build.gradle
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const gradlePath = join(__dirname, '..', 'android', 'app', 'build.gradle')

if (!existsSync(gradlePath)) {
  console.error('Error: android/app/build.gradle not found.')
  console.error('Run: npx cap add android && npx cap sync android')
  process.exit(1)
}

let content = readFileSync(gradlePath, 'utf-8')
const match = content.match(/versionCode\s+(\d+)/)
if (!match) {
  console.error('Error: versionCode not found in build.gradle')
  process.exit(1)
}

const current = parseInt(match[1])
const next = current + 1
content = content.replace(/versionCode\s+\d+/, `versionCode ${next}`)
writeFileSync(gradlePath, content, 'utf-8')
console.log(`✓ versionCode: ${current} → ${next}`)
