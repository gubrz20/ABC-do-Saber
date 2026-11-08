import test from 'node:test';
import assert from 'node:assert/strict';
import { VOWELS, STORIES, GAMES, ACTIVITIES, optionsFor, createMemoryGame, turnMemoryCard, createGardenRound, pickFlower, TRAIN_ROUNDS, addCompletion, getProgress, escapeHTML, safeRoute } from '../src/domain.js';

test('each round offers one correct option and two different distractors',()=>{
  for (const {letter} of VOWELS) for (const rng of [()=>0,()=>.5,()=>.99]) {
    const options=optionsFor(letter,rng);
    assert.equal(options.length,3);assert.equal(new Set(options).size,3);
    assert.equal(options.filter(v=>v===letter).length,1);
  }
});
test('repeating activities cannot duplicate earned discoveries',()=>{
  const first=addCompletion([],'vogais');
  assert.deepEqual(addCompletion(first,'vogais'),['vogais']);
  assert.deepEqual(addCompletion(first,'casa-das-vogais'),['vogais','casa-das-vogais']);
  assert.deepEqual(first,['vogais']);assert.throws(()=>addCompletion([],'fake'));
});
test('names and invitation identity cannot inject markup',()=>{
  assert.equal(escapeHTML('<img onerror="alert(1)">'), '&lt;img onerror=&quot;alert(1)&quot;&gt;');
});
test('old shared links reach their corresponding new screens',()=>{
  assert.equal(safeRoute('#jogos'),'brincar');assert.equal(safeRoute('#progresso'),'progressos');assert.equal(safeRoute('#descobertas'),'progressos');assert.equal(safeRoute(''),'inicio');
});
test('no activity completion means no achievement and no invented progress',()=>{
  const progress=getProgress([]);
  assert.equal(progress.done,0);assert.equal(progress.total,8);assert.equal(progress.unlockedCount,0);
  assert.equal(progress.achievements.length,10);assert.ok(progress.achievements.every(a=>a.completedSteps===0&&!a.unlocked));
});
test('first completed activity unlocks its badge and first step, regardless of order',()=>{
  const game=getProgress(['vogais']);
  assert.deepEqual(game.achievements.filter(a=>a.unlocked).map(a=>a.id),['primeiro-passo','amigo-das-vogais']);
  const story=getProgress(['casa-das-vogais']);
  assert.deepEqual(story.achievements.filter(a=>a.unlocked).map(a=>a.id),['primeiro-passo','mundo-de-historias']);
  assert.equal(story.done,1);assert.equal(story.achievements.find(a=>a.id==='grande-explorador').completedSteps,1);
});
test('original achievements remain earned after adding content; replays and unknown IDs add nothing',()=>{
  const progress=getProgress(['vogais','casa-das-vogais','vogais','unknown']);
  assert.equal(progress.done,2);assert.equal(progress.unlockedCount,4);assert.equal(progress.total,8);
  assert.ok(progress.achievements.find(a=>a.id==='grande-explorador').unlocked);
  assert.equal(getProgress(['unknown']).unlockedCount,0);assert.equal(getProgress(null).done,0);
});
test('each added activity earns its own badge and all eight earn all ten badges',()=>{
  for(const id of ['memoria-vogais','letras-figuras','elefantinho-semente','pipa-amizade','jardim-letras','trem-vogais']){
    const p=getProgress(addCompletion([],id));assert.equal(p.done,1);assert.equal(p.unlockedCount,2);
  }
  const all=getProgress(ACTIVITIES.map(a=>a.id));assert.equal(all.done,8);assert.equal(all.unlockedCount,10);
  assert.equal(GAMES.length,5);assert.equal(STORIES.length,3);
  assert.equal(new Set(ACTIVITIES.map(a=>a.route)).size,8);assert.ok(STORIES.every(s=>s.pages.length===5));
});
test('memory game has three pairs, cannot match a card with itself, and pauses after a mismatch',()=>{
  const game=createMemoryGame(()=>.99);
  assert.equal(game.deck.length,6);assert.deepEqual([...new Set(game.deck)].sort(),['A','E','I']);
  const one=turnMemoryCard(game,0);assert.equal(turnMemoryCard(one,0),one);assert.equal(one.matched.length,0);
  const wrong=game.deck.findIndex(l=>l!==game.deck[0]);const two=turnMemoryCard(one,wrong);
  assert.equal(two.selected.length,2);assert.equal(two.matched.length,0);assert.equal(turnMemoryCard(two,5),two);
  assert.equal(turnMemoryCard(game,-1),game);assert.equal(turnMemoryCard(game,6),game);
});
test('memory completion requires all three different pairs and matched cards cannot be reused',()=>{
  let state=createMemoryGame(()=>.5);
  for(const letter of ['A','E','I']){
    const indices=state.deck.flatMap((l,i)=>l===letter?[i]:[]);
    state=turnMemoryCard(turnMemoryCard(state,indices[0]),indices[1]);
    assert.equal(state.selected.length,0);assert.equal(turnMemoryCard(state,indices[0]),state);
  }
  assert.equal(new Set(state.matched).size,6);
});

test('expanded memory has five complete vowel pairs and cannot finish early',()=>{
  let state=createMemoryGame(()=>.99,5);
  assert.equal(state.deck.length,10);
  for(const {letter} of VOWELS){
    const indices=state.deck.flatMap((l,i)=>l===letter?[i]:[]);assert.equal(indices.length,2);
    state=turnMemoryCard(turnMemoryCard(state,indices[0]),indices[1]);
  }
  assert.equal(new Set(state.matched).size,10);
});
test('garden has exactly three targets per vowel and retries preserve found flowers',()=>{
  for(let round=0;round<5;round++)for(const rng of [()=>0,()=>.5,()=>.99]){
    let state=createGardenRound(round,rng);assert.equal(state.flowers.length,6);
    const correct=state.flowers.flatMap((l,i)=>l===state.target?[i]:[]);assert.equal(correct.length,3);
    state=pickFlower(state,correct[0]);assert.equal(pickFlower(state,correct[0]),state);
    const wrong=state.flowers.findIndex(l=>l!==state.target);state=pickFlower(state,wrong);assert.deepEqual(state.found,[correct[0]]);
    assert.equal(pickFlower(state,-1),state);assert.equal(pickFlower(state,6),state);
    for(const index of correct.slice(1))state=pickFlower(state,index);
    assert.equal(state.found.length,3);assert.equal(pickFlower(state,wrong),state);
  }
});
test('train models include each vowel and each gap has one valid choice',()=>{
  assert.equal(TRAIN_ROUNDS.length,5);const answers=TRAIN_ROUNDS.map(r=>r.model[r.gap]);
  assert.deepEqual([...new Set(answers)].sort(),['A','E','I','O','U']);
  for(const r of TRAIN_ROUNDS){assert.equal(r.model.length,3);assert.ok([0,1,2].includes(r.gap));assert.equal(optionsFor(r.model[r.gap]).filter(v=>v===r.model[r.gap]).length,1);}
});
