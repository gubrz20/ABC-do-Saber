import { VOWELS, STORIES, GAMES, ACTIVITIES, optionsFor, createMemoryGame, turnMemoryCard, createGardenRound, pickFlower, TRAIN_ROUNDS, addCompletion, getProgress, safeRoute, escapeHTML as esc } from './domain.js';
import { icon, shelfArt, objectArt, storyArt, gardenArt } from './art.js';
import { AccountAPI } from './api.js';
import { updateActivityView } from './view.js';

const $ = selector => document.querySelector(selector);
const main = $('#conteudo');
const api = new AccountAPI(window.ABC_CONFIG);
const storage = {
  get(key, fallback) { try { return JSON.parse(sessionStorage.getItem(key)) ?? fallback; } catch { return fallback; } },
  set(key, value) { try { if (value == null) sessionStorage.removeItem(key); else sessionStorage.setItem(key, JSON.stringify(value)); } catch {} },
};
let child = storage.get('abc_child_session', null);
if (!child || typeof child.token !== 'string' || !child.child || typeof child.child.name !== 'string' || !Array.isArray(child.completed)) { child = null; storage.set('abc_child_session', null); }
const storedExploration = storage.get('abc_exploration', []);
let demoCompleted = (Array.isArray(storedExploration) ? storedExploration : []).filter(x => ACTIVITIES.some(a => a.id === x));
let completed = child?.completed || demoCompleted;
let sound = false;
let dashboard = null;
let round = 0;
let choices = optionsFor('A');
let answered = false;
let storyStates = Object.fromEntries(STORIES.map(story => [story.id, { page: 0, seen: new Set([0]) }]));
let memory = createMemoryGame();
let figureRound = 0;
let figureChoices = optionsFor('A');
let figureAnswered = false;
let figureHint = true;
let gardenRound = 0;
let garden = createGardenRound();
let trainRound = 0;
let trainAnswered = false;
let trainChoices = optionsFor(TRAIN_ROUNDS[0].model[TRAIN_ROUNDS[0].gap]);
let trainMessage = '';
let currentGuide = '';
let renderedRoute = null;
const hints = { letter: false, figure: false, train: false, memory: false };
const feedback = { letter: '', figure: '' };
const tried = { letter: '', figure: '', train: '', garden: -1 };
let pendingSave = null;
let routeVersion = 0;
let signupRole = 'parent';
let speechTimer;
let sessionCheck;

function toast(text) { const el = $('#toast'); el.textContent = text; el.classList.add('visible'); clearTimeout(el.timer); el.timer = setTimeout(() => el.classList.remove('visible'), 4500); }
function go(route) { if (location.hash === '#' + route) render(); else location.hash = route; }
function button(text, action, cls = 'button primary', attrs = '') { return `<button type="button" class="${cls}" data-action="${action}" ${attrs}>${text}</button>`; }
function mascot(message, compact = false) {
  currentGuide = message;
  return `<aside class="guide ${compact ? 'guide-compact' : ''}" aria-label="Dica do elefantinho"><img src="assets/elefante-guia.png" alt="" width="100" height="106"><div class="guide-bubble"><p>${esc(message)}</p>${button(icon('sound',18) + '<span>Ouvir a dica</span>', 'speak', 'guide-speak')}</div></aside>`;
}
function speak(text = currentGuide, force = false) {
  if (!('speechSynthesis' in window)) { toast('A voz não está disponível neste navegador. Leia a dica junto com um adulto.'); return; }
  if (!sound && !force) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'pt-BR'; utterance.rate = .86; utterance.pitch = 1.08;
  const voice = speechSynthesis.getVoices().find(v => v.lang === 'pt-BR'); if (voice) utterance.voice = voice;
  const animate = active => document.querySelectorAll('.guide img,.hero-mascot').forEach(el => el.classList.toggle('is-speaking', active));
  utterance.onstart = () => animate(true); utterance.onend = () => animate(false);
  utterance.onerror = () => { animate(false); toast('Não consegui falar agora. A dica continua escrita na tela.'); };
  speechSynthesis.speak(utterance);
  clearTimeout(speechTimer); speechTimer = setTimeout(() => animate(false), 18000);
}
function updateSound() {
  $('#sound-toggle').innerHTML = icon(sound ? 'sound' : 'muted', 21) + `<span>${sound ? 'Com voz' : 'Sem voz'}</span>`;
  $('#sound-toggle').setAttribute('aria-label', sound ? 'Com voz. Desativar voz do elefantinho' : 'Sem voz. Ativar voz do elefantinho');
  $('#sound-toggle').setAttribute('aria-pressed', String(sound));
  if (!sound && 'speechSynthesis' in window) { speechSynthesis.cancel(); document.querySelectorAll('.is-speaking').forEach(e=>e.classList.remove('is-speaking')); }
}
function backLink(route = 'inicio', text = 'Voltar') { return `<a href="#${route}" class="back-link">${icon('back',20)}${text}</a>`; }
function heading(kicker, title, description = '') { return `<div class="page-heading"><span class="eyebrow">${kicker}</span><h1>${title}</h1>${description ? `<p>${description}</p>` : ''}</div>`; }

function home() {
  currentGuide = 'Oi! Eu sou seu amigo elefantinho. Este é o nosso quintal de letras! Vamos brincar, abrir uma história ou ver suas conquistas?';
  return `<section class="home-wrap quintal-home"><div class="quintal-hero"><div class="quintal-copy"><span class="eyebrow">ABC do saber · nosso lugar de aprender</span><h1>Aqui, letra vira<br><span>brincadeira.</span></h1><p>Tem letra brotando no jardim e vogal passeando de trem. Vem descobrir comigo?</p><div class="hero-buttons"><a href="#brincar" class="button primary">Vamos brincar ${icon('arrow',21)}</a>${button(icon('sound',19)+' Ouvir o elefantinho','speak','button soft')}</div><div class="quintal-invite">${icon('heart',19)} Um adulto por perto. Uma descoberta de cada vez.</div></div>${gardenArt()}</div><div class="vowel-fence" aria-label="As cinco vogais"><span>Nosso quintal<br><strong>começa com…</strong></span><div>${VOWELS.map(v=>`<span class="fence-letter ${v.color}" aria-hidden="true">${v.letter}</span>`).join('')}</div><span class="fence-caption">Cinco vogais.<br>Tantas possibilidades!</span></div><section class="quintal-destinations" aria-label="Escolha o que fazer"><a href="#brincar" class="destination destination-play"><div class="destination-art">${shelfArt('jardim')}</div><div><span class="eyebrow">O quintal está aberto</span><h2>Vamos brincar?</h2><p>Cinco brincadeiras com letras, figuras e muitas tentativas.</p><span class="card-action">Escolher uma brincadeira ${icon('arrow',20)}</span></div></a><a href="#historias" class="destination destination-book">${shelfArt('historias')}<div><span class="eyebrow">Cantinho da imaginação</span><h2>Era uma vez…</h2><p>Três histórias para ler juntinho.</p><span class="card-action">Abrir uma história ${icon('arrow',20)}</span></div></a><a href="#progressos" class="destination destination-passport"><span class="passport-stamp">${icon('trophy',38)}</span><div><span class="eyebrow">Meu álbum de descobertas</span><h2>Meus progressos</h2><p>Cada atividade completa vira uma conquista para guardar.</p><span class="card-action">Ver progressos ${icon('arrow',20)}</span></div></a></section><div class="gentle-note"><span class="gentle-icon">${icon('heart',25)}</span><div><strong>Aqui, tentar também é aprender.</strong><p>Sem corrida. O elefantinho acompanha o seu ritmo.</p></div><span class="teacher-note">Para explorar junto<br>com um adulto.</span></div></section>`;
}
function gameCatalog() {
  return `<section class="page-container">${backLink()}${heading('O quintal das brincadeiras','Vamos brincar?','Escolha um cantinho. Tem cinco jeitos de brincar com as letras!')}<div class="catalog-grid game-workbench">${GAMES.map(catalogCard).join('')}</div>${mascot('Escolha uma brincadeira! Vamos cuidar do jardim, passear de trem, encontrar letras ou descobrir pares?',true)}<p class="adult-hint">Para o adulto: explore os nomes e as formas das letras junto com a criança. Todas as brincadeiras funcionam sem som.</p></section>`;
}
function catalogCard(item) {
  return `<a href="#${item.route}" class="catalog-feature ${item.color} ${item.kind || (item.pages ? 'story' : 'game')}-station"><div class="catalog-art">${shelfArt(item.art)}</div><div><span class="tag">${item.tag || `${item.pages.length} cenas · para ler junto`}</span><h2>${item.title}</h2><p>${item.description}</p><span class="button primary">${item.pages ? 'Abrir a história' : 'Começar'} ${icon(item.pages ? 'book' : 'arrow',21)}</span></div></a>`;
}
function game() {
  const item = VOWELS[round];
  return `<section class="game-page page-container">${backLink('brincar','Voltar às brincadeiras')}<div class="game-top"><div><span class="eyebrow">Encontre a letra</span><h1>Qual peça é igual?</h1></div><div class="round-dots" role="group" aria-label="Rodada ${round + 1} de 5">${VOWELS.map((v,i)=>`<span class="${i < round ? 'done' : i===round ? 'current' : ''}" aria-hidden="true">${i < round ? icon('check',16) : ''}</span>`).join('')}</div></div><div class="game-board letter-workshop">${collectionStrip(round)}<div class="letter-model ${item.color} ${hints.letter?'outline-model':''}" role="img" aria-label="Letra modelo ${item.letter}">${item.letter}</div><p class="model-caption">Encontre uma letra igual a esta.</p>${button(icon('star',18)+' Ver contorno','letter-hint','button ghost hint-control',`aria-pressed="${hints.letter}"`)}<div class="letter-options" role="group" aria-label="Escolha uma letra">${choices.map((letter,i)=>button(letter,'answer','letter-choice '+['blue','yellow','coral'][i]+(answered&&letter===item.letter?' correct':tried.letter===letter?' tried':''),`data-letter="${letter}" aria-label="Letra ${letter}" ${answered?'disabled':''}`)).join('')}</div><div id="answer-feedback" class="answer-feedback letter-result" role="status" aria-live="polite">${answered?`<div class="discovery-reveal">${objectArt(item.object)}<div><span class="tag">Você encontrou!</span><h2>${item.letter} de ${item.word.toLocaleLowerCase('pt-BR')}</h2><p>${item.phrase}</p></div></div>`:esc(feedback.letter)}</div><div id="round-next" class="round-next activity-actions">${answered?button(round===4?'Concluir a brincadeira '+icon('star',20):'Próxima letra '+icon('arrow',20),'next-round'):''}</div></div>${mascot(answered?'Você encontrou! '+item.phrase:feedback.letter||`Olhe a letra ${item.letter}. Qual das três peças tem a mesma forma?`, true)}</section>`;
}
function stories() {
  return `<section class="page-container">${backLink()}${heading('Era uma vez…','Histórias para imaginar','Três histórias curtinhas para descobrir as letras, cuidar e brincar junto.')}<div class="catalog-grid">${STORIES.map(catalogCard).join('')}</div>${mascot('Qual história vamos abrir hoje? Um adulto pode ler com você. Eu também posso contar se o som estiver disponível.',true)}</section>`;
}
function currentStory() { return STORIES.find(story => story.route === safeRoute(location.hash)); }
function reader(story = currentStory()) {
  const state = storyStates[story.id];
  const p = story.pages[state.page]; state.seen.add(state.page);
  return `<section class="reader-page page-container">${backLink('historias','Fechar o livro')}<div class="reader-top"><div><span class="eyebrow">${story.title}</span><h1>${p.title}</h1></div><span class="page-counter">${state.page + 1} <span>de ${story.pages.length}</span></span></div><article class="story-book">${storyArt(p)}<div class="story-text"><p>${esc(p.text)}</p>${button(icon('sound',19)+' Ouvir esta página','read-page','button ghost')}</div></article><div class="reader-controls">${button(icon('back',20)+' Anterior','previous-page','button outline',state.page===0?'disabled':'')}${state.page===story.pages.length-1 ? button('Concluir a história '+icon('check',20),'finish-story') : button('Próxima página '+icon('arrow',20),'next-page')}</div>${mascot(p.prompt,true)}</section>`;
}
function memoryGame() {
  const allMatched = memory.matched.length === memory.deck.length;
  return `<section class="page-container game-page">${backLink('brincar','Voltar às brincadeiras')}<div class="game-top"><div><span class="eyebrow">Memória das vogais</span><h1>Onde está o par?</h1></div><span class="pair-count">${memory.matched.length/2} de ${memory.deck.length/2} pares</span></div><div class="game-board memory-table"><div class="game-mode" role="group" aria-label="Quantidade de pares">${[3,5].map(n=>button(n+' pares','memory-size','mode-button',`data-pairs="${n}" aria-pressed="${memory.deck.length===n*2}"`)).join('')}${button(icon('star',18)+(hints.memory?' Voltar a brincar':' Espiar cartas'),'memory-peek','button ghost',`aria-pressed="${hints.memory}" ${allMatched?'disabled':''}`)}</div><p class="mode-note">Escolher outra quantidade começa um novo jogo.</p><p class="memory-instruction">Vire duas cartas e procure letras iguais.</p><div class="memory-grid ${memory.deck.length===10?'memory-five':''}" role="group" aria-label="Cartas da memória">${memory.deck.map((letter,i) => {
    const matched = memory.matched.includes(i), revealed = matched || hints.memory || memory.selected.includes(i);
    return button(revealed ? `<span aria-hidden="true">${letter}</span>${matched?icon('check',18):''}` : '<span aria-hidden="true">?</span>', 'memory-card', `memory-card ${revealed?'revealed':''} ${matched?'matched':''}`, `data-index="${i}" aria-label="Carta ${i+1}${revealed ? `, letra ${letter}${matched?', par encontrado':''}` : ', virada para baixo'}" ${revealed||memory.selected.length===2||hints.memory?'disabled':''}`);
  }).join('')}</div><p class="memory-feedback" role="status">${hints.memory?'Olhe as letras. Para procurar os pares, escolha Voltar a brincar.':memory.message}</p><div class="pair-gallery" aria-label="Pares descobertos">${memory.matched.length ? `${[...new Set(memory.matched.map(i=>memory.deck[i]))].map(l=>{const v=VOWELS.find(v=>v.letter===l);return `<span>${objectArt(v.object)}<strong>${l}</strong><span>${v.word}</span></span>`}).join('')}` : '<span class="gallery-placeholder">Cada par encontrado ganha uma figura aqui.</span>'}</div><div class="activity-actions">${memory.selected.length===2&&!hints.memory ? button('Virar as cartas e tentar outro par','memory-reset','button outline') : ''}${allMatched ? button('Concluir a brincadeira '+icon('star',20),'finish-memory') : ''}</div></div>${mascot(allMatched?'Você encontrou todos os pares! Vamos guardar essa conquista?':memory.message,true)}</section>`;
}
function figureGame() {
  const item = VOWELS[figureRound];
  return `<section class="page-container game-page">${backLink('brincar','Voltar às brincadeiras')}<div class="game-top"><div><span class="eyebrow">Letra e figura</span><h1>Qual é a primeira letra?</h1></div><span class="pair-count">${figureRound+1} de ${VOWELS.length} figuras</span></div><div class="game-board figure-workshop">${collectionStrip(figureRound)}<div class="game-mode" role="group" aria-label="Pista da palavra">${button('Com palavra','figure-mode','mode-button',`data-hint="true" aria-pressed="${figureHint}"`)}${button('Só a figura','figure-mode','mode-button',`data-hint="false" aria-pressed="${!figureHint}"`)}</div><div class="figure-model">${objectArt(item.object)}<p class="figure-word" ${!figureHint&&!hints.figure&&!figureAnswered?'hidden':''}><strong>${item.word[0]}</strong>${item.word.slice(1)}</p></div><p class="model-caption">${figureHint?'Olhe a palavra e encontre sua primeira letra.':'Qual é o nome desta figura? Um adulto pode ajudar.'}</p><div class="letter-options" role="group" aria-label="Escolha a primeira letra">${figureChoices.map((letter,i)=>button(letter,'figure-answer','letter-choice '+['blue','yellow','coral'][i]+(figureAnswered&&letter===item.letter?' correct':tried.figure===letter?' tried':''),`data-letter="${letter}" aria-label="Letra ${letter}" ${figureAnswered?'disabled':''}`)).join('')}</div><div class="figure-hint-slot">${!figureHint?button(icon('star',18)+' Ver palavra','figure-hint','button ghost hint-control',`aria-pressed="${hints.figure}"`):''}</div><p id="figure-feedback" class="answer-feedback" role="status">${figureAnswered ? `Você encontrou! ${item.phrase}` : esc(feedback.figure)}</p><div class="round-next activity-actions">${figureAnswered?button(figureRound===VOWELS.length-1?'Concluir a brincadeira '+icon('star',20):'Próxima figura '+icon('arrow',20),'next-figure'):''}</div></div>${mascot(figureAnswered?item.phrase:feedback.figure||`Olhe a figura. Qual é a primeira letra de ${item.word.toLocaleLowerCase('pt-BR')}?`,true)}<p class="adult-hint">Para o adulto: diga o nome da figura e explore a letra inicial com a criança. Á é a letra A com acento.</p></section>`;
}
function collectionStrip(count, numbered = false) {
  return `<div class="vowel-collection" role="group" aria-label="${count} de 5 etapas concluídas">${VOWELS.map((v,i)=>`<span class="${i<count?'collected':''}" aria-label="${numbered?'Viagem '+(i+1):v.letter}${i<count?', concluída':''}">${numbered?i+1:v.letter}${i<count?icon('check',13):''}</span>`).join('')}</div>`;
}
function gardenGame() {
  const ready=garden.found.length===3;
  return `<section class="page-container game-page">${backLink('brincar','Voltar às brincadeiras')}<div class="game-top"><div><span class="eyebrow">Jardim das letras</span><h1>Onde floresce a letra ${garden.target}?</h1></div><span class="pair-count">Canteiro ${gardenRound+1} de 5</span></div><div class="garden-board game-board">${collectionStrip(gardenRound)}<div class="garden-task"><span class="seed-model" aria-label="Letra modelo ${garden.target}">${garden.target}</span><p>Encontre <strong>3 flores</strong> com esta letra.<span>${garden.found.length} de 3 encontradas</span></p></div><div class="flower-basket" role="group" aria-label="${garden.found.length} de 3 flores encontradas">${[0,1,2].map(i=>`<span class="${i<garden.found.length?'picked':''}" aria-hidden="true">${icon(i<garden.found.length?'flower':'star',27)}</span>`).join('')}</div><div class="flower-bed" role="group" aria-label="Flores para escolher">${garden.flowers.map((letter,i)=>button(`<span class="flower-face">${letter}${garden.found.includes(i)?icon('check',19):''}</span><span class="flower-stem" aria-hidden="true"></span>`,'pick-flower',`flower-tile ${garden.found.includes(i)?'found':tried.garden===i?'tried':''}`,`data-index="${i}" aria-label="Flor ${i+1}, letra ${letter}${garden.found.includes(i)?', encontrada':''}" ${garden.found.includes(i)||ready?'disabled':''}`)).join('')}</div><p class="game-feedback" role="status">${garden.message}</p><div class="activity-actions">${ready?button(gardenRound===4?'Concluir a brincadeira '+icon('flower',20):'Próximo canteiro '+icon('arrow',20),'next-garden'):''}</div></div>${mascot(ready?'Você cuidou muito bem deste canteiro!':`Procure três letras ${garden.target}. Cada flor encontrada fica marcada.`,true)}</section>`;
}
function trainCars(model, gap = -1, solved = false, hint = -1) {
  return `<div class="letter-train"><span class="train-engine" aria-hidden="true">${icon('train',42)}</span>${model.map((l,i)=>`<span class="train-wagon ${i===gap?'missing-wagon':''} ${i===hint?'model-hint':''}" ${i===gap?'aria-label="Vagão para completar"':''}><span>${i===gap&&!solved?'?':l}</span></span>`).join('')}</div>`;
}
function trainGame() {
  const item=TRAIN_ROUNDS[trainRound];
  const vowel=VOWELS.find(v=>v.letter===item.model[item.gap]);
  return `<section class="page-container game-page">${backLink('brincar','Voltar às brincadeiras')}<div class="game-top"><div><span class="eyebrow">Trem das vogais</span><h1>Qual letra vai no vagão?</h1></div><span class="pair-count">Viagem ${trainRound+1} de ${TRAIN_ROUNDS.length}</span></div><div class="game-board train-board">${collectionStrip(trainRound,true)}<div class="train-model" aria-label="Trem modelo: ${item.model.join(', ')}"><span class="train-label">Olhe este trem</span>${trainCars(item.model,-1,false,hints.train?item.gap:-1)}</div><div class="train-your" aria-label="Seu trem"><span class="train-label">Complete o seu</span>${trainCars(item.model,item.gap,trainAnswered)}</div>${button(icon('star',18)+' Ver pista','train-hint','button ghost hint-control',`aria-pressed="${hints.train}"`)}<div class="letter-options train-options" role="group" aria-label="Escolha a letra para o vagão">${trainChoices.map((l,i)=>button(l,'train-answer','letter-choice '+['blue','yellow','coral'][i]+(trainAnswered&&l===vowel.letter?' correct':tried.train===l?' tried':''),`data-letter="${l}" aria-label="Letra ${l}" ${trainAnswered?'disabled':''}`)).join('')}</div><div class="train-ticket" role="status"><span class="ticket-art" aria-hidden="true">${trainAnswered?objectArt(vowel.object):icon('train',38)}</span><div><p class="game-feedback">${trainMessage||'Os dois trens querem ficar iguais. Olhe o vagão com ?.'}</p><span class="ticket-word">${trainAnswered?`${vowel.letter} de ${vowel.word.toLocaleLowerCase('pt-BR')}`:'Uma letra em cada viagem.'}</span></div></div><div class="activity-actions">${trainAnswered?button(trainRound===TRAIN_ROUNDS.length-1?'Concluir a brincadeira '+icon('train',20):'Próxima viagem '+icon('arrow',20),'next-train'):''}</div></div>${mascot('Compare os dois trens. Escolha a letra que aparece na mesma posição do modelo.',true)}</section>`;
}
function completionRoute(id) { return id==='vogais'?'fim-jogo':id==='casa-das-vogais'?'fim-historia':`concluido/${id}`; }
function finishActivity(id) { pendingSave=id;go(completionRoute(id)); }
function restartActivity(id) {
  const activity=ACTIVITIES.find(a=>a.id===id);if(!activity)return;
  clearActivityHints();
  if(id==='vogais'){round=0;answered=false;choices=optionsFor('A');}
  if(id==='memoria-vogais')memory=createMemoryGame();
  if(id==='jardim-letras'){gardenRound=0;garden=createGardenRound();}
  if(id==='trem-vogais'){trainRound=0;trainAnswered=false;trainMessage='';trainChoices=optionsFor('E');}
  if(id==='letras-figuras'){figureRound=0;figureAnswered=false;figureChoices=optionsFor('A');}
  if(activity.kind==='story')storyStates[id]={page:0,seen:new Set([0])};
  go(activity.route);
}
function progressPage() {
  const progress = getProgress(completed);
  const next = progress.activities.find(activity => !activity.done);
  return `<section class="page-container progress-page">${backLink()}${heading('Um passo de cada vez','Meus progressos',child ? `Acompanhe as conquistas de ${esc(child.child.name)}.` : 'Complete atividades para ganhar conquistas. Nesta exploração, seu progresso fica guardado nesta aba.')}
    <section class="progress-overview" aria-labelledby="progress-summary-title">
      <div class="progress-trophy" aria-hidden="true">${icon('trophy',44)}</div>
      <div class="progress-overview-copy"><h2 id="progress-summary-title">${progress.done === progress.total ? 'Você completou todas as atividades!' : progress.done ? 'Olha quanto você já fez!' : 'Sua aventura começa aqui!'}</h2><p id="activity-progress-label"><strong>${progress.done} de ${progress.total}</strong> atividades concluídas</p><progress max="${progress.total}" value="${progress.done}" aria-labelledby="activity-progress-label"></progress><p class="progress-note">Cada atividade completa traz novas conquistas.</p></div>
      <div class="achievement-count"><strong>${progress.unlockedCount}<span> de ${progress.achievements.length}</span></strong><span>conquistas ganhas</span></div>
    </section>
    <section class="progress-activities" aria-labelledby="progress-activities-title"><div class="section-line"><h2 id="progress-activities-title">Meu caminho</h2></div><div class="activity-checklist">${progress.activities.map(activity => `<a href="#${activity.route}" class="activity-step ${activity.done ? 'completed' : ''}"><span class="step-symbol">${icon(activity.done ? 'check' : activity.icon,24)}</span><span><strong>${activity.title}</strong><span>${activity.done ? 'Concluída · pode brincar de novo' : 'Vamos começar?'}</span></span>${icon('arrow',20)}</a>`).join('')}</div></section>
    <section aria-labelledby="achievements-title"><div class="section-line"><h2 id="achievements-title">Minhas conquistas</h2><span class="shelf-note">Uma alegria a cada atividade</span></div><div class="achievement-grid">${progress.achievements.map(achievement => `<article class="achievement-card ${achievement.color} ${achievement.unlocked ? 'earned' : ''}" data-achievement="${achievement.id}"><div class="achievement-symbol" aria-hidden="true">${icon(achievement.icon,38)}</div><span class="achievement-status">${icon(achievement.unlocked ? 'check' : 'lock',14)} ${achievement.unlocked ? 'Conquistada!' : 'Para conquistar'}</span><h3>${achievement.title}</h3><p>${achievement.unlocked ? achievement.description : achievement.hint}</p><span class="achievement-steps">${achievement.completedSteps} de ${achievement.totalSteps} ${achievement.totalSteps === 1 ? 'etapa concluída' : 'etapas concluídas'}</span></article>`).join('')}</div></section>
    ${mascot(progress.done === progress.total ? 'Você ganhou todas as conquistas! Podemos brincar e ler de novo sempre que quiser.' : next ? `Vamos ganhar uma conquista? A próxima atividade pode ser ${next.title}. Eu vou com você!` : 'Cada atividade é uma nova conquista!',true)}</section>`;
}
function completion(type) {
  const activity = ACTIVITIES.find(a => a.id === type);
  const game = activity.kind === 'game';
  return `<section class="celebration page-container"><span class="eyebrow">Cada atividade é um passo a mais</span><div class="celebration-art"><img src="assets/elefante-guia.png" alt="Elefantinho comemorando" width="190" height="202"><span aria-hidden="true">✦</span></div><h1>${type==='vogais'?'Você encontrou as vogais!':game?'Que brincadeira boa!':'Que história gostosa!'}</h1><p>${game?`Você concluiu ${activity.title}. Foi muito bom brincar com você!`:`Você chegou ao fim de ${activity.title}. O que mais gostou de descobrir?`}</p><div id="save-state" class="save-state" role="status">Guardando seu progresso…</div><div id="earned-achievements" class="earned-achievements"></div><div class="celebration-actions">${button('De novo! '+icon('play',19),'restart-activity','button primary',`data-activity="${activity.id}"`)}<a href="#progressos" class="button outline">Ver progressos ${icon('star',19)}</a></div><a href="#inicio" class="text-link">Voltar ao início</a></section>`;
}
async function recordCompletion(activity) {
  const tokenAtStart = child?.token;
  const previousAchievements = new Set(getProgress(completed).achievements.filter(a => a.unlocked).map(a => a.id));
  pendingSave = activity;
  try {
    if (child) {
      const data = await api.complete(tokenAtStart, activity);
      if (child?.token !== tokenAtStart) return;
      completed = data.completed; child.completed = completed; storage.set('abc_child_session', child);
    } else {
      demoCompleted = addCompletion(demoCompleted, activity); completed = demoCompleted; storage.set('abc_exploration',demoCompleted);
    }
    pendingSave = null;
    const newlyEarned = getProgress(completed).achievements.filter(a => a.unlocked && !previousAchievements.has(a.id));
    showSavedProgress(newlyEarned);
    if (safeRoute(location.hash) === 'progressos') render();
  } catch(e) {
    if ($('#save-state')) $('#save-state').innerHTML = `<p>${esc(e.message)}</p>${button('Tentar guardar de novo','retry-save','button outline')}`;
  }
}

function showSavedProgress(newlyEarned = []) {
  const status = $('#save-state');
  if (!status) return;
  status.textContent = (child ? 'Progresso salvo no seu perfil.' : 'Progresso salvo nesta aba.') + (newlyEarned.length ? ` Conquistas desbloqueadas: ${newlyEarned.map(a => a.title).join(' e ')}.` : '');
  const rewards = $('#earned-achievements');
  if (rewards) rewards.innerHTML = newlyEarned.length ? `<h2>Você ganhou!</h2><div class="earned-badges">${newlyEarned.map(a => `<div class="earned-badge">${icon(a.icon,25)}<strong>${a.title}</strong>${icon('check',17)}</div>`).join('')}</div>` : '';
}

function field(id,label,type='text',autocomplete='',hint='',value='') {
  return `<div class="field"><label for="${id}">${label}</label><div class="input-wrap"><input id="${id}" name="${id}" type="${type}" ${autocomplete?`autocomplete="${autocomplete}"`:''} ${value?`value="${esc(value)}"`:''} aria-describedby="${id}-help ${id}-error" ${type==='password'?'minlength="10"':''}>${type==='password'?button('Mostrar','toggle-password','password-toggle',`data-input="${id}" aria-label="Mostrar senha" aria-pressed="false"`):''}</div><span id="${id}-help" class="field-help">${hint}</span><span id="${id}-error" class="field-error"></span></div>`;
}
function accountNotice() { return api.configured ? '' : '<div class="connection-note" role="status"><strong>As contas ainda não estão disponíveis.</strong><p>Você já pode brincar e ler histórias. O progresso e as conquistas ficam nesta aba durante a exploração.</p><a href="#inicio">Explorar as atividades →</a></div>'; }
function adultShell(body) { return `<section class="adult-page page-container">${backLink()}<div class="adult-layout"><div class="adult-intro"><span class="eyebrow">Aprender junto faz a diferença</span><h1>Um pequeno passo.<br>Um mundo de descobertas.</h1><p>Família e escola acompanham cada descoberta, respeitando o tempo de cada criança.</p><img src="assets/elefante-guia.png" alt="Elefantinho do ABC do saber" width="220" height="234"><div class="adult-assurance">${icon('lock',20)}<span>A criança brinca.<br>Os adultos cuidam do acesso.</span></div></div><div class="adult-form-panel">${body}</div></div></section>`; }
function login() {
  return adultShell(`<span class="eyebrow">Área dos adultos</span><h2>Que bom ter você aqui.</h2><p>Entre para abrir um perfil ou acompanhar as descobertas.</p>${accountNotice()}<form id="login-form" novalidate>${field('email','E-mail','email','email')}${field('password','Senha','password','current-password')}<div class="form-error" role="alert"></div><button type="submit" class="button primary full" ${!api.configured?'disabled':''}>Entrar ${icon('arrow',20)}</button><a href="#recuperar" class="form-link">Esqueci minha senha</a></form><div class="form-bottom">Primeira vez por aqui? <a href="#cadastro">Criar conta de adulto</a></div>`);
}
function signup() {
  return adultShell(`<span class="eyebrow">Vamos começar</span><h2>Uma conta para acompanhar.</h2><p>O acesso é do adulto. A criança terá seu próprio perfil.</p>${accountNotice()}<form id="signup-form" novalidate><fieldset class="role-picker"><legend>Eu sou</legend><label><input type="radio" name="role" value="parent" ${signupRole==='parent'?'checked':''}>Responsável</label><label><input type="radio" name="role" value="teacher" ${signupRole==='teacher'?'checked':''}>Professor(a)</label></fieldset>${field('name','Seu nome','text','name')}${field('school','Nome da escola','text','organization','Preencha se você for professor(a).')}${field('email','Seu e-mail','email','email')}${field('password','Crie uma senha','password','new-password','Use pelo menos 10 caracteres.')}<div class="form-error" role="alert"></div><button type="submit" class="button primary full" ${!api.configured?'disabled':''}>Criar minha conta ${icon('arrow',20)}</button></form><div class="form-bottom">Já tem conta? <a href="#adultos">Entrar</a></div>`);
}
function recovery(reset = false) {
  return adultShell(`<span class="eyebrow">Acesso à sua conta</span><h2>${reset?'Crie uma nova senha.':'Vamos recuperar seu acesso.'}</h2><p>${reset?'Escolha uma senha que só você conheça.':'Enviaremos um link para o seu e-mail.'}</p>${accountNotice()}<form id="${reset?'reset':'recover'}-form" novalidate>${reset?field('password','Nova senha','password','new-password','Pelo menos 10 caracteres.'):field('email','Seu e-mail','email','email')}<div class="form-error" role="alert"></div><button type="submit" class="button primary full" ${!api.configured?'disabled':''}>${reset?'Salvar nova senha':'Enviar link de recuperação'}</button></form><a href="#adultos" class="form-link">Voltar para entrar</a>`);
}
function childAvatar(name) {
  const names = ['star','heart','book']; const n = names.includes(name)?name:'star';
  return `<span class="child-avatar avatar-${n}">${icon(n,27)}</span>`;
}
function dashboardPage() {
  if (!dashboard || !api.session) return login();
  const { adult, children = [], grants = [] } = dashboard;
  const parent = adult.role === 'parent';
  return `<section class="page-container dashboard">${backLink()}<div class="dashboard-heading"><div><span class="eyebrow">${parent?'Área da família':'Área do professor'}</span><h1>Olá, ${esc(adult.name)}.</h1><p>${parent?'Aqui começam as descobertas de quem você acompanha.':`Abra uma atividade com uma criança autorizada. ${esc(adult.school || '')}`}</p></div>${button('Sair da conta','logout','button outline')}</div><div class="dashboard-columns"><section class="dashboard-main"><div class="section-line"><h2>${parent?'Perfis das crianças':'Crianças autorizadas'}</h2>${parent?button('+ Novo perfil','new-child','button small primary'):''}</div>${children.length?`<div class="child-grid">${children.map(c=>`<article class="child-card">${childAvatar(c.avatar)}<h3>${esc(c.name)}</h3><p>${getProgress(c.completed).done} de ${getProgress(c.completed).total} atividades concluídas · ${getProgress(c.completed).unlockedCount} conquistas</p><ul class="child-records">${ACTIVITIES.map(a=>`<li>${c.completed?.includes(a.id)?'✓':'○'} ${a.title}</li>`).join('')}</ul>${button('Abrir para brincar '+icon('arrow',18),'open-child','button primary',`data-id="${esc(c.id)}"`)}</article>`).join('')}</div>`:`<div class="empty-state">${icon('heart',36)}<h3>${parent?'Uma nova descoberta começa aqui.':'Ainda não há perfis autorizados.'}</h3><p>${parent?'Crie um perfil com nome de exibição e avatar.':'Crie um convite e compartilhe com o responsável. A criança aparecerá aqui após a autorização.'}</p></div>`}</section><aside class="dashboard-side"><div class="side-card"><span class="eyebrow">Família e escola juntas</span><h2>${parent?'Vincular à escola':'Convidar uma família'}</h2><p>${parent?'Recebeu um convite? Confira o professor antes de autorizar o acesso a um perfil.':'Gere um código para o responsável autorizar o acesso a uma criança. O código vale por 7 dias e pode ser usado uma vez.'}</p>${parent?`<form id="invite-form" novalidate>${field('invite','Código do convite','text','off')}<div class="form-error" role="alert"></div><button type="submit" class="button outline full">Conferir convite</button></form>`:button('Gerar convite','create-invite','button primary full')}<div id="invite-result" role="status"></div></div>${parent?`<div class="side-card"><h2>Acessos autorizados</h2>${grants.length?grants.map(g=>`<div class="grant-row"><strong>${esc(g.teacher_name)}</strong><p>${esc(g.school)} · ${esc(g.child_name)}</p>${button('Revogar acesso','revoke','button danger small',`data-id="${esc(g.id)}" data-name="${esc(g.teacher_name)}"`)}</div>`).join(''):'<p>Nenhum professor tem acesso aos perfis.</p>'}</div>`:''}</aside></div></section>`;
}

function updateStrip() {
  const el = $('#session-strip'); el.hidden = false;
  if (child) el.innerHTML = `<span>${childAvatar(child.child.avatar)} Brincando como <strong>${esc(child.child.name)}</strong></span>${button('Encerrar e trocar de criança','end-child','strip-button')}`;
  else el.innerHTML = `<span><span class="exploration-dot"></span> Modo de exploração <span class="strip-detail">· Seu progresso fica nesta aba.</span></span><a href="#adultos">Entrar com um adulto ${icon('arrow',15)}</a>`;
}
function render() {
  const version = ++routeVersion;
  const route = safeRoute(location.hash);
  const activityUpdate = route === renderedRoute && (GAMES.some(g=>g.route===route)||STORIES.some(story=>story.route===route));
  if (!activityUpdate && 'speechSynthesis' in window) speechSynthesis.cancel();
  const adultRoutes = ['adultos','cadastro','recuperar','nova-senha','painel'];
  if (child && adultRoutes.includes(route)) { location.replace('#inicio'); showEndSession(); return; }
  const views = {inicio:home,brincar:gameCatalog,jogo:game,memoria:memoryGame,figuras:figureGame,jardim:gardenGame,trem:trainGame,historias:stories,...Object.fromEntries(STORIES.map(story=>[story.route,()=>reader(story)])),progressos:progressPage,adultos:()=>api.session&&dashboard?dashboardPage():login(),cadastro:signup,recuperar:recovery,'nova-senha':()=>recovery(true),painel:dashboardPage,'fim-jogo':()=>completion('vogais'),'fim-historia':()=>completion('casa-das-vogais')};
  const titles = {inicio:'Uma descoberta de cada vez',brincar:'Brincar',jogo:'Encontre a letra',historias:'Histórias',livro:'A Casa das Vogais',progressos:'Meus progressos',adultos:'Área dos adultos',cadastro:'Criar conta',recuperar:'Recuperar acesso','nova-senha':'Nova senha',painel:'Acompanhar progressos','fim-jogo':'Vogais descobertas!','fim-historia':'História concluída!'};
  const finishedActivity = ACTIVITIES.find(a => completionRoute(a.id) === route);
  if (finishedActivity) views[route] = () => completion(finishedActivity.id);
  for (const activity of ACTIVITIES) titles[activity.route] = activity.title;
  if (finishedActivity) titles[route] = 'Atividade concluída';
  const html = views[route] ? views[route]() : `<section class="page-container not-found">${heading('Vamos voltar?','Esta página não está por aqui.')}<a href="#inicio" class="button primary">Voltar ao início</a></section>`;
  if (activityUpdate) updateActivityView(main,html);
  else main.innerHTML=html;
  renderedRoute=route;
  document.title = `${titles[route] || 'Página não encontrada'} · ABC do saber`;
  document.body.classList.toggle('adult-mode', adultRoutes.includes(route));
  document.querySelectorAll('[data-nav]').forEach(a=>{ const active = a.dataset.nav === (finishedActivity ? 'progressos' : GAMES.some(g=>g.route===route) ? 'brincar' : STORIES.some(story=>story.route===route) ? 'historias' : route); if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current'); });
  if (!activityUpdate) { updateStrip(); main.focus({preventScroll:true}); window.scrollTo({top:0,behavior:'instant'}); }
  if (finishedActivity) {
    const activity = finishedActivity.id;
    if (pendingSave === activity) recordCompletion(activity);
    else if (completed.includes(activity)) showSavedProgress();
    else $('#save-state').innerHTML = '<p>Vamos concluir uma atividade para ganhar uma conquista?</p><a href="#brincar">Escolher uma brincadeira →</a>';
  }
  if (!activityUpdate && sound && (GAMES.some(g=>g.route===route)||currentStory())) setTimeout(()=>{if(version===routeVersion){const story=currentStory();speak(story?story.pages[storyStates[story.id].page].text:currentGuide);}},120);
}

function focusAfterChoice(event, selector) {
  if (event.detail !== 0) return;
  const target=$(selector); if(!target)return;
  target.focus({preventScroll:true});
  const rect=target.getBoundingClientRect();
  if(rect.top<0||rect.bottom>innerHeight)target.scrollIntoView({block:'nearest',behavior:'instant'});
}
function nextStage(event, selector) {
  render(); focusAfterChoice(event,selector); speak(currentGuide);
}
function clearActivityHints() {
  for(const key of Object.keys(hints))hints[key]=false;
  feedback.letter='';feedback.figure='';
  tried.letter='';tried.figure='';tried.train='';tried.garden=-1;
}
function showDialog(title,body,{onConfirm,confirm='Confirmar',danger=false}={}) {
  const dialog=$('#app-dialog');
  dialog.innerHTML=`<div class="dialog-content"><h2 id="dialog-title">${title}</h2>${body}<div class="dialog-actions">${button('Voltar','close-dialog','button outline')}${onConfirm?button(confirm,'confirm-dialog',`button ${danger?'danger':'primary'}`):''}</div><div class="dialog-error" role="alert"></div></div>`;
  dialog.confirmAction=onConfirm; dialog.showModal(); dialog.querySelector(danger?'[data-action="close-dialog"]':'input,select,button')?.focus();
}
function showEndSession() {
  showDialog('Encerrar esta sessão?',`<p>O progresso já salvo continua no perfil. Para trocar de criança ou voltar à área adulta, o adulto precisará entrar novamente.${pendingSave?' Há uma atividade que ainda não foi salva. Volte e tente guardar antes de encerrar.':''}</p>`,{confirm:'Encerrar sessão',onConfirm:async()=>{
    if(child)await api.endChild(child.token);
    clearInterval(sessionCheck);child=null;storage.set('abc_child_session',null);completed=demoCompleted;pendingSave=null;
    $('#app-dialog').close();api.session=null;dashboard=null;go('adultos');render();
  }});
}
async function verifyChild() {
  if(!child)return;const token=child.token;
  try { const data=await api.childStatus(token); if(child?.token===token){completed=data.completed;child.completed=completed;storage.set('abc_child_session',child);} }
  catch(e) { if(child?.token!==token)return; if([400,401,403].includes(e.status)){clearInterval(sessionCheck);child=null;storage.set('abc_child_session',null);completed=demoCompleted;pendingSave=null;go('adultos');toast(e.message);} }
}
async function refreshDashboard() { dashboard=await api.dashboard();render(); }
async function busy(el, task) { if(el.disabled)return;el.disabled=true;el.setAttribute('aria-busy','true');try {await task();}catch(e){const dialog=$('#app-dialog');if(dialog.open)dialog.querySelector('.dialog-error').textContent=e.message;else toast(e.message);}finally{el.disabled=false;el.removeAttribute('aria-busy');} }

document.addEventListener('click', async e => {
  const el=e.target.closest('[data-action]'); if(!el)return;
  const action=el.dataset.action;
  if(action==='speak'){sound=true;updateSound();speak(currentGuide,true);}
  if(action==='read-page'){const story=currentStory();if(story){sound=true;updateSound();speak(story.pages[storyStates[story.id].page].text,true);}}
  if(action==='letter-hint'){hints.letter=!hints.letter;render();}
  if(action==='answer'&&!answered){
    const item=VOWELS[round];tried.letter=el.dataset.letter;
    if(el.dataset.letter===item.letter){answered=true;feedback.letter='';}
    else{hints.letter=true;feedback.letter=`Vamos olhar de novo? Procure a peça com a mesma forma da letra ${item.letter}.`;}
    render();if(answered)focusAfterChoice(e,'[data-action="next-round"]');speak(currentGuide);
  }
  if(action==='next-round'&&answered){if(round<4){round++;answered=false;choices=optionsFor(VOWELS[round].letter);clearActivityHints();nextStage(e,'[data-action="answer"]');}else finishActivity('vogais');}
  if(action==='restart-game')restartActivity('vogais');
  if(action==='next-page'||action==='previous-page'){
    const story=currentStory();if(!story)return;const state=storyStates[story.id];state.page=Math.max(0,Math.min(story.pages.length-1,state.page+(action==='next-page'?1:-1)));render();
    focusAfterChoice(e,action==='next-page'?(state.page===story.pages.length-1?'[data-action="finish-story"]':'[data-action="next-page"]'):'[data-action="previous-page"]');speak(story.pages[state.page].text);
  }
  if(action==='finish-story'){const story=currentStory();if(!story||storyStates[story.id].seen.size!==story.pages.length)return;finishActivity(story.id);}
  if(action==='restart-activity')restartActivity(el.dataset.activity);
  if(action==='memory-size'){const n=Number(el.dataset.pairs);if([3,5].includes(n)&&n*2!==memory.deck.length){memory=createMemoryGame(Math.random,n);hints.memory=false;render();}}
  if(action==='memory-peek'){hints.memory=!hints.memory;render();speak(hints.memory?'Olhe as letras. Depois, escolha Voltar a brincar.':memory.message);}
  if(action==='memory-card'&&!hints.memory){
    const previous=memory;memory=turnMemoryCard(memory,Number(el.dataset.index));if(previous===memory)return;
    render();const index=Number(el.dataset.index);
    const next=memory.selected.length===2?'[data-action="memory-reset"]':memory.matched.length===memory.deck.length?'[data-action="finish-memory"]':`.memory-card[data-index="${memory.deck.findIndex((_,i)=>i>index&&!memory.matched.includes(i)&&!memory.selected.includes(i))}"]:not(:disabled)`;
    focusAfterChoice(e,$(next)?next:'.memory-card:not(:disabled)');speak(memory.message);
  }
  if(action==='memory-reset'){memory={...memory,selected:[],message:'Vamos procurar outro par. Você pode tentar quantas vezes quiser!'};nextStage(e,'.memory-card:not(:disabled)');}
  if(action==='finish-memory'&&memory.matched.length===memory.deck.length)finishActivity('memoria-vogais');
  if(action==='figure-mode'){figureHint=el.dataset.hint==='true';hints.figure=false;feedback.figure='';render();}
  if(action==='figure-hint'){hints.figure=!hints.figure;render();}
  if(action==='figure-answer'&&!figureAnswered){
    const item=VOWELS[figureRound];tried.figure=el.dataset.letter;
    if(el.dataset.letter===item.letter){figureAnswered=true;feedback.figure='';}
    else{hints.figure=true;feedback.figure=`Vamos olhar de novo? ${item.word} começa com a letra ${item.letter}.`;}
    render();if(figureAnswered)focusAfterChoice(e,'[data-action="next-figure"]');speak(currentGuide);
  }
  if(action==='next-figure'&&figureAnswered){if(figureRound<VOWELS.length-1){figureRound++;figureAnswered=false;figureChoices=optionsFor(VOWELS[figureRound].letter);clearActivityHints();nextStage(e,'[data-action="figure-answer"]');}else finishActivity('letras-figuras');}
  if(action==='pick-flower'){
    const index=Number(el.dataset.index);const previous=garden;garden=pickFlower(garden,index);if(previous===garden)return;
    tried.garden=garden.flowers[index]!==garden.target?index:-1;render();
    const nextIndex=garden.flowers.findIndex((_,i)=>i>index&&!garden.found.includes(i));
    if(garden.found.includes(index))focusAfterChoice(e,garden.found.length===3?'[data-action="next-garden"]':nextIndex>=0?`.flower-tile[data-index="${nextIndex}"]`:'.flower-tile:not(:disabled)');
    speak(garden.message);
  }
  if(action==='next-garden'&&garden.found.length===3){if(gardenRound<4){gardenRound++;garden=createGardenRound(gardenRound);clearActivityHints();nextStage(e,'.flower-tile:not(:disabled)');}else finishActivity('jardim-letras');}
  if(action==='train-hint'){hints.train=!hints.train;render();}
  if(action==='train-answer'&&!trainAnswered){
    const item=TRAIN_ROUNDS[trainRound];tried.train=el.dataset.letter;
    trainAnswered=el.dataset.letter===item.model[item.gap];
    if(!trainAnswered)hints.train=true;
    trainMessage=trainAnswered?'O vagão está completo. Boa viagem!':'Olhe o mesmo vagão no trem modelo. Qual letra está lá?';
    render();if(trainAnswered)focusAfterChoice(e,'[data-action="next-train"]');speak(trainMessage);
  }
  if(action==='next-train'&&trainAnswered){if(trainRound<TRAIN_ROUNDS.length-1){trainRound++;trainAnswered=false;trainMessage='';const item=TRAIN_ROUNDS[trainRound];trainChoices=optionsFor(item.model[item.gap]);clearActivityHints();nextStage(e,'[data-action="train-answer"]');}else finishActivity('trem-vogais');}
  if(action==='retry-save')await busy(el,()=>recordCompletion(pendingSave));
  if(action==='end-child')showEndSession();
  if(action==='close-dialog')$('#app-dialog').close();
  if(action==='confirm-dialog')await busy(el,()=>$('#app-dialog').confirmAction?.());
  if(action==='toggle-password'){const input=document.getElementById(el.dataset.input);const show=input.type==='password';input.type=show?'text':'password';el.textContent=show?'Ocultar':'Mostrar';el.setAttribute('aria-pressed',String(show));el.setAttribute('aria-label',show?'Ocultar senha':'Mostrar senha');}
  if(action==='logout')await busy(el,async()=>{await api.logout();dashboard=null;go('adultos');render();});
  if(action==='new-child')showDialog('Um novo perfil',`<form id="child-form" novalidate>${field('child-name','Nome de exibição','text','off','De 2 a 30 caracteres. Pode ser um apelido.')}<fieldset class="avatar-picker"><legend>Escolha um avatar</legend>${['star','heart','book'].map((a,i)=>`<label><input type="radio" name="avatar" value="${a}" ${i===0?'checked':''}>${childAvatar(a)}<span>${{star:'Estrela',heart:'Coração',book:'Livro'}[a]}</span></label>`).join('')}</fieldset><div class="form-error" role="alert"></div><button type="submit" class="button primary full">Criar perfil</button></form>`);
  if(action==='create-invite')await busy(el,async()=>{const data=await api.createInvite();$('#invite-result').innerHTML=`<p>Compartilhe este código com o responsável:</p><strong class="invite-code">${esc(data.code)}</strong><p>Válido por 7 dias, para uma autorização.</p>`;});
  if(action==='revoke')showDialog('Revogar acesso?',`<p>${esc(el.dataset.name)} deixará de acessar este perfil e de registrar atividades. Uma sessão infantil aberta por esse professor também perderá acesso.</p>`,{danger:true,confirm:'Revogar acesso',onConfirm:async()=>{await api.revokeGrant(el.dataset.id);$('#app-dialog').close();await refreshDashboard();toast('Acesso revogado.');}});
  if(action==='open-child')showDialog('Tudo pronto para brincar?',`<p>Vamos abrir a experiência infantil. Para voltar à área adulta ou trocar de criança, será necessário entrar novamente.</p>`,{confirm:'Abrir para brincar',onConfirm:async()=>{
    const data=await api.startChild(el.dataset.id); await api.logout();dashboard=null;
    clearActivityHints();child=data;completed=data.completed;storage.set('abc_child_session',child);round=0;answered=false;choices=optionsFor('A');storyStates=Object.fromEntries(STORIES.map(story=>[story.id,{page:0,seen:new Set([0])}]));memory=createMemoryGame();gardenRound=0;garden=createGardenRound();trainRound=0;trainAnswered=false;trainMessage='';trainChoices=optionsFor('E');figureHint=true;figureRound=0;figureAnswered=false;figureChoices=optionsFor('A');pendingSave=null;
    $('#app-dialog').close();sessionCheck=setInterval(verifyChild,60000);go('inicio');render();
  }});
});

function formValue(form,name){return form.elements.namedItem(name)?.value?.trim()||'';}
function invalid(form,id,message){const input=form.querySelector('#'+id);input?.setAttribute('aria-invalid','true');const error=form.querySelector('#'+id+'-error');if(error)error.textContent=message;input?.focus();return false;}
function validateEmail(form){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValue(form,'email'))||invalid(form,'email','Digite um e-mail válido.');}
document.addEventListener('input',e=>{const input=e.target;if(input.matches('input')){input.removeAttribute('aria-invalid');const error=document.getElementById(input.id+'-error');if(error)error.textContent='';}});
document.addEventListener('change',e=>{if(e.target.name==='role')signupRole=e.target.value;});
document.addEventListener('submit',async e=>{
  const form=e.target;if(!form.matches('form'))return;e.preventDefault();
  const error=form.querySelector('.form-error');if(error)error.textContent='';
  if(['login-form','signup-form','recover-form'].includes(form.id)&&!validateEmail(form))return;
  const password=form.elements.namedItem('password')?.value||'';
  if(form.id==='login-form'&&!password)return invalid(form,'password','Digite sua senha.');
  if(['signup-form','reset-form'].includes(form.id)&&password.length<10)return invalid(form,'password','Use pelo menos 10 caracteres.');
  if(form.id==='signup-form'&&formValue(form,'name').length<2)return invalid(form,'name','Digite seu nome.');
  if(form.id==='signup-form'&&signupRole==='teacher'&&formValue(form,'school').length<2)return invalid(form,'school','Informe a escola para apresentar no convite.');
  if(form.id==='child-form'&&(formValue(form,'child-name').length<2||formValue(form,'child-name').length>30))return invalid(form,'child-name','Use de 2 a 30 caracteres.');
  const submit=form.querySelector('[type="submit"]');if(submit.disabled)return;submit.disabled=true;submit.setAttribute('aria-busy','true');
  try {
    if(form.id==='login-form'){dashboard=await api.login(formValue(form,'email').toLowerCase(),password);form.reset();go('painel');}
    if(form.id==='signup-form'){await api.signup({email:formValue(form,'email').toLowerCase(),password,name:formValue(form,'name'),role:signupRole,school:formValue(form,'school')});form.reset();form.innerHTML='<div class="success-note"><h3>Confira seu e-mail.</h3><p>Enviamos a confirmação para você continuar. Depois, entre para criar ou acompanhar um perfil.</p><a href="#adultos" class="button primary">Voltar para entrar</a></div>';}
    if(form.id==='recover-form'){await api.recover(formValue(form,'email').toLowerCase());form.innerHTML='<div class="success-note"><h3>Confira seu e-mail.</h3><p>Se houver uma conta, você receberá o link de recuperação.</p><a href="#adultos" class="button outline">Voltar para entrar</a></div>';}
    if(form.id==='reset-form'){await api.resetPassword(password);go('adultos');toast('Senha atualizada. Entre com sua nova senha.');}
    if(form.id==='child-form'){await api.createChild(formValue(form,'child-name'),formValue(form,'avatar'));$('#app-dialog').close();await refreshDashboard();toast('Perfil criado.');}
    if(form.id==='invite-form'){
      const code=formValue(form,'invite');if(!code)throw new Error('Digite o código recebido do professor.');
      const preview=await api.previewInvite(code);
      if(!dashboard.children.length)throw new Error('Crie um perfil infantil antes de autorizar um professor.');
      showDialog('Autorizar este professor?',`<div class="invite-preview"><h3>${esc(preview.name)}</h3><p>${esc(preview.school)}</p><p>${esc(preview.email)}</p></div><p>Confira com a escola se este é o professor esperado. Ele poderá abrir atividades e ver o progresso e as conquistas do perfil escolhido. Você pode revogar o acesso na sua área.</p><div class="field"><label for="grant-child">Perfil que será autorizado</label><select id="grant-child">${dashboard.children.map(c=>`<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('')}</select></div>`,{confirm:'Autorizar acesso',onConfirm:async()=>{await api.acceptInvite(code,$('#grant-child').value);$('#app-dialog').close();await refreshDashboard();toast('Professor autorizado para este perfil.');}});
    }
  }catch(err){if(error?.isConnected)error.textContent=err.message;else toast(err.message);}
  finally{submit.disabled=false;submit.removeAttribute('aria-busy');}
});

$('#sound-toggle').addEventListener('click',()=>{sound=!sound;updateSound();if(sound)speak('Olá! Eu vou acompanhar você nas descobertas.');});
$('#adult-icon').innerHTML=icon('adult',18); updateSound();
document.querySelectorAll('[data-nav-icon]').forEach(el=>{el.innerHTML=icon(el.dataset.navIcon,25);});
window.addEventListener('hashchange',render);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&'speechSynthesis'in window)speechSynthesis.cancel();if(!document.hidden)verifyChild();});
const recoveryParams=new URLSearchParams(location.hash.slice(1));
if(recoveryParams.get('type')==='recovery'&&recoveryParams.has('access_token')){api.session={access_token:recoveryParams.get('access_token')};history.replaceState(null,'','#nova-senha');}
else if(recoveryParams.has('access_token')||recoveryParams.has('error')){history.replaceState(null,'','#adultos');}
if(child){if(api.configured){verifyChild();sessionCheck=setInterval(verifyChild,60000);}else{child=null;storage.set('abc_child_session',null);completed=demoCompleted;}}
render();
