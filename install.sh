#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20
npm install framer-motion three @react-three/fiber @react-three/drei firebase zod @google/genai lucide-react
npm install -D @types/three vitest @vitejs/plugin-react jsdom @playwright/test @testing-library/react @testing-library/jest-dom
