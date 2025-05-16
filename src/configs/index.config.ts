import { readdirSync } from 'fs';

export default readdirSync(__dirname)
  .filter(
    (file) => file.endsWith('.config.js') && file !== 'index.config.js' && !file.includes('.spec.'),
  )
  .map((file) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require(`./${file}`).default;
    if (typeof mod === 'function') return mod;
  })
  .filter(Boolean);
