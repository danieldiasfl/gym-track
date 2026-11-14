# FitTrack — protótipo de acompanhamento de treinos

Aplicação web responsiva para organizar treinos, exercícios e histórico. Esta versão é um protótipo frontend: não usa backend nem banco de dados. Os dados são salvos no `localStorage` do navegador.

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

- Na tela inicial, escolha Alex ou Marina, ou crie um perfil.
- Dentro do perfil, crie, edite e exclua treinos.
- Abra um treino para gerenciar exercícios.
- Adicione exercícios e configure séries/repetições, carga, notas e dificuldade.
- Clique em **Iniciar treino**, ajuste os valores efetivamente realizados e finalize.
- Abra **Histórico** para consultar as sessões salvas.

Os dados ficam no armazenamento local do navegador. Eles não são sincronizados entre computadores, navegadores ou usuários. Para voltar aos dados de demonstração originais, abra as ferramentas do navegador → Application/Armazenamento → Local Storage → seu endereço local → apague a chave `fittrack-data`.

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

Não é necessário configurar banco de dados, variáveis de ambiente ou funções server-side nesta versão.

### D. Atualizar o site depois de mudar o código

Sempre que quiser publicar uma alteração:

```bash
git add .
git commit -m "Describe your change"
git push
```

O Cloudflare Pages detecta o novo commit, executa `npm run build` e publica a versão atualizada automaticamente.

## 4. Limitações importantes desta versão

- Não há login real: a escolha de perfil é apenas uma seleção local.
- Os dados ficam no navegador/dispositivo em que foram cadastrados.
- Limpar os dados do navegador pode apagar os registros.
- Não existe sincronização entre usuários ou dispositivos.
- O histórico guarda uma cópia dos dados registrados na sessão, portanto alterações futuras no treino não reescrevem sessões antigas.
- Esta versão usa dados demonstrativos para iniciar a experiência.

## 5. Próxima etapa: conectar o Supabase

Quando o protótipo estiver aprovado, a evolução natural é criar tabelas para `profiles`, `workouts`, `exercises`, `workout_sessions` e `session_exercises`, configurar autenticação e substituir a camada de `localStorage` por chamadas ao Supabase. A interface pode ser mantida praticamente igual.

## Comandos úteis

```bash
npm run dev      # servidor local de desenvolvimento
npm run build    # verifica tipos e gera a versão de produção em dist/
npm run preview  # testa localmente a versão de produção
```
