import React, { useState } from 'react';
import { Drawer, Box, IconButton, Typography, List, ListItem, ListItemText, ListItemSecondaryAction, Button, TextField } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useBasket } from './BasketContext';

export default function BasketDrawer() {
  const [open, setOpen] = useState(false);
  const { items, removeFromBasket, updateQuantity, clearBasket } = useBasket();

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
            <Button variant="contained" color="primary" fullWidth disabled={items.length === 0} onClick={() => {/* TODO: create order */}}>Order</Button>
          </Box>
        </Box>
      </Drawer>
    </>
  );
} 