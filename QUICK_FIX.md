# Quick Fix - Development vs Production

## Error का Solution:

आपने `npm start` run किया, जो production mode के लिए है। Development के लिए:

### Option 1: Development Mode (Recommended)
```bash
npm run dev
```
यह http://localhost:3000 पर app चलाएगा

### Option 2: Production Mode
```bash
# पहले build करें
npm run build

# फिर start करें
npm start
```

## React.js Version Use करें:

अगर आप pure React.js version use करना चाहते हैं (जो हमने अभी बनाया):

```bash
cd ../threejs-react
npm install
npm run dev
```

यह http://localhost:5173 पर चलेगा और बिना server के काम करेगा।

## Summary:

- **Next.js version** (`threejs/`): `npm run dev` use करें
- **React.js version** (`threejs-react/`): `npm run dev` use करें (recommended)

