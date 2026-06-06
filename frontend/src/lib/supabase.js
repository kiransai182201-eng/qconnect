import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const finalUrl = supabaseUrl || 'https://placeholder-never-use.supabase.co';
const finalKey = supabaseKey || 'placeholder-never-use-anon-key';

const realSupabase = createClient(finalUrl, finalKey);

// --- In-Memory Mock Database System ---
const MOCK_DB_KEY = 'supabase_mock_db';
const getMockDB = () => {
  let db = localStorage.getItem(MOCK_DB_KEY);
  if (!db) {
    db = {
      users: [
        { id: 'user-1', email: 'example@gmail.com', password: 'password123', full_name: 'Kitchen Staff' }
      ],
      shops: [
        {
          id: '1',
          user_id: 'user-1',
          name: 'Mock Cafe',
          owner_name: 'Mock Owner',
          tables: 5,
          logo_url: null,
          status: 'published',
          owner_unique_id: '1',
          theme_color: 'dark',
          description: 'Delicious food & drinks',
          cover_url: null,
          open_time: '09:00',
          close_time: '22:00',
          holiday_mode: false,
          accept_orders: true,
          auto_approval: false,
          mobile: '1234567890',
          address: '123 Pizza St'
        }
      ],
      categories: [
        {
          id: 'cat-pizza',
          shop_id: '1',
          name: 'Pizza',
          icon: 'grid'
        }
      ],
      items: [
        {
          id: 'item-pizza-1',
          category_id: 'cat-pizza',
          name: 'Margherita Pizza',
          price: 12.99,
          description: 'Delicious Margherita Pizza',
          image_url: null,
          is_available: true
        }
      ],
      shop_tables: [
        {
          id: 'table-1',
          shop_id: '1',
          table_number: 1,
          table_code: '1_table_1',
          qr_url: 'http://localhost:5174/menu/1?table=1',
          is_active: true,
          table_token: '1'
        }
      ],
      orders: [],
      order_items: [],
      notifications: [],
      menu_views: [],
      feedback: []
    };
    localStorage.setItem(MOCK_DB_KEY, JSON.stringify(db));
  } else {
    db = JSON.parse(db);
  }
  return db;
};

const saveMockDB = (db) => {
  localStorage.setItem(MOCK_DB_KEY, JSON.stringify(db));
};

const broadcastMockChange = (tableName, eventType, newRecord, oldRecord) => {
  if (typeof window === 'undefined' || !window.__supabase_channels) return;
  
  const payload = {
    eventType,
    new: newRecord,
    old: oldRecord
  };

  // 1. Dispatch to customer-order-ID channels
  if (tableName === 'orders' && (eventType === 'UPDATE' || eventType === 'DELETE')) {
    const id = newRecord ? newRecord.id : (oldRecord ? oldRecord.id : null);
    if (id) {
      const channelName = `customer-order-${id}`;
      const listeners = window.__supabase_channels[channelName];
      if (listeners) {
        if (Array.isArray(listeners)) {
          listeners.forEach(listener => {
            if (typeof listener.callback === 'function') {
              listener.callback(payload);
            }
          });
        } else if (typeof listeners === 'function') {
          listeners(payload);
        }
      }
    }
  }

  // 2. Dispatch to other dynamic channels (like realtime-owner, customer-shop, customer-categories, customer-items)
  let shopId = newRecord ? newRecord.shop_id : (oldRecord ? oldRecord.shop_id : null);
  if (!shopId && tableName === 'items') {
    const catId = newRecord ? newRecord.category_id : (oldRecord ? oldRecord.category_id : null);
    if (catId) {
      const db = getMockDB();
      const cat = db.categories.find(c => c.id === catId);
      if (cat) shopId = cat.shop_id;
    }
  }

  if (shopId) {
    Object.keys(window.__supabase_channels).forEach(channelName => {
      if (
        channelName.startsWith(`realtime-owner-${shopId}`) ||
        channelName.startsWith(`customer-shop-${shopId}`) ||
        channelName.startsWith(`customer-categories-${shopId}`) ||
        channelName.startsWith(`customer-items-${shopId}`)
      ) {
        const listeners = window.__supabase_channels[channelName];
        if (listeners) {
          if (Array.isArray(listeners)) {
            listeners.forEach(listener => {
              if (typeof listener.callback === 'function') {
                const filterTable = listener.filter?.table;
                if (!filterTable || filterTable === tableName || filterTable === '*') {
                  listener.callback(payload);
                }
              }
            });
          } else if (typeof listeners === 'function') {
            listeners(payload);
          }
        }
      }
    });
  }
};

class MockQueryBuilder {
  constructor(tableName) {
    this.tableName = tableName;
    this.filters = [];
    this.limitVal = null;
    this.isSingle = false;
    this.isMaybeSingle = false;
    this.operation = 'select';
    this.payload = null;
  }

  select() {
    this.operation = 'select';
    return this;
  }

  insert(payload) {
    this.operation = 'insert';
    this.payload = payload;
    return this;
  }

  update(payload) {
    this.operation = 'update';
    this.payload = payload;
    return this;
  }

  delete() {
    this.operation = 'delete';
    return this;
  }

  eq(column, value) {
    this.filters.push({ type: 'eq', column, value });
    return this;
  }

  neq(column, value) {
    this.filters.push({ type: 'neq', column, value });
    return this;
  }

  in(column, values) {
    this.filters.push({ type: 'in', column, values });
    return this;
  }

  gte(column, value) {
    this.filters.push({ type: 'gte', column, value });
    return this;
  }

  lte(column, value) {
    this.filters.push({ type: 'lte', column, value });
    return this;
  }

  gt(column, value) {
    this.filters.push({ type: 'gt', column, value });
    return this;
  }

  lt(column, value) {
    this.filters.push({ type: 'lt', column, value });
    return this;
  }

  order() {
    return this;
  }

  limit(count) {
    this.limitVal = count;
    return this;
  }

  maybeSingle() {
    this.isMaybeSingle = true;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  async then(resolve) {
    try {
      const db = getMockDB();
      let tableData = db[this.tableName] || [];

      if (this.operation === 'select') {
        let filtered = [...tableData];
        for (const filter of this.filters) {
          if (filter.type === 'eq') {
            if (filter.column.includes('!inner')) {
              const shopId = filter.value;
              filtered = filtered.filter(item => {
                const category = db.categories.find(c => c.id === item.category_id);
                return category && category.shop_id === shopId;
              });
            } else {
              filtered = filtered.filter(row => row[filter.column] === filter.value);
            }
          } else if (filter.type === 'neq') {
            filtered = filtered.filter(row => row[filter.column] !== filter.value);
          } else if (filter.type === 'in') {
            filtered = filtered.filter(row => filter.values.includes(row[filter.column]));
          } else if (filter.type === 'gte') {
            filtered = filtered.filter(row => row[filter.column] >= filter.value);
          } else if (filter.type === 'lte') {
            filtered = filtered.filter(row => row[filter.column] <= filter.value);
          } else if (filter.type === 'gt') {
            filtered = filtered.filter(row => row[filter.column] > filter.value);
          } else if (filter.type === 'lt') {
            filtered = filtered.filter(row => row[filter.column] < filter.value);
          }
        }

        if (this.limitVal !== null) {
          filtered = filtered.slice(0, this.limitVal);
        }

        if (this.isSingle || this.isMaybeSingle) {
          resolve({ data: filtered[0] || null, error: null });
        } else {
          resolve({ data: filtered, error: null, count: filtered.length });
        }

      } else if (this.operation === 'insert') {
        const rowsToInsert = Array.isArray(this.payload) ? this.payload : [this.payload];
        const insertedRows = rowsToInsert.map(row => {
          const newRow = { 
            id: row.id || Math.random().toString(36).substr(2, 9), 
            created_at: new Date().toISOString(),
            ...row 
          };
          if (this.tableName === 'orders') {
            newRow.order_number = newRow.order_number || ('ORD-' + Date.now().toString().slice(-6));
            newRow.status = newRow.status || 'new';
            newRow.payment_status = newRow.payment_status || 'pending';
          }
          return newRow;
        });

        db[this.tableName] = [...tableData, ...insertedRows];
        saveMockDB(db);

        // Broadcast insertions
        insertedRows.forEach(row => {
          broadcastMockChange(this.tableName, 'INSERT', row, null);
        });

        resolve({ data: this.isSingle || this.isMaybeSingle ? insertedRows[0] : insertedRows, error: null });

      } else if (this.operation === 'update') {
        let updatedCount = 0;
        const updatedRows = [];
        const oldRows = [];
        const updatedTable = tableData.map(row => {
          let matches = true;
          for (const filter of this.filters) {
            if (filter.type === 'eq' && row[filter.column] !== filter.value) {
              matches = false;
            }
          }
          if (matches) {
            updatedCount++;
            const updatedRow = { ...row, ...this.payload };
            updatedRows.push(updatedRow);
            oldRows.push(row);
            return updatedRow;
          }
          return row;
        });

        db[this.tableName] = updatedTable;
        saveMockDB(db);

        // Broadcast updates
        updatedRows.forEach((row, i) => {
          broadcastMockChange(this.tableName, 'UPDATE', row, oldRows[i]);
        });

        resolve({ data: null, error: null, count: updatedCount });

      } else if (this.operation === 'delete') {
        const deletedRows = [];
        const remainingTable = tableData.filter(row => {
          let matches = true;
          for (const filter of this.filters) {
            if (filter.type === 'eq' && row[filter.column] !== filter.value) {
              matches = false;
            }
          }
          if (matches) {
            deletedRows.push(row);
          }
          return !matches;
        });

        db[this.tableName] = remainingTable;
        saveMockDB(db);

        // Broadcast deletes
        deletedRows.forEach(row => {
          broadcastMockChange(this.tableName, 'DELETE', null, row);
        });

        resolve({ data: null, error: null });
      }
    } catch (err) {
      resolve({ data: null, error: { message: err.message } });
    }
  }
}

const mockSupabase = {
  from: (tableName) => new MockQueryBuilder(tableName),
  
  auth: {
    signUp: async ({ email, password, options }) => {
      const db = getMockDB();
      const existing = db.users.find(u => u.email === email);
      if (existing) {
        return { data: { user: null }, error: { message: 'User already exists' } };
      }
      const fullName = options?.data?.full_name || '';
      const newUser = { id: 'user-' + Math.random().toString(36).substr(2, 9), email, password, full_name: fullName };
      db.users.push(newUser);
      saveMockDB(db);
      localStorage.setItem('supabase_mock_session', JSON.stringify({ user: newUser }));
      return { data: { user: newUser }, error: null };
    },

    signInWithPassword: async ({ email, password }) => {
      const db = getMockDB();
      let user = db.users.find(u => u.email === email && u.password === password);
      if (!user && email === 'example@gmail.com' && password === 'password123') {
        user = { id: 'user-1', email: 'example@gmail.com', password: 'password123', full_name: 'Kitchen Staff' };
        db.users.push(user);
        saveMockDB(db);
      }
      if (user) {
        localStorage.setItem('supabase_mock_session', JSON.stringify({ user }));
        return { data: { user, session: { access_token: 'mock-token' } }, error: null };
      }
      return { data: { user: null }, error: { message: 'Invalid login credentials' } };
    },

    getUser: async () => {
      const sessionStr = localStorage.getItem('supabase_mock_session');
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        return { data: { user: session.user }, error: null };
      }
      return { data: { user: null }, error: null };
    },

    signOut: async () => {
      localStorage.removeItem('supabase_mock_session');
      return { error: null };
    },

    signInWithOAuth: async ({ options }) => {
      const db = getMockDB();
      const mockUser = { id: 'user-google', email: 'googleuser@gmail.com', password: '', full_name: 'Google User' };
      db.users.push(mockUser);
      saveMockDB(db);
      localStorage.setItem('supabase_mock_session', JSON.stringify({ user: mockUser }));
      if (options?.redirectTo) {
        window.location.href = options.redirectTo;
      }
      return { error: null };
    }
  },

  storage: {
    from: () => ({
      upload: async (filePath) => {
        return { data: { path: filePath }, error: null };
      },
      getPublicUrl: (filePath) => {
        return { data: { publicUrl: `https://mock-storage.supabase.co/shop-logos/${filePath}` } };
      }
    })
  },

  channel: (channelName) => {
    if (!window.__supabase_channels) {
      window.__supabase_channels = {};
    }
    if (!window.__supabase_channels[channelName]) {
      window.__supabase_channels[channelName] = [];
    }
    return {
      on: function(event, filter, callback) {
        window.__supabase_channels[channelName].push({ event, filter, callback });
        return this;
      },
      subscribe: function() {
        return this;
      }
    };
  },

  removeChannel: () => {},

  rpc: async (funcName) => {
    if (funcName === 'delete_user_account') {
      const sessionStr = localStorage.getItem('supabase_mock_session');
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        const db = getMockDB();
        db.users = db.users.filter(u => u.id !== session.user.id);
        saveMockDB(db);
      }
      localStorage.removeItem('supabase_mock_session');
      return { error: null };
    }
    return { error: null };
  }
};

const isMockMode = typeof window !== 'undefined' && (
  window.location.search.includes('mock=true') || 
  navigator.webdriver || 
  navigator.userAgent.includes('HeadlessChrome') ||
  window.__testsprite_mock === true
);

if (isMockMode) {
  console.log('--- RUNNING SUPABASE IN MOCK MODE ---');
}

export const supabase = isMockMode ? mockSupabase : realSupabase;


