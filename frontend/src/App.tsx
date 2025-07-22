import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ProductListPage from './pages/ProductListPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import { BasketProvider } from './components/BasketContext';
import BasketDrawer from './components/BasketDrawer';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Button, Box } from '@mui/material';

function App() {
  return (
    <BasketProvider>
      <Router>
        <AppBar position="static">
          <Toolbar>
            <Box sx={{ flexGrow: 1 }}>
              <Button color="inherit" component={Link} to="/">Products</Button>
              <Button color="inherit" component={Link} to="/orders">Order History</Button>
            </Box>
          </Toolbar>
        </AppBar>
        <Routes>
          <Route path="/" element={<ProductListPage />} />
          <Route path="/orders" element={<OrderHistoryPage />} />
        </Routes>
        <BasketDrawer />
      </Router>
    </BasketProvider>
  );
}

export default App;
