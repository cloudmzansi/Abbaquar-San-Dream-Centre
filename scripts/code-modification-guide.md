# Code Modification Guide for VPS Migration

This guide explains how to modify your Abbaquar San Dream Centre application code to work with a VPS instead of Supabase.

## Overview of Changes Required

### 1. Database Connection
- Replace Supabase client with PostgreSQL connection
- Update all database queries to use raw SQL or a PostgreSQL client
- Remove Supabase-specific features (RLS, real-time subscriptions)

### 2. Authentication
- Replace Supabase Auth with custom JWT implementation
- Update login/logout functionality
- Modify protected routes

### 3. File Storage
- Replace Supabase Storage with local file system or cloud storage
- Update image upload/download logic
- Modify image URL generation

### 4. API Routes
- Convert Supabase functions to Express.js API routes
- Update PayFast ITN handling
- Add proper error handling and validation

## Step-by-Step Code Modifications

### 1. Database Layer Changes

#### Create New Database Client

Create `src/lib/database.ts`:

```typescript
import { Client, Pool } from 'pg';

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'abbaquar_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Create connection pool
export const pool = new Pool(dbConfig);

// Helper function for queries
export async function query(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

// Helper function for transactions
export async function transaction<T>(callback: (client: Client) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```

#### Update Type Definitions

Update `src/types/database.ts`:

```typescript
// Remove Supabase-specific types and add PostgreSQL types
export interface Database {
  // Your existing table types remain the same
  // Remove Supabase-specific interfaces
}

// Add new types for API responses
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}
```

### 2. Authentication Changes

#### Create JWT Authentication

Create `src/lib/auth.ts`:

```typescript
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { query } from './database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '7d';

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
}

export interface AuthResult {
  user: User;
  token: string;
}

// Generate JWT token
export function generateToken(user: User): string {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      full_name: user.full_name 
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Verify JWT token
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Authenticate user
export async function authenticateUser(email: string, password: string): Promise<AuthResult> {
  const result = await query(
    'SELECT id, email, full_name, avatar_url, password_hash FROM profiles WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    throw new Error('Invalid credentials');
  }

  const user = result.rows[0];
  const isValidPassword = await verifyPassword(password, user.password_hash);

  if (!isValidPassword) {
    throw new Error('Invalid credentials');
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    avatar_url: user.avatar_url
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      avatar_url: user.avatar_url
    },
    token
  };
}

// Get user from token
export async function getUserFromToken(token: string): Promise<User> {
  const decoded = verifyToken(token);
  
  const result = await query(
    'SELECT id, email, full_name, avatar_url FROM profiles WHERE id = $1',
    [decoded.id]
  );

  if (result.rows.length === 0) {
    throw new Error('User not found');
  }

  return result.rows[0];
}
```

#### Create Authentication Middleware

Create `src/middleware/auth.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import { getUserFromToken } from '../lib/auth';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    full_name: string;
    avatar_url?: string;
  };
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const user = await getUserFromToken(token);
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export async function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const user = await getUserFromToken(token);
      req.user = user;
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
}
```

### 3. File Storage Changes

#### Create File Storage Service

Create `src/lib/storage.ts`:

```typescript
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

const UPLOAD_PATH = process.env.UPLOAD_PATH || '/var/www/abbaquar/uploads';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

export interface UploadResult {
  filename: string;
  path: string;
  url: string;
  size: number;
}

// Ensure directory exists
async function ensureDirectory(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

// Optimize image
async function optimizeImage(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(1200, 1200, { 
      fit: 'inside',
      withoutEnlargement: true 
    })
    .webp({ quality: 85 })
    .toBuffer();
}

// Upload file
export async function uploadFile(
  file: Buffer,
  bucket: string,
  originalName?: string
): Promise<UploadResult> {
  const bucketPath = path.join(UPLOAD_PATH, bucket);
  await ensureDirectory(bucketPath);

  const extension = originalName ? path.extname(originalName) : '.webp';
  const filename = `${uuidv4()}${extension}`;
  const filePath = path.join(bucketPath, filename);

  // Optimize if it's an image
  let processedFile = file;
  if (extension.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    processedFile = await optimizeImage(file);
  }

  await fs.writeFile(filePath, processedFile);

  return {
    filename,
    path: filePath,
    url: `${BASE_URL}/uploads/${bucket}/${filename}`,
    size: processedFile.length
  };
}

// Delete file
export async function deleteFile(bucket: string, filename: string): Promise<void> {
  const filePath = path.join(UPLOAD_PATH, bucket, filename);
  
  try {
    await fs.unlink(filePath);
  } catch (error) {
    // File might not exist, which is fine
    console.warn(`File not found for deletion: ${filePath}`);
  }
}

// Get file URL
export function getFileUrl(bucket: string, filename: string): string {
  return `${BASE_URL}/uploads/${bucket}/${filename}`;
}

// Get optimized image URL (for compatibility with existing code)
export function getOptimizedImageUrl(bucket: string, filename: string, width?: number): string {
  let url = getFileUrl(bucket, filename);
  
  if (width && filename.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    // For now, return the same URL. You could implement image resizing here
    // or use a service like Cloudinary for dynamic resizing
    url += `?w=${width}`;
  }
  
  return url;
}
```

### 4. Service Layer Updates

#### Update Events Service

Replace `src/lib/eventsService.ts`:

```typescript
import { query, transaction } from '../lib/database';
import { uploadFile, deleteFile, getOptimizedImageUrl } from '../lib/storage';
import { Event } from '../types';

const BUCKET_NAME = 'events';

export async function getEvents(): Promise<Event[]> {
  const result = await query(`
    SELECT id, title, date, start_time, end_time, venue, description, 
           image_path, display_on, created_at, updated_at
    FROM events 
    ORDER BY date DESC
  `);

  return result.rows.map(event => ({
    ...event,
    image_path: event.image_path ? getOptimizedImageUrl(BUCKET_NAME, event.image_path) : undefined
  }));
}

export async function getEvent(id: string): Promise<Event> {
  const result = await query(`
    SELECT id, title, date, start_time, end_time, venue, description, 
           image_path, display_on, created_at, updated_at
    FROM events 
    WHERE id = $1
  `, [id]);

  if (result.rows.length === 0) {
    throw new Error('Event not found');
  }

  const event = result.rows[0];
  return {
    ...event,
    image_path: event.image_path ? getOptimizedImageUrl(BUCKET_NAME, event.image_path) : undefined
  };
}

export async function createEvent(
  eventData: Omit<Event, 'id' | 'created_at' | 'updated_at'>,
  imageFile?: Buffer
): Promise<Event> {
  return transaction(async (client) => {
    let imagePath = eventData.image_path;

    // Upload image if provided
    if (imageFile) {
      const uploadResult = await uploadFile(imageFile, BUCKET_NAME);
      imagePath = uploadResult.filename;
    }

    // Insert event
    const result = await client.query(`
      INSERT INTO events (title, date, start_time, end_time, venue, description, image_path, display_on)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, title, date, start_time, end_time, venue, description, 
                image_path, display_on, created_at, updated_at
    `, [
      eventData.title,
      eventData.date,
      eventData.start_time,
      eventData.end_time,
      eventData.venue,
      eventData.description,
      imagePath,
      eventData.display_on
    ]);

    const event = result.rows[0];
    return {
      ...event,
      image_path: event.image_path ? getOptimizedImageUrl(BUCKET_NAME, event.image_path) : undefined
    };
  });
}

export async function updateEvent(
  id: string,
  updates: Partial<Omit<Event, 'id' | 'created_at' | 'updated_at'>>,
  imageFile?: Buffer
): Promise<Event> {
  return transaction(async (client) => {
    // Get current event to check for existing image
    const currentResult = await client.query(
      'SELECT image_path FROM events WHERE id = $1',
      [id]
    );

    if (currentResult.rows.length === 0) {
      throw new Error('Event not found');
    }

    const currentEvent = currentResult.rows[0];
    let imagePath = updates.image_path || currentEvent.image_path;

    // Handle new image upload
    if (imageFile) {
      const uploadResult = await uploadFile(imageFile, BUCKET_NAME);
      imagePath = uploadResult.filename;

      // Delete old image if it exists
      if (currentEvent.image_path) {
        await deleteFile(BUCKET_NAME, currentEvent.image_path);
      }
    }

    // Build update query dynamically
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'image_path' || imageFile) {
        updateFields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (imageFile) {
      updateFields.push(`image_path = $${paramCount}`);
      values.push(imagePath);
      paramCount++;
    }

    values.push(id);

    const result = await client.query(`
      UPDATE events 
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount}
      RETURNING id, title, date, start_time, end_time, venue, description, 
                image_path, display_on, created_at, updated_at
    `, values);

    const event = result.rows[0];
    return {
      ...event,
      image_path: event.image_path ? getOptimizedImageUrl(BUCKET_NAME, event.image_path) : undefined
    };
  });
}

export async function deleteEvent(id: string): Promise<void> {
  return transaction(async (client) => {
    // Get event to find image path
    const result = await client.query(
      'SELECT image_path FROM events WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      throw new Error('Event not found');
    }

    const event = result.rows[0];

    // Delete image file if it exists
    if (event.image_path) {
      await deleteFile(BUCKET_NAME, event.image_path);
    }

    // Delete event record
    await client.query('DELETE FROM events WHERE id = $1', [id]);
  });
}
```

### 5. API Routes

#### Create Express API Server

Create `server.js`:

```javascript
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { requireAuth, optionalAuth } = require('./src/middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('dist'));

// Serve uploaded files
app.use('/uploads', express.static(process.env.UPLOAD_PATH || '/var/www/abbaquar/uploads'));

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Authentication routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { authenticateUser } = require('./src/lib/auth');
    
    const result = await authenticateUser(email, password);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(401).json({ success: false, error: error.message });
  }
});

// Events API
app.get('/api/events', async (req, res) => {
  try {
    const { getEvents } = require('./src/lib/eventsService');
    const events = await getEvents();
    res.json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/events/:id', async (req, res) => {
  try {
    const { getEvent } = require('./src/lib/eventsService');
    const event = await getEvent(req.params.id);
    res.json({ success: true, data: event });
  } catch (error) {
    res.status(404).json({ success: false, error: error.message });
  }
});

app.post('/api/events', requireAuth, upload.single('image'), async (req, res) => {
  try {
    const { createEvent } = require('./src/lib/eventsService');
    const eventData = req.body;
    const imageFile = req.file ? req.file.buffer : undefined;
    
    const event = await createEvent(eventData, imageFile);
    res.json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/events/:id', requireAuth, upload.single('image'), async (req, res) => {
  try {
    const { updateEvent } = require('./src/lib/eventsService');
    const updates = req.body;
    const imageFile = req.file ? req.file.buffer : undefined;
    
    const event = await updateEvent(req.params.id, updates, imageFile);
    res.json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/events/:id', requireAuth, async (req, res) => {
  try {
    const { deleteEvent } = require('./src/lib/eventsService');
    await deleteEvent(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PayFast ITN endpoint
app.post('/api/payfast-itn', async (req, res) => {
  try {
    // Your existing PayFast ITN logic
    // Update to use the new database connection
    res.status(200).send('OK');
  } catch (error) {
    console.error('PayFast ITN error:', error);
    res.status(500).send('Error');
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 6. Frontend Changes

#### Update API Client

Create `src/lib/api.ts`:

```typescript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:3000/api';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Authentication
  async login(email: string, password: string) {
    const result = await this.request<{ success: boolean; user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (result.success) {
      this.setToken(result.token);
    }

    return result;
  }

  logout() {
    this.setToken(null);
  }

  // Events
  async getEvents() {
    const result = await this.request<{ success: boolean; data: any[] }>('/events');
    return result.data;
  }

  async getEvent(id: string) {
    const result = await this.request<{ success: boolean; data: any }>(`/events/${id}`);
    return result.data;
  }

  async createEvent(eventData: any, imageFile?: File) {
    const formData = new FormData();
    formData.append('data', JSON.stringify(eventData));
    
    if (imageFile) {
      formData.append('image', imageFile);
    }

    const result = await this.request<{ success: boolean; data: any }>('/events', {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    });

    return result.data;
  }

  async updateEvent(id: string, updates: any, imageFile?: File) {
    const formData = new FormData();
    formData.append('data', JSON.stringify(updates));
    
    if (imageFile) {
      formData.append('image', imageFile);
    }

    const result = await this.request<{ success: boolean; data: any }>(`/events/${id}`, {
      method: 'PUT',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    });

    return result.data;
  }

  async deleteEvent(id: string) {
    await this.request(`/events/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
```

#### Update Authentication Context

Update `src/contexts/AuthContext.tsx`:

```typescript
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '../lib/api';

interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('auth_token');
    if (token) {
      // You might want to verify the token with the server
      // For now, we'll assume it's valid
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const result = await apiClient.login(email, password);
      if (result.success) {
        setUser(result.user);
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    apiClient.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

### 7. Package.json Updates

Add these dependencies to your `package.json`:

```json
{
  "dependencies": {
    "pg": "^8.11.3",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "multer": "^1.4.5-lts.1",
    "sharp": "^0.32.6"
  },
  "devDependencies": {
    "@types/pg": "^8.10.7",
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/multer": "^1.4.11"
  }
}
```

### 8. Environment Variables

Create `.env` file:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=abbaquar_db
DB_USER=abbaquar_user
DB_PASSWORD=your_secure_password

# File storage
UPLOAD_PATH=/var/www/abbaquar/uploads
BASE_URL=https://yourdomain.com

# JWT
JWT_SECRET=your_jwt_secret_here

# PayFast
PAYFAST_MERCHANT_ID=your_merchant_id
PAYFAST_MERCHANT_KEY=your_merchant_key
PAYFAST_PASSPHRASE=your_passphrase
PAYFAST_SANDBOX=false

# Server
PORT=3000
NODE_ENV=production
```

## Migration Checklist

- [ ] Run the migration export script
- [ ] Set up VPS with PostgreSQL
- [ ] Import database schema and data
- [ ] Update all service files to use PostgreSQL
- [ ] Replace Supabase Auth with JWT
- [ ] Update file storage to use local filesystem
- [ ] Create Express.js API server
- [ ] Update frontend API client
- [ ] Test all functionality
- [ ] Deploy to VPS
- [ ] Update DNS records
- [ ] Monitor and optimize

## Testing

After making these changes:

1. Test database connections
2. Test authentication flow
3. Test file uploads/downloads
4. Test all CRUD operations
5. Test PayFast integration
6. Test responsive design
7. Test performance

## Performance Considerations

- Use connection pooling for database
- Implement caching for frequently accessed data
- Optimize images before storage
- Use CDN for static assets
- Monitor server resources
- Set up proper logging

This guide provides a comprehensive approach to migrating from Supabase to a VPS. The key is to maintain the same functionality while replacing the cloud services with self-hosted alternatives.
