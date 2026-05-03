#!/usr/bin/env node
// Bumps CFBundleShortVersionString (marketing version) in ios/App/App/Info.plist
// Usage: node scripts/bump-ios-version.js [patch|minor|major|<x.y.z>]
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const plistPath = join(__dirname, '..', 'ios', 'App', 'App', 'Info.plist')

if (!existsSync(plistPath)) {
  console.error('Error: ios/App/App/Info.plist not found.')
  console.error('Run: npx cap add ios && npx cap sync ios')
  process.exit(1)
}

let plist = readFileSync(plistPath, 'utf-8')
const re = /<key>CFBundleShortVersionString<\/key>\s*<string>([^<]+)<\/string>/
const match = plist.match(re)
if (!match) {
  console.error('Error: CFBundleShortVersionString not found in Info.plist')
  process.exit(1)
}

const current = match[1].trim()
const arg = process.argv[2] || 'patch'

let next
if (/^\d+\.\d+\.\d+$/.test(arg)) {
  next = arg
} else {
  // Capacitor inserts $(MARKETING_VERSION) by default; resolve fallback to 1.0.0
  const baseStr = current.startsWith('$') ? '1.0.0' : current
  const [maj, min, pat] = baseStr.split('.').map((n) => parseInt(n) || 0)
  if (arg === 'major') next = `${maj + 1}.0.0`
  else if (arg === 'minor') next = `${maj}.${min + 1}.0`
  else next = `${maj}.${min}.${pat + 1}`
}

plist = plist.replace(
  re,
  `<key>CFBundleShortVersionString</key>\n\t<string>${next}</string>`,
)
writeFileSync(plistPath, plist, 'utf-8')
console.log(`✓ CFBundleShortVersionString: ${current} → ${next}`)
console.log('Note: CFBundleVersion (build number) is auto-incremented by fastlane in CI.')
