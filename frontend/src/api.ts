import axios from 'axios';

const API_BASE = 'http://localhost/rohlik-assignment-backend/api/v1';

export interface Product {
  id?: number;
  name: string;
  pricePerUnit: number;
  stockQuantity: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductPage {
  content: Product[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export async function getProducts(page = 0, size = 20): Promise<ProductPage> {
  const res = await axios.get(`${API_BASE}/products`, { params: { page, size } });
  return res.data;
}

export async function getProduct(id: number): Promise<Product> {
  const res = await axios.get(`${API_BASE}/products/${id}`);
  return res.data;
}

export async function createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
  const res = await axios.post(`${API_BASE}/products`, product);
  return res.data;
}

export async function updateProduct(id: number, product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
  const res = await axios.put(`${API_BASE}/products/${id}`, product);
  return res.data;
}

export async function deleteProduct(id: number): Promise<void> {
  await axios.delete(`${API_BASE}/products/${id}`);
}

export interface OrderItemDto {
  productId: number;
  quantity: number;
}

export interface OrderRequestDto {
  items: OrderItemDto[];
}

export interface OrderResponseDto {
  id: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItemDto[];
  status: 'RESERVED' | 'PAID' | 'CANCELLED';
  totalPrice: number;
}

export interface PaymentRequestDto {
  paymentMethod: string;
  paymentDetails: string;
  amount: number;
}

export interface PageOrderResponseDto {
  content: OrderResponseDto[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export async function createOrder(order: OrderRequestDto): Promise<OrderResponseDto> {
  const res = await axios.post(`${API_BASE}/orders`, order);
  return res.data;
}

export async function listOrders(page = 0, size = 20, sort?: string): Promise<PageOrderResponseDto> {
  const params: any = { page, size };
  if (sort) params.sort = sort;
  const res = await axios.get(`${API_BASE}/orders`, { params });
  return res.data;
}

export async function payOrder(id: number, payment: PaymentRequestDto): Promise<OrderResponseDto> {
  const res = await axios.post(`${API_BASE}/orders/${id}/pay`, payment);
  return res.data;
}

export async function cancelOrder(id: number): Promise<OrderResponseDto> {
  const res = await axios.post(`${API_BASE}/orders/${id}/cancel`);
  return res.data;
}

export async function getOrder(id: number): Promise<OrderResponseDto> {
  const res = await axios.get(`${API_BASE}/orders/${id}`);
  return res.data;
} 