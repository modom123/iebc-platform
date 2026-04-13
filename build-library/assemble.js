#!/usr/bin/env node
/**
 * IEBC Build Library — Assembly Script
 * Usage: node assemble.js --config=B --client=AcmeCorp --out=../builds/acme
 *
 * Assembles a new project from numbered components in manifest.json
 */

const fs = require('fs')
const path = require('path')

const args = Object.fromEntries(
  process.argv.slice(2).map(a => a.replace('--', '').split('='))
)

const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'manifest.json'), 'utf8'))
const config = args.config || 'B'
const clientName = args.client || 'NewClient'
const outDir = args.out || path.join(__dirname, '../builds', clientName.toLowerCase().replace(/\s+/g, '-'))

const selectedConfig = manifest.configs[config]
if (!selectedConfig) {
  console.error(`Config "${config}" not found. Available: ${Object.keys(manifest.configs).join(', ')}`)
  process.exit(1)
}

console.log(`\n🏗  Building: ${selectedConfig.name}`)
console.log(`📦  Client: ${clientName}`)
console.log(`📁  Output: ${outDir}`)
console.log(`🔧  Components: ${selectedConfig.components.join(', ')}\n`)

const sourceRoot = path.join(__dirname, '..')
fs.mkdirSync(outDir, { recursive: true })

let assembled = []
let missing = []

for (const compNum of selectedConfig.components) {
  const comp = manifest.components[compNum]
  if (!comp) { missing.push(compNum); continue }

  for (const srcPath of comp.paths) {
    const full = path.join(sourceRoot, srcPath)
    const dest = path.join(outDir, srcPath)
    if (fs.existsSync(full)) {
      fs.mkdirSync(path.dirname(dest), { recursive: true })
      if (fs.statSync(full).isDirectory()) {
        copyDir(full, dest)
      } else {
        fs.copyFileSync(full, dest)
      }
      assembled.push(`  ✓ [${compNum.padStart(2,'0')}] ${comp.name}`)
    } else {
      missing.push(`${compNum} (${srcPath})`)
    }
  }
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true })
  for (const f of fs.readdirSync(src)) {
    const s = path.join(src, f), d = path.join(dest, f)
    fs.statSync(s).isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d)
  }
}

console.log('Assembled components:')
console.log(assembled.join('\n'))
if (missing.length) console.log(`\n⚠  Missing: ${missing.join(', ')}`)

// Write client config file
fs.writeFileSync(path.join(outDir, 'CLIENT.json'), JSON.stringify({
  client: clientName,
  config,
  configName: selectedConfig.name,
  components: selectedConfig.components,
  builtAt: new Date().toISOString(),
  nextSteps: [
    '1. Set env vars: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, ANTHROPIC_API_KEY, STRIPE_SECRET_KEY',
    '2. Run schemas in Supabase SQL Editor (components 91-98)',
    '3. Create storage bucket "documents" in Supabase Dashboard > Storage',
    '4. Deploy: vercel --prod',
  ]
}, null, 2))

console.log(`\n✅  Build complete → ${outDir}`)
console.log('📋  Next steps saved to CLIENT.json\n')
