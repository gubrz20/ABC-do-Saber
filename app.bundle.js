(() => {
  // src/domain.js
  var VOWELS = Object.freeze([
    { letter: "A", word: "\xC1RVORE", object: "arvore", color: "blue", phrase: "A de \xE1rvore. Olha quantas folhas!" },
    { letter: "E", word: "ELEFANTE", object: "elefante", color: "yellow", phrase: "E de elefante. Esse sou eu!" },
    { letter: "I", word: "ILHA", object: "ilha", color: "coral", phrase: "I de ilha. Um pedacinho de terra no mar!" },
    { letter: "O", word: "OVO", object: "ovo", color: "blue", phrase: "O de ovo. Que descoberta legal!" },
    { letter: "U", word: "UVA", object: "uva", color: "yellow", phrase: "U de uva. Um cachinho de descobertas!" }
  ]);
  var STORY = Object.freeze([
    { letter: "A", title: "Uma casa para as letras", text: "A \xE1rvore fazia sombra na casa das vogais.", prompt: "Voc\xEA consegue encontrar a \xE1rvore?" },
    { letter: "E", title: "Uma visita especial", text: "O elefante chegou e bateu \xE0 porta.", prompt: "Como ser\xE1 o som de um elefante?" },
    { letter: "I", title: "Uma ideia para brincar", text: "Na ilha, as vogais inventaram uma brincadeira.", prompt: "Que brincadeira voc\xEA inventaria?" },
    { letter: "O", title: "Uma surpresa no jardim", text: "Perto da casa, havia um ovo no ninho.", prompt: "O que ser\xE1 que tem dentro do ovo?" },
    { letter: "U", title: "Todo mundo junto", text: "As vogais dividiram as uvas e ficaram amigas.", prompt: "Vamos contar essa hist\xF3ria de novo?" }
  ]);
  var STORIES = Object.freeze([
    { id: "casa-das-vogais", title: "A Casa das Vogais", route: "livro", color: "coral", art: "historias", description: "Entre nessa casa e conhe\xE7a as amigas A, E, I, O e U.", pages: STORY },
    { id: "elefantinho-semente", title: "O Elefantinho e a Semente", route: "livro-semente", color: "green", art: "semente", description: "Uma semente pequenininha e um elefantinho cheio de cuidado.", pages: [
      { title: "Uma sementinha no caminho", text: "O elefantinho encontrou uma semente no jardim.", prompt: "O que voc\xEA acha que essa semente pode virar?", scene: "semente", stage: 0 },
      { title: "Um cantinho para crescer", text: "Ele colocou a semente na terra fofinha.", prompt: "Vamos fazer de conta que estamos plantando?", scene: "semente", stage: 1 },
      { title: "Um pouco de cuidado", text: "Com a tromba, ele regou a terra devagar.", prompt: "O que mais uma planta precisa para crescer?", scene: "semente", stage: 2 },
      { title: "Olha o brotinho!", text: "Com o tempo, um brotinho verde apareceu.", prompt: "Voc\xEA consegue encontrar as duas folhinhas?", scene: "semente", stage: 3 },
      { title: "Uma flor para todos", text: "A planta cresceu e deu uma linda flor amarela.", prompt: "Como voc\xEA cuidaria dessa flor?", scene: "semente", stage: 4 }
    ] },
    { id: "pipa-amizade", title: "A Pipa da Amizade", route: "livro-pipa", color: "blue", art: "pipa", description: "Uma pipa, um dia de vento e a alegria de brincar junto.", pages: [
      { title: "Um papel e uma ideia", text: "O elefantinho fez uma pipa de papel azul.", prompt: "Que cor voc\xEA escolheria para sua pipa?", scene: "pipa", stage: 0 },
      { title: "Uma estrela no meio", text: "Ele desenhou uma estrela bem no meio da pipa.", prompt: "Que desenho voc\xEA colocaria na sua pipa?", scene: "pipa", stage: 1 },
      { title: "Vamos para o campo?", text: "Com os amigos, ele levou a pipa para o campo.", prompt: "Quem voc\xEA chamaria para brincar junto?", scene: "pipa", stage: 2 },
      { title: "Uma dan\xE7a no c\xE9u", text: "O vento chegou, e a pipa dan\xE7ou no c\xE9u.", prompt: "Vamos imitar a pipa dan\xE7ando no vento?", scene: "pipa", stage: 3 },
      { title: "A vez de cada amigo", text: "Cada amigo segurou a linha um pouquinho.", prompt: "Como podemos dividir uma brincadeira?", scene: "pipa", stage: 4 }
    ] }
  ]);
  var GAMES = Object.freeze([
    { id: "vogais", title: "Encontre a letra", route: "jogo", color: "blue", art: "brincar", tag: "5 descobertas \xB7 sem pressa", description: "Uma letra aparece. Qual pe\xE7a \xE9 igual a ela?" },
    { id: "memoria-vogais", title: "Mem\xF3ria das vogais", route: "memoria", color: "yellow", art: "memoria", tag: "3 ou 5 pares \xB7 voc\xEA escolhe", description: "Vire duas cartas e encontre as vogais que s\xE3o iguais." },
    { id: "letras-figuras", title: "Letra e figura", route: "figuras", color: "coral", art: "figuras", tag: "5 figuras \xB7 para descobrir junto", description: "Uma figura, uma palavra e uma letra para descobrir. Com ou sem pista!" },
    { id: "jardim-letras", title: "Jardim das letras", route: "jardim", color: "green", art: "jardim", tag: "5 canteiros \xB7 encontre as flores", description: "Procure tr\xEAs flores com a mesma letra. Vamos cuidar desse jardim?" },
    { id: "trem-vogais", title: "Trem das vogais", route: "trem", color: "yellow", art: "trem", tag: "5 viagens \xB7 complete os vag\xF5es", description: "Olhe o trem modelo e escolha a letra que falta no seu vag\xE3o." }
  ]);
  function optionsFor(letter, rng = Math.random) {
    const others = VOWELS.map((v) => v.letter).filter((v) => v !== letter);
    const choices2 = [letter, others[(VOWELS.findIndex((v) => v.letter === letter) + 1) % 4], others[(VOWELS.findIndex((v) => v.letter === letter) + 2) % 4]];
    for (let i = choices2.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [choices2[i], choices2[j]] = [choices2[j], choices2[i]];
    }
    return choices2;
  }
  function addCompletion(records, activity) {
    if (!ACTIVITIES.some((item) => item.id === activity)) throw new Error("Atividade desconhecida");
    return records.includes(activity) ? [...records] : [...records, activity];
  }
  var ACTIVITIES = Object.freeze([
    ...GAMES.map((item) => ({ ...item, kind: "game", icon: "star" })),
    ...STORIES.map((item) => ({ ...item, kind: "story", icon: "book" }))
  ]);
  var ACHIEVEMENTS = Object.freeze([
    { id: "primeiro-passo", title: "Primeiro passo", description: "Voc\xEA concluiu sua primeira atividade!", hint: "Conclua uma atividade para ganhar sua primeira conquista.", required: ACTIVITIES.map((a) => a.id), any: true, icon: "heart", color: "blue" },
    { id: "amigo-das-vogais", title: "Amigo das vogais", description: "Voc\xEA encontrou as cinco vogais!", hint: "Complete as cinco rodadas de Encontre a letra.", required: ["vogais"], icon: "star", color: "yellow" },
    { id: "mundo-de-historias", title: "Um mundo de hist\xF3rias", description: "Voc\xEA chegou ao fim de A Casa das Vogais!", hint: "Percorra as cinco cenas e conclua A Casa das Vogais.", required: ["casa-das-vogais"], icon: "book", color: "coral" },
    { id: "grande-explorador", title: "Grande explorador", description: "Voc\xEA concluiu Encontre a letra e A Casa das Vogais!", hint: "Conclua Encontre a letra e A Casa das Vogais.", required: ["vogais", "casa-das-vogais"], icon: "trophy", color: "yellow" },
    { id: "boa-memoria", title: "Boa mem\xF3ria", description: "Voc\xEA encontrou todos os pares de vogais!", hint: "Encontre todos os pares em Mem\xF3ria das vogais.", required: ["memoria-vogais"], icon: "star", color: "blue" },
    { id: "letras-e-figuras", title: "Letras e figuras", description: "Voc\xEA descobriu a primeira letra de cinco palavras!", hint: "Conclua as cinco rodadas de Letra e figura.", required: ["letras-figuras"], icon: "star", color: "coral" },
    { id: "amigo-do-jardim", title: "Amigo do jardim", description: "Voc\xEA acompanhou a semente virar uma flor!", hint: "Conclua O Elefantinho e a Semente.", required: ["elefantinho-semente"], icon: "heart", color: "yellow" },
    { id: "historias-de-amizade", title: "Hist\xF3rias de amizade", description: "Voc\xEA chegou ao fim de A Pipa da Amizade!", hint: "Conclua A Pipa da Amizade.", required: ["pipa-amizade"], icon: "book", color: "blue" },
    { id: "jardineiro-letras", title: "Jardineiro das letras", description: "Seu jardim floresceu com as cinco vogais!", hint: "Encontre todas as flores em Jardim das letras.", required: ["jardim-letras"], icon: "flower", color: "green" },
    { id: "maquinista-vogais", title: "Maquinista das vogais", description: "Voc\xEA completou as cinco viagens do trem!", hint: "Complete os vag\xF5es em Trem das vogais.", required: ["trem-vogais"], icon: "train", color: "yellow" }
  ]);
  function createMemoryGame(rng = Math.random, pairs = 3) {
    const deck = VOWELS.slice(0, pairs === 5 ? 5 : 3).flatMap((v) => [v.letter, v.letter]);
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return { deck, selected: [], matched: [], message: "Vire duas cartas e procure letras iguais." };
  }
  function turnMemoryCard(state, index) {
    if (!Number.isInteger(index) || index < 0 || index >= state.deck.length || state.selected.length === 2 || state.selected.includes(index) || state.matched.includes(index)) return state;
    const selected = [...state.selected, index];
    if (selected.length === 2 && state.deck[selected[0]] === state.deck[selected[1]]) {
      return { ...state, selected: [], matched: [...state.matched, ...selected], message: `Voc\xEA encontrou um par de ${state.deck[index]}!` };
    }
    return { ...state, selected, message: selected.length === 2 ? "S\xE3o letras diferentes. Vamos olhar e tentar outro par?" : "Agora, escolha mais uma carta." };
  }
  function getProgress(records = []) {
    const known = new Set(Array.isArray(records) ? records : []);
    const activities = ACTIVITIES.map((activity) => ({ ...activity, done: known.has(activity.id) }));
    const achievements = ACHIEVEMENTS.map((achievement) => {
      const totalSteps = achievement.any ? 1 : achievement.required.length;
      const completedSteps = Math.min(totalSteps, achievement.required.filter((id) => known.has(id)).length);
      return { ...achievement, totalSteps, completedSteps, unlocked: completedSteps === totalSteps };
    });
    return { activities, achievements, done: activities.filter((a) => a.done).length, total: activities.length, unlockedCount: achievements.filter((a) => a.unlocked).length };
  }
  function safeRoute(hash) {
    const route = hash.replace(/^#/, "") || "inicio";
    const aliases = { jogos: "brincar", progresso: "progressos", descobertas: "progressos", entrar: "adultos", cadastrar: "cadastro" };
    return aliases[route] || route;
  }
  function escapeHTML(value = "") {
    return String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  }
  function createGardenRound(round2 = 0, rng = Math.random) {
    const target = VOWELS[round2 % VOWELS.length].letter;
    const others = VOWELS.filter((v) => v.letter !== target).map((v) => v.letter);
    const flowers = [target, target, target, ...others.slice(0, 3)];
    for (let i = flowers.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [flowers[i], flowers[j]] = [flowers[j], flowers[i]];
    }
    return { target, flowers, found: [], message: "Encontre tr\xEAs flores com esta letra." };
  }
  function pickFlower(state, index) {
    if (!Number.isInteger(index) || index < 0 || index >= state.flowers.length || state.found.includes(index) || state.found.length === 3) return state;
    if (state.flowers[index] !== state.target) return { ...state, message: `Olhe o modelo ${state.target}. Esta flor tem outra letra. Tente mais uma!` };
    const found = [...state.found, index];
    return { ...state, found, message: found.length === 3 ? "As tr\xEAs flores apareceram! Seu canteiro floresceu." : `Voc\xEA encontrou! Faltam ${3 - found.length} ${found.length === 2 ? "flor" : "flores"}.` };
  }
  var TRAIN_ROUNDS = Object.freeze([
    { model: ["A", "E", "I"], gap: 1 },
    { model: ["O", "U", "A"], gap: 0 },
    { model: ["I", "A", "U"], gap: 2 },
    { model: ["E", "A", "E"], gap: 1 },
    { model: ["U", "I", "O"], gap: 1 }
  ]);

  // src/art.js
  var base = (body, label, box = "0 0 240 200") => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box}" role="img" aria-label="${label}">${body}</svg>`;
  var icon = (name, size = 24) => {
    const paths = {
      arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
      back: '<path d="m14 6-6 6 6 6"/>',
      sound: '<path d="M11 4 5 9H2v6h3l6 5V4Z"/><path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
      muted: '<path d="M11 4 5 9H2v6h3l6 5V4Z"/><path d="m16 9 6 6m0-6-6 6"/>',
      adult: '<circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
      star: '<path d="m12 2 3 6 7 1-5 5 1 8-6-4-6 4 1-8-5-5 7-1Z"/>',
      trophy: '<path d="M8 3h8v7a4 4 0 0 1-8 0V3Zm0 2H4v3a4 4 0 0 0 4 4m8-7h4v3a4 4 0 0 1-4 4m-4 2v5m-4 2h8m-8 0v-2h8v2"/>',
      book: '<path d="M12 6C8 3 4 3 2 4v16c4-1 7 0 10 2 3-2 6-3 10-2V4c-2-1-6-1-10 2Zm0 0v16"/>',
      blocks: '<rect x="2" y="10" width="9" height="11" rx="2"/><rect x="13" y="10" width="9" height="11" rx="2"/><path d="m8 3 5-2 4 6-6 3-3-7ZM5 17h3m9-3v4"/>',
      flower: '<path d="M12 21v-7m0 5c-5 0-7-3-7-5 4-1 7 2 7 5Zm0-12c-5-8-11 0-5 3-3 6 6 9 7 3 6 4 10-5 4-6 0-6-8-7-6 0Z"/><circle cx="12" cy="10" r="2"/>',
      train: '<rect x="3" y="6" width="12" height="12" rx="3"/><path d="M7 6V3h4v3M3 12h12m0 6h6v-8h-6M6 21h.01M12 21h.01M19 21h.01"/>',
      check: '<path d="m5 12 4 4L19 6"/>',
      close: '<path d="m6 6 12 12M18 6 6 18"/>',
      lock: '<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V6a4 4 0 0 1 8 0v4"/>',
      heart: '<path d="M20 5c-3-3-6-1-8 1-2-2-5-4-8-1-4 5 3 11 8 15 5-4 12-10 8-15Z"/>',
      play: '<path d="m8 4 13 8-13 8Z"/>',
      home: '<path d="m3 10 9-8 9 8v11H3V10Zm6 11v-7h6v7"/>'
    };
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.star}</svg>`;
  };
  function objectArt(name) {
    if (name === "elefante") return '<img src="assets/elefante-guia.png" alt="Elefantinho azul com len\xE7o amarelo" width="240" height="250">';
    const art = {
      arvore: '<ellipse cx="120" cy="181" rx="80" ry="10" fill="#DBEBE2"/><path d="M110 174V88h20v86" fill="#AF7754"/><circle cx="85" cy="76" r="36" fill="#75B597"/><circle cx="140" cy="65" r="46" fill="#39785D"/><circle cx="157" cy="106" r="29" fill="#75B597"/><circle cx="102" cy="111" r="33" fill="#5D9E7C"/>',
      ilha: '<ellipse cx="120" cy="159" rx="106" ry="27" fill="#BEDAF4"/><ellipse cx="120" cy="146" rx="73" ry="25" fill="#FFDC86"/><path d="M125 143c-6-31-3-57 6-80" stroke="#AF7754" stroke-width="13" fill="none"/><path d="M130 68C96 23 57 49 56 68c30-9 47-5 74 0Zm0 0c30-50 64-38 69-15-29-4-45 4-69 15Zm0 0c-33 1-51 24-47 40 13-18 32-28 47-40Zm0 0c28-8 52 9 56 28-15-13-35-20-56-28Z" fill="#39785D"/>',
      ovo: '<ellipse cx="120" cy="180" rx="73" ry="12" fill="#E9DBBF"/><path d="M66 127c0-47 32-97 54-97s54 50 54 97a54 54 0 0 1-108 0Z" fill="#FFE6A3"/><path d="M94 75c-13 20-19 39-18 55" fill="none" stroke="#FFF9EC" stroke-width="11" stroke-linecap="round"/><circle cx="105" cy="132" r="4" fill="#243557"/><circle cx="140" cy="132" r="4" fill="#243557"/><path d="M115 146q9 10 18 0" fill="none" stroke="#243557" stroke-width="3" stroke-linecap="round"/>',
      uva: '<path d="M122 53c0-20 11-30 19-35" fill="none" stroke="#39785D" stroke-width="9" stroke-linecap="round"/><path d="M126 45C94 7 57 32 63 54c24 15 46 7 63-9Z" fill="#75B597"/>' + [[90, 78], [133, 78], [68, 113], [110, 113], [153, 113], [91, 146], [133, 146], [112, 176]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="25" fill="#8877B4" stroke="#F7F4FC" stroke-width="3"/>`).join("")
    };
    return base(art[name] || art.arvore, { arvore: "\xC1rvore de copa verde", ilha: "Ilha com uma palmeira", ovo: "Ovo amarelo", uva: "Cacho de uvas" }[name]);
  }
  var shelfArt = (name) => {
    if (name === "jardim") return base('<path d="M25 166h190" stroke="#35745B" stroke-width="5" stroke-linecap="round"/>' + ["A", "E", "A"].map((l, i) => `<g transform="translate(${57 + i * 64} 80)"><path d="M0 15v66m0-18q-25-17-25-4 7 18 25 4m0-25q25-17 25-4-7 18-25 4" fill="#72B99A" stroke="#35745B" stroke-width="3"/><g fill="${i === 1 ? "#E88B78" : "#F7C95C"}"><circle cy="-15" r="17"/><circle cx="20" r="17"/><circle cy="19" r="17"/><circle cx="-20" r="17"/></g><circle r="22" fill="#FFFDF8" stroke="#243557" stroke-width="2"/><text y="10" text-anchor="middle" fill="#243557" font-family="Nunito,Arial" font-weight="900" font-size="29">${l}</text></g>`).join(""), "Flores com as letras A, E e A");
    if (name === "trem") return base('<path d="M12 164h216m-200-8v16m28-16v16m28-16v16m28-16v16m28-16v16m28-16v16m28-16v16" stroke="#9A7858" stroke-width="4"/><path d="M15 141V84h44V58h26v83Z" fill="#2F63BF" stroke="#243557" stroke-width="3"/><rect x="24" y="94" width="22" height="24" rx="4" fill="#EAF3FE"/>' + ["A", "E"].map((l, i) => `<g transform="translate(${100 + i * 65} 88)"><rect width="58" height="54" rx="9" fill="${i ? "#E88B78" : "#F7C95C"}" stroke="#243557" stroke-width="3"/><text x="29" y="41" text-anchor="middle" font-family="Nunito,Arial" font-size="38" font-weight="900" fill="#243557">${l}</text><circle cx="13" cy="60" r="8" fill="#243557"/><circle cx="45" cy="60" r="8" fill="#243557"/></g>`).join("") + '<circle cx="30" cy="149" r="10" fill="#243557"/><circle cx="73" cy="149" r="10" fill="#243557"/>', "Trem de brinquedo com vogais nos vag\xF5es");
    if (name === "brincar") return `<div class="toy-letters" aria-hidden="true"><span>A</span><span>B</span><span>C</span></div>`;
    if (name === "memoria") return base('<rect x="39" y="39" width="75" height="112" rx="16" fill="#285BCE" transform="rotate(-9 76 95)"/><rect x="122" y="42" width="75" height="112" rx="16" fill="#FFF" stroke="#D8A52F" stroke-width="4" transform="rotate(9 160 98)"/><text x="76" y="113" text-anchor="middle" font-family="Nunito,Arial,sans-serif" font-size="49" font-weight="900" fill="#FFF">?</text><text x="159" y="115" text-anchor="middle" font-family="Nunito,Arial,sans-serif" font-size="51" font-weight="900" fill="#243557">A</text>', "Duas cartas de um jogo da mem\xF3ria");
    if (name === "figuras") return base('<rect x="22" y="49" width="90" height="110" rx="18" fill="#FFF" stroke="#E87560" stroke-width="4"/><text x="67" y="130" text-anchor="middle" font-family="Nunito,Arial,sans-serif" font-size="65" font-weight="900" fill="#285BCE">U</text><path d="m122 100 14 0m-6-6 6 6-6 6" fill="none" stroke="#243557" stroke-width="3" stroke-linecap="round"/><path d="M183 66q-8-20 5-32" fill="none" stroke="#39785D" stroke-width="6"/>' + [[166, 83], [190, 83], [156, 106], [179, 106], [202, 106], [167, 129], [191, 129], [179, 150]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="15" fill="#8877B4" stroke="#FFF0EB" stroke-width="2"/>`).join(""), "Letra U ao lado de um cacho de uvas");
    if (name === "semente") return base('<path d="M119 153V84" stroke="#39785D" stroke-width="9" stroke-linecap="round"/><path d="M117 125c-36 3-44-19-40-29 27-6 38 8 40 29Zm6-17c33 4 42-15 40-27-24-7-39 7-40 27Z" fill="#75B597"/><g fill="#FFCE57"><ellipse cx="120" cy="54" rx="17" ry="25"/><ellipse cx="120" cy="54" rx="17" ry="25" transform="rotate(60 120 78)"/><ellipse cx="120" cy="54" rx="17" ry="25" transform="rotate(120 120 78)"/><ellipse cx="120" cy="54" rx="17" ry="25" transform="rotate(180 120 78)"/><ellipse cx="120" cy="54" rx="17" ry="25" transform="rotate(240 120 78)"/><ellipse cx="120" cy="54" rx="17" ry="25" transform="rotate(300 120 78)"/></g><circle cx="120" cy="78" r="17" fill="#D8A52F"/><ellipse cx="120" cy="169" rx="59" ry="13" fill="#AF7754"/>', "Flor amarela nascendo na terra");
    if (name === "pipa") return base('<path d="m126 22 47 61-53 65-48-65Z" fill="#285BCE"/><path d="m126 22-6 126M72 83h101" stroke="#9CBEF6" stroke-width="3"/><path d="M120 148q22 14 4 26t14 15" fill="none" stroke="#53627B" stroke-width="3"/><path d="m121 157-13 0 7 11 6-11 13 1-7 10Z" fill="#E87560"/><path d="m126 58 6 12 14 2-10 10 2 14-12-6-12 6 2-14-10-10 14-2Z" fill="#FFCE57"/>', "Pipa azul com uma estrela amarela");
    if (name === "historias") return base('<path d="M120 58C80 32 36 41 24 54v114c37-18 69-7 96 12 27-19 59-30 96-12V54c-12-13-56-22-96 4Z" fill="#FFF" stroke="#D77D6C" stroke-width="5"/><path d="M120 58v122" stroke="#D77D6C" stroke-width="5"/><path d="m55 89 17-10 17 10v29H55Z" fill="#FFCE57"/><circle cx="167" cy="94" r="19" fill="#BCD3FA"/><path d="M148 135h40M51 143h40" stroke="#F2C9BD" stroke-width="8" stroke-linecap="round"/>', "Livro aberto ilustrado");
    return base('<path d="m120 28 24 47 52 8-38 37 9 53-47-25-47 25 9-53-38-37 52-8Z" fill="#FFCE57" stroke="#D8A52F" stroke-width="4"/><circle cx="106" cy="105" r="4" fill="#243557"/><circle cx="134" cy="105" r="4" fill="#243557"/><path d="M109 122q11 11 22 0" fill="none" stroke="#243557" stroke-width="4" stroke-linecap="round"/>', "Estrela sorridente");
  };
  function storyArt(page) {
    if (page.scene) return sceneArt(page);
    return `<div class="story-picture"><svg viewBox="0 0 640 360" role="img" aria-label="Casa das vogais em um jardim, com a letra ${page.letter} em destaque"><rect width="640" height="360" rx="28" fill="#EAF1FF"/><circle cx="535" cy="62" r="30" fill="#FFCE57"/><path d="M0 280Q140 224 320 280T640 270v90H0Z" fill="#D4E7DA"/><path d="m170 160 140-110 145 110Z" fill="#E87560"/><rect x="190" y="156" width="240" height="150" rx="8" fill="#FFECB2"/><rect x="280" y="201" width="65" height="105" rx="32" fill="#285BCE"/><circle cx="327" cy="260" r="4" fill="#FFCE57"/><rect x="212" y="187" width="43" height="43" rx="8" fill="#FFF"/><rect x="369" y="187" width="43" height="43" rx="8" fill="#FFF"/><path d="M80 287V166" stroke="#AF7754" stroke-width="18"/><circle cx="80" cy="145" r="58" fill="#75B597"/><circle cx="110" cy="168" r="35" fill="#39785D"/><text x="310" y="160" text-anchor="middle" font-family="Nunito,Arial,sans-serif" font-size="64" font-weight="900" fill="#243557">${page.letter}</text><circle cx="500" cy="303" r="6" fill="#E87560"/><circle cx="548" cy="315" r="7" fill="#FFCE57"/></svg><div class="story-object">${objectArt(VOWELS_ART[page.letter])}</div></div>`;
  }
  var VOWELS_ART = { A: "arvore", E: "elefante", I: "ilha", O: "ovo", U: "uva" };
  function sceneArt(page) {
    const seed = page.scene === "semente";
    const stage = page.stage;
    const flower = stage >= 4 ? '<g fill="#FFCE57"><circle cx="440" cy="141" r="24"/><circle cx="414" cy="161" r="24"/><circle cx="424" cy="190" r="24"/><circle cx="456" cy="190" r="24"/><circle cx="466" cy="161" r="24"/></g><circle cx="440" cy="166" r="20" fill="#D8A52F"/>' : "";
    const plant = `<ellipse cx="440" cy="296" rx="85" ry="18" fill="#AF7754"/>${stage === 0 ? '<ellipse cx="440" cy="267" rx="15" ry="21" fill="#805539" transform="rotate(25 440 267)"/>' : ""}${stage >= 1 && stage < 3 ? '<ellipse cx="440" cy="303" rx="10" ry="13" fill="#805539"/>' : ""}${stage >= 2 ? '<path d="m351 171 5 13m15-6 5 13m-33-1 4 12" stroke="#6B9DDC" stroke-width="6" stroke-linecap="round"/>' : ""}${stage >= 3 ? `<path d="M440 284v-${stage === 4 ? 115 : 53}" stroke="#39785D" stroke-width="10" stroke-linecap="round"/><path d="M438 261c-44 2-53-21-49-37 35-5 48 15 49 37Zm5-16c42 0 50-24 46-35-29-5-45 14-46 35Z" fill="#75B597"/>` : ""}${flower}`;
    const kiteX = stage >= 3 ? 452 : 409;
    const kiteY = stage >= 3 ? 103 : 192;
    const kite = `<g transform="translate(${kiteX - 120} ${kiteY - 80})"><path d="m120 19 49 61-49 65-49-65Z" fill="#285BCE"/><path d="M120 19v126M71 80h98" stroke="#9CBEF6" stroke-width="3"/>${stage >= 1 ? '<path d="m120 51 7 15 16 2-12 12 3 16-14-8-14 8 3-16-12-12 16-2Z" fill="#FFCE57"/>' : ""}<path d="M120 145q31 18 3 40t22 26" fill="none" stroke="#53627B" stroke-width="3"/><path d="m125 160-16 2 9 11 7-13 15-1-6 12Z" fill="#E87560"/></g>${stage >= 2 ? '<ellipse cx="543" cy="290" rx="24" ry="30" fill="#E87560"/><circle cx="551" cy="279" r="3" fill="#243557"/><path d="m566 282 13 7-13 5" fill="#FFCE57"/>' : ""}${stage >= 3 ? '<path d="M490 73h51m-37 19h49m-45 25h29" stroke="#BCD3FA" stroke-width="5" stroke-linecap="round"/>' : ""}`;
    return `<div class="story-picture story-scene"><svg viewBox="0 0 640 360" role="img" aria-label="${seed ? ["Uma semente no jardim", "Semente plantada na terra", "\xC1gua regando a terra", "Brotinho com duas folhas", "Flor amarela no jardim"][stage] : ["Pipa azul de papel", "Estrela desenhada na pipa", "Pipa no campo com amigos", "Pipa voando no vento", "Amigos brincando juntos com a pipa"][stage]}"><rect width="640" height="360" rx="28" fill="${seed ? "#EDF7F1" : "#EAF1FF"}"/><circle cx="548" cy="57" r="28" fill="#FFCE57"/><path d="M0 289Q180 232 360 282T640 270v90H0Z" fill="#D4E7DA"/><path d="M63 63q24-22 45 0 32-18 51 5H63Z" fill="#FFF"/>${seed ? plant : kite}<circle cx="55" cy="310" r="6" fill="#E87560"/><circle cx="586" cy="326" r="7" fill="#FFCE57"/></svg><img class="scene-elephant" src="assets/elefante-guia.png" alt="Elefantinho acompanhando a hist\xF3ria" width="180" height="190"></div>`;
  }
  function gardenArt() {
    return `<div class="quintal-scene"><svg viewBox="0 0 660 450" role="img" aria-label="Um quintal de brinquedo com flores de vogais, um trem e o elefantinho"><path d="M34 211C5 109 89 46 182 60c87-85 195-43 229 1 111-35 224 40 211 138 63 99-12 199-134 195H164C54 411-16 309 34 211Z" fill="#EAF3FE"/><circle cx="528" cy="86" r="31" fill="#F7C95C"/><path d="M84 107q19-32 42-4 25-16 38 10H84Z" fill="#FFF"/><path d="M27 306q142-71 312-6t291-7v50c-7 60-54 66-137 66H145q-92 0-118-66Z" fill="#D9EBDD"/><path d="M65 357c48-28 93 39 142 15s34-81 102-65 97 85 185 47 74-65 112-48" fill="none" stroke="#FFFDF8" stroke-width="17" stroke-linecap="round"/><path d="M65 357c48-28 93 39 142 15s34-81 102-65 97 85 185 47 74-65 112-48" fill="none" stroke="#769781" stroke-width="2" stroke-dasharray="3 11" stroke-linecap="round"/>
  ${["A", "E", "I", "O", "U"].map((l, i) => {
      const x = 70 + i * 54, y = 225 + i % 2 * 21;
      return `<g transform="translate(${x} ${y})"><path d="M0 0v68m0-20q-20-17-23-3 9 14 23 3m0-21q24-16 25-2-9 16-25 2" fill="#72B99A" stroke="#35745B" stroke-width="3"/><rect x="-21" y="-35" width="42" height="49" rx="10" fill="${["#F7C95C", "#E88B78", "#FFFFFF", "#F7C95C", "#E88B78"][i]}" stroke="#243557" stroke-width="2"/><text y="1" text-anchor="middle" fill="#243557" font-family="Nunito,Arial" font-size="34" font-weight="900">${l}</text></g>`;
    }).join("")}
  <path d="M48 294q133 21 270 0l-12 26H60Z" fill="#BD855D" stroke="#79583F" stroke-width="2"/><path d="M64 304h235" stroke="#E4AE81" stroke-width="3" stroke-linecap="round"/><g transform="translate(85 379)"><path d="M0 0h39v-20H22v-18H8V0Z" fill="#2F63BF"/><rect x="45" y="-30" width="42" height="32" rx="7" fill="#F7C95C" stroke="#243557" stroke-width="2"/><text x="66" y="-7" text-anchor="middle" font-family="Nunito,Arial" font-size="24" font-weight="900" fill="#243557">A</text><rect x="94" y="-30" width="42" height="32" rx="7" fill="#E88B78" stroke="#243557" stroke-width="2"/>${[12, 33, 53, 78, 103, 127].map((x) => `<circle cx="${x}" cy="7" r="6" fill="#243557"/>`).join("")}</g><path d="M560 230v36m-12-29 12 9 13-15" stroke="#35745B" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="560" cy="224" r="12" fill="#E88B78"/><circle cx="560" cy="224" r="5" fill="#F7C95C"/></svg><img class="hero-mascot" src="assets/elefante-guia.png" alt="Elefantinho azul com len\xE7o amarelo no quintal de letras" width="290" height="307"><span class="quintal-sign">O quintal do<br><strong>elefantinho</strong></span></div>`;
  }

  // src/api.js
  var ApiError = class extends Error {
    constructor(message, status = 0) {
      super(message);
      this.status = status;
    }
  };
  var AccountAPI = class {
    constructor(config = {}, fetcher = globalThis.fetch) {
      this.url = (config.supabaseUrl || "").replace(/\/$/, "");
      this.key = config.supabasePublishableKey || "";
      this.fetcher = fetcher.bind(globalThis);
      this.session = null;
    }
    get configured() {
      return /^https:\/\/[a-z\d.-]+(?::\d+)?$/i.test(this.url) && !!this.key;
    }
    async request(path, body, { method = "POST", adult = true } = {}) {
      if (!this.configured) throw new ApiError("As contas ainda n\xE3o foram conectadas. Voc\xEA pode explorar as atividades enquanto isso.");
      if (adult && !this.session) throw new ApiError("Entre novamente para continuar.", 401);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12e3);
      try {
        const response = await this.fetcher(this.url + path, {
          method,
          signal: controller.signal,
          headers: { apikey: this.key, "Content-Type": "application/json", ...adult ? { Authorization: `Bearer ${this.session.access_token}` } : {} },
          ...body === void 0 ? {} : { body: JSON.stringify(body) }
        });
        const data = await response.json().catch(() => null);
        if (!response.ok) {
          const known = {
            invalid_credentials: "E-mail ou senha incorretos. Confira e tente novamente.",
            email_not_confirmed: "Confirme seu e-mail antes de entrar.",
            user_already_exists: "Este e-mail j\xE1 tem uma conta. Tente entrar.",
            over_email_send_rate_limit: "Aguarde um pouco antes de pedir outro e-mail.",
            weak_password: "Use uma senha com pelo menos 10 caracteres."
          };
          const rpcMessages = {
            "invalid_invite": "Esse convite n\xE3o est\xE1 dispon\xEDvel. Pe\xE7a um novo ao professor.",
            "access_denied": "Este perfil n\xE3o est\xE1 dispon\xEDvel para sua conta.",
            "session_expired": "A sess\xE3o da crian\xE7a terminou ou a autoriza\xE7\xE3o mudou. Entre na \xE1rea adulta para continuar.",
            "invalid_name": "Digite um nome de exibi\xE7\xE3o entre 2 e 30 caracteres."
          };
          throw new ApiError(known[data?.error_code] || rpcMessages[data?.message] || (response.status === 401 ? "Sua sess\xE3o terminou. Entre novamente." : "N\xE3o foi poss\xEDvel concluir. Confira sua conex\xE3o e tente novamente."), response.status);
        }
        return data;
      } catch (e) {
        if (e instanceof ApiError) throw e;
        throw new ApiError(e.name === "AbortError" ? "A conex\xE3o demorou. Tente novamente." : "Sem conex\xE3o com as contas. Confira a internet e tente novamente.");
      } finally {
        clearTimeout(timeout);
      }
    }
    async login(email, password) {
      const data = await this.request("/auth/v1/token?grant_type=password", { email, password }, { adult: false });
      this.session = data;
      return this.dashboard();
    }
    async signup({ email, password, name, role, school }) {
      return this.request("/auth/v1/signup", { email, password, data: { display_name: name, adult_role: role, school_name: school || "" } }, { adult: false });
    }
    async recover(email) {
      return this.request("/auth/v1/recover", { email, redirect_to: new URL("./", location.href).href + "#nova-senha" }, { adult: false });
    }
    async resetPassword(password) {
      await this.request("/auth/v1/user", { password }, { method: "PUT" });
      await this.logout();
    }
    async logout() {
      try {
        if (this.session) await this.request("/auth/v1/logout", {});
      } finally {
        this.session = null;
      }
    }
    rpc(name, params = {}, options) {
      return this.request("/rest/v1/rpc/" + name, params, options);
    }
    dashboard() {
      return this.rpc("dashboard_data");
    }
    createChild(name, avatar) {
      return this.rpc("create_child", { p_name: name, p_avatar: avatar });
    }
    createInvite() {
      return this.rpc("create_invite");
    }
    previewInvite(code) {
      return this.rpc("preview_invite", { p_code: code });
    }
    acceptInvite(code, child2) {
      return this.rpc("accept_invite", { p_code: code, p_child: child2 });
    }
    revokeGrant(id) {
      return this.rpc("revoke_grant", { p_grant: id });
    }
    startChild(id) {
      return this.rpc("start_child_session", { p_child: id });
    }
    childStatus(token) {
      return this.rpc("child_status", { p_token: token }, { adult: false });
    }
    complete(token, activity) {
      return this.rpc("complete_activity", { p_token: token, p_activity: activity }, { adult: false });
    }
    endChild(token) {
      return this.rpc("end_child_session", { p_token: token }, { adult: false });
    }
  };

  // src/view.js
  function key(node) {
    if (node.nodeType !== 1) return null;
    if (node.tagName === "IMG") return `image:${node.getAttribute("src")}`;
    if (node.id) return `id:${node.id}`;
    if (node.dataset.viewKey) return `view:${node.dataset.viewKey}`;
    if (node.dataset.action) {
      return [
        node.dataset.action,
        node.dataset.index,
        node.dataset.letter,
        node.dataset.pairs,
        node.dataset.hint
      ].join(":");
    }
    return node.classList[0] ? `${node.tagName}:${node.classList[0]}` : null;
  }
  function compatible(current, next) {
    return current.nodeType === next.nodeType && current.nodeName === next.nodeName && key(current) === key(next);
  }
  function patch(current, next) {
    if (current.isEqualNode(next)) return;
    if (current.nodeType !== 1) {
      current.nodeValue = next.nodeValue;
      return;
    }
    for (const attribute of [...current.attributes]) {
      if (!next.hasAttribute(attribute.name)) current.removeAttribute(attribute.name);
    }
    for (const attribute of next.attributes) {
      if (current.getAttribute(attribute.name) !== attribute.value) {
        current.setAttribute(attribute.name, attribute.value);
      }
    }
    patchChildren(current, next);
  }
  function patchChildren(parent, next) {
    let cursor = parent.firstChild;
    for (const desired of [...next.childNodes]) {
      let current = cursor;
      if (!current || !compatible(current, desired)) {
        current = null;
        if (key(desired)) {
          for (let candidate = cursor; candidate; candidate = candidate.nextSibling) {
            if (compatible(candidate, desired)) {
              current = candidate;
              break;
            }
          }
        }
        if (current) parent.insertBefore(current, cursor);
        else {
          current = desired.cloneNode(true);
          parent.insertBefore(current, cursor);
        }
      }
      patch(current, desired);
      cursor = current.nextSibling;
    }
    while (cursor) {
      const next2 = cursor.nextSibling;
      cursor.remove();
      cursor = next2;
    }
  }
  function updateActivityView(container, html) {
    const template = document.createElement("template");
    template.innerHTML = html;
    const { scrollX: left, scrollY: top } = window;
    patchChildren(container, template.content);
    if (window.scrollX !== left || window.scrollY !== top) {
      window.scrollTo({ left, top, behavior: "instant" });
    }
  }

  // src/app.js
  var $ = (selector) => document.querySelector(selector);
  var main = $("#conteudo");
  var api = new AccountAPI(window.ABC_CONFIG);
  var storage = {
    get(key2, fallback) {
      try {
        return JSON.parse(sessionStorage.getItem(key2)) ?? fallback;
      } catch {
        return fallback;
      }
    },
    set(key2, value) {
      try {
        if (value == null) sessionStorage.removeItem(key2);
        else sessionStorage.setItem(key2, JSON.stringify(value));
      } catch {
      }
    }
  };
  var child = storage.get("abc_child_session", null);
  if (!child || typeof child.token !== "string" || !child.child || typeof child.child.name !== "string" || !Array.isArray(child.completed)) {
    child = null;
    storage.set("abc_child_session", null);
  }
  var storedExploration = storage.get("abc_exploration", []);
  var demoCompleted = (Array.isArray(storedExploration) ? storedExploration : []).filter((x) => ACTIVITIES.some((a) => a.id === x));
  var completed = child?.completed || demoCompleted;
  var sound = false;
  var dashboard = null;
  var round = 0;
  var choices = optionsFor("A");
  var answered = false;
  var storyStates = Object.fromEntries(STORIES.map((story) => [story.id, { page: 0, seen: /* @__PURE__ */ new Set([0]) }]));
  var memory = createMemoryGame();
  var figureRound = 0;
  var figureChoices = optionsFor("A");
  var figureAnswered = false;
  var figureHint = true;
  var gardenRound = 0;
  var garden = createGardenRound();
  var trainRound = 0;
  var trainAnswered = false;
  var trainChoices = optionsFor(TRAIN_ROUNDS[0].model[TRAIN_ROUNDS[0].gap]);
  var trainMessage = "";
  var currentGuide = "";
  var renderedRoute = null;
  var hints = { letter: false, figure: false, train: false, memory: false };
  var feedback = { letter: "", figure: "" };
  var tried = { letter: "", figure: "", train: "", garden: -1 };
  var pendingSave = null;
  var routeVersion = 0;
  var signupRole = "parent";
  var speechTimer;
  var sessionCheck;
  function toast(text) {
    const el = $("#toast");
    el.textContent = text;
    el.classList.add("visible");
    clearTimeout(el.timer);
    el.timer = setTimeout(() => el.classList.remove("visible"), 4500);
  }
  function go(route) {
    if (location.hash === "#" + route) render();
    else location.hash = route;
  }
  function button(text, action, cls = "button primary", attrs = "") {
    return `<button type="button" class="${cls}" data-action="${action}" ${attrs}>${text}</button>`;
  }
  function mascot(message, compact = false) {
    currentGuide = message;
    return `<aside class="guide ${compact ? "guide-compact" : ""}" aria-label="Dica do elefantinho"><img src="assets/elefante-guia.png" alt="" width="100" height="106"><div class="guide-bubble"><p>${escapeHTML(message)}</p>${button(icon("sound", 18) + "<span>Ouvir a dica</span>", "speak", "guide-speak")}</div></aside>`;
  }
  function speak(text = currentGuide, force = false) {
    if (!("speechSynthesis" in window)) {
      toast("A voz n\xE3o est\xE1 dispon\xEDvel neste navegador. Leia a dica junto com um adulto.");
      return;
    }
    if (!sound && !force) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    utterance.rate = 0.86;
    utterance.pitch = 1.08;
    const voice = speechSynthesis.getVoices().find((v) => v.lang === "pt-BR");
    if (voice) utterance.voice = voice;
    const animate = (active) => document.querySelectorAll(".guide img,.hero-mascot").forEach((el) => el.classList.toggle("is-speaking", active));
    utterance.onstart = () => animate(true);
    utterance.onend = () => animate(false);
    utterance.onerror = () => {
      animate(false);
      toast("N\xE3o consegui falar agora. A dica continua escrita na tela.");
    };
    speechSynthesis.speak(utterance);
    clearTimeout(speechTimer);
    speechTimer = setTimeout(() => animate(false), 18e3);
  }
  function updateSound() {
    $("#sound-toggle").innerHTML = icon(sound ? "sound" : "muted", 21) + `<span>${sound ? "Com voz" : "Sem voz"}</span>`;
    $("#sound-toggle").setAttribute("aria-label", sound ? "Com voz. Desativar voz do elefantinho" : "Sem voz. Ativar voz do elefantinho");
    $("#sound-toggle").setAttribute("aria-pressed", String(sound));
    if (!sound && "speechSynthesis" in window) {
      speechSynthesis.cancel();
      document.querySelectorAll(".is-speaking").forEach((e) => e.classList.remove("is-speaking"));
    }
  }
  function backLink(route = "inicio", text = "Voltar") {
    return `<a href="#${route}" class="back-link">${icon("back", 20)}${text}</a>`;
  }
  function heading(kicker, title, description = "") {
    return `<div class="page-heading"><span class="eyebrow">${kicker}</span><h1>${title}</h1>${description ? `<p>${description}</p>` : ""}</div>`;
  }
  function home() {
    currentGuide = "Oi! Eu sou seu amigo elefantinho. Este \xE9 o nosso quintal de letras! Vamos brincar, abrir uma hist\xF3ria ou ver suas conquistas?";
    return `<section class="home-wrap quintal-home"><div class="quintal-hero"><div class="quintal-copy"><span class="eyebrow">ABC do saber \xB7 nosso lugar de aprender</span><h1>Aqui, letra vira<br><span>brincadeira.</span></h1><p>Tem letra brotando no jardim e vogal passeando de trem. Vem descobrir comigo?</p><div class="hero-buttons"><a href="#brincar" class="button primary">Vamos brincar ${icon("arrow", 21)}</a>${button(icon("sound", 19) + " Ouvir o elefantinho", "speak", "button soft")}</div><div class="quintal-invite">${icon("heart", 19)} Um adulto por perto. Uma descoberta de cada vez.</div></div>${gardenArt()}</div><div class="vowel-fence" aria-label="As cinco vogais"><span>Nosso quintal<br><strong>come\xE7a com\u2026</strong></span><div>${VOWELS.map((v) => `<span class="fence-letter ${v.color}" aria-hidden="true">${v.letter}</span>`).join("")}</div><span class="fence-caption">Cinco vogais.<br>Tantas possibilidades!</span></div><section class="quintal-destinations" aria-label="Escolha o que fazer"><a href="#brincar" class="destination destination-play"><div class="destination-art">${shelfArt("jardim")}</div><div><span class="eyebrow">O quintal est\xE1 aberto</span><h2>Vamos brincar?</h2><p>Cinco brincadeiras com letras, figuras e muitas tentativas.</p><span class="card-action">Escolher uma brincadeira ${icon("arrow", 20)}</span></div></a><a href="#historias" class="destination destination-book">${shelfArt("historias")}<div><span class="eyebrow">Cantinho da imagina\xE7\xE3o</span><h2>Era uma vez\u2026</h2><p>Tr\xEAs hist\xF3rias para ler juntinho.</p><span class="card-action">Abrir uma hist\xF3ria ${icon("arrow", 20)}</span></div></a><a href="#progressos" class="destination destination-passport"><span class="passport-stamp">${icon("trophy", 38)}</span><div><span class="eyebrow">Meu \xE1lbum de descobertas</span><h2>Meus progressos</h2><p>Cada atividade completa vira uma conquista para guardar.</p><span class="card-action">Ver progressos ${icon("arrow", 20)}</span></div></a></section><div class="gentle-note"><span class="gentle-icon">${icon("heart", 25)}</span><div><strong>Aqui, tentar tamb\xE9m \xE9 aprender.</strong><p>Sem corrida. O elefantinho acompanha o seu ritmo.</p></div><span class="teacher-note">Para explorar junto<br>com um adulto.</span></div></section>`;
  }
  function gameCatalog() {
    return `<section class="page-container">${backLink()}${heading("O quintal das brincadeiras", "Vamos brincar?", "Escolha um cantinho. Tem cinco jeitos de brincar com as letras!")}<div class="catalog-grid game-workbench">${GAMES.map(catalogCard).join("")}</div>${mascot("Escolha uma brincadeira! Vamos cuidar do jardim, passear de trem, encontrar letras ou descobrir pares?", true)}<p class="adult-hint">Para o adulto: explore os nomes e as formas das letras junto com a crian\xE7a. Todas as brincadeiras funcionam sem som.</p></section>`;
  }
  function catalogCard(item) {
    return `<a href="#${item.route}" class="catalog-feature ${item.color} ${item.kind || (item.pages ? "story" : "game")}-station"><div class="catalog-art">${shelfArt(item.art)}</div><div><span class="tag">${item.tag || `${item.pages.length} cenas \xB7 para ler junto`}</span><h2>${item.title}</h2><p>${item.description}</p><span class="button primary">${item.pages ? "Abrir a hist\xF3ria" : "Come\xE7ar"} ${icon(item.pages ? "book" : "arrow", 21)}</span></div></a>`;
  }
  function game() {
    const item = VOWELS[round];
    return `<section class="game-page page-container">${backLink("brincar", "Voltar \xE0s brincadeiras")}<div class="game-top"><div><span class="eyebrow">Encontre a letra</span><h1>Qual pe\xE7a \xE9 igual?</h1></div><div class="round-dots" role="group" aria-label="Rodada ${round + 1} de 5">${VOWELS.map((v, i) => `<span class="${i < round ? "done" : i === round ? "current" : ""}" aria-hidden="true">${i < round ? icon("check", 16) : ""}</span>`).join("")}</div></div><div class="game-board letter-workshop">${collectionStrip(round)}<div class="letter-model ${item.color} ${hints.letter ? "outline-model" : ""}" role="img" aria-label="Letra modelo ${item.letter}">${item.letter}</div><p class="model-caption">Encontre uma letra igual a esta.</p>${button(icon("star", 18) + " Ver contorno", "letter-hint", "button ghost hint-control", `aria-pressed="${hints.letter}"`)}<div class="letter-options" role="group" aria-label="Escolha uma letra">${choices.map((letter, i) => button(letter, "answer", "letter-choice " + ["blue", "yellow", "coral"][i] + (answered && letter === item.letter ? " correct" : tried.letter === letter ? " tried" : ""), `data-letter="${letter}" aria-label="Letra ${letter}" ${answered ? "disabled" : ""}`)).join("")}</div><div id="answer-feedback" class="answer-feedback letter-result" role="status" aria-live="polite">${answered ? `<div class="discovery-reveal">${objectArt(item.object)}<div><span class="tag">Voc\xEA encontrou!</span><h2>${item.letter} de ${item.word.toLocaleLowerCase("pt-BR")}</h2><p>${item.phrase}</p></div></div>` : escapeHTML(feedback.letter)}</div><div id="round-next" class="round-next activity-actions">${answered ? button(round === 4 ? "Concluir a brincadeira " + icon("star", 20) : "Pr\xF3xima letra " + icon("arrow", 20), "next-round") : ""}</div></div>${mascot(answered ? "Voc\xEA encontrou! " + item.phrase : feedback.letter || `Olhe a letra ${item.letter}. Qual das tr\xEAs pe\xE7as tem a mesma forma?`, true)}</section>`;
  }
  function stories() {
    return `<section class="page-container">${backLink()}${heading("Era uma vez\u2026", "Hist\xF3rias para imaginar", "Tr\xEAs hist\xF3rias curtinhas para descobrir as letras, cuidar e brincar junto.")}<div class="catalog-grid">${STORIES.map(catalogCard).join("")}</div>${mascot("Qual hist\xF3ria vamos abrir hoje? Um adulto pode ler com voc\xEA. Eu tamb\xE9m posso contar se o som estiver dispon\xEDvel.", true)}</section>`;
  }
  function currentStory() {
    return STORIES.find((story) => story.route === safeRoute(location.hash));
  }
  function reader(story = currentStory()) {
    const state = storyStates[story.id];
    const p = story.pages[state.page];
    state.seen.add(state.page);
    return `<section class="reader-page page-container">${backLink("historias", "Fechar o livro")}<div class="reader-top"><div><span class="eyebrow">${story.title}</span><h1>${p.title}</h1></div><span class="page-counter">${state.page + 1} <span>de ${story.pages.length}</span></span></div><article class="story-book">${storyArt(p)}<div class="story-text"><p>${escapeHTML(p.text)}</p>${button(icon("sound", 19) + " Ouvir esta p\xE1gina", "read-page", "button ghost")}</div></article><div class="reader-controls">${button(icon("back", 20) + " Anterior", "previous-page", "button outline", state.page === 0 ? "disabled" : "")}${state.page === story.pages.length - 1 ? button("Concluir a hist\xF3ria " + icon("check", 20), "finish-story") : button("Pr\xF3xima p\xE1gina " + icon("arrow", 20), "next-page")}</div>${mascot(p.prompt, true)}</section>`;
  }
  function memoryGame() {
    const allMatched = memory.matched.length === memory.deck.length;
    return `<section class="page-container game-page">${backLink("brincar", "Voltar \xE0s brincadeiras")}<div class="game-top"><div><span class="eyebrow">Mem\xF3ria das vogais</span><h1>Onde est\xE1 o par?</h1></div><span class="pair-count">${memory.matched.length / 2} de ${memory.deck.length / 2} pares</span></div><div class="game-board memory-table"><div class="game-mode" role="group" aria-label="Quantidade de pares">${[3, 5].map((n) => button(n + " pares", "memory-size", "mode-button", `data-pairs="${n}" aria-pressed="${memory.deck.length === n * 2}"`)).join("")}${button(icon("star", 18) + (hints.memory ? " Voltar a brincar" : " Espiar cartas"), "memory-peek", "button ghost", `aria-pressed="${hints.memory}" ${allMatched ? "disabled" : ""}`)}</div><p class="mode-note">Escolher outra quantidade come\xE7a um novo jogo.</p><p class="memory-instruction">Vire duas cartas e procure letras iguais.</p><div class="memory-grid ${memory.deck.length === 10 ? "memory-five" : ""}" role="group" aria-label="Cartas da mem\xF3ria">${memory.deck.map((letter, i) => {
      const matched = memory.matched.includes(i), revealed = matched || hints.memory || memory.selected.includes(i);
      return button(revealed ? `<span aria-hidden="true">${letter}</span>${matched ? icon("check", 18) : ""}` : '<span aria-hidden="true">?</span>', "memory-card", `memory-card ${revealed ? "revealed" : ""} ${matched ? "matched" : ""}`, `data-index="${i}" aria-label="Carta ${i + 1}${revealed ? `, letra ${letter}${matched ? ", par encontrado" : ""}` : ", virada para baixo"}" ${revealed || memory.selected.length === 2 || hints.memory ? "disabled" : ""}`);
    }).join("")}</div><p class="memory-feedback" role="status">${hints.memory ? "Olhe as letras. Para procurar os pares, escolha Voltar a brincar." : memory.message}</p><div class="pair-gallery" aria-label="Pares descobertos">${memory.matched.length ? `${[...new Set(memory.matched.map((i) => memory.deck[i]))].map((l) => {
      const v = VOWELS.find((v2) => v2.letter === l);
      return `<span>${objectArt(v.object)}<strong>${l}</strong><span>${v.word}</span></span>`;
    }).join("")}` : '<span class="gallery-placeholder">Cada par encontrado ganha uma figura aqui.</span>'}</div><div class="activity-actions">${memory.selected.length === 2 && !hints.memory ? button("Virar as cartas e tentar outro par", "memory-reset", "button outline") : ""}${allMatched ? button("Concluir a brincadeira " + icon("star", 20), "finish-memory") : ""}</div></div>${mascot(allMatched ? "Voc\xEA encontrou todos os pares! Vamos guardar essa conquista?" : memory.message, true)}</section>`;
  }
  function figureGame() {
    const item = VOWELS[figureRound];
    return `<section class="page-container game-page">${backLink("brincar", "Voltar \xE0s brincadeiras")}<div class="game-top"><div><span class="eyebrow">Letra e figura</span><h1>Qual \xE9 a primeira letra?</h1></div><span class="pair-count">${figureRound + 1} de ${VOWELS.length} figuras</span></div><div class="game-board figure-workshop">${collectionStrip(figureRound)}<div class="game-mode" role="group" aria-label="Pista da palavra">${button("Com palavra", "figure-mode", "mode-button", `data-hint="true" aria-pressed="${figureHint}"`)}${button("S\xF3 a figura", "figure-mode", "mode-button", `data-hint="false" aria-pressed="${!figureHint}"`)}</div><div class="figure-model">${objectArt(item.object)}<p class="figure-word" ${!figureHint && !hints.figure && !figureAnswered ? "hidden" : ""}><strong>${item.word[0]}</strong>${item.word.slice(1)}</p></div><p class="model-caption">${figureHint ? "Olhe a palavra e encontre sua primeira letra." : "Qual \xE9 o nome desta figura? Um adulto pode ajudar."}</p><div class="letter-options" role="group" aria-label="Escolha a primeira letra">${figureChoices.map((letter, i) => button(letter, "figure-answer", "letter-choice " + ["blue", "yellow", "coral"][i] + (figureAnswered && letter === item.letter ? " correct" : tried.figure === letter ? " tried" : ""), `data-letter="${letter}" aria-label="Letra ${letter}" ${figureAnswered ? "disabled" : ""}`)).join("")}</div><div class="figure-hint-slot">${!figureHint ? button(icon("star", 18) + " Ver palavra", "figure-hint", "button ghost hint-control", `aria-pressed="${hints.figure}"`) : ""}</div><p id="figure-feedback" class="answer-feedback" role="status">${figureAnswered ? `Voc\xEA encontrou! ${item.phrase}` : escapeHTML(feedback.figure)}</p><div class="round-next activity-actions">${figureAnswered ? button(figureRound === VOWELS.length - 1 ? "Concluir a brincadeira " + icon("star", 20) : "Pr\xF3xima figura " + icon("arrow", 20), "next-figure") : ""}</div></div>${mascot(figureAnswered ? item.phrase : feedback.figure || `Olhe a figura. Qual \xE9 a primeira letra de ${item.word.toLocaleLowerCase("pt-BR")}?`, true)}<p class="adult-hint">Para o adulto: diga o nome da figura e explore a letra inicial com a crian\xE7a. \xC1 \xE9 a letra A com acento.</p></section>`;
  }
  function collectionStrip(count, numbered = false) {
    return `<div class="vowel-collection" role="group" aria-label="${count} de 5 etapas conclu\xEDdas">${VOWELS.map((v, i) => `<span class="${i < count ? "collected" : ""}" aria-label="${numbered ? "Viagem " + (i + 1) : v.letter}${i < count ? ", conclu\xEDda" : ""}">${numbered ? i + 1 : v.letter}${i < count ? icon("check", 13) : ""}</span>`).join("")}</div>`;
  }
  function gardenGame() {
    const ready = garden.found.length === 3;
    return `<section class="page-container game-page">${backLink("brincar", "Voltar \xE0s brincadeiras")}<div class="game-top"><div><span class="eyebrow">Jardim das letras</span><h1>Onde floresce a letra ${garden.target}?</h1></div><span class="pair-count">Canteiro ${gardenRound + 1} de 5</span></div><div class="garden-board game-board">${collectionStrip(gardenRound)}<div class="garden-task"><span class="seed-model" aria-label="Letra modelo ${garden.target}">${garden.target}</span><p>Encontre <strong>3 flores</strong> com esta letra.<span>${garden.found.length} de 3 encontradas</span></p></div><div class="flower-basket" role="group" aria-label="${garden.found.length} de 3 flores encontradas">${[0, 1, 2].map((i) => `<span class="${i < garden.found.length ? "picked" : ""}" aria-hidden="true">${icon(i < garden.found.length ? "flower" : "star", 27)}</span>`).join("")}</div><div class="flower-bed" role="group" aria-label="Flores para escolher">${garden.flowers.map((letter, i) => button(`<span class="flower-face">${letter}${garden.found.includes(i) ? icon("check", 19) : ""}</span><span class="flower-stem" aria-hidden="true"></span>`, "pick-flower", `flower-tile ${garden.found.includes(i) ? "found" : tried.garden === i ? "tried" : ""}`, `data-index="${i}" aria-label="Flor ${i + 1}, letra ${letter}${garden.found.includes(i) ? ", encontrada" : ""}" ${garden.found.includes(i) || ready ? "disabled" : ""}`)).join("")}</div><p class="game-feedback" role="status">${garden.message}</p><div class="activity-actions">${ready ? button(gardenRound === 4 ? "Concluir a brincadeira " + icon("flower", 20) : "Pr\xF3ximo canteiro " + icon("arrow", 20), "next-garden") : ""}</div></div>${mascot(ready ? "Voc\xEA cuidou muito bem deste canteiro!" : `Procure tr\xEAs letras ${garden.target}. Cada flor encontrada fica marcada.`, true)}</section>`;
  }
  function trainCars(model, gap = -1, solved = false, hint = -1) {
    return `<div class="letter-train"><span class="train-engine" aria-hidden="true">${icon("train", 42)}</span>${model.map((l, i) => `<span class="train-wagon ${i === gap ? "missing-wagon" : ""} ${i === hint ? "model-hint" : ""}" ${i === gap ? 'aria-label="Vag\xE3o para completar"' : ""}><span>${i === gap && !solved ? "?" : l}</span></span>`).join("")}</div>`;
  }
  function trainGame() {
    const item = TRAIN_ROUNDS[trainRound];
    const vowel = VOWELS.find((v) => v.letter === item.model[item.gap]);
    return `<section class="page-container game-page">${backLink("brincar", "Voltar \xE0s brincadeiras")}<div class="game-top"><div><span class="eyebrow">Trem das vogais</span><h1>Qual letra vai no vag\xE3o?</h1></div><span class="pair-count">Viagem ${trainRound + 1} de ${TRAIN_ROUNDS.length}</span></div><div class="game-board train-board">${collectionStrip(trainRound, true)}<div class="train-model" aria-label="Trem modelo: ${item.model.join(", ")}"><span class="train-label">Olhe este trem</span>${trainCars(item.model, -1, false, hints.train ? item.gap : -1)}</div><div class="train-your" aria-label="Seu trem"><span class="train-label">Complete o seu</span>${trainCars(item.model, item.gap, trainAnswered)}</div>${button(icon("star", 18) + " Ver pista", "train-hint", "button ghost hint-control", `aria-pressed="${hints.train}"`)}<div class="letter-options train-options" role="group" aria-label="Escolha a letra para o vag\xE3o">${trainChoices.map((l, i) => button(l, "train-answer", "letter-choice " + ["blue", "yellow", "coral"][i] + (trainAnswered && l === vowel.letter ? " correct" : tried.train === l ? " tried" : ""), `data-letter="${l}" aria-label="Letra ${l}" ${trainAnswered ? "disabled" : ""}`)).join("")}</div><div class="train-ticket" role="status"><span class="ticket-art" aria-hidden="true">${trainAnswered ? objectArt(vowel.object) : icon("train", 38)}</span><div><p class="game-feedback">${trainMessage || "Os dois trens querem ficar iguais. Olhe o vag\xE3o com ?."}</p><span class="ticket-word">${trainAnswered ? `${vowel.letter} de ${vowel.word.toLocaleLowerCase("pt-BR")}` : "Uma letra em cada viagem."}</span></div></div><div class="activity-actions">${trainAnswered ? button(trainRound === TRAIN_ROUNDS.length - 1 ? "Concluir a brincadeira " + icon("train", 20) : "Pr\xF3xima viagem " + icon("arrow", 20), "next-train") : ""}</div></div>${mascot("Compare os dois trens. Escolha a letra que aparece na mesma posi\xE7\xE3o do modelo.", true)}</section>`;
  }
  function completionRoute(id) {
    return id === "vogais" ? "fim-jogo" : id === "casa-das-vogais" ? "fim-historia" : `concluido/${id}`;
  }
  function finishActivity(id) {
    pendingSave = id;
    go(completionRoute(id));
  }
  function restartActivity(id) {
    const activity = ACTIVITIES.find((a) => a.id === id);
    if (!activity) return;
    clearActivityHints();
    if (id === "vogais") {
      round = 0;
      answered = false;
      choices = optionsFor("A");
    }
    if (id === "memoria-vogais") memory = createMemoryGame();
    if (id === "jardim-letras") {
      gardenRound = 0;
      garden = createGardenRound();
    }
    if (id === "trem-vogais") {
      trainRound = 0;
      trainAnswered = false;
      trainMessage = "";
      trainChoices = optionsFor("E");
    }
    if (id === "letras-figuras") {
      figureRound = 0;
      figureAnswered = false;
      figureChoices = optionsFor("A");
    }
    if (activity.kind === "story") storyStates[id] = { page: 0, seen: /* @__PURE__ */ new Set([0]) };
    go(activity.route);
  }
  function progressPage() {
    const progress = getProgress(completed);
    const next = progress.activities.find((activity) => !activity.done);
    return `<section class="page-container progress-page">${backLink()}${heading("Um passo de cada vez", "Meus progressos", child ? `Acompanhe as conquistas de ${escapeHTML(child.child.name)}.` : "Complete atividades para ganhar conquistas. Nesta explora\xE7\xE3o, seu progresso fica guardado nesta aba.")}
    <section class="progress-overview" aria-labelledby="progress-summary-title">
      <div class="progress-trophy" aria-hidden="true">${icon("trophy", 44)}</div>
      <div class="progress-overview-copy"><h2 id="progress-summary-title">${progress.done === progress.total ? "Voc\xEA completou todas as atividades!" : progress.done ? "Olha quanto voc\xEA j\xE1 fez!" : "Sua aventura come\xE7a aqui!"}</h2><p id="activity-progress-label"><strong>${progress.done} de ${progress.total}</strong> atividades conclu\xEDdas</p><progress max="${progress.total}" value="${progress.done}" aria-labelledby="activity-progress-label"></progress><p class="progress-note">Cada atividade completa traz novas conquistas.</p></div>
      <div class="achievement-count"><strong>${progress.unlockedCount}<span> de ${progress.achievements.length}</span></strong><span>conquistas ganhas</span></div>
    </section>
    <section class="progress-activities" aria-labelledby="progress-activities-title"><div class="section-line"><h2 id="progress-activities-title">Meu caminho</h2></div><div class="activity-checklist">${progress.activities.map((activity) => `<a href="#${activity.route}" class="activity-step ${activity.done ? "completed" : ""}"><span class="step-symbol">${icon(activity.done ? "check" : activity.icon, 24)}</span><span><strong>${activity.title}</strong><span>${activity.done ? "Conclu\xEDda \xB7 pode brincar de novo" : "Vamos come\xE7ar?"}</span></span>${icon("arrow", 20)}</a>`).join("")}</div></section>
    <section aria-labelledby="achievements-title"><div class="section-line"><h2 id="achievements-title">Minhas conquistas</h2><span class="shelf-note">Uma alegria a cada atividade</span></div><div class="achievement-grid">${progress.achievements.map((achievement) => `<article class="achievement-card ${achievement.color} ${achievement.unlocked ? "earned" : ""}" data-achievement="${achievement.id}"><div class="achievement-symbol" aria-hidden="true">${icon(achievement.icon, 38)}</div><span class="achievement-status">${icon(achievement.unlocked ? "check" : "lock", 14)} ${achievement.unlocked ? "Conquistada!" : "Para conquistar"}</span><h3>${achievement.title}</h3><p>${achievement.unlocked ? achievement.description : achievement.hint}</p><span class="achievement-steps">${achievement.completedSteps} de ${achievement.totalSteps} ${achievement.totalSteps === 1 ? "etapa conclu\xEDda" : "etapas conclu\xEDdas"}</span></article>`).join("")}</div></section>
    ${mascot(progress.done === progress.total ? "Voc\xEA ganhou todas as conquistas! Podemos brincar e ler de novo sempre que quiser." : next ? `Vamos ganhar uma conquista? A pr\xF3xima atividade pode ser ${next.title}. Eu vou com voc\xEA!` : "Cada atividade \xE9 uma nova conquista!", true)}</section>`;
  }
  function completion(type) {
    const activity = ACTIVITIES.find((a) => a.id === type);
    const game2 = activity.kind === "game";
    return `<section class="celebration page-container"><span class="eyebrow">Cada atividade \xE9 um passo a mais</span><div class="celebration-art"><img src="assets/elefante-guia.png" alt="Elefantinho comemorando" width="190" height="202"><span aria-hidden="true">\u2726</span></div><h1>${type === "vogais" ? "Voc\xEA encontrou as vogais!" : game2 ? "Que brincadeira boa!" : "Que hist\xF3ria gostosa!"}</h1><p>${game2 ? `Voc\xEA concluiu ${activity.title}. Foi muito bom brincar com voc\xEA!` : `Voc\xEA chegou ao fim de ${activity.title}. O que mais gostou de descobrir?`}</p><div id="save-state" class="save-state" role="status">Guardando seu progresso\u2026</div><div id="earned-achievements" class="earned-achievements"></div><div class="celebration-actions">${button("De novo! " + icon("play", 19), "restart-activity", "button primary", `data-activity="${activity.id}"`)}<a href="#progressos" class="button outline">Ver progressos ${icon("star", 19)}</a></div><a href="#inicio" class="text-link">Voltar ao in\xEDcio</a></section>`;
  }
  async function recordCompletion(activity) {
    const tokenAtStart = child?.token;
    const previousAchievements = new Set(getProgress(completed).achievements.filter((a) => a.unlocked).map((a) => a.id));
    pendingSave = activity;
    try {
      if (child) {
        const data = await api.complete(tokenAtStart, activity);
        if (child?.token !== tokenAtStart) return;
        completed = data.completed;
        child.completed = completed;
        storage.set("abc_child_session", child);
      } else {
        demoCompleted = addCompletion(demoCompleted, activity);
        completed = demoCompleted;
        storage.set("abc_exploration", demoCompleted);
      }
      pendingSave = null;
      const newlyEarned = getProgress(completed).achievements.filter((a) => a.unlocked && !previousAchievements.has(a.id));
      showSavedProgress(newlyEarned);
      if (safeRoute(location.hash) === "progressos") render();
    } catch (e) {
      if ($("#save-state")) $("#save-state").innerHTML = `<p>${escapeHTML(e.message)}</p>${button("Tentar guardar de novo", "retry-save", "button outline")}`;
    }
  }
  function showSavedProgress(newlyEarned = []) {
    const status = $("#save-state");
    if (!status) return;
    status.textContent = (child ? "Progresso salvo no seu perfil." : "Progresso salvo nesta aba.") + (newlyEarned.length ? ` Conquistas desbloqueadas: ${newlyEarned.map((a) => a.title).join(" e ")}.` : "");
    const rewards = $("#earned-achievements");
    if (rewards) rewards.innerHTML = newlyEarned.length ? `<h2>Voc\xEA ganhou!</h2><div class="earned-badges">${newlyEarned.map((a) => `<div class="earned-badge">${icon(a.icon, 25)}<strong>${a.title}</strong>${icon("check", 17)}</div>`).join("")}</div>` : "";
  }
  function field(id, label, type = "text", autocomplete = "", hint = "", value = "") {
    return `<div class="field"><label for="${id}">${label}</label><div class="input-wrap"><input id="${id}" name="${id}" type="${type}" ${autocomplete ? `autocomplete="${autocomplete}"` : ""} ${value ? `value="${escapeHTML(value)}"` : ""} aria-describedby="${id}-help ${id}-error" ${type === "password" ? 'minlength="10"' : ""}>${type === "password" ? button("Mostrar", "toggle-password", "password-toggle", `data-input="${id}" aria-label="Mostrar senha" aria-pressed="false"`) : ""}</div><span id="${id}-help" class="field-help">${hint}</span><span id="${id}-error" class="field-error"></span></div>`;
  }
  function accountNotice() {
    return api.configured ? "" : '<div class="connection-note" role="status"><strong>As contas ainda n\xE3o est\xE3o dispon\xEDveis.</strong><p>Voc\xEA j\xE1 pode brincar e ler hist\xF3rias. O progresso e as conquistas ficam nesta aba durante a explora\xE7\xE3o.</p><a href="#inicio">Explorar as atividades \u2192</a></div>';
  }
  function adultShell(body) {
    return `<section class="adult-page page-container">${backLink()}<div class="adult-layout"><div class="adult-intro"><span class="eyebrow">Aprender junto faz a diferen\xE7a</span><h1>Um pequeno passo.<br>Um mundo de descobertas.</h1><p>Fam\xEDlia e escola acompanham cada descoberta, respeitando o tempo de cada crian\xE7a.</p><img src="assets/elefante-guia.png" alt="Elefantinho do ABC do saber" width="220" height="234"><div class="adult-assurance">${icon("lock", 20)}<span>A crian\xE7a brinca.<br>Os adultos cuidam do acesso.</span></div></div><div class="adult-form-panel">${body}</div></div></section>`;
  }
  function login() {
    return adultShell(`<span class="eyebrow">\xC1rea dos adultos</span><h2>Que bom ter voc\xEA aqui.</h2><p>Entre para abrir um perfil ou acompanhar as descobertas.</p>${accountNotice()}<form id="login-form" novalidate>${field("email", "E-mail", "email", "email")}${field("password", "Senha", "password", "current-password")}<div class="form-error" role="alert"></div><button type="submit" class="button primary full" ${!api.configured ? "disabled" : ""}>Entrar ${icon("arrow", 20)}</button><a href="#recuperar" class="form-link">Esqueci minha senha</a></form><div class="form-bottom">Primeira vez por aqui? <a href="#cadastro">Criar conta de adulto</a></div>`);
  }
  function signup() {
    return adultShell(`<span class="eyebrow">Vamos come\xE7ar</span><h2>Uma conta para acompanhar.</h2><p>O acesso \xE9 do adulto. A crian\xE7a ter\xE1 seu pr\xF3prio perfil.</p>${accountNotice()}<form id="signup-form" novalidate><fieldset class="role-picker"><legend>Eu sou</legend><label><input type="radio" name="role" value="parent" ${signupRole === "parent" ? "checked" : ""}>Respons\xE1vel</label><label><input type="radio" name="role" value="teacher" ${signupRole === "teacher" ? "checked" : ""}>Professor(a)</label></fieldset>${field("name", "Seu nome", "text", "name")}${field("school", "Nome da escola", "text", "organization", "Preencha se voc\xEA for professor(a).")}${field("email", "Seu e-mail", "email", "email")}${field("password", "Crie uma senha", "password", "new-password", "Use pelo menos 10 caracteres.")}<div class="form-error" role="alert"></div><button type="submit" class="button primary full" ${!api.configured ? "disabled" : ""}>Criar minha conta ${icon("arrow", 20)}</button></form><div class="form-bottom">J\xE1 tem conta? <a href="#adultos">Entrar</a></div>`);
  }
  function recovery(reset = false) {
    return adultShell(`<span class="eyebrow">Acesso \xE0 sua conta</span><h2>${reset ? "Crie uma nova senha." : "Vamos recuperar seu acesso."}</h2><p>${reset ? "Escolha uma senha que s\xF3 voc\xEA conhe\xE7a." : "Enviaremos um link para o seu e-mail."}</p>${accountNotice()}<form id="${reset ? "reset" : "recover"}-form" novalidate>${reset ? field("password", "Nova senha", "password", "new-password", "Pelo menos 10 caracteres.") : field("email", "Seu e-mail", "email", "email")}<div class="form-error" role="alert"></div><button type="submit" class="button primary full" ${!api.configured ? "disabled" : ""}>${reset ? "Salvar nova senha" : "Enviar link de recupera\xE7\xE3o"}</button></form><a href="#adultos" class="form-link">Voltar para entrar</a>`);
  }
  function childAvatar(name) {
    const names = ["star", "heart", "book"];
    const n = names.includes(name) ? name : "star";
    return `<span class="child-avatar avatar-${n}">${icon(n, 27)}</span>`;
  }
  function dashboardPage() {
    if (!dashboard || !api.session) return login();
    const { adult, children = [], grants = [] } = dashboard;
    const parent = adult.role === "parent";
    return `<section class="page-container dashboard">${backLink()}<div class="dashboard-heading"><div><span class="eyebrow">${parent ? "\xC1rea da fam\xEDlia" : "\xC1rea do professor"}</span><h1>Ol\xE1, ${escapeHTML(adult.name)}.</h1><p>${parent ? "Aqui come\xE7am as descobertas de quem voc\xEA acompanha." : `Abra uma atividade com uma crian\xE7a autorizada. ${escapeHTML(adult.school || "")}`}</p></div>${button("Sair da conta", "logout", "button outline")}</div><div class="dashboard-columns"><section class="dashboard-main"><div class="section-line"><h2>${parent ? "Perfis das crian\xE7as" : "Crian\xE7as autorizadas"}</h2>${parent ? button("+ Novo perfil", "new-child", "button small primary") : ""}</div>${children.length ? `<div class="child-grid">${children.map((c) => `<article class="child-card">${childAvatar(c.avatar)}<h3>${escapeHTML(c.name)}</h3><p>${getProgress(c.completed).done} de ${getProgress(c.completed).total} atividades conclu\xEDdas \xB7 ${getProgress(c.completed).unlockedCount} conquistas</p><ul class="child-records">${ACTIVITIES.map((a) => `<li>${c.completed?.includes(a.id) ? "\u2713" : "\u25CB"} ${a.title}</li>`).join("")}</ul>${button("Abrir para brincar " + icon("arrow", 18), "open-child", "button primary", `data-id="${escapeHTML(c.id)}"`)}</article>`).join("")}</div>` : `<div class="empty-state">${icon("heart", 36)}<h3>${parent ? "Uma nova descoberta come\xE7a aqui." : "Ainda n\xE3o h\xE1 perfis autorizados."}</h3><p>${parent ? "Crie um perfil com nome de exibi\xE7\xE3o e avatar." : "Crie um convite e compartilhe com o respons\xE1vel. A crian\xE7a aparecer\xE1 aqui ap\xF3s a autoriza\xE7\xE3o."}</p></div>`}</section><aside class="dashboard-side"><div class="side-card"><span class="eyebrow">Fam\xEDlia e escola juntas</span><h2>${parent ? "Vincular \xE0 escola" : "Convidar uma fam\xEDlia"}</h2><p>${parent ? "Recebeu um convite? Confira o professor antes de autorizar o acesso a um perfil." : "Gere um c\xF3digo para o respons\xE1vel autorizar o acesso a uma crian\xE7a. O c\xF3digo vale por 7 dias e pode ser usado uma vez."}</p>${parent ? `<form id="invite-form" novalidate>${field("invite", "C\xF3digo do convite", "text", "off")}<div class="form-error" role="alert"></div><button type="submit" class="button outline full">Conferir convite</button></form>` : button("Gerar convite", "create-invite", "button primary full")}<div id="invite-result" role="status"></div></div>${parent ? `<div class="side-card"><h2>Acessos autorizados</h2>${grants.length ? grants.map((g) => `<div class="grant-row"><strong>${escapeHTML(g.teacher_name)}</strong><p>${escapeHTML(g.school)} \xB7 ${escapeHTML(g.child_name)}</p>${button("Revogar acesso", "revoke", "button danger small", `data-id="${escapeHTML(g.id)}" data-name="${escapeHTML(g.teacher_name)}"`)}</div>`).join("") : "<p>Nenhum professor tem acesso aos perfis.</p>"}</div>` : ""}</aside></div></section>`;
  }
  function updateStrip() {
    const el = $("#session-strip");
    el.hidden = false;
    if (child) el.innerHTML = `<span>${childAvatar(child.child.avatar)} Brincando como <strong>${escapeHTML(child.child.name)}</strong></span>${button("Encerrar e trocar de crian\xE7a", "end-child", "strip-button")}`;
    else el.innerHTML = `<span><span class="exploration-dot"></span> Modo de explora\xE7\xE3o <span class="strip-detail">\xB7 Seu progresso fica nesta aba.</span></span><a href="#adultos">Entrar com um adulto ${icon("arrow", 15)}</a>`;
  }
  function render() {
    const version = ++routeVersion;
    const route = safeRoute(location.hash);
    const activityUpdate = route === renderedRoute && (GAMES.some((g) => g.route === route) || STORIES.some((story) => story.route === route));
    if (!activityUpdate && "speechSynthesis" in window) speechSynthesis.cancel();
    const adultRoutes = ["adultos", "cadastro", "recuperar", "nova-senha", "painel"];
    if (child && adultRoutes.includes(route)) {
      location.replace("#inicio");
      showEndSession();
      return;
    }
    const views = { inicio: home, brincar: gameCatalog, jogo: game, memoria: memoryGame, figuras: figureGame, jardim: gardenGame, trem: trainGame, historias: stories, ...Object.fromEntries(STORIES.map((story) => [story.route, () => reader(story)])), progressos: progressPage, adultos: () => api.session && dashboard ? dashboardPage() : login(), cadastro: signup, recuperar: recovery, "nova-senha": () => recovery(true), painel: dashboardPage, "fim-jogo": () => completion("vogais"), "fim-historia": () => completion("casa-das-vogais") };
    const titles = { inicio: "Uma descoberta de cada vez", brincar: "Brincar", jogo: "Encontre a letra", historias: "Hist\xF3rias", livro: "A Casa das Vogais", progressos: "Meus progressos", adultos: "\xC1rea dos adultos", cadastro: "Criar conta", recuperar: "Recuperar acesso", "nova-senha": "Nova senha", painel: "Acompanhar progressos", "fim-jogo": "Vogais descobertas!", "fim-historia": "Hist\xF3ria conclu\xEDda!" };
    const finishedActivity = ACTIVITIES.find((a) => completionRoute(a.id) === route);
    if (finishedActivity) views[route] = () => completion(finishedActivity.id);
    for (const activity of ACTIVITIES) titles[activity.route] = activity.title;
    if (finishedActivity) titles[route] = "Atividade conclu\xEDda";
    const html = views[route] ? views[route]() : `<section class="page-container not-found">${heading("Vamos voltar?", "Esta p\xE1gina n\xE3o est\xE1 por aqui.")}<a href="#inicio" class="button primary">Voltar ao in\xEDcio</a></section>`;
    if (activityUpdate) updateActivityView(main, html);
    else main.innerHTML = html;
    renderedRoute = route;
    document.title = `${titles[route] || "P\xE1gina n\xE3o encontrada"} \xB7 ABC do saber`;
    document.body.classList.toggle("adult-mode", adultRoutes.includes(route));
    document.querySelectorAll("[data-nav]").forEach((a) => {
      const active = a.dataset.nav === (finishedActivity ? "progressos" : GAMES.some((g) => g.route === route) ? "brincar" : STORIES.some((story) => story.route === route) ? "historias" : route);
      if (active) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    if (!activityUpdate) {
      updateStrip();
      main.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: "instant" });
    }
    if (finishedActivity) {
      const activity = finishedActivity.id;
      if (pendingSave === activity) recordCompletion(activity);
      else if (completed.includes(activity)) showSavedProgress();
      else $("#save-state").innerHTML = '<p>Vamos concluir uma atividade para ganhar uma conquista?</p><a href="#brincar">Escolher uma brincadeira \u2192</a>';
    }
    if (!activityUpdate && sound && (GAMES.some((g) => g.route === route) || currentStory())) setTimeout(() => {
      if (version === routeVersion) {
        const story = currentStory();
        speak(story ? story.pages[storyStates[story.id].page].text : currentGuide);
      }
    }, 120);
  }
  function focusAfterChoice(event, selector) {
    if (event.detail !== 0) return;
    const target = $(selector);
    if (!target) return;
    target.focus({ preventScroll: true });
    const rect = target.getBoundingClientRect();
    if (rect.top < 0 || rect.bottom > innerHeight) target.scrollIntoView({ block: "nearest", behavior: "instant" });
  }
  function nextStage(event, selector) {
    render();
    focusAfterChoice(event, selector);
    speak(currentGuide);
  }
  function clearActivityHints() {
    for (const key2 of Object.keys(hints)) hints[key2] = false;
    feedback.letter = "";
    feedback.figure = "";
    tried.letter = "";
    tried.figure = "";
    tried.train = "";
    tried.garden = -1;
  }
  function showDialog(title, body, { onConfirm, confirm = "Confirmar", danger = false } = {}) {
    const dialog = $("#app-dialog");
    dialog.innerHTML = `<div class="dialog-content"><h2 id="dialog-title">${title}</h2>${body}<div class="dialog-actions">${button("Voltar", "close-dialog", "button outline")}${onConfirm ? button(confirm, "confirm-dialog", `button ${danger ? "danger" : "primary"}`) : ""}</div><div class="dialog-error" role="alert"></div></div>`;
    dialog.confirmAction = onConfirm;
    dialog.showModal();
    dialog.querySelector(danger ? '[data-action="close-dialog"]' : "input,select,button")?.focus();
  }
  function showEndSession() {
    showDialog("Encerrar esta sess\xE3o?", `<p>O progresso j\xE1 salvo continua no perfil. Para trocar de crian\xE7a ou voltar \xE0 \xE1rea adulta, o adulto precisar\xE1 entrar novamente.${pendingSave ? " H\xE1 uma atividade que ainda n\xE3o foi salva. Volte e tente guardar antes de encerrar." : ""}</p>`, { confirm: "Encerrar sess\xE3o", onConfirm: async () => {
      if (child) await api.endChild(child.token);
      clearInterval(sessionCheck);
      child = null;
      storage.set("abc_child_session", null);
      completed = demoCompleted;
      pendingSave = null;
      $("#app-dialog").close();
      api.session = null;
      dashboard = null;
      go("adultos");
      render();
    } });
  }
  async function verifyChild() {
    if (!child) return;
    const token = child.token;
    try {
      const data = await api.childStatus(token);
      if (child?.token === token) {
        completed = data.completed;
        child.completed = completed;
        storage.set("abc_child_session", child);
      }
    } catch (e) {
      if (child?.token !== token) return;
      if ([400, 401, 403].includes(e.status)) {
        clearInterval(sessionCheck);
        child = null;
        storage.set("abc_child_session", null);
        completed = demoCompleted;
        pendingSave = null;
        go("adultos");
        toast(e.message);
      }
    }
  }
  async function refreshDashboard() {
    dashboard = await api.dashboard();
    render();
  }
  async function busy(el, task) {
    if (el.disabled) return;
    el.disabled = true;
    el.setAttribute("aria-busy", "true");
    try {
      await task();
    } catch (e) {
      const dialog = $("#app-dialog");
      if (dialog.open) dialog.querySelector(".dialog-error").textContent = e.message;
      else toast(e.message);
    } finally {
      el.disabled = false;
      el.removeAttribute("aria-busy");
    }
  }
  document.addEventListener("click", async (e) => {
    const el = e.target.closest("[data-action]");
    if (!el) return;
    const action = el.dataset.action;
    if (action === "speak") {
      sound = true;
      updateSound();
      speak(currentGuide, true);
    }
    if (action === "read-page") {
      const story = currentStory();
      if (story) {
        sound = true;
        updateSound();
        speak(story.pages[storyStates[story.id].page].text, true);
      }
    }
    if (action === "letter-hint") {
      hints.letter = !hints.letter;
      render();
    }
    if (action === "answer" && !answered) {
      const item = VOWELS[round];
      tried.letter = el.dataset.letter;
      if (el.dataset.letter === item.letter) {
        answered = true;
        feedback.letter = "";
      } else {
        hints.letter = true;
        feedback.letter = `Vamos olhar de novo? Procure a pe\xE7a com a mesma forma da letra ${item.letter}.`;
      }
      render();
      if (answered) focusAfterChoice(e, '[data-action="next-round"]');
      speak(currentGuide);
    }
    if (action === "next-round" && answered) {
      if (round < 4) {
        round++;
        answered = false;
        choices = optionsFor(VOWELS[round].letter);
        clearActivityHints();
        nextStage(e, '[data-action="answer"]');
      } else finishActivity("vogais");
    }
    if (action === "restart-game") restartActivity("vogais");
    if (action === "next-page" || action === "previous-page") {
      const story = currentStory();
      if (!story) return;
      const state = storyStates[story.id];
      state.page = Math.max(0, Math.min(story.pages.length - 1, state.page + (action === "next-page" ? 1 : -1)));
      render();
      focusAfterChoice(e, action === "next-page" ? state.page === story.pages.length - 1 ? '[data-action="finish-story"]' : '[data-action="next-page"]' : '[data-action="previous-page"]');
      speak(story.pages[state.page].text);
    }
    if (action === "finish-story") {
      const story = currentStory();
      if (!story || storyStates[story.id].seen.size !== story.pages.length) return;
      finishActivity(story.id);
    }
    if (action === "restart-activity") restartActivity(el.dataset.activity);
    if (action === "memory-size") {
      const n = Number(el.dataset.pairs);
      if ([3, 5].includes(n) && n * 2 !== memory.deck.length) {
        memory = createMemoryGame(Math.random, n);
        hints.memory = false;
        render();
      }
    }
    if (action === "memory-peek") {
      hints.memory = !hints.memory;
      render();
      speak(hints.memory ? "Olhe as letras. Depois, escolha Voltar a brincar." : memory.message);
    }
    if (action === "memory-card" && !hints.memory) {
      const previous = memory;
      memory = turnMemoryCard(memory, Number(el.dataset.index));
      if (previous === memory) return;
      render();
      const index = Number(el.dataset.index);
      const next = memory.selected.length === 2 ? '[data-action="memory-reset"]' : memory.matched.length === memory.deck.length ? '[data-action="finish-memory"]' : `.memory-card[data-index="${memory.deck.findIndex((_, i) => i > index && !memory.matched.includes(i) && !memory.selected.includes(i))}"]:not(:disabled)`;
      focusAfterChoice(e, $(next) ? next : ".memory-card:not(:disabled)");
      speak(memory.message);
    }
    if (action === "memory-reset") {
      memory = { ...memory, selected: [], message: "Vamos procurar outro par. Voc\xEA pode tentar quantas vezes quiser!" };
      nextStage(e, ".memory-card:not(:disabled)");
    }
    if (action === "finish-memory" && memory.matched.length === memory.deck.length) finishActivity("memoria-vogais");
    if (action === "figure-mode") {
      figureHint = el.dataset.hint === "true";
      hints.figure = false;
      feedback.figure = "";
      render();
    }
    if (action === "figure-hint") {
      hints.figure = !hints.figure;
      render();
    }
    if (action === "figure-answer" && !figureAnswered) {
      const item = VOWELS[figureRound];
      tried.figure = el.dataset.letter;
      if (el.dataset.letter === item.letter) {
        figureAnswered = true;
        feedback.figure = "";
      } else {
        hints.figure = true;
        feedback.figure = `Vamos olhar de novo? ${item.word} come\xE7a com a letra ${item.letter}.`;
      }
      render();
      if (figureAnswered) focusAfterChoice(e, '[data-action="next-figure"]');
      speak(currentGuide);
    }
    if (action === "next-figure" && figureAnswered) {
      if (figureRound < VOWELS.length - 1) {
        figureRound++;
        figureAnswered = false;
        figureChoices = optionsFor(VOWELS[figureRound].letter);
        clearActivityHints();
        nextStage(e, '[data-action="figure-answer"]');
      } else finishActivity("letras-figuras");
    }
    if (action === "pick-flower") {
      const index = Number(el.dataset.index);
      const previous = garden;
      garden = pickFlower(garden, index);
      if (previous === garden) return;
      tried.garden = garden.flowers[index] !== garden.target ? index : -1;
      render();
      const nextIndex = garden.flowers.findIndex((_, i) => i > index && !garden.found.includes(i));
      if (garden.found.includes(index)) focusAfterChoice(e, garden.found.length === 3 ? '[data-action="next-garden"]' : nextIndex >= 0 ? `.flower-tile[data-index="${nextIndex}"]` : ".flower-tile:not(:disabled)");
      speak(garden.message);
    }
    if (action === "next-garden" && garden.found.length === 3) {
      if (gardenRound < 4) {
        gardenRound++;
        garden = createGardenRound(gardenRound);
        clearActivityHints();
        nextStage(e, ".flower-tile:not(:disabled)");
      } else finishActivity("jardim-letras");
    }
    if (action === "train-hint") {
      hints.train = !hints.train;
      render();
    }
    if (action === "train-answer" && !trainAnswered) {
      const item = TRAIN_ROUNDS[trainRound];
      tried.train = el.dataset.letter;
      trainAnswered = el.dataset.letter === item.model[item.gap];
      if (!trainAnswered) hints.train = true;
      trainMessage = trainAnswered ? "O vag\xE3o est\xE1 completo. Boa viagem!" : "Olhe o mesmo vag\xE3o no trem modelo. Qual letra est\xE1 l\xE1?";
      render();
      if (trainAnswered) focusAfterChoice(e, '[data-action="next-train"]');
      speak(trainMessage);
    }
    if (action === "next-train" && trainAnswered) {
      if (trainRound < TRAIN_ROUNDS.length - 1) {
        trainRound++;
        trainAnswered = false;
        trainMessage = "";
        const item = TRAIN_ROUNDS[trainRound];
        trainChoices = optionsFor(item.model[item.gap]);
        clearActivityHints();
        nextStage(e, '[data-action="train-answer"]');
      } else finishActivity("trem-vogais");
    }
    if (action === "retry-save") await busy(el, () => recordCompletion(pendingSave));
    if (action === "end-child") showEndSession();
    if (action === "close-dialog") $("#app-dialog").close();
    if (action === "confirm-dialog") await busy(el, () => $("#app-dialog").confirmAction?.());
    if (action === "toggle-password") {
      const input = document.getElementById(el.dataset.input);
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      el.textContent = show ? "Ocultar" : "Mostrar";
      el.setAttribute("aria-pressed", String(show));
      el.setAttribute("aria-label", show ? "Ocultar senha" : "Mostrar senha");
    }
    if (action === "logout") await busy(el, async () => {
      await api.logout();
      dashboard = null;
      go("adultos");
      render();
    });
    if (action === "new-child") showDialog("Um novo perfil", `<form id="child-form" novalidate>${field("child-name", "Nome de exibi\xE7\xE3o", "text", "off", "De 2 a 30 caracteres. Pode ser um apelido.")}<fieldset class="avatar-picker"><legend>Escolha um avatar</legend>${["star", "heart", "book"].map((a, i) => `<label><input type="radio" name="avatar" value="${a}" ${i === 0 ? "checked" : ""}>${childAvatar(a)}<span>${{ star: "Estrela", heart: "Cora\xE7\xE3o", book: "Livro" }[a]}</span></label>`).join("")}</fieldset><div class="form-error" role="alert"></div><button type="submit" class="button primary full">Criar perfil</button></form>`);
    if (action === "create-invite") await busy(el, async () => {
      const data = await api.createInvite();
      $("#invite-result").innerHTML = `<p>Compartilhe este c\xF3digo com o respons\xE1vel:</p><strong class="invite-code">${escapeHTML(data.code)}</strong><p>V\xE1lido por 7 dias, para uma autoriza\xE7\xE3o.</p>`;
    });
    if (action === "revoke") showDialog("Revogar acesso?", `<p>${escapeHTML(el.dataset.name)} deixar\xE1 de acessar este perfil e de registrar atividades. Uma sess\xE3o infantil aberta por esse professor tamb\xE9m perder\xE1 acesso.</p>`, { danger: true, confirm: "Revogar acesso", onConfirm: async () => {
      await api.revokeGrant(el.dataset.id);
      $("#app-dialog").close();
      await refreshDashboard();
      toast("Acesso revogado.");
    } });
    if (action === "open-child") showDialog("Tudo pronto para brincar?", `<p>Vamos abrir a experi\xEAncia infantil. Para voltar \xE0 \xE1rea adulta ou trocar de crian\xE7a, ser\xE1 necess\xE1rio entrar novamente.</p>`, { confirm: "Abrir para brincar", onConfirm: async () => {
      const data = await api.startChild(el.dataset.id);
      await api.logout();
      dashboard = null;
      clearActivityHints();
      child = data;
      completed = data.completed;
      storage.set("abc_child_session", child);
      round = 0;
      answered = false;
      choices = optionsFor("A");
      storyStates = Object.fromEntries(STORIES.map((story) => [story.id, { page: 0, seen: /* @__PURE__ */ new Set([0]) }]));
      memory = createMemoryGame();
      gardenRound = 0;
      garden = createGardenRound();
      trainRound = 0;
      trainAnswered = false;
      trainMessage = "";
      trainChoices = optionsFor("E");
      figureHint = true;
      figureRound = 0;
      figureAnswered = false;
      figureChoices = optionsFor("A");
      pendingSave = null;
      $("#app-dialog").close();
      sessionCheck = setInterval(verifyChild, 6e4);
      go("inicio");
      render();
    } });
  });
  function formValue(form, name) {
    return form.elements.namedItem(name)?.value?.trim() || "";
  }
  function invalid(form, id, message) {
    const input = form.querySelector("#" + id);
    input?.setAttribute("aria-invalid", "true");
    const error = form.querySelector("#" + id + "-error");
    if (error) error.textContent = message;
    input?.focus();
    return false;
  }
  function validateEmail(form) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValue(form, "email")) || invalid(form, "email", "Digite um e-mail v\xE1lido.");
  }
  document.addEventListener("input", (e) => {
    const input = e.target;
    if (input.matches("input")) {
      input.removeAttribute("aria-invalid");
      const error = document.getElementById(input.id + "-error");
      if (error) error.textContent = "";
    }
  });
  document.addEventListener("change", (e) => {
    if (e.target.name === "role") signupRole = e.target.value;
  });
  document.addEventListener("submit", async (e) => {
    const form = e.target;
    if (!form.matches("form")) return;
    e.preventDefault();
    const error = form.querySelector(".form-error");
    if (error) error.textContent = "";
    if (["login-form", "signup-form", "recover-form"].includes(form.id) && !validateEmail(form)) return;
    const password = form.elements.namedItem("password")?.value || "";
    if (form.id === "login-form" && !password) return invalid(form, "password", "Digite sua senha.");
    if (["signup-form", "reset-form"].includes(form.id) && password.length < 10) return invalid(form, "password", "Use pelo menos 10 caracteres.");
    if (form.id === "signup-form" && formValue(form, "name").length < 2) return invalid(form, "name", "Digite seu nome.");
    if (form.id === "signup-form" && signupRole === "teacher" && formValue(form, "school").length < 2) return invalid(form, "school", "Informe a escola para apresentar no convite.");
    if (form.id === "child-form" && (formValue(form, "child-name").length < 2 || formValue(form, "child-name").length > 30)) return invalid(form, "child-name", "Use de 2 a 30 caracteres.");
    const submit = form.querySelector('[type="submit"]');
    if (submit.disabled) return;
    submit.disabled = true;
    submit.setAttribute("aria-busy", "true");
    try {
      if (form.id === "login-form") {
        dashboard = await api.login(formValue(form, "email").toLowerCase(), password);
        form.reset();
        go("painel");
      }
      if (form.id === "signup-form") {
        await api.signup({ email: formValue(form, "email").toLowerCase(), password, name: formValue(form, "name"), role: signupRole, school: formValue(form, "school") });
        form.reset();
        form.innerHTML = '<div class="success-note"><h3>Confira seu e-mail.</h3><p>Enviamos a confirma\xE7\xE3o para voc\xEA continuar. Depois, entre para criar ou acompanhar um perfil.</p><a href="#adultos" class="button primary">Voltar para entrar</a></div>';
      }
      if (form.id === "recover-form") {
        await api.recover(formValue(form, "email").toLowerCase());
        form.innerHTML = '<div class="success-note"><h3>Confira seu e-mail.</h3><p>Se houver uma conta, voc\xEA receber\xE1 o link de recupera\xE7\xE3o.</p><a href="#adultos" class="button outline">Voltar para entrar</a></div>';
      }
      if (form.id === "reset-form") {
        await api.resetPassword(password);
        go("adultos");
        toast("Senha atualizada. Entre com sua nova senha.");
      }
      if (form.id === "child-form") {
        await api.createChild(formValue(form, "child-name"), formValue(form, "avatar"));
        $("#app-dialog").close();
        await refreshDashboard();
        toast("Perfil criado.");
      }
      if (form.id === "invite-form") {
        const code = formValue(form, "invite");
        if (!code) throw new Error("Digite o c\xF3digo recebido do professor.");
        const preview = await api.previewInvite(code);
        if (!dashboard.children.length) throw new Error("Crie um perfil infantil antes de autorizar um professor.");
        showDialog("Autorizar este professor?", `<div class="invite-preview"><h3>${escapeHTML(preview.name)}</h3><p>${escapeHTML(preview.school)}</p><p>${escapeHTML(preview.email)}</p></div><p>Confira com a escola se este \xE9 o professor esperado. Ele poder\xE1 abrir atividades e ver o progresso e as conquistas do perfil escolhido. Voc\xEA pode revogar o acesso na sua \xE1rea.</p><div class="field"><label for="grant-child">Perfil que ser\xE1 autorizado</label><select id="grant-child">${dashboard.children.map((c) => `<option value="${escapeHTML(c.id)}">${escapeHTML(c.name)}</option>`).join("")}</select></div>`, { confirm: "Autorizar acesso", onConfirm: async () => {
          await api.acceptInvite(code, $("#grant-child").value);
          $("#app-dialog").close();
          await refreshDashboard();
          toast("Professor autorizado para este perfil.");
        } });
      }
    } catch (err) {
      if (error?.isConnected) error.textContent = err.message;
      else toast(err.message);
    } finally {
      submit.disabled = false;
      submit.removeAttribute("aria-busy");
    }
  });
  $("#sound-toggle").addEventListener("click", () => {
    sound = !sound;
    updateSound();
    if (sound) speak("Ol\xE1! Eu vou acompanhar voc\xEA nas descobertas.");
  });
  $("#adult-icon").innerHTML = icon("adult", 18);
  updateSound();
  document.querySelectorAll("[data-nav-icon]").forEach((el) => {
    el.innerHTML = icon(el.dataset.navIcon, 25);
  });
  window.addEventListener("hashchange", render);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && "speechSynthesis" in window) speechSynthesis.cancel();
    if (!document.hidden) verifyChild();
  });
  var recoveryParams = new URLSearchParams(location.hash.slice(1));
  if (recoveryParams.get("type") === "recovery" && recoveryParams.has("access_token")) {
    api.session = { access_token: recoveryParams.get("access_token") };
    history.replaceState(null, "", "#nova-senha");
  } else if (recoveryParams.has("access_token") || recoveryParams.has("error")) {
    history.replaceState(null, "", "#adultos");
  }
  if (child) {
    if (api.configured) {
      verifyChild();
      sessionCheck = setInterval(verifyChild, 6e4);
    } else {
      child = null;
      storage.set("abc_child_session", null);
      completed = demoCompleted;
    }
  }
  render();
})();
