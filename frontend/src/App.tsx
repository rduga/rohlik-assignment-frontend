import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ProductListPage from './pages/ProductListPage';
import { BasketProvider } from './components/BasketContext';
import BasketDrawer from './components/BasketDrawer';

function App() {
  return (
    <BasketProvider>
      <ProductListPage />
      <BasketDrawer />
    </BasketProvider>
  );
}

export default App;
