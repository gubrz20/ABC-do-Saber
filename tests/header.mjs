import { createRequire } from 'node:module';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.ABC_PLAYWRIGHT || 'playwright-core');
const browser = await chromium.launch({ headless: true, ...(process.env.ABC_CHROMIUM ? { executablePath: process.env.ABC_CHROMIUM } : {}) });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
const results = [];
function check(condition, label) { assert.ok(condition, label); results.push(label); console.log('PASS', label); }
try {
  await page.goto((process.env.ABC_TEST_URL || 'http://127.0.0.1:4173') + '/#inicio');
  await page.locator('.hero-mascot').waitFor(); await page.evaluate(() => document.fonts.ready);
  check(JSON.stringify(await page.locator('.main-nav a').allTextContents()) === JSON.stringify(['Início', 'Brincar', 'Histórias', 'Progressos']), 'all four navigation labels are visible and preserved');
  check(await page.locator('[data-nav-icon] svg').count() === 4, 'each destination has its own decorative recognizable icon');
  await page.locator('.site-header').screenshot({ path: 'docs/header-desktop.png' });
  for (const width of [1440, 1024, 900, 768, 390, 360, 320]) {
    await page.setViewportSize({ width, height: 900 });
    const metrics = await page.evaluate(() => {
      const rect = selector => { const r = document.querySelector(selector).getBoundingClientRect(); return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width }; };
      return {
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        brand: rect('.brand'), nav: rect('.main-nav'), actions: rect('.header-actions'),
        targets: [...document.querySelectorAll('.main-nav a, #sound-toggle')].map(el => { const r = el.getBoundingClientRect(); return { width: r.width, height: r.height }; }),
      };
    });
    check(!metrics.overflow, `${width}px: no horizontal page overflow`);
    check(metrics.brand.right <= metrics.actions.left && metrics.actions.right <= width, `${width}px: logo and adult/sound controls do not overlap or clip`);
    check(metrics.targets.every(t => t.width >= 56 && t.height >= 56), `${width}px: every child navigation and voice target is at least 56px`);
    check(width > 900 ? metrics.nav.left >= metrics.brand.right && metrics.nav.right <= metrics.actions.left : metrics.nav.top >= Math.max(metrics.brand.bottom, metrics.actions.bottom), `${width}px: navigation uses its intended row without collisions`);
    if (width === 390) await page.locator('.site-header').screenshot({ path: 'docs/header-mobile.png' });
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const [route, label] of [['inicio', 'Início'], ['memoria', 'Brincar'], ['livro-semente', 'Histórias'], ['progressos', 'Progressos']]) {
    await page.evaluate(route => { location.hash = route; }, route);
    await page.waitForFunction(label => document.querySelector('.main-nav [aria-current="page"]')?.textContent === label, label);
    check(await page.locator('.main-nav [aria-current="page"]').count() === 1, `${route}: exactly one correctly selected destination`);
  }
  await page.evaluate(() => { speechSynthesis.speak = () => {}; speechSynthesis.cancel = () => {}; });
  await page.getByRole('button', { name: 'Sem voz. Ativar voz do elefantinho', exact: true }).click();
  check((await page.locator('#sound-toggle').innerText()).includes('Com voz'), 'voice control exposes its enabled state in visible text');
  await page.getByRole('button', { name: 'Com voz. Desativar voz do elefantinho', exact: true }).click();
  check((await page.locator('#sound-toggle').innerText()).includes('Sem voz'), 'voice control exposes its disabled state in visible text');
  await page.locator('.main-nav [data-nav="brincar"]').focus(); await page.keyboard.press('Enter');
  await page.waitForURL('**/#brincar'); check(true, 'navigation works with keyboard activation');
  check(await page.evaluate(() => getComputedStyle(document.querySelector('.main-nav a')).transitionDuration === '0s'), 'reduced-motion preference is respected');
  const colors = await page.evaluate(() => ({ canvas: getComputedStyle(document.body).backgroundColor, rootCanvas: getComputedStyle(document.documentElement).backgroundColor, primary: getComputedStyle(document.querySelector('.main-nav [aria-current="page"]')).backgroundColor, text: getComputedStyle(document.documentElement).color }));
  check(colors.rootCanvas === 'rgb(255, 253, 248)' && colors.primary === 'rgb(47, 99, 191)' && colors.text === 'rgb(36, 53, 87)', 'the warm canvas, elephant blue and navy palette are applied in the browser');
  await writeFile('docs/header-results.json', JSON.stringify({ checks: results.length, results }, null, 2));
  console.log(`PASS ${results.length} header checks`);
} finally { await browser.close(); }
