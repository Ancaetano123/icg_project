# Road Rumble

Road Rumble is a casual 3D game developed in JavaScript with Three.js. The goal is to cross busy roads, avoid obstacles, and collect coins, unlocking skins and special powers.

## Online Demo

Play online: [https://roadrumble.netlify.app/](https://roadrumble.netlify.app/)

## Features

- 3D low-poly graphics with Three.js
- Customizable character with multiple skins
- Power-ups: shield, rocket, magnet, and extra lives
- Coin and shop system
- Progressive difficulty
- Desktop support only

## How to run in development mode

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Ancaetano123/icg_project
   cd icg_project
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   The game will be available at [http://localhost:5173/easy.html](http://localhost:5173/easy.html) (or the port indicated by Vite).

## How to build for production

```bash
npm run build
```
The optimized files will be in the `dist/` folder.

## How to deploy to an external site (example: Netlify)

1. Go to [https://app.netlify.com/](https://app.netlify.com/)
2. Click "Add new site" > "Import an existing project"
3. Connect your GitHub repository and select the project
4. Set the build command: `npm run build`
5. Set the publish directory: `dist`
6. Click "Deploy site"

Or deploy manually:
- Build (`npm run build`)
- Upload the `dist/` folder to Netlify, Vercel, GitHub Pages, etc.

## Technologies used

- [Three.js](https://threejs.org/) — 3D graphics
- [Vite](https://vitejs.dev/) — bundler and dev server
- [JavaScript](https://www.javascript.com/) — main language

## Credits & Inspiration

Developed by **António Caetano**.

Some components and game mechanics were inspired and adapted from [https://javascriptgametutorials.com/](https://javascriptgametutorials.com/).

Images, graphics, and code are original.

---

**Have fun playing Road Rumble!**