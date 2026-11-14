# FitTrack — protótipo de acompanhamento de treinos

Aplicação web responsiva para organizar treinos, exercícios e histórico. A interface fala com Pages Functions em `/api`, e essas funções leem e gravam no Cloudflare D1.

## Requisitos

- Node.js 20.19+ ou 22.12+ (recomendado: versão LTS atual)
- npm (instalado junto com Node.js)
- Git e conta no GitHub (somente para publicar pelo fluxo Git)

## 1. Executar no seu computador

1. Instale o Node.js: https://nodejs.org/
2. Extraia o arquivo ZIP.
3. Abra a pasta `fittrack` no VS Code.
4. Abra o terminal integrado do VS Code (`Terminal` → `New Terminal`).
5. Execute:

```bash
npm install
npm run dev
```

6. O terminal mostrará um endereço local, normalmente `http://localhost:5173`.
7. Abra esse endereço no navegador.

Para parar o servidor, volte ao terminal e pressione `Ctrl + C`.

## 2. Como testar a aplicação

- Na tela inicial, crie um perfil ou escolha um que já esteja no banco.
- Dentro do perfil, crie, edite e exclua treinos.
- Abra um treino para gerenciar exercícios.
- Adicione exercícios e configure séries/repetições, carga, notas e dificuldade.
- Clique em **Iniciar treino**, ajuste os valores efetivamente realizados e finalize.
- Abra **Histórico** para consultar as sessões salvas.

Os dados vêm do D1. No `npm run dev` puro a API não existe; use `npm run dev:cf` para subir o Vite junto com as Pages Functions. Antes disso, aplique o schema e deixe o binding `DB` apontando para o seu banco (veja a seção 3).

## 3. Publicar gratuitamente no Cloudflare Pages

A maneira mais simples é publicar conectando o projeto a um repositório GitHub. Assim, cada `git push` pode disparar uma nova publicação.

### A. Criar uma conta e um repositório no GitHub

1. Crie uma conta em https://github.com/ (se ainda não tiver).
2. Clique em **New repository**.
3. Dê o nome `fittrack`.
4. Marque **Private** se quiser manter o código privado, ou **Public** se não houver problema em deixá-lo público.
5. Crie o repositório. Se possível, crie-o vazio, sem README, licença ou `.gitignore` (o projeto já tem README).

### B. Enviar o projeto para o GitHub

No terminal do VS Code, dentro da pasta do projeto, execute os comandos abaixo. Troque `SEU-USUARIO` pelo seu nome de usuário do GitHub:

```bash
git init
git add .
git commit -m "Initial FitTrack app"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/fittrack.git
git push -u origin main
```

Se o Git pedir autenticação, siga a janela de login do navegador. Caso `git` não seja reconhecido, instale-o em https://git-scm.com/downloads e reabra o terminal.

### C. Criar o site no Cloudflare Pages

1. Acesse https://dash.cloudflare.com/ e crie uma conta gratuita.
2. No painel, entre em **Workers & Pages**.
3. Escolha **Create application** e depois **Pages** (a opção pode aparecer como **Import an existing Git repository**).
4. Conecte sua conta GitHub e autorize o acesso ao repositório `fittrack`.
5. Selecione o repositório `fittrack`.
6. Configure o build:

   - **Project name:** `fittrack` (ou outro nome disponível)
   - **Production branch:** `main`
   - **Framework preset:** `Vite` (se não aparecer, escolha `None`)
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `/` ou deixe em branco

7. Clique em **Save and Deploy**.
8. Aguarde o build terminar. O Cloudflare mostrará um endereço semelhante a `https://fittrack.pages.dev`.

### D. Ligar o D1

1. No painel, abra **Storage & databases → D1** e confirme o nome do banco.
2. No projeto Pages, em **Settings → Bindings**, adicione o D1 com o nome da variável **`DB`**. A função só enxerga esse nome.
3. Na sua máquina, com o Wrangler autenticado (`npx wrangler login`), aplique as tabelas no banco `DB`:

```bash
npx wrangler d1 execute DB --remote --file=./migrations/0001_init.sql
```

O comando `npm run db:migrate` faz a mesma coisa.

4. Faça um novo deploy. As rotas em `functions/api` passam a responder em `/api/state`, `/api/users`, `/api/workouts`, `/api/exercises` e `/api/sessions`.

Não há login. Quem alcançar o site consegue ler e alterar os perfis desse banco.

### D. Atualizar o site depois de mudar o código

Sempre que quiser publicar uma alteração:

```bash
git add .
git commit -m "Describe your change"
git push
```

O Cloudflare Pages detecta o novo commit, executa `npm run build` e publica a versão atualizada automaticamente.

## 4. Limitações importantes desta versão

- Não há login real: a escolha de perfil só escolhe um registro do banco.
- Qualquer pessoa com o endereço do site pode ler e gravar nesses perfis.
- O histórico guarda uma cópia dos dados registrados na sessão, portanto alterações futuras no treino não reescrevem sessões antigas.
- O banco começa vazio. Os perfis de demonstração (Alex e Marina) não são mais criados automaticamente.

## Comandos úteis

```bash
npm run dev        # só a interface; /api não responde
npm run dev:cf     # interface + Pages Functions, com o binding do wrangler.toml
npm run db:migrate # cria as tabelas no D1 remoto chamado DB
npm run build      # verifica tipos e gera a versão de produção em dist/
npm run preview    # testa localmente a versão de produção, sem a API
```
