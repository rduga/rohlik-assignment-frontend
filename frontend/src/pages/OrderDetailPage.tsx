import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrder, getProducts, payOrder, cancelOrder } from '../api';
import type { OrderResponseDto, PaymentRequestDto, Product } from '../api';
import { Box, Typography, Button, CircularProgress, Snackbar, Paper, Divider } from '@mui/material';

const productEmojis = ['🍎', '🍌', '🥦', '🥕', '🍞', '🧀', '🥩', '🍗', '🍪', '🥛', '🍊', '🍇', '🍉', '🍋', '🍆', '🍔', '🍟', '🍕', '🌭', '🥨', '🍿', '🍫', '🍰', '🍯', '🥜', '🍵', '🥤', '🧃', '🧊', '🍶'];
function getProductEmoji(id: number | undefined) {
  if (typeof id !== 'number') return '🛒';
  return productEmojis[id % productEmojis.length];
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderResponseDto | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const data = await getOrder(Number(id));
        setOrder(data);
      } catch (e: any) {
        setError(e.message || 'Failed to load order');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
    const interval = setInterval(fetchOrder, 15000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    getProducts(0, 1000).then(data => setProducts(data.content));
  }, []);

  const getProductName = (pid: number) => products.find(p => p.id === pid)?.name || `#${pid}`;

  const handlePay = async () => {
    if (!order) return;
    setPaying(true);
    try {
      const payment: PaymentRequestDto = {
        paymentMethod: 'card',
        paymentDetails: '**** **** **** 1234',
        amount: order.totalPrice,
      };
      await payOrder(order.id, payment);
      setSnackbar('Order paid!');
      setOrder({ ...order, status: 'PAID' });
    } catch (e: any) {
      setSnackbar(e.message || 'Payment failed');
    } finally {
      setPaying(false);
    }
  };

  const handleCancel = async () => {
    if (!order) return;
    setCancelling(true);
    try {
      await cancelOrder(order.id);
      setSnackbar('Order cancelled!');
      setOrder({ ...order, status: 'CANCELLED' });
    } catch (e: any) {
      setSnackbar(e.message || 'Cancel failed');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <CircularProgress />;
  if (error || !order) return <Typography color="error">{error || 'Order not found'}</Typography>;

  return (
    <Box sx={{ p: 3, width: '100%', maxWidth: 1280, mx: 'auto' }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Order #{order.id}</Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>Created: {new Date(order.createdAt).toLocaleString()}</Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>Status: {order.status}</Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>Total: {order.totalPrice} Kč</Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle1">Items:</Typography>
        <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none' }}>
          {order.items.map((item, idx) => (
            <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }} title={`Product ID: ${item.productId}`}>
              <span style={{ fontSize: 24 }}>{getProductEmoji(item.productId)}</span>
              <span>{getProductName(item.productId)} x {item.quantity} ks</span>
            </li>
          ))}
        </ul>
        <Divider sx={{ my: 2 }} />
        {order.status === 'RESERVED' && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained" color="success" disabled={paying} onClick={handlePay}>
              {paying ? 'Paying...' : 'Pay'}
            </Button>
            <Button variant="outlined" color="error" disabled={cancelling} onClick={handleCancel}>
              {cancelling ? 'Cancelling...' : 'Cancel'}
            </Button>
          </Box>
        )}
        <Button sx={{ mt: 2 }} onClick={() => navigate(-1)}>Back</Button>
      </Paper>
      <Snackbar open={!!snackbar} autoHideDuration={3000} onClose={() => setSnackbar(null)} message={snackbar} />
    </Box>
  );
} 