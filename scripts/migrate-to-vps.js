#!/usr/bin/env node

/**
 * VPS Migration Script for Abbaquar San Dream Centre
 * 
 * This script helps migrate your Supabase database and files to a VPS setup.
 * It exports all data and provides instructions for VPS setup.
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const MIGRATION_DIR = path.join(__dirname, '../migration-export');
const MIGRATION_TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');

// Get environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase environment variables');
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Tables to migrate (in dependency order)
const TABLES = [
  'profiles',
  'activities',
  'events', 
  'gallery',
  'team_members',
  'volunteers',
  'contact_messages',
  'contact_submissions',
  'donations'
];

// Storage buckets to migrate
const STORAGE_BUCKETS = [
  'events',
  'gallery', 
  'activities',
  'team',
  'volunteers'
];

// Create migration directory
function createMigrationDirectory() {
  const migrationPath = path.join(MIGRATION_DIR, MIGRATION_TIMESTAMP);
  
  if (!fs.existsSync(MIGRATION_DIR)) {
    fs.mkdirSync(MIGRATION_DIR, { recursive: true });
  }
  
  if (!fs.existsSync(migrationPath)) {
    fs.mkdirSync(migrationPath, { recursive: true });
  }
  
  // Create subdirectories
  fs.mkdirSync(path.join(migrationPath, 'database'), { recursive: true });
  fs.mkdirSync(path.join(migrationPath, 'files'), { recursive: true });
  fs.mkdirSync(path.join(migrationPath, 'scripts'), { recursive: true });
  
  return migrationPath;
}

// Export table data
async function exportTable(tableName, migrationPath) {
  try {
    console.log(`📊 Exporting table: ${tableName}`);
    
    const { data, error } = await supabase
      .from(tableName)
      .select('*');
    
    if (error) {
      console.error(`❌ Error exporting ${tableName}:`, error);
      return false;
    }
    
    const exportFile = path.join(migrationPath, 'database', `${tableName}.json`);
    const exportData = {
      table: tableName,
      timestamp: new Date().toISOString(),
      recordCount: data.length,
      data: data
    };
    
    fs.writeFileSync(exportFile, JSON.stringify(exportData, null, 2));
    console.log(`✅ ${tableName}: ${data.length} records exported`);
    
    return true;
  } catch (error) {
    console.error(`❌ Error exporting ${tableName}:`, error);
    return false;
  }
}

// Export storage bucket files
async function exportStorageBucket(bucketName, migrationPath) {
  try {
    console.log(`📁 Exporting storage bucket: ${bucketName}`);
    
    const { data: files, error } = await supabase.storage
      .from(bucketName)
      .list('', { limit: 1000 });
    
    if (error) {
      console.error(`❌ Error listing files in ${bucketName}:`, error);
      return false;
    }
    
    const bucketDir = path.join(migrationPath, 'files', bucketName);
    fs.mkdirSync(bucketDir, { recursive: true });
    
    let downloadedCount = 0;
    
    for (const file of files) {
      try {
        const { data: fileData, error: downloadError } = await supabase.storage
          .from(bucketName)
          .download(file.name);
        
        if (downloadError) {
          console.error(`❌ Error downloading ${file.name}:`, downloadError);
          continue;
        }
        
        const filePath = path.join(bucketDir, file.name);
        const buffer = await fileData.arrayBuffer();
        fs.writeFileSync(filePath, Buffer.from(buffer));
        downloadedCount++;
        
      } catch (error) {
        console.error(`❌ Error processing file ${file.name}:`, error);
      }
    }
    
    console.log(`✅ ${bucketName}: ${downloadedCount}/${files.length} files downloaded`);
    return true;
    
  } catch (error) {
    console.error(`❌ Error exporting bucket ${bucketName}:`, error);
    return false;
  }
}

// Generate SQL schema
async function generateSQLSchema(migrationPath) {
  console.log('📝 Generating SQL schema...');
  
  const schema = `-- Abbaquar San Dream Centre Database Schema
-- Generated: ${new Date().toISOString()}

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_path TEXT,
  display_on TEXT DEFAULT 'activities' CHECK (display_on IN ('home', 'activities', 'both')),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  venue TEXT NOT NULL,
  description TEXT NOT NULL,
  image_path TEXT,
  display_on TEXT DEFAULT 'events' CHECK (display_on IN ('home', 'events', 'both')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create gallery table
CREATE TABLE IF NOT EXISTS gallery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  description TEXT,
  image_path TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  image_path TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create volunteers table
CREATE TABLE IF NOT EXISTS volunteers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  image_path TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contact_messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contact_submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create donations table
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payfast_payment_id TEXT UNIQUE NOT NULL,
  merchant_payment_id TEXT,
  payment_status TEXT NOT NULL,
  amount_gross DECIMAL(10,2) NOT NULL,
  amount_fee DECIMAL(10,2) NOT NULL,
  amount_net DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'ZAR',
  donor_first_name TEXT,
  donor_last_name TEXT,
  donor_email TEXT,
  item_name TEXT,
  item_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_activities_display_on ON activities(display_on);
CREATE INDEX IF NOT EXISTS idx_activities_sort_order ON activities(sort_order);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_display_on ON events(display_on);
CREATE INDEX IF NOT EXISTS idx_gallery_category ON gallery(category);
CREATE INDEX IF NOT EXISTS idx_team_members_sort_order ON team_members(sort_order);
CREATE INDEX IF NOT EXISTS idx_team_members_is_active ON team_members(is_active);
CREATE INDEX IF NOT EXISTS idx_volunteers_sort_order ON volunteers(sort_order);
CREATE INDEX IF NOT EXISTS idx_volunteers_is_active ON volunteers(is_active);
CREATE INDEX IF NOT EXISTS idx_donations_payfast_payment_id ON donations(payfast_payment_id);
CREATE INDEX IF NOT EXISTS idx_donations_payment_status ON donations(payment_status);

-- Create updated_at trigger functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gallery_updated_at BEFORE UPDATE ON gallery FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_volunteers_updated_at BEFORE UPDATE ON volunteers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_donations_updated_at BEFORE UPDATE ON donations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

  const schemaFile = path.join(migrationPath, 'database', 'schema.sql');
  fs.writeFileSync(schemaFile, schema);
  console.log('✅ SQL schema generated');
}

// Generate data import script
function generateDataImportScript(migrationPath) {
  console.log('📝 Generating data import script...');
  
  const importScript = `#!/usr/bin/env node

/**
 * Data Import Script for VPS Migration
 * 
 * This script imports the exported JSON data into your VPS PostgreSQL database.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Client } from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database configuration - UPDATE THESE VALUES
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'abbaquar_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'your_password'
};

// Tables to import (in dependency order)
const TABLES = [
  'profiles',
  'activities',
  'events', 
  'gallery',
  'team_members',
  'volunteers',
  'contact_messages',
  'contact_submissions',
  'donations'
];

async function importTableData(tableName, client, dataPath) {
  try {
    const filePath = path.join(dataPath, 'database', \`\${tableName}.json\`);
    
    if (!fs.existsSync(filePath)) {
      console.log(\`⚠️  No data file found for \${tableName}\`);
      return true;
    }
    
    const fileData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const records = fileData.data;
    
    if (records.length === 0) {
      console.log(\`📊 \${tableName}: No records to import\`);
      return true;
    }
    
    console.log(\`📊 Importing \${tableName}: \${records.length} records\`);
    
    // Clear existing data
    await client.query(\`DELETE FROM \${tableName}\`);
    
    // Import data
    for (const record of records) {
      const columns = Object.keys(record);
      const values = Object.values(record);
      const placeholders = values.map((_, i) => \`$\${i + 1}\`).join(', ');
      
      const query = \`INSERT INTO \${tableName} (\${columns.join(', ')}) VALUES (\${placeholders})\`;
      await client.query(query, values);
    }
    
    console.log(\`✅ \${tableName}: \${records.length} records imported\`);
    return true;
    
  } catch (error) {
    console.error(\`❌ Error importing \${tableName}:\`, error);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting data import...');
  
  const client = new Client(DB_CONFIG);
  
  try {
    await client.connect();
    console.log('✅ Connected to database');
    
    // Get data path from command line argument
    const dataPath = process.argv[2];
    if (!dataPath) {
      console.error('❌ Please provide the data path: node import-data.js <data-path>');
      process.exit(1);
    }
    
    // Import each table
    for (const table of TABLES) {
      await importTableData(table, client, dataPath);
    }
    
    console.log('🎉 Data import completed!');
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
`;

  const importFile = path.join(migrationPath, 'scripts', 'import-data.js');
  fs.writeFileSync(importFile, importScript);
  console.log('✅ Data import script generated');
}

// Generate VPS setup guide
function generateVPSSetupGuide(migrationPath) {
  console.log('📝 Generating VPS setup guide...');
  
  const setupGuide = `# VPS Setup Guide for Abbaquar San Dream Centre

## Prerequisites
- Ubuntu 20.04+ VPS with root access
- Domain name pointing to your VPS
- SSL certificate (Let's Encrypt recommended)

## 1. Server Setup

### Update system
\`\`\`bash
sudo apt update && sudo apt upgrade -y
\`\`\`

### Install PostgreSQL
\`\`\`bash
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql
\`\`\`

### Create database and user
\`\`\`bash
sudo -u postgres psql
\`\`\`

\`\`\`sql
CREATE DATABASE abbaquar_db;
CREATE USER abbaquar_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE abbaquar_db TO abbaquar_user;
\\q
\`\`\`

### Install Node.js
\`\`\`bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
\`\`\`

### Install Nginx
\`\`\`bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
\`\`\`

## 2. Database Migration

### Run the schema
\`\`\`bash
psql -h localhost -U abbaquar_user -d abbaquar_db -f schema.sql
\`\`\`

### Import your data
\`\`\`bash
cd scripts
npm install pg
node import-data.js ../database
\`\`\`

## 3. File Storage Setup

### Create upload directories
\`\`\`bash
sudo mkdir -p /var/www/abbaquar/uploads/{events,gallery,activities,team,volunteers}
sudo chown -R www-data:www-data /var/www/abbaquar/uploads
sudo chmod -R 755 /var/www/abbaquar/uploads
\`\`\`

### Copy your files
\`\`\`bash
cp -r files/* /var/www/abbaquar/uploads/
\`\`\`

## 4. Application Setup

### Clone your repository
\`\`\`bash
cd /var/www
sudo git clone [your-repo-url] abbaquar
cd abbaquar
\`\`\`

### Install dependencies
\`\`\`bash
npm install
\`\`\`

### Environment variables
Create \`.env\` file:
\`\`\`env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=abbaquar_db
DB_USER=abbaquar_user
DB_PASSWORD=your_secure_password

# File storage
UPLOAD_PATH=/var/www/abbaquar/uploads
BASE_URL=https://yourdomain.com

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your_jwt_secret_here

# PayFast (if using)
PAYFAST_MERCHANT_ID=your_merchant_id
PAYFAST_MERCHANT_KEY=your_merchant_key
PAYFAST_PASSPHRASE=your_passphrase
PAYFAST_SANDBOX=false
\`\`\`

### Build application
\`\`\`bash
npm run build
\`\`\`

## 5. Nginx Configuration

Create \`/etc/nginx/sites-available/abbaquar\`:
\`\`\`nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    root /var/www/abbaquar/dist;
    index index.html;
    
    # Handle file uploads
    location /uploads/ {
        alias /var/www/abbaquar/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # API routes
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
}
\`\`\`

Enable the site:
\`\`\`bash
sudo ln -s /etc/nginx/sites-available/abbaquar /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
\`\`\`

## 6. SSL Certificate

\`\`\`bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
\`\`\`

## 7. Process Management

### Install PM2
\`\`\`bash
sudo npm install -g pm2
\`\`\`

### Create ecosystem file
Create \`ecosystem.config.js\`:
\`\`\`javascript
module.exports = {
  apps: [{
    name: 'abbaquar-api',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
\`\`\`

### Start application
\`\`\`bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
\`\`\`

## 8. Backup Strategy

### Database backup script
Create \`/var/www/abbaquar/scripts/backup-db.sh\`:
\`\`\`bash
#!/bin/bash
BACKUP_DIR="/var/backups/abbaquar"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
pg_dump -h localhost -U abbaquar_user abbaquar_db > $BACKUP_DIR/db_backup_$DATE.sql
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
\`\`\`

### File backup script
Create \`/var/www/abbaquar/scripts/backup-files.sh\`:
\`\`\`bash
#!/bin/bash
BACKUP_DIR="/var/backups/abbaquar"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/files_backup_$DATE.tar.gz /var/www/abbaquar/uploads
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
\`\`\`

### Setup cron jobs
\`\`\`bash
crontab -e
\`\`\`

Add:
\`\`\`
0 2 * * * /var/www/abbaquar/scripts/backup-db.sh
0 3 * * * /var/www/abbaquar/scripts/backup-files.sh
\`\`\`

## 9. Monitoring

### Install monitoring tools
\`\`\`bash
sudo apt install htop iotop nethogs -y
\`\`\`

### Log monitoring
\`\`\`bash
pm2 logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
\`\`\`

## 10. Security

### Firewall setup
\`\`\`bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
\`\`\`

### PostgreSQL security
Edit \`/etc/postgresql/*/main/postgresql.conf\`:
\`\`\`
listen_addresses = 'localhost'
\`\`\`

Edit \`/etc/postgresql/*/main/pg_hba.conf\`:
\`\`\`
local   all             all                                     md5
host    all             all             127.0.0.1/32            md5
\`\`\`

Restart PostgreSQL:
\`\`\`bash
sudo systemctl restart postgresql
\`\`\`

## Next Steps

1. Test your application thoroughly
2. Set up monitoring and alerting
3. Configure automated backups
4. Update DNS records
5. Monitor performance and optimize as needed

## Troubleshooting

### Common issues:
- **Database connection errors**: Check PostgreSQL is running and credentials are correct
- **File upload issues**: Verify upload directory permissions
- **SSL issues**: Ensure domain is properly configured
- **Performance issues**: Monitor server resources and optimize queries

### Useful commands:
\`\`\`bash
# Check service status
sudo systemctl status postgresql nginx

# View logs
sudo journalctl -u postgresql
sudo journalctl -u nginx

# Database management
sudo -u postgres psql -c "\\l"
sudo -u postgres psql abbaquar_db -c "\\dt"

# PM2 management
pm2 status
pm2 restart abbaquar-api
pm2 logs abbaquar-api
\`\`\`
`;

  const guideFile = path.join(migrationPath, 'VPS-SETUP-GUIDE.md');
  fs.writeFileSync(guideFile, setupGuide);
  console.log('✅ VPS setup guide generated');
}

// Create migration manifest
function createMigrationManifest(migrationPath, results) {
  const manifest = {
    migrationTimestamp: MIGRATION_TIMESTAMP,
    supabaseUrl: supabaseUrl,
    tables: Object.keys(results.database || {}),
    storageBuckets: Object.keys(results.storage || {}),
    summary: {
      totalTables: Object.keys(results.database || {}).length,
      successfulTableExports: Object.values(results.database || {}).filter(Boolean).length,
      failedTableExports: Object.values(results.database || {}).filter(r => !r).length,
      totalBuckets: Object.keys(results.storage || {}).length,
      successfulBucketExports: Object.values(results.storage || {}).filter(Boolean).length,
      failedBucketExports: Object.values(results.storage || {}).filter(r => !r).length
    },
    results: results,
    nextSteps: [
      '1. Review the exported data in the database/ directory',
      '2. Copy files from the files/ directory to your VPS',
      '3. Follow the VPS-SETUP-GUIDE.md instructions',
      '4. Run the schema.sql file on your VPS PostgreSQL',
      '5. Use the import-data.js script to import your data',
      '6. Update your application code to use the new database',
      '7. Test thoroughly before going live'
    ]
  };
  
  const manifestFile = path.join(migrationPath, 'migration-manifest.json');
  fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2));
  
  return manifest;
}

// Main migration function
async function performMigration() {
  console.log('🚀 Starting VPS migration export...');
  console.log(`📁 Migration directory: ${MIGRATION_DIR}`);
  console.log(`⏰ Timestamp: ${MIGRATION_TIMESTAMP}`);
  console.log('');
  
  // Create migration directory
  const migrationPath = createMigrationDirectory();
  
  // Test connection
  console.log('🔍 Testing Supabase connection...');
  try {
    const { data, error } = await supabase
      .from('activities')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Failed to connect to Supabase:', error);
      process.exit(1);
    }
    
    console.log('✅ Connection successful');
    console.log('');
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    process.exit(1);
  }
  
  const results = { database: {}, storage: {} };
  
  // Export database tables
  console.log('📊 Exporting database tables...');
  for (const table of TABLES) {
    results.database[table] = await exportTable(table, migrationPath);
  }
  
  // Export storage buckets
  console.log('');
  console.log('📁 Exporting storage buckets...');
  for (const bucket of STORAGE_BUCKETS) {
    results.storage[bucket] = await exportStorageBucket(bucket, migrationPath);
  }
  
  // Generate additional files
  console.log('');
  console.log('📝 Generating migration files...');
  await generateSQLSchema(migrationPath);
  generateDataImportScript(migrationPath);
  generateVPSSetupGuide(migrationPath);
  
  // Create manifest
  const manifest = createMigrationManifest(migrationPath, results);
  
  // Summary
  console.log('');
  console.log('📋 Migration Export Summary:');
  console.log(`📁 Export location: ${migrationPath}`);
  console.log(`📊 Database tables: ${manifest.summary.successfulTableExports}/${manifest.summary.totalTables} exported`);
  console.log(`📁 Storage buckets: ${manifest.summary.successfulBucketExports}/${manifest.summary.totalBuckets} exported`);
  
  if (manifest.summary.failedTableExports > 0 || manifest.summary.failedBucketExports > 0) {
    console.log('');
    console.log('⚠️  Some exports failed. Check the logs above for details.');
  }
  
  console.log('');
  console.log('🎉 Migration export completed!');
  console.log('');
  console.log('📝 Next steps:');
  manifest.nextSteps.forEach(step => console.log(step));
  
  return manifest;
}

// CLI handling
if (process.argv.includes('--help')) {
  console.log(`
VPS Migration Script for Abbaquar San Dream Centre

Usage:
  node migrate-to-vps.js

This script will:
1. Export all database tables to JSON files
2. Download all files from Supabase Storage
3. Generate SQL schema for PostgreSQL
4. Create data import scripts
5. Generate VPS setup guide

Environment variables required:
  VITE_SUPABASE_URL or SUPABASE_URL
  VITE_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY

Output:
  migration-export/[timestamp]/
    ├── database/          # JSON exports of all tables
    ├── files/            # Downloaded storage files
    ├── scripts/          # Import scripts
    ├── schema.sql        # PostgreSQL schema
    ├── VPS-SETUP-GUIDE.md # Complete setup instructions
    └── migration-manifest.json # Migration summary
`);
} else {
  // Perform migration
  performMigration().catch(error => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
}
