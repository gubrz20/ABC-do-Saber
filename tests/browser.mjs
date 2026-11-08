import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import { writeFile, mkdir, readFile } from 'node:fs/promises';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.ABC_PLAYWRIGHT || 'playwright-core');
const base=process.env.ABC_TEST_URL || 'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true,...(process.env.ABC_CHROMIUM?{executablePath:process.env.ABC_CHROMIUM}:{})});
const errors=[];let checks=0;const results=[];
const check=(condition,label)=>{assert.ok(condition,label);checks++;results.push(label);console.log('PASS',label);};
const page=await browser.newPage({viewport:{width:1440,height:1100},reducedMotion:'reduce'});
page.on('pageerror',e=>errors.push(e.message));
async function route(p,hash){await p.goto(base+'/#'+hash);await p.waitForSelector('main h1');await p.evaluate(()=>document.fonts.ready);}
async function axe(p,label){
  const source=await readFile(require.resolve(process.env.ABC_AXE || 'axe-core/axe.min.js'),'utf8');
  await p.addScriptTag({content:source});
  const violations=await p.evaluate(async()=> (await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}})).violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)})));
  check(violations.length===0,`${label}: no automated WCAG A/AA violations (${JSON.stringify(violations)})`);
}
try{
  await mkdir(new URL('../docs/',import.meta.url),{recursive:true});
  if(!process.env.ABC_ONLY_ACCOUNTS){
  await route(page,'inicio');
  check(await page.locator('.hero-mascot').evaluate(i=>i.complete&&i.naturalWidth>0),'generated elephant asset loads');
  check(await page.evaluate(()=>document.fonts.check('700 20px "Baloo 2"')&&document.fonts.check('400 16px Nunito')),'self-hosted heading and body fonts load');
  check(await page.locator('#sound-toggle').getAttribute('aria-pressed')==='false','voice starts off');
  await page.screenshot({path:'docs/inicio-desktop.png',fullPage:true});
  await axe(page,'Home desktop');
  await page.getByRole('link',{name:'Progressos',exact:true}).click();
  await page.waitForSelector('.progress-overview');
  check(await page.locator('.achievement-card.earned').count()===0&&await page.locator('.achievement-card').count()===10,'progress starts with ten unearned achievements');
  check(await page.getByRole('progressbar').getAttribute('value')==='0','activity progress starts at zero');
  await axe(page,'Progress before completing an activity');
  await page.screenshot({path:'docs/progressos-vazio-desktop.png',fullPage:true});
  await route(page,'inicio');
  await page.evaluate(()=>{window.__speechCalls=[];speechSynthesis.speak=u=>window.__speechCalls.push({text:u.text,lang:u.lang});speechSynthesis.cancel=()=>{};});
  await page.getByRole('button',{name:'Ouvir o elefantinho',exact:true}).click();
  check(await page.evaluate(()=>window.__speechCalls.length===1&&window.__speechCalls[0].lang==='pt-BR'&&window.__speechCalls[0].text.includes('elefantinho')),'explicit listening action requests the elephant guidance in Brazilian Portuguese');
  await page.getByRole('button',{name:'Com voz. Desativar voz do elefantinho',exact:true}).click();
  check(await page.locator('#sound-toggle').getAttribute('aria-pressed')==='false','voice can be disabled before activities');
  await page.getByRole('link',{name:'Vamos brincar',exact:true}).first().click();
  await page.getByRole('link',{name:/5 descobertas/}).click();
  await page.waitForSelector('.letter-model');
  await page.getByRole('button',{name:'Ver contorno',exact:true}).click();
  check(await page.locator('.letter-model').evaluate(e=>e.classList.contains('outline-model')),'letter hint highlights the model contour without giving away an option');
  await page.getByRole('button',{name:'Ver contorno',exact:true}).click();
  const target=await page.locator('.letter-model').innerText();
  const wrong=page.locator(`.letter-choice:not([data-letter="${target}"])`).first();
  await wrong.click();
  check((await page.locator('#answer-feedback').innerText()).includes('Vamos olhar de novo'),'wrong answer retains round and provides gentle hint');
  check(await page.locator('.letter-model').innerText()===target,'no lives or round lost after a different answer');
  await page.getByRole('button',{name:'Letra '+target,exact:true}).focus();
  await page.keyboard.press('Enter');
  check(await page.locator('.discovery-reveal').isVisible(),'correct answer reveals matching image and word');
  check(await page.evaluate(()=>JSON.parse(sessionStorage.getItem('abc_exploration')||'[]').length===0),'answering a single round does not prematurely earn activity achievements');
  await page.screenshot({path:'docs/jogo-desktop.png',fullPage:true});
  await axe(page,'Game success feedback');
  await page.getByRole('button',{name:/Próxima letra/}).click();
  for(let i=1;i<5;i++){
    const letter=await page.locator('.letter-model').innerText();
    await page.getByRole('button',{name:'Letra '+letter,exact:true}).click();
    await page.getByRole('button',{name:i===4?/Concluir a brincadeira/:/Próxima letra/}).click();
  }
  await page.waitForURL('**/#fim-jogo');
  await page.waitForFunction(()=>JSON.parse(sessionStorage.getItem('abc_exploration')||'[]').includes('vogais'));
  check(true,'five game rounds complete without audio and create actual discovery');
  check(await page.locator('.earned-badge').count()===2,'first completed game announces First step and Friend of vowels achievements');
  await page.getByRole('link',{name:'Ver progressos',exact:true}).click();
  await page.waitForSelector('.progress-overview');
  check(await page.locator('.achievement-card.earned').count()===2,'one activity earns two achievements');
  check(await page.getByRole('progressbar').getAttribute('value')==='1'&&await page.getByRole('progressbar').getAttribute('max')==='8','one of eight activities is reflected in the progress bar');
  check(await page.getByRole('link',{name:'Progressos',exact:true}).getAttribute('aria-current')==='page','new tab is marked as current');
  await page.screenshot({path:'docs/progressos-parcial-desktop.png',fullPage:true});
  await route(page,'fim-jogo');
  await page.getByRole('button',{name:/De novo/}).click();
  check((await page.locator('.letter-model').innerText())==='A','replay starts at first round');
  await route(page,'livro');
  check(await page.getByRole('button',{name:'Anterior',exact:true}).isDisabled(),'first story page has honest previous boundary');
  await page.screenshot({path:'docs/historia-desktop.png',fullPage:true});
  await axe(page,'Story reader');
  for(let i=0;i<4;i++)await page.getByRole('button',{name:/Próxima página/}).click();
  await page.getByRole('button',{name:/Concluir a história/}).click();
  await page.waitForURL('**/#fim-historia');
  await page.waitForFunction(()=>JSON.parse(sessionStorage.getItem('abc_exploration')||'[]').includes('casa-das-vogais'));
  check(await page.locator('.earned-badge').count()===2,'finishing the original story unlocks its badge and the original explorer achievement');
  await route(page,'progressos');
  check(await page.locator('.achievement-card.earned').count()===4,'original game and story preserve the original four achievements');
  check(await page.getByRole('progressbar').getAttribute('value')==='2','two original activities count toward the expanded progress');
  const saved=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('abc_exploration')));
  check(new Set(saved).size===2,'discoveries are unique');
  await page.screenshot({path:'docs/progressos-desktop.png',fullPage:true});
  await axe(page,'Progress and earned achievements');
  await route(page,'fim-historia');
  await page.getByRole('button',{name:/De novo/}).click();
  for(let i=0;i<4;i++)await page.getByRole('button',{name:/Próxima página/}).click();
  await page.getByRole('button',{name:/Concluir a história/}).click();
  await page.waitForFunction(()=>document.querySelector('#save-state')?.textContent.includes('Progresso salvo'));
  check(await page.locator('.earned-badge').count()===0,'replaying a completed activity does not reaward achievements');
  await route(page,'descobertas');
  check(await page.locator('h1').innerText()==='Meus progressos','old Discoveries bookmark opens Progress');
  await route(page,'brincar');
  check(await page.locator('.catalog-grid .catalog-feature').count()===5,'game tab contains all five playable games');
  await page.screenshot({path:'docs/jogos-catalogo.png',fullPage:true});await axe(page,'Expanded game catalog');
  await route(page,'historias');
  check(await page.locator('.catalog-grid .catalog-feature').count()===3,'story tab contains the original and exactly two new stories');
  await page.screenshot({path:'docs/historias-catalogo.png',fullPage:true});await axe(page,'Expanded story catalog');

  // Stable shuffle fixture: A A E E I I. Every interaction still uses the public UI.
  await page.addInitScript(()=>{Math.random=()=>.99;});
  await route(page,'memoria');await page.reload();await page.locator('.memory-grid').waitFor();
  await page.locator('.memory-card[data-index="0"]').focus();await page.keyboard.press('Enter');
  await page.locator('.memory-card[data-index="2"]').click();
  check((await page.locator('.memory-feedback').innerText()).includes('diferentes'),'memory mismatch offers a gentle retry without a timer');
  check(await page.evaluate(()=>!JSON.parse(sessionStorage.getItem('abc_exploration')).includes('memoria-vogais')),'a mismatched pair does not grant a completion');
  await page.getByRole('button',{name:'Virar as cartas e tentar outro par',exact:true}).click();
  for(const pair of [[0,1],[2,3],[4,5]])for(const index of pair)await page.locator(`.memory-card[data-index="${index}"]`).click();
  check(await page.locator('.memory-card.matched').count()===6,'all three vowel pairs stay visible after matching');
  await page.screenshot({path:'docs/memoria-desktop.png',fullPage:true});await axe(page,'Memory game completed pairs');
  await page.getByRole('button',{name:/Concluir a brincadeira/}).click();
  await page.waitForFunction(()=>JSON.parse(sessionStorage.getItem('abc_exploration')).includes('memoria-vogais'));
  check((await page.locator('.earned-badge').innerText()).includes('Boa memória'),'memory game earns its own achievement');

  await route(page,'memoria');
  await page.getByRole('button',{name:'5 pares',exact:true}).click();
  check(await page.locator('.memory-card').count()===10,'expanded memory includes all five vowel pairs');
  for(let i=0;i<10;i++)await page.locator(`.memory-card[data-index="${i}"]`).click();
  check(await page.locator('.pair-gallery>span').count()===5,'five-pair memory reveals each corresponding picture and word');
  await page.getByRole('button',{name:/Concluir a brincadeira/}).click();
  await page.waitForFunction(()=>document.querySelector('#save-state')?.textContent.includes('Progresso salvo'));
  check(await page.locator('.earned-badge').count()===0,'five-pair replay does not grant a duplicate badge');
  await route(page,'figuras');
  await page.getByRole('button',{name:'Só a figura',exact:true}).click();
  check(await page.locator('.figure-word').isHidden(),'picture-only mode hides the word but keeps adult-readable instructions');
  await page.getByRole('button',{name:'Com palavra',exact:true}).click();
  const figureTarget=await page.locator('.figure-word').innerText();
  await page.locator('.letter-choice:not([data-letter="A"])').first().click();
  check((await page.locator('#figure-feedback').innerText()).includes('Vamos olhar de novo'),'figure game explains a different answer without moving ahead');
  check(await page.locator('.figure-word').innerText()===figureTarget,'figure game keeps the current word after a different answer');
  for(let i=0;i<5;i++){
    const firstLetter=(await page.locator('.figure-word').innerText()).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s/g,'')[0];
    await page.getByRole('button',{name:'Letra '+firstLetter,exact:true}).click();
    if(i===0){await page.screenshot({path:'docs/figuras-desktop.png',fullPage:true});await axe(page,'Letter and picture game');}
    await page.getByRole('button',{name:i===4?/Concluir a brincadeira/:/Próxima figura/}).click();
  }
  await page.waitForFunction(()=>JSON.parse(sessionStorage.getItem('abc_exploration')).includes('letras-figuras'));
  check((await page.locator('.earned-badge').innerText()).includes('Letras e figuras'),'five picture rounds earn the correct separate achievement');

  await route(page,'livro-semente');
  await page.evaluate(()=>{window.__newStorySpeech=[];speechSynthesis.speak=u=>window.__newStorySpeech.push(u.text);speechSynthesis.cancel=()=>{};});
  await page.getByRole('button',{name:'Ouvir esta página',exact:true}).click();
  check(await page.evaluate(()=>window.__newStorySpeech[0].includes('semente no jardim')),'new story narration uses the current story and page');
  await page.getByRole('button',{name:'Com voz. Desativar voz do elefantinho',exact:true}).click();
  for(let i=0;i<2;i++)await page.getByRole('button',{name:/Próxima página/}).click();
  await route(page,'livro-pipa');
  check((await page.locator('.page-counter').innerText()).startsWith('1'),'a different book starts at its own first scene');
  check(await page.evaluate(()=>!JSON.parse(sessionStorage.getItem('abc_exploration')).some(id=>['elefantinho-semente','pipa-amizade'].includes(id))),'partly reading either new story awards neither completion');
  await route(page,'livro-semente');
  check((await page.locator('.page-counter').innerText()).startsWith('3'),'returning to a book preserves only that book\'s current page');
  for(let i=0;i<2;i++)await page.getByRole('button',{name:/Próxima página/}).click();
  await page.screenshot({path:'docs/historia-semente.png',fullPage:true});await axe(page,'Elephant and seed reader');
  await page.getByRole('button',{name:/Concluir a história/}).click();
  await page.waitForFunction(()=>JSON.parse(sessionStorage.getItem('abc_exploration')).includes('elefantinho-semente'));
  check((await page.locator('.earned-badge').innerText()).includes('Amigo do jardim'),'seed story earns only its corresponding new badge');
  await route(page,'livro-pipa');
  for(let i=0;i<4;i++)await page.getByRole('button',{name:/Próxima página/}).click();
  await page.screenshot({path:'docs/historia-pipa.png',fullPage:true});await axe(page,'Friendship kite reader');
  await page.getByRole('button',{name:/Concluir a história/}).click();
  await page.waitForFunction(()=>JSON.parse(sessionStorage.getItem('abc_exploration')).includes('pipa-amizade'));
  await route(page,'progressos');
  check(await page.getByRole('progressbar').getAttribute('value')==='6'&&await page.getByRole('progressbar').getAttribute('max')==='8','six legacy activities remain completed out of eight');
  check(await page.locator('.achievement-card.earned').count()===8,'four new activities add four badges and preserve the original four');
  await page.screenshot({path:'docs/progressos-desktop.png',fullPage:true});await axe(page,'Six legacy activities and eight achievements');
  await route(page,'jardim');
  const gardenTarget=await page.locator('.seed-model').innerText();
  const wrongFlower=page.locator('.flower-tile').filter({hasText: gardenTarget==='A'?'E':'A'}).first();
  await wrongFlower.click();
  check(await page.locator('.flower-tile.found').count()===0,'wrong flower does not count and gives a visual retry');
  check((await page.locator('.game-feedback').innerText()).includes('outra letra'),'garden explains how to try again');
  await page.locator('.flower-tile').filter({hasText:gardenTarget}).first().focus();await page.keyboard.press('Enter');
  check(await page.locator('.flower-tile.found').count()===1,'garden supports keyboard selection and marks one found flower');
  await route(page,'trem');
  check(await page.locator('.missing-wagon').innerText()==='?','another game opens with independent unsolved state');
  await route(page,'jardim');
  check(await page.locator('.flower-tile.found').count()===1,'returning to garden preserves its own current canteiro');
  for(let round=0;round<5;round++){
    const target=await page.locator('.seed-model').innerText();
    while(await page.locator('.flower-tile.found').count()<3){
      await page.locator('.flower-tile:not(:disabled)').filter({hasText:target}).first().click();
    }
    check(await page.locator('.flower-tile.found').count()===3,`garden round ${round+1}: three distinct target flowers required`);
    if(round===0){await page.screenshot({path:'docs/jardim-desktop.png',fullPage:true});await axe(page,'Garden with found flowers');}
    await page.getByRole('button',{name:round===4?/Concluir a brincadeira/:/Próximo canteiro/}).click();
  }
  await page.waitForFunction(()=>JSON.parse(sessionStorage.getItem('abc_exploration')).includes('jardim-letras'));
  check((await page.locator('.earned-badge').innerText()).includes('Jardineiro das letras'),'completed garden earns its own badge');
  await route(page,'trem');
  for(let round=0;round<5;round++){
    const target=await page.locator('.train-model .train-wagon').nth(await page.locator('.train-your .train-wagon').evaluateAll(els=>els.findIndex(e=>e.classList.contains('missing-wagon')))).innerText();
    if(round===0){
      await page.locator(`.train-options .letter-choice:not([data-letter="${target}"])`).first().click();
      check(await page.locator('.missing-wagon').innerText()==='?','incorrect train choice keeps the same gap and trip');
      check((await page.locator('.game-feedback').innerText()).includes('modelo'),'train retry refers to the visible model');
    }
    await page.getByRole('button',{name:'Letra '+target,exact:true}).click();
    check((await page.locator('.missing-wagon').innerText()).trim()===target,`trip ${round+1}: correct letter is placed in the wagon`);
    if(round===0){await page.screenshot({path:'docs/trem-desktop.png',fullPage:true});await axe(page,'Train success');}
    await page.getByRole('button',{name:round===4?/Concluir a brincadeira/:/Próxima viagem/}).click();
  }
  await page.waitForFunction(()=>JSON.parse(sessionStorage.getItem('abc_exploration')).includes('trem-vogais'));
  check((await page.locator('.earned-badge').innerText()).includes('Maquinista das vogais'),'five completed trips earn the train badge');
  await route(page,'progressos');
  check(await page.getByRole('progressbar').getAttribute('value')==='8'&&await page.locator('.achievement-card.earned').count()===10,'all eight activities unlock ten achievements');
  await page.screenshot({path:'docs/progressos-completo.png',fullPage:true});await axe(page,'Eight activities and ten achievements');
  await route(page,'concluido/jardim-letras');await page.getByRole('button',{name:/De novo/}).click();
  check(await page.locator('.flower-tile.found').count()===0&&await page.locator('.seed-model').innerText()==='A','garden replay resets all canteiros');
  await route(page,'concluido/trem-vogais');await page.getByRole('button',{name:/De novo/}).click();
  check(await page.locator('.missing-wagon').innerText()==='?'&&(await page.locator('.pair-count').innerText()).includes('1 de 5'),'train replay resets all trips');
  await route(page,'adultos');
  check(await page.getByRole('button',{name:'Entrar',exact:true}).isDisabled(),'unconfigured cloud accounts cannot submit pretend credentials');
  await axe(page,'Adult login');
  await page.screenshot({path:'docs/adultos-desktop.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});
  for(const hash of ['inicio','brincar','jogo','memoria','figuras','jardim','trem','historias','livro','livro-semente','livro-pipa','progressos','adultos','cadastro','recuperar','nao-existe']){
    await route(page,hash);
    check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`390px: ${hash} has no horizontal overflow`);
    if(['inicio','jogo','memoria','figuras','jardim','trem','livro-semente','livro-pipa','progressos'].includes(hash))await page.screenshot({path:`docs/${hash}-mobile.png`,fullPage:true});
  }
  await route(page,'progressos');await axe(page,'Progress narrow');
  await route(page,'inicio');await axe(page,'Home narrow');
  await page.setViewportSize({width:640,height:450});
  await route(page,'livro');check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'200% equivalent viewport retains document scrolling');
  await page.keyboard.press('Tab');check(await page.evaluate(()=>document.activeElement!==document.body),'keyboard focus reaches an interactive control');
  check(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollbarColor!=='auto'),'global scrollbar uses theme tokens');
  }

  // Provider fixtures exercise UI/transport only. Database authorization is tested independently.
  const account=await browser.newPage({viewport:{width:1280,height:1000},reducedMotion:'reduce'});account.on('pageerror',e=>errors.push(e.message));
  await account.route('**/config.js',r=>r.fulfill({contentType:'application/javascript',body:'window.ABC_CONFIG={supabaseUrl:"https://fixture.supabase.co",supabasePublishableKey:"sb_publishable_fixture"};'}));
  let adultRole='parent',children=[],grants=[],failLogin=false,failSave=false,childCompleted=[];
  const requests=[];
  await account.route('https://fixture.supabase.co/**',async r=>{
    const req=r.request(),url=new URL(req.url()),name=url.pathname.split('/').pop();
    const cors={'access-control-allow-origin':'*','access-control-allow-headers':'apikey,content-type,authorization','access-control-allow-methods':'POST,GET,PUT,OPTIONS'};
    if(req.method()==='OPTIONS')return r.fulfill({status:204,headers:cors,body:''});
    requests.push({name,headers:req.headers(),body:req.postDataJSON()});
    const data=req.postDataJSON()||{};
    const ok=(body)=>r.fulfill({status:200,contentType:'application/json',headers:cors,body:JSON.stringify(body)});
    if(url.pathname==='/auth/v1/token'){
      if(failLogin)return r.fulfill({status:400,contentType:'application/json',headers:cors,body:JSON.stringify({error_code:'invalid_credentials'})});
      adultRole=data.email.startsWith('teacher')?'teacher':'parent';return ok({access_token:'ADULT_FIXTURE_JWT'});
    }
    if(name==='dashboard_data')return ok({adult:{id:'adult',name:'Adulto de teste',role:adultRole,school:'Escola de Teste'},children,grants});
    if(name==='create_child'){children.push({id:'child-1',name:data.p_name,avatar:data.p_avatar,completed:[]});return ok('child-1');}
    if(name==='preview_invite')return ok({name:'Professor de teste',school:'Escola de Teste',email:'teacher@example.test'});
    if(name==='accept_invite'){grants=[{id:'grant-1',teacher_name:'Professor de teste',school:'Escola de Teste',child_name:children[0].name}];return ok('grant-1');}
    if(name==='revoke_grant'){grants=[];return ok(null);}
    if(name==='create_invite')return ok({code:'0123456789ABCDEF'});
    if(name==='start_child_session')return ok({token:'CHILD_SCOPED_FIXTURE',child:children[0],completed:childCompleted});
    if(name==='child_status')return ok({completed:childCompleted});
    if(name==='complete_activity'){
      if(failSave)return r.fulfill({status:503,contentType:'application/json',headers:cors,body:JSON.stringify({message:'temporarily unavailable'})});
      childCompleted=[...new Set([...childCompleted,data.p_activity])];return ok({completed:childCompleted});
    }
    return ok({});
  });
  await route(account,'adultos');
  await account.getByRole('button',{name:'Entrar',exact:true}).click();
  check(await account.locator('#email').getAttribute('aria-invalid')==='true','invalid form associates error and focuses field');
  await account.getByLabel('E-mail',{exact:true}).fill('family@example.test');
  await account.getByLabel('Senha',{exact:true}).fill('a-long-test-password');
  await account.getByRole('button',{name:'Mostrar senha',exact:true}).click();
  check(await account.locator('#password').getAttribute('type')==='text','password reveal works');
  failLogin=true;await account.getByRole('button',{name:'Entrar',exact:true}).click();
  await account.waitForFunction(()=>document.querySelector('.form-error')?.textContent.includes('incorretos'),null,{timeout:15000}).catch(async e=>{console.log('LOGIN DEBUG',await account.locator('.form-error').innerText(),requests.map(r=>r.name),errors);throw e;});
  check(await account.locator('#email').inputValue()==='family@example.test','login failure preserves input');
  failLogin=false;await account.getByRole('button',{name:'Entrar',exact:true}).click();await account.waitForURL('**/#painel');
  await account.getByRole('button',{name:'+ Novo perfil',exact:true}).click();
  await account.getByLabel('Nome de exibição',{exact:true}).fill('<Bia>');
  await account.getByRole('button',{name:'Criar perfil',exact:true}).click();
  await account.waitForSelector('.child-card');
  check((await account.locator('.child-card h3').innerText())==='<Bia>','child display name safely renders literal markup');
  await account.getByLabel('Código do convite',{exact:true}).fill('0123456789ABCDEF');
  await account.getByRole('button',{name:'Conferir convite',exact:true}).click();
  await account.waitForSelector('#grant-child');
  check((await account.getByRole('dialog').innerText()).includes('teacher@example.test'),'parent sees teacher identity before authorizing');
  await account.locator('#grant-child').focus();await account.keyboard.press('ArrowDown');await account.keyboard.press('Escape');
  // Escape may close native select; reopen dialog only if browser closed it too.
  if(!(await account.getByRole('dialog').isVisible()))await account.getByRole('button',{name:'Conferir convite',exact:true}).click();
  await account.getByRole('button',{name:'Autorizar acesso',exact:true}).click();
  await account.waitForSelector('.grant-row');
  await account.getByRole('button',{name:'Revogar acesso',exact:true}).click();
  await account.getByRole('dialog').getByRole('button',{name:'Voltar',exact:true}).click();
  check(await account.evaluate(()=>document.activeElement.textContent==='Revogar acesso'),'cancelled modal restores initiating focus');
  await account.getByRole('button',{name:'Revogar acesso',exact:true}).click();
  await account.getByRole('dialog').getByRole('button',{name:'Revogar acesso',exact:true}).click();
  await account.waitForFunction(()=>!document.querySelector('.grant-row'));
  check(true,'family can revoke teacher access');
  await axe(account,'Family dashboard');
  await account.getByRole('button',{name:'Sair da conta',exact:true}).click();await account.waitForURL('**/#adultos');
  await account.getByLabel('E-mail',{exact:true}).fill('teacher@example.test');await account.getByLabel('Senha',{exact:true}).fill('a-long-test-password');
  await account.getByRole('button',{name:'Entrar',exact:true}).click();await account.waitForURL('**/#painel');
  await account.getByRole('button',{name:'Gerar convite',exact:true}).click();
  await account.waitForSelector('.invite-code');
  check((await account.locator('.invite-code').innerText())==='0123456789ABCDEF','teacher creates shareable invitation');
  await account.getByRole('button',{name:/Abrir para brincar/}).click();
  await account.getByRole('dialog').getByRole('button',{name:'Abrir para brincar',exact:true}).click();
  await account.waitForURL('**/#inicio');
  check(!(await account.evaluate(()=>JSON.stringify({...localStorage,...sessionStorage}))).includes('ADULT_FIXTURE_JWT'),'adult JWT never reaches persistent browser storage');
  await account.getByRole('link',{name:'Área dos adultos',exact:true}).click();
  await account.waitForSelector('dialog[open]');
  check((await account.getByRole('dialog').innerText()).includes('precisará entrar novamente'),'child cannot return directly to adult area');
  await account.getByRole('dialog').getByRole('button',{name:'Voltar',exact:true}).click();
  await account.evaluate(()=>location.hash='livro');
  for(let i=0;i<4;i++)await account.getByRole('button',{name:/Próxima página/}).click();
  failSave=true;await account.getByRole('button',{name:/Concluir a história/}).click();
  await account.getByRole('button',{name:'Tentar guardar de novo',exact:true}).waitFor();
  check(true,'cloud save failure leaves a persistent retry action');
  check(await account.locator('.earned-badge').count()===0,'a failed cloud save awards no achievements');
  failSave=false;await account.getByRole('button',{name:'Tentar guardar de novo',exact:true}).click();
  await account.waitForFunction(()=>document.querySelector('#save-state')?.textContent.includes('Progresso salvo no seu perfil'));
  check(await account.locator('.earned-badge').count()===2,'a successful retry awards exactly the achievements earned by that child');
  const scopedRequests=requests.filter(r=>['complete_activity','child_status'].includes(r.name));
  check(scopedRequests.length>0&&scopedRequests.every(r=>!r.headers.authorization),'child API traffic contains no adult authentication token');
  await account.getByRole('button',{name:'Encerrar e trocar de criança',exact:true}).click();
  await account.getByRole('dialog').getByRole('button',{name:'Encerrar sessão',exact:true}).click();
  await account.waitForURL('**/#adultos');
  check(await account.evaluate(()=>sessionStorage.getItem('abc_child_session'))===null,'ending session clears child profile from shared browser tab');
  check(errors.length===0,`no browser JavaScript errors (${errors.join(';')})`);
  await writeFile('docs/browser-results.json',JSON.stringify({checks,results,errors,provider:'local HTTP fixtures; not a live Supabase connection'},null,2));
  console.log(`PASS ${checks} browser checks`);
}finally{await browser.close();}
