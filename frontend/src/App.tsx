import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ProductListPage from './pages/ProductListPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import OrderDetailPage from './pages/OrderDetailPage';
import { BasketProvider } from './components/BasketContext';
import BasketDrawer from './components/BasketDrawer';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Button, Box, Typography } from '@mui/material';

function App() {
  return (
    <BasketProvider>
      <Router>
        <AppBar position="static">
          <Toolbar>
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
              <Typography variant="h6" sx={{ mr: 4, display: 'flex', alignItems: 'center', fontWeight: 700 }}>
                <span role="img" aria-label="grocery" style={{ marginRight: 8 }}>🥦</span> Rado Grocery
              </Typography>
              <Button color="inherit" component={Link} to="/">Products</Button>
              <Button color="inherit" component={Link} to="/orders">Order History</Button>
            </Box>
          </Toolbar>
        </AppBar>
        <Routes>
          <Route path="/" element={<ProductListPage />} />
          <Route path="/orders" element={<OrderHistoryPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
        </Routes>
        <BasketDrawer />
      </Router>
    </BasketProvider>
  );
}

export default App;
