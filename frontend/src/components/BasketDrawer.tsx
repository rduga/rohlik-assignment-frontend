import React, { useState } from 'react';
import { Drawer, Box, IconButton, Typography, List, ListItem, ListItemText, ListItemSecondaryAction, Button, TextField, Snackbar } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useBasket } from './BasketContext';
import { createOrder } from '../api';
import { useNavigate } from 'react-router-dom';

export default function BasketDrawer() {
  const [open, setOpen] = useState(false);
  const { items, removeFromBasket, updateQuantity, clearBasket } = useBasket();
  const [ordering, setOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [showReservationNotice, setShowReservationNotice] = useState(false);
  const navigate = useNavigate();

  const total = items.reduce((sum, item) => sum + item.product.pricePerUnit * item.quantity, 0);

  return (
    <>
      <IconButton
        color="primary"
        sx={{ position: 'fixed', top: 24, right: 24, zIndex: 1300, bgcolor: 'white', boxShadow: 2 }}
        onClick={() => setOpen(true)}
        size="large"
      >
        <ShoppingCartIcon />
        {items.length > 0 && (
          <Box component="span" sx={{ ml: 1, fontWeight: 'bold' }}>{items.length}</Box>
        )}
      </IconButton>
      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 350, p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <ShoppingCartIcon sx={{ mr: 1 }} />
            <Typography variant="h6" sx={{ flexGrow: 1 }}>Shopping Basket</Typography>
            <IconButton onClick={() => setOpen(false)}><CloseIcon /></IconButton>
          </Box>
          <List sx={{ flexGrow: 1 }}>
            {items.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                Your basket is empty.
              </Typography>
            ) : items.map((item) => (
              <ListItem key={item.product.id} alignItems="flex-start">
                <ListItemText
                  primary={item.product.name}
                  secondary={`Price: ${item.product.pricePerUnit} Kč`}
                />
                <TextField
                  type="number"
                  size="small"
                  value={item.quantity}
                  onChange={e => updateQuantity(item.product.id!, Math.max(1, Number(e.target.value)))}
                  inputProps={{ min: 1, style: { width: 48 } }}
                  sx={{ mr: 1 }}
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end" onClick={() => removeFromBasket(item.product.id!)}><DeleteIcon /></IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1">Total: {total} Kč</Typography>
          </Box>
          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <Button variant="outlined" color="secondary" onClick={clearBasket} disabled={items.length === 0}>Clear</Button>
            <Button variant="contained" color="primary" fullWidth disabled={items.length === 0 || ordering} onClick={async () => {
              setOrdering(true);
              setOrderError(null);
              try {
                const order = await createOrder({
                  items: items.map(item => ({ productId: item.product.id!, quantity: item.quantity }))
                });
                setOrderSuccess(`Order #${order.id} created!`);
                clearBasket();
                setOpen(false);
                setShowReservationNotice(true);
                navigate(`/orders/${order.id}`);
              } catch (e: any) {
                setOrderError(e?.response?.data?.message || e.message || 'Order failed');
              } finally {
                setOrdering(false);
              }
            }}>
              {ordering ? 'Confirming...' : 'Confirm Order'}
            </Button>
          </Box>
          {orderSuccess && <Typography color="success.main" sx={{ mt: 2 }}>{orderSuccess}</Typography>}
          {orderError && <Typography color="error.main" sx={{ mt: 2 }}>{orderError}</Typography>}
        </Box>
      </Drawer>
      <Snackbar
        open={showReservationNotice}
        autoHideDuration={8000}
        onClose={() => setShowReservationNotice(false)}
        message={
          'Order has been created. Products are reserved for 30 minutes. Please pay within this period, otherwise the order will be cancelled.'
        }
      />
    </>
  );
} 