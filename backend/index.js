const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Supabase Client ───────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─── Middleware ────────────────────────────────────────────────────────────────
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:5173', 'https://your-app.pages.dev'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || corsOrigins.includes(origin) || corsOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'QConnect backend is running!' });
});

app.get('/api/health', async (req, res) => {
  try {
    const { data, error } = await supabase.from('shops').select('id').limit(1);
    if (error) {
      return res.status(500).json({
        status: "error",
        database: "disconnected",
        server: "running",
        error: error.message
      });
    }
    res.json({
      status: "ok",
      database: "connected",
      server: "running"
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      database: "disconnected",
      server: "running",
      error: err.message
    });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════════════════════════════════

// Register
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;
  const { data, error } = await supabase.auth.admin.createUser({
    email, password,
    user_metadata: { name }
  });
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'User registered successfully', user: data.user });
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(401).json({ error: error.message });
  res.json({ message: 'Login successful', session: data.session, user: data.user });
});

// ══════════════════════════════════════════════════════════════════════════════
// SHOPS
// ══════════════════════════════════════════════════════════════════════════════

// Create shop
app.post('/api/shops', async (req, res) => {
  const { name, owner_name, logo, status } = req.body;
  const { data, error } = await supabase
    .from('shops')
    .insert([{ name, owner_name, logo, status: status || 'setup' }])
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Shop created', shop: data });
});

// Get shop by ID
app.get('/api/shops/:shopId', async (req, res) => {
  const { data, error } = await supabase
    .from('shops')
    .select('*')
    .eq('id', req.params.shopId)
    .single();
  if (error) return res.status(404).json({ error: 'Shop not found' });
  res.json(data);
});

// Publish shop
app.post('/api/shops/:shopId/publish', async (req, res) => {
  const { data, error } = await supabase
    .from('shops')
    .update({ status: 'published' })
    .eq('id', req.params.shopId)
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Menu published successfully', shop: data });
});

// ══════════════════════════════════════════════════════════════════════════════
// TABLES (physical tables inside a shop)
// ══════════════════════════════════════════════════════════════════════════════

// Get all tables for a shop
app.get('/api/shops/:shopId/tables', async (req, res) => {
  const { data, error } = await supabase
    .from('tables')
    .select('*')
    .eq('shop_id', req.params.shopId);
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Create table
app.post('/api/shops/:shopId/tables', async (req, res) => {
  const { table_number } = req.body;
  const { data, error } = await supabase
    .from('tables')
    .insert([{ shop_id: req.params.shopId, table_number }])
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Table created', table: data });
});

// ══════════════════════════════════════════════════════════════════════════════
// QR CODES
// ══════════════════════════════════════════════════════════════════════════════

// Get QR code data for a shop table
app.get('/api/shops/:shopId/qr-codes', async (req, res) => {
  const { shopId } = req.params;
  const { table } = req.query; // ?table=1
  const baseUrl = process.env.FRONTEND_URL || 'https://your-app.pages.dev';
  res.json({
    shopId,
    table: table || 1,
    qrUrl: `${baseUrl}/menu/${shopId}?table=${table || 1}`
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// CATEGORIES
// ══════════════════════════════════════════════════════════════════════════════

// Get categories for a shop
app.get('/api/shops/:shopId/categories', async (req, res) => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('shop_id', req.params.shopId);
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Create category
app.post('/api/shops/:shopId/categories', async (req, res) => {
  const { name, icon } = req.body;
  const { data, error } = await supabase
    .from('categories')
    .insert([{ shop_id: req.params.shopId, name, icon }])
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Category added', category: data });
});

// Delete category
app.delete('/api/shops/:shopId/categories/:categoryId', async (req, res) => {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', req.params.categoryId)
    .eq('shop_id', req.params.shopId);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Category deleted' });
});

// ══════════════════════════════════════════════════════════════════════════════
// ITEMS
// ══════════════════════════════════════════════════════════════════════════════

// Get items for a shop
app.get('/api/shops/:shopId/items', async (req, res) => {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('shop_id', req.params.shopId);
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Create item
app.post('/api/shops/:shopId/items', async (req, res) => {
  const { category_id, name, price, description, image } = req.body;
  const { data, error } = await supabase
    .from('items')
    .insert([{ shop_id: req.params.shopId, category_id, name, price, description, image }])
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Item added', item: data });
});

// Update item
app.put('/api/shops/:shopId/items/:itemId', async (req, res) => {
  const { name, price, description, image, category_id } = req.body;
  const { data, error } = await supabase
    .from('items')
    .update({ name, price, description, image, category_id })
    .eq('id', req.params.itemId)
    .eq('shop_id', req.params.shopId)
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Item updated', item: data });
});

// Delete item
app.delete('/api/shops/:shopId/items/:itemId', async (req, res) => {
  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', req.params.itemId)
    .eq('shop_id', req.params.shopId);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Item deleted' });
});

// ══════════════════════════════════════════════════════════════════════════════
// ORDERS
// ══════════════════════════════════════════════════════════════════════════════

// Place order (customer)
app.post('/api/shops/:shopId/orders', async (req, res) => {
  const { table_id, items, total } = req.body;
  // items = [{ item_id, quantity, price }]
  const { data, error } = await supabase
    .from('orders')
    .insert([{
      shop_id: req.params.shopId,
      table_id,
      items,
      total,
      status: 'pending'
    }])
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Order placed', order: data });
});

// Get all orders for a shop
app.get('/api/shops/:shopId/orders', async (req, res) => {
  const { status } = req.query; // ?status=pending
  let query = supabase
    .from('orders')
    .select('*')
    .eq('shop_id', req.params.shopId)
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Update order status (shop owner)
app.put('/api/shops/:shopId/orders/:orderId', async (req, res) => {
  const { status } = req.body; // pending | preparing | ready | completed
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', req.params.orderId)
    .eq('shop_id', req.params.shopId)
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Order updated', order: data });
});

// ─── Start Server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`QConnect backend running on port ${PORT}`);
});
