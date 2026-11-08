# ABC do Saber 🐘

Um quintal de descobertas para a alfabetização infantil: letras, brincadeiras, histórias e conquistas, com um elefantinho que acompanha a criança.

**[Abrir o site](https://schneiderfelipe922-byte.github.io/ABC-do-Saber/)**

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

## Abrir pela pasta

Baixe e extraia o projeto e dê dois cliques em **index.html**. A versão pronta `app.bundle.js` está incluída: não é necessário instalar Node.js para explorar as brincadeiras e histórias.

Para desenvolvimento ou recursos de conta, use um servidor HTTP. Com Node.js 22 ou superior:

```sh
npm ci
npm run build
npm start
```

Abra **http://127.0.0.1:4173**. No macOS, o arquivo **Abrir ABC do saber.command** também inicia o servidor; mantenha o terminal aberto durante o uso. O servidor é somente local.

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

A integração opcional oferece contas de responsáveis e professores, perfis infantis e convites com autorização da família. Para ativá-la:

1. Crie um projeto Supabase e aplique as três migrações de `supabase/migrations/` em ordem.
2. Habilite autenticação por e-mail, confirmação de e-mail, senha mínima de dez caracteres e envio de mensagens.
3. Configure a Site URL e os redirecionamentos para o endereço publicado, incluindo `https://schneiderfelipe922-byte.github.io/ABC-do-Saber/#nova-senha`.
4. Preencha somente a URL e a chave **publicável** em `config.js`. Nunca inclua `service_role`, senhas ou chaves privadas.
5. Teste cadastro, confirmação, recuperação, convites, autorização e revogação na instância real antes de usar contas com crianças.

As migrações implementam RLS e operações RPC com autorização. Sessões infantis têm duração limitada; senhas e tokens de autenticação de adultos não são persistidos no navegador. Os testes locais de contas usam simulações e não validam envio real de e-mail.

## Testes

```sh
npm run check
npm test
npm run test:database
npx playwright-core install chromium
# Com npm start em outro terminal:
npm run test:e2e
npm run test:header
npm run test:interactions
```

Os testes verificam regras de jogos, integração, autorização do banco, acessibilidade, navegação e estabilidade das atividades. Os relatórios locais em `docs/` não são publicados.

## Publicação no GitHub Pages

O workflow `.github/workflows/pages.yml` verifica o código, executa os testes unitários, gera o site e publica `_site/` a cada envio para `main`. Somente HTML, CSS, configuração pública, bundle e assets vão para a hospedagem. Arquivos de desenvolvimento, testes, histórico do protótipo e migrações ficam fora do site.

Endereço: **https://schneiderfelipe922-byte.github.io/ABC-do-Saber/**
