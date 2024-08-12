import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import {NextUIProvider} from "@nextui-org/react";
import { initFaro } from 'instrumentation.ts';

initFaro();

ReactDOM.createRoot(document.getElementById('root')!).render(
  // <UserProvider>
  <React.StrictMode>
    <NextUIProvider>
      <App />
    </NextUIProvider>
  </React.StrictMode>
  // </UserProvider>

)
