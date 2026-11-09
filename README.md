# ABC do Saber 🐘

Um quintal de descobertas para a alfabetização infantil: letras, brincadeiras, histórias e conquistas, com um elefantinho que acompanha a criança.

Pensado para crianças de 3 a 5 anos, com acompanhamento de familiares ou professores. A experiência é em português, com botões grandes, ilustrações, pistas visuais e voz opcional. Não há limite de tempo, vidas ou ranking.

## Brincar e aprender

- **Encontre a letra:** reconheça as cinco vogais com pistas e figuras.
- **Memória das vogais:** encontre pares, escolha a quantidade de cartas e use a opção de espiar.
- **Letra e figura:** descubra a vogal inicial de cada palavra.
- **Jardim das letras:** encontre três flores da letra indicada em cada canteiro.
- **Trem das vogais:** compare as letras com o modelo e complete o vagão vazio.
- **Histórias:** A Casa das Vogais, O Elefantinho e a Semente e A Pipa da Amizade, com cinco cenas cada.
- **Progressos:** acompanhe oito atividades e desbloqueie dez conquistas ao concluir as propostas. Repetições não duplicam conquistas.

O mascote usa a síntese de voz do navegador em português após ativação pelo adulto ou criança. Não usa microfone. Todas as atividades podem ser realizadas sem áudio, e animações respeitam a preferência por movimento reduzido.

## Desenvolvimento

HTML, CSS e JavaScript, com módulos em `src/`. O esbuild gera `app.bundle.js`, um script compatível com a abertura direta do HTML, e prepara a pasta `_site/` para publicação. Após editar os módulos, execute `npm run build` e inclua o bundle atualizado no commit.

- `src/app.js`: navegação, atividades e interface.
- `src/domain.js`: regras dos jogos, histórias e conquistas.
- `src/view.js`: atualização das atividades sem recriar a página a cada escolha.
- `src/api.js`: integração opcional de contas.
- `assets/`: logo, mascote, ilustrações e fontes locais, com suas licenças.
- `supabase/migrations/`: estrutura e regras de autorização do backend opcional.

## Contas e privacidade

**O site publicado funciona sem conta. O Supabase não está configurado por padrão.** No modo de exploração, somente os identificadores de atividades concluídas são guardados na sessão da aba; não há sincronização entre dispositivos. O comportamento do armazenamento em abertura por arquivo pode variar entre navegadores; prefira o site publicado para uso regular.

As migrações implementam RLS e operações RPC com autorização. Sessões infantis têm duração limitada; senhas e tokens de autenticação de adultos não são persistidos no navegador. Os testes locais de contas usam simulações e não validam envio real de e-mail.

## Checklist de avaliação do frontend

- [x] Deploy e funcionamento — O link publicado abre a aplicação no navegador. A página carrega com o CSS e o JavaScript funcionando, sem tela em branco, listagem de pastas ou erros de carregamento.

- [x] Interatividade sem recarregamento — Os cliques e envios de formulários são tratados pelo JavaScript. O preventDefault() impede o envio padrão dos formulários, permitindo cadastrar, editar e remover itens sem recarregar a página.

- [x] Persistência de dados — Os dados são salvos no navegador com localStorage ou sessionStorage. Ao atualizar a página com F5, os dados salvos são recuperados e continuam visíveis na tela.

- [x] Estabilidade do console — Ao testar os recursos da aplicação com o DevTools aberto (F12 → Console), nenhum erro em vermelho aparece.

- [x] Adaptabilidade e responsividade — A interface se ajusta a telas de celular sem quebrar o layout ou gerar rolagem horizontal indesejada. As imagens informativas têm descrições no atributo alt, e as tags HTML semânticas ajudam na navegação por leitores de tela.

## Contribuição e agradecimento

Agradeço a *Felipe Schneider* pela contribuição na criação deste repositório. Ele disponibilizou seu MacBook para que eu pudesse configurar o repositório no GitHub e enviar os arquivos do projeto.
