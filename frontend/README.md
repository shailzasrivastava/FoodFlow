Frontend 

## Run it locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (defaults to `http://localhost:5173`). Verified with `npm run build`
and `npx eslint .` — both pass clean with zero errors.


## Folder structure

```
src/
  components/         Navbar, Hero, Card, Footer
  components/ui/       Button, Input, Modal, Toast, Loader, index.js (barrel export)
  context/             ThemeContext (dark/light + localStorage), ToastContext (toast queue)
  pages/                Home, About, Dashboard, Login
  data/products.js     Placeholder catalog data — replace with real HimShakti products
  utils/whatsapp.js    Builds the wa.me pre-filled order link
```

