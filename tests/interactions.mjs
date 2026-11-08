import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.ABC_PLAYWRIGHT || 'playwright-core');
const browser=await chromium.launch({headless:true,...(process.env.ABC_CHROMIUM?{executablePath:process.env.ABC_CHROMIUM}:{})});
const base=process.env.ABC_TEST_URL || 'http://127.0.0.1:4173';
const results=[];const errors=[];
const page=await browser.newPage({viewport:{width:390,height:700},reducedMotion:'reduce'});
page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>{Math.random=()=>.99;});
const check=(ok,label)=>{assert.ok(ok,label);results.push(label);console.log('PASS',label);};
async function route(hash){await page.goto(base+'/#'+hash);await page.reload();await page.locator('.game-board').waitFor();await page.evaluate(()=>document.fonts.ready);}
async function stableClick(selector,label){
  const target=page.locator(selector).first();await target.scrollIntoViewIfNeeded();
  await page.evaluate(()=>{window.__stable={board:document.querySelector('.game-board'),guide:document.querySelector('.guide img'),y:scrollY};});
  await target.evaluate(el=>{window.__stable.control=el;window.__stable.keepControl=['train-answer','memory-card','memory-peek','pick-flower','figure-mode','figure-hint','figure-answer','answer'].includes(el.dataset.action);});
  await target.click();await page.waitForTimeout(160);
  const state=await page.evaluate(()=>({board:window.__stable.board===document.querySelector('.game-board'),guide:window.__stable.guide===document.querySelector('.guide img'),delta:Math.abs(scrollY-window.__stable.y),control:!window.__stable.keepControl||window.__stable.control.isConnected}));
  assert.ok(state.board&&state.guide&&state.control,`${label}: existing board and mascot must survive the choice`);
  assert.ok(state.delta<=1,`${label}: scroll moved ${state.delta}px`);
  results.push(`${label}: persistent board, mascot and scroll`);console.log('PASS',results.at(-1));
}
try{
  for(const width of [390,1280]){
    await page.setViewportSize({width,height:700});
    await route('trem');
    await page.evaluate(()=>{window.__speech=[];speechSynthesis.speak=u=>window.__speech.push(u.text);speechSynthesis.cancel=()=>{};});
    await page.getByRole('button',{name:'Sem voz. Ativar voz do elefantinho',exact:true}).click();
    await page.waitForTimeout(150);await page.evaluate(()=>{window.__speech=[]});
    await stableClick('[data-action="train-answer"][data-letter="O"]',`${width}px train incorrect answer`);
    check(await page.evaluate(()=>window.__speech.length===1),'one choice produces one utterance, without restarting the page guide');
    check(await page.locator('.train-model .model-hint').count()===1,'train retry highlights the matching model wagon');
    await stableClick('[data-action="train-answer"][data-letter="E"]',`${width}px train correct answer`);
    check((await page.locator('.ticket-word').innerText()).startsWith('E de elefante'),'train correct answer reveals the matching letter and picture');
    await stableClick('[data-action="next-train"]',`${width}px next train trip`);
    check(await page.locator('.train-model .model-hint').count()===0&&await page.locator('.vowel-collection>span').count()===5,'new trip clears its clue and keeps five progress stamps');

    await route('memoria');
    await stableClick('[data-action="memory-card"][data-index="0"]',`${width}px first memory card`);
    await stableClick('[data-action="memory-peek"]',`${width}px memory peek`);
    check(await page.locator('.memory-card.revealed').count()===6&&await page.locator('.memory-card:not(:disabled)').count()===0,'peeking reveals the board without accepting selections');
    check(await page.locator('.memory-card.matched').count()===0,'peeking does not create pairs');
    await stableClick('[data-action="memory-peek"]',`${width}px finish peeking`);
    check(await page.locator('.memory-card.revealed').count()===1,'finishing peek preserves the original selected card');
    await stableClick('[data-action="memory-card"][data-index="2"]',`${width}px memory mismatch`);
    await stableClick('[data-action="memory-reset"]',`${width}px memory retry`);
    await stableClick('[data-action="memory-card"][data-index="0"]',`${width}px memory select after retry`);
    await stableClick('[data-action="memory-card"][data-index="1"]',`${width}px memory matched pair`);
    check(await page.locator('.memory-card.matched').count()===2,'matching adds only its two cards and the gallery entry');
    await page.locator('[data-action="memory-card"][data-index="2"]').focus();await page.keyboard.press('Enter');
    check(await page.locator('[data-action="memory-card"][data-index="3"]').evaluate(e=>e===document.activeElement),'keyboard continues at the next available memory card');

    await route('jardim');
    await stableClick('[data-action="pick-flower"][data-index="3"]',`${width}px garden incorrect flower`);
    await stableClick('[data-action="pick-flower"][data-index="0"]',`${width}px garden first flower`);
    await stableClick('[data-action="pick-flower"][data-index="1"]',`${width}px garden second flower`);
    await stableClick('[data-action="pick-flower"][data-index="2"]',`${width}px garden third flower`);
    check(await page.locator('.flower-basket>span').count()===3&&await page.locator('.flower-basket .picked').count()===3,'bouquet has exactly three found flowers');
    await stableClick('[data-action="next-garden"]',`${width}px next garden bed`);
    check(await page.locator('.flower-basket>span').count()===3&&await page.locator('.flower-basket .picked').count()===0,'next bed keeps three empty bouquet places');

    await route('figuras');
    await stableClick('[data-action="figure-mode"][data-hint="false"]',`${width}px picture-only mode`);
    await stableClick('[data-action="figure-hint"]',`${width}px reveal picture word clue`);
    check(await page.locator('.figure-word').isVisible(),'word clue reveals the written model');
    await stableClick('[data-action="figure-answer"]:not([data-letter="A"])',`${width}px picture incorrect answer`);
    await stableClick('[data-action="figure-answer"][data-letter="A"]',`${width}px picture correct answer`);
    await stableClick('[data-action="next-figure"]',`${width}px next figure`);

    await route('jogo');
    await stableClick('[data-action="answer"]:not([data-letter="A"])',`${width}px letter incorrect answer`);
    await stableClick('[data-action="answer"][data-letter="A"]',`${width}px letter correct answer`);
    await stableClick('[data-action="next-round"]',`${width}px next letter`);
    await page.locator('[data-action="answer"][data-letter="E"]').focus();await page.keyboard.press('Enter');
    check(await page.locator('[data-action="next-round"]').evaluate(e=>e===document.activeElement),'keyboard moves to the next-step action after a correct answer');
    check(await page.locator('.vowel-collection>span').count()===5,'letter collection retains all five stamps through updates');
  }
  await page.setViewportSize({width:320,height:700});
  const axeSource=await readFile(require.resolve(process.env.ABC_AXE || 'axe-core/axe.min.js'),'utf8');
  for(const hash of ['jogo','memoria','figuras','jardim','trem']){
    await route(hash);
    if(hash==='memoria')await page.getByRole('button',{name:'Espiar cartas',exact:true}).click();
    if(hash==='trem')await page.getByRole('button',{name:'Ver pista',exact:true}).click();
    await page.addScriptTag({content:axeSource});
    const violations=await page.evaluate(async()=>(await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}})).violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})));
    check(violations.length===0,`${hash}: new hints pass automated accessibility checks ${JSON.stringify(violations)}`);
    check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${hash}: no overflow at 320px`);
  }
  check(errors.length===0,`no JavaScript errors: ${errors.join(';')}`);
  await writeFile('docs/interaction-results.json',JSON.stringify({checks:results.length,results,errors},null,2));
  console.log(`PASS ${results.length} activity interaction checks`);
}finally{await browser.close();}
