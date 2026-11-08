export const VOWELS = Object.freeze([
  { letter: 'A', word: 'ÁRVORE', object: 'arvore', color: 'blue', phrase: 'A de árvore. Olha quantas folhas!' },
  { letter: 'E', word: 'ELEFANTE', object: 'elefante', color: 'yellow', phrase: 'E de elefante. Esse sou eu!' },
  { letter: 'I', word: 'ILHA', object: 'ilha', color: 'coral', phrase: 'I de ilha. Um pedacinho de terra no mar!' },
  { letter: 'O', word: 'OVO', object: 'ovo', color: 'blue', phrase: 'O de ovo. Que descoberta legal!' },
  { letter: 'U', word: 'UVA', object: 'uva', color: 'yellow', phrase: 'U de uva. Um cachinho de descobertas!' },
]);

export const STORY = Object.freeze([
  { letter: 'A', title: 'Uma casa para as letras', text: 'A árvore fazia sombra na casa das vogais.', prompt: 'Você consegue encontrar a árvore?' },
  { letter: 'E', title: 'Uma visita especial', text: 'O elefante chegou e bateu à porta.', prompt: 'Como será o som de um elefante?' },
  { letter: 'I', title: 'Uma ideia para brincar', text: 'Na ilha, as vogais inventaram uma brincadeira.', prompt: 'Que brincadeira você inventaria?' },
  { letter: 'O', title: 'Uma surpresa no jardim', text: 'Perto da casa, havia um ovo no ninho.', prompt: 'O que será que tem dentro do ovo?' },
  { letter: 'U', title: 'Todo mundo junto', text: 'As vogais dividiram as uvas e ficaram amigas.', prompt: 'Vamos contar essa história de novo?' },
]);

export const STORIES = Object.freeze([
  { id: 'casa-das-vogais', title: 'A Casa das Vogais', route: 'livro', color: 'coral', art: 'historias', description: 'Entre nessa casa e conheça as amigas A, E, I, O e U.', pages: STORY },
  { id: 'elefantinho-semente', title: 'O Elefantinho e a Semente', route: 'livro-semente', color: 'green', art: 'semente', description: 'Uma semente pequenininha e um elefantinho cheio de cuidado.', pages: [
    { title: 'Uma sementinha no caminho', text: 'O elefantinho encontrou uma semente no jardim.', prompt: 'O que você acha que essa semente pode virar?', scene: 'semente', stage: 0 },
    { title: 'Um cantinho para crescer', text: 'Ele colocou a semente na terra fofinha.', prompt: 'Vamos fazer de conta que estamos plantando?', scene: 'semente', stage: 1 },
    { title: 'Um pouco de cuidado', text: 'Com a tromba, ele regou a terra devagar.', prompt: 'O que mais uma planta precisa para crescer?', scene: 'semente', stage: 2 },
    { title: 'Olha o brotinho!', text: 'Com o tempo, um brotinho verde apareceu.', prompt: 'Você consegue encontrar as duas folhinhas?', scene: 'semente', stage: 3 },
    { title: 'Uma flor para todos', text: 'A planta cresceu e deu uma linda flor amarela.', prompt: 'Como você cuidaria dessa flor?', scene: 'semente', stage: 4 },
  ] },
  { id: 'pipa-amizade', title: 'A Pipa da Amizade', route: 'livro-pipa', color: 'blue', art: 'pipa', description: 'Uma pipa, um dia de vento e a alegria de brincar junto.', pages: [
    { title: 'Um papel e uma ideia', text: 'O elefantinho fez uma pipa de papel azul.', prompt: 'Que cor você escolheria para sua pipa?', scene: 'pipa', stage: 0 },
    { title: 'Uma estrela no meio', text: 'Ele desenhou uma estrela bem no meio da pipa.', prompt: 'Que desenho você colocaria na sua pipa?', scene: 'pipa', stage: 1 },
    { title: 'Vamos para o campo?', text: 'Com os amigos, ele levou a pipa para o campo.', prompt: 'Quem você chamaria para brincar junto?', scene: 'pipa', stage: 2 },
    { title: 'Uma dança no céu', text: 'O vento chegou, e a pipa dançou no céu.', prompt: 'Vamos imitar a pipa dançando no vento?', scene: 'pipa', stage: 3 },
    { title: 'A vez de cada amigo', text: 'Cada amigo segurou a linha um pouquinho.', prompt: 'Como podemos dividir uma brincadeira?', scene: 'pipa', stage: 4 },
  ] },
]);

export const GAMES = Object.freeze([
  { id: 'vogais', title: 'Encontre a letra', route: 'jogo', color: 'blue', art: 'brincar', tag: '5 descobertas · sem pressa', description: 'Uma letra aparece. Qual peça é igual a ela?' },
  { id: 'memoria-vogais', title: 'Memória das vogais', route: 'memoria', color: 'yellow', art: 'memoria', tag: '3 ou 5 pares · você escolhe', description: 'Vire duas cartas e encontre as vogais que são iguais.' },
  { id: 'letras-figuras', title: 'Letra e figura', route: 'figuras', color: 'coral', art: 'figuras', tag: '5 figuras · para descobrir junto', description: 'Uma figura, uma palavra e uma letra para descobrir. Com ou sem pista!' },
  { id: 'jardim-letras', title: 'Jardim das letras', route: 'jardim', color: 'green', art: 'jardim', tag: '5 canteiros · encontre as flores', description: 'Procure três flores com a mesma letra. Vamos cuidar desse jardim?' },
  { id: 'trem-vogais', title: 'Trem das vogais', route: 'trem', color: 'yellow', art: 'trem', tag: '5 viagens · complete os vagões', description: 'Olhe o trem modelo e escolha a letra que falta no seu vagão.' },
]);

export function optionsFor(letter, rng = Math.random) {
  const others = VOWELS.map(v => v.letter).filter(v => v !== letter);
  const choices = [letter, others[(VOWELS.findIndex(v => v.letter === letter) + 1) % 4], others[(VOWELS.findIndex(v => v.letter === letter) + 2) % 4]];
  for (let i = choices.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [choices[i], choices[j]] = [choices[j], choices[i]]; }
  return choices;
}

export function addCompletion(records, activity) {
  if (!ACTIVITIES.some(item => item.id === activity)) throw new Error('Atividade desconhecida');
  return records.includes(activity) ? [...records] : [...records, activity];
}

export const ACTIVITIES = Object.freeze([
  ...GAMES.map(item => ({ ...item, kind: 'game', icon: 'star' })),
  ...STORIES.map(item => ({ ...item, kind: 'story', icon: 'book' })),
]);

export const ACHIEVEMENTS = Object.freeze([
  { id: 'primeiro-passo', title: 'Primeiro passo', description: 'Você concluiu sua primeira atividade!', hint: 'Conclua uma atividade para ganhar sua primeira conquista.', required: ACTIVITIES.map(a => a.id), any: true, icon: 'heart', color: 'blue' },
  { id: 'amigo-das-vogais', title: 'Amigo das vogais', description: 'Você encontrou as cinco vogais!', hint: 'Complete as cinco rodadas de Encontre a letra.', required: ['vogais'], icon: 'star', color: 'yellow' },
  { id: 'mundo-de-historias', title: 'Um mundo de histórias', description: 'Você chegou ao fim de A Casa das Vogais!', hint: 'Percorra as cinco cenas e conclua A Casa das Vogais.', required: ['casa-das-vogais'], icon: 'book', color: 'coral' },
  { id: 'grande-explorador', title: 'Grande explorador', description: 'Você concluiu Encontre a letra e A Casa das Vogais!', hint: 'Conclua Encontre a letra e A Casa das Vogais.', required: ['vogais', 'casa-das-vogais'], icon: 'trophy', color: 'yellow' },
  { id: 'boa-memoria', title: 'Boa memória', description: 'Você encontrou todos os pares de vogais!', hint: 'Encontre todos os pares em Memória das vogais.', required: ['memoria-vogais'], icon: 'star', color: 'blue' },
  { id: 'letras-e-figuras', title: 'Letras e figuras', description: 'Você descobriu a primeira letra de cinco palavras!', hint: 'Conclua as cinco rodadas de Letra e figura.', required: ['letras-figuras'], icon: 'star', color: 'coral' },
  { id: 'amigo-do-jardim', title: 'Amigo do jardim', description: 'Você acompanhou a semente virar uma flor!', hint: 'Conclua O Elefantinho e a Semente.', required: ['elefantinho-semente'], icon: 'heart', color: 'yellow' },
  { id: 'historias-de-amizade', title: 'Histórias de amizade', description: 'Você chegou ao fim de A Pipa da Amizade!', hint: 'Conclua A Pipa da Amizade.', required: ['pipa-amizade'], icon: 'book', color: 'blue' },
  { id: 'jardineiro-letras', title: 'Jardineiro das letras', description: 'Seu jardim floresceu com as cinco vogais!', hint: 'Encontre todas as flores em Jardim das letras.', required: ['jardim-letras'], icon: 'flower', color: 'green' },
  { id: 'maquinista-vogais', title: 'Maquinista das vogais', description: 'Você completou as cinco viagens do trem!', hint: 'Complete os vagões em Trem das vogais.', required: ['trem-vogais'], icon: 'train', color: 'yellow' },
]);

export function createMemoryGame(rng = Math.random, pairs = 3) {
  const deck = VOWELS.slice(0, pairs === 5 ? 5 : 3).flatMap(v => [v.letter, v.letter]);
  for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]]; }
  return { deck, selected: [], matched: [], message: 'Vire duas cartas e procure letras iguais.' };
}

export function turnMemoryCard(state, index) {
  if (!Number.isInteger(index) || index < 0 || index >= state.deck.length || state.selected.length === 2 || state.selected.includes(index) || state.matched.includes(index)) return state;
  const selected = [...state.selected, index];
  if (selected.length === 2 && state.deck[selected[0]] === state.deck[selected[1]]) {
    return { ...state, selected: [], matched: [...state.matched, ...selected], message: `Você encontrou um par de ${state.deck[index]}!` };
  }
  return { ...state, selected, message: selected.length === 2 ? 'São letras diferentes. Vamos olhar e tentar outro par?' : 'Agora, escolha mais uma carta.' };
}

export function getProgress(records = []) {
  const known = new Set(Array.isArray(records) ? records : []);
  const activities = ACTIVITIES.map(activity => ({ ...activity, done: known.has(activity.id) }));
  const achievements = ACHIEVEMENTS.map(achievement => {
    const totalSteps = achievement.any ? 1 : achievement.required.length;
    const completedSteps = Math.min(totalSteps, achievement.required.filter(id => known.has(id)).length);
    return { ...achievement, totalSteps, completedSteps, unlocked: completedSteps === totalSteps };
  });
  return { activities, achievements, done: activities.filter(a => a.done).length, total: activities.length, unlockedCount: achievements.filter(a => a.unlocked).length };
}

export function safeRoute(hash) {
  const route = hash.replace(/^#/, '') || 'inicio';
  const aliases = { jogos: 'brincar', progresso: 'progressos', descobertas: 'progressos', entrar: 'adultos', cadastrar: 'cadastro' };
  return aliases[route] || route;
}

export function escapeHTML(value = '') {
  return String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

// Each flower is selectable once. A wrong choice never removes a found flower.
export function createGardenRound(round = 0, rng = Math.random) {
  const target = VOWELS[round % VOWELS.length].letter;
  const others = VOWELS.filter(v => v.letter !== target).map(v => v.letter);
  const flowers = [target, target, target, ...others.slice(0, 3)];
  for (let i = flowers.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [flowers[i], flowers[j]] = [flowers[j], flowers[i]]; }
  return { target, flowers, found: [], message: 'Encontre três flores com esta letra.' };
}
export function pickFlower(state, index) {
  if (!Number.isInteger(index) || index < 0 || index >= state.flowers.length || state.found.includes(index) || state.found.length === 3) return state;
  if (state.flowers[index] !== state.target) return { ...state, message: `Olhe o modelo ${state.target}. Esta flor tem outra letra. Tente mais uma!` };
  const found = [...state.found, index];
  return { ...state, found, message: found.length === 3 ? 'As três flores apareceram! Seu canteiro floresceu.' : `Você encontrou! Faltam ${3 - found.length} ${found.length === 2 ? 'flor' : 'flores'}.` };
}
export const TRAIN_ROUNDS = Object.freeze([
  { model: ['A', 'E', 'I'], gap: 1 },
  { model: ['O', 'U', 'A'], gap: 0 },
  { model: ['I', 'A', 'U'], gap: 2 },
  { model: ['E', 'A', 'E'], gap: 1 },
  { model: ['U', 'I', 'O'], gap: 1 },
]);
