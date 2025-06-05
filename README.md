# Road Rumble

Road Rumble é um jogo 3D casual, desenvolvido em JavaScript com Three.js. O objetivo é atravessar estradas movimentadas, evitar obstáculos e apanhar moedas, desbloqueando skins e poderes especiais.

## Demonstração Online

Jogo online : [https://roadrumble.netlify.app/](https://roadrumble.netlify.app/)

## Funcionalidades

- Gráficos 3D low-poly com Three.js
- Personagem personalizável com várias skins
- Power-ups: escudo, foguete, íman e vidas extra
- Sistema de moedas e loja
- Dificuldade progressiva
- Suporte para desktop apenas

## Como jogar em modo de desenvolvimento

1. **Clonar o repositório:**
   ```bash
   git clone https://github.com/Ancaetano123/icg_project
   cd icg_project
   ```

2. **Instalar as dependências:**
   ```bash
   npm install
   ```

3. **Iniciar o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   O jogo ficará disponível em [http://localhost:5173/easy.html](http://localhost:5173/easy.html) (ou na porta indicada pelo Vite).

## Como fazer build para produção

```bash
npm run build
```
Os ficheiros otimizados ficam na pasta `dist/`.

## Como publicar num site externo (exemplo Netlify)

1. Acede a [https://app.netlify.com/](https://app.netlify.com/)
2. Clica em "Add new site" > "Import an existing project"
3. Liga o teu repositório GitHub e seleciona o projeto
4. Define o comando de build: `npm run build`
5. Define a pasta de publicação: `dist`
6. Clica em "Deploy site"

Ou faz deploy manual:
- Faz build (`npm run build`)
- Faz upload da pasta `dist/` para o Netlify, Vercel, GitHub Pages, etc.

## Tecnologias utilizadas

- [Three.js](https://threejs.org/) — gráficos 3D
- [Vite](https://vitejs.dev/) — bundler e servidor de desenvolvimento
- [JavaScript](https://www.javascript.com/) - linguagem utilizada 

## Créditos e Inspiração

Desenvolvido por **António Caetano**.

Alguns componentes e mecânicas do jogo foram inspirados e adaptados de [https://javascriptgametutorials.com/](https://javascriptgametutorials.com/).

Imagens, gráficos e código são de autoria própria.

---

**Diverte-te a jogar Road Rumble!**