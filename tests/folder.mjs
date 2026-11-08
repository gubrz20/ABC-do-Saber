import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const browser = await chromium.launch({ headless: true, ...(process.env.ABC_CHROMIUM ? { executablePath: process.env.ABC_CHROMIUM } : {}) });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const base = process.env.ABC_TEST_URL || pathToFileURL(resolve('index.html')).href;
  for (const route of ['inicio', 'jogo', 'memoria', 'figuras', 'jardim', 'trem', 'historias', 'progressos']) {
    await page.goto(base + '#' + route);
    await page.locator('#conteudo > *').first().waitFor();
    assert.ok((await page.locator('#conteudo').innerText()).length > 50, route);
  }
  await page.goto(base + '#trem');
  const choice = page.locator('[data-action="train-answer"]').first();
  await choice.waitFor();
  await page.evaluate(() => { window.savedBoard = document.querySelector('.game-board'); });
  await choice.click();
  assert.ok(await page.evaluate(() => window.savedBoard === document.querySelector('.game-board')));
  assert.deepEqual(errors, []);
  console.log('PASS: oito telas carregam e escolher uma resposta preserva o tabuleiro, sem erros JavaScript.');
} finally { await browser.close(); }
