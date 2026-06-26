#!/usr/bin/env node
import { readFileSync } from 'fs'

let raw = ''
try { raw = readFileSync('/dev/stdin', 'utf8') } catch { process.exit(0) }
let input
try { input = JSON.parse(raw) } catch { process.exit(0) }

const filePath = input?.tool_input?.file_path || ''
const FE_EXTS = /\.(html|css|js|mjs|ts|tsx|jsx|vue|svelte|astro|scss|sass|less)$/i

if (FE_EXTS.test(filePath)) {
  const filename = filePath.split('/').pop()
  process.stdout.write(
    '[modern-web-guidance] Frontend file touched: ' + filename + '\n' +
    'Before adding new UI patterns, search for modern guidance:\n' +
    '  npx -y modern-web-guidance@latest search "<what you want to do>"\n' +
    'Docs: dialogs use <dialog>, modals use popover API, CSS scroll-driven animations over JS.\n'
  )
}
process.exit(0)
