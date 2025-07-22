import React, { useEffect, useState } from 'react';
import { listOrders, payOrder, cancelOrder } from '../api';
import type { OrderResponseDto, PaymentRequestDto } from '../api';
import { Box, Typography, Card, CardContent, CardActions, Button, CircularProgress, Snackbar, Grid } from '@mui/material';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<OrderResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<number | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await listOrders(0, 20);
      setOrders(data.content);
    } catch (e: any) {
      setError(e.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handlePay = async (order: OrderResponseDto) => {
    setPayingId(order.id);
    try {
      // For demo, use dummy payment details
      const payment: PaymentRequestDto = {
        paymentMethod: 'card',
        paymentDetails: '**** **** **** 1234',
        amount: order.totalPrice,
      };
      await payOrder(order.id, payment);
      setSnackbar('Order paid!');
      fetchOrders();
    } catch (e: any) {
      setSnackbar(e.message || 'Payment failed');
    } finally {
      setPayingId(null);
    }
  };

  const handleCancel = async (order: OrderResponseDto) => {
    setCancellingId(order.id);
    try {
      await cancelOrder(order.id);
      setSnackbar('Order cancelled!');
      fetchOrders();
    } catch (e: any) {
      setSnackbar(e.message || 'Cancel failed');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Order History</Typography>
      {loading ? <CircularProgress /> : (
        <Grid container spacing={2} columns={12}>
          {orders.map(order => (
            <Grid key={order.id} columns={4}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1">Order #{order.id}</Typography>
                  <Typography variant="body2">Status: {order.status}</Typography>
                  <Typography variant="body2">Total: {order.totalPrice} Kč</Typography>
                  <Typography variant="body2">Items:</Typography>
                  <ul>
                    {order.items.map((item, idx) => (
                      <li key={idx}>Product #{item.productId} x {item.quantity}</li>
                    ))}
                  </ul>
                </CardContent>
                <CardActions>
                  {order.status === 'RESERVED' && (
                    <>
                      <Button size="small" variant="contained" color="success" disabled={payingId === order.id} onClick={() => handlePay(order)}>
                        {payingId === order.id ? 'Paying...' : 'Pay'}
                      </Button>
                      <Button size="small" variant="outlined" color="error" disabled={cancellingId === order.id} onClick={() => handleCancel(order)}>
                        {cancellingId === order.id ? 'Cancelling...' : 'Cancel'}
                      </Button>
                    </>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      <Snackbar open={!!snackbar} autoHideDuration={3000} onClose={() => setSnackbar(null)} message={snackbar} />
      {error && <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError(null)} message={error} />}
    </Box>
  );
} 