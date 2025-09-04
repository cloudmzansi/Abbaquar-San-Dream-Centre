#!/bin/bash

# Supabase CLI Migration Script for Abbaquar San Dream Centre
# This script uses the official Supabase CLI for a proper migration

set -e  # Exit on any error

echo "🚀 Starting Supabase CLI Migration..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    
    # Install Supabase CLI (macOS/Linux)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        brew install supabase/tap/supabase
    else
        # Linux
        curl -fsSL https://supabase.com/install.sh | sh
    fi
fi

# Check if user is logged in
if ! supabase projects list &> /dev/null; then
    echo "🔐 Please login to Supabase CLI:"
    supabase login
fi

# Get project details
echo "📋 Available Supabase projects:"
supabase projects list

read -p "Enter your Supabase project reference ID: " PROJECT_REF

# Create migration directory
MIGRATION_DIR="supabase-migration-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$MIGRATION_DIR"
cd "$MIGRATION_DIR"

echo "📁 Created migration directory: $MIGRATION_DIR"

# 1. Export database schema and data
echo "📊 Exporting database schema and data..."

# Get database URL
DB_URL=$(supabase projects api-keys --project-ref "$PROJECT_REF" | grep "Database URL" | awk '{print $3}')

if [ -z "$DB_URL" ]; then
    echo "❌ Could not get database URL. Please check your project reference."
    exit 1
fi

# Export schema
echo "📝 Exporting database schema..."
pg_dump "$DB_URL" --schema-only --no-owner --no-privileges > schema.sql

# Export data
echo "📊 Exporting database data..."
pg_dump "$DB_URL" --data-only --no-owner --no-privileges > data.sql

# 2. Export storage files
echo "📁 Exporting storage files..."

# Create storage directory
mkdir -p storage

# Get storage buckets
BUCKETS=("events" "gallery" "activities" "team" "volunteers")

for bucket in "${BUCKETS[@]}"; do
    echo "📦 Exporting bucket: $bucket"
    mkdir -p "storage/$bucket"
    
    # List files in bucket
    supabase storage ls "$bucket" --project-ref "$PROJECT_REF" > "storage/${bucket}_files.txt"
    
    # Download files (this might need to be done manually or with a custom script)
    echo "⚠️  Manual step: Download files from bucket '$bucket' to storage/$bucket/"
    echo "   You can use the Supabase dashboard or write a custom script for this."
done

# 3. Export environment variables
echo "🔧 Exporting environment configuration..."
cat > .env.example << EOF
# Database (update these for your VPS)
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

# Server
PORT=3000
NODE_ENV=production
EOF

# 4. Create import script for VPS
cat > import-to-vps.sh << 'EOF'
#!/bin/bash

# Import script for VPS
set -e

echo "🚀 Importing to VPS PostgreSQL..."

# Check if PostgreSQL is running
if ! systemctl is-active --quiet postgresql; then
    echo "❌ PostgreSQL is not running. Please start it first."
    exit 1
fi

# Create database if it doesn't exist
sudo -u postgres psql -c "CREATE DATABASE abbaquar_db;" 2>/dev/null || echo "Database already exists"

# Create user if it doesn't exist
sudo -u postgres psql -c "CREATE USER abbaquar_user WITH PASSWORD 'your_secure_password';" 2>/dev/null || echo "User already exists"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE abbaquar_db TO abbaquar_user;"

# Import schema
echo "📝 Importing schema..."
psql -h localhost -U abbaquar_user -d abbaquar_db -f schema.sql

# Import data
echo "📊 Importing data..."
psql -h localhost -U abbaquar_user -d abbaquar_db -f data.sql

echo "✅ Import completed!"
EOF

chmod +x import-to-vps.sh

# 5. Create storage migration script
cat > migrate-storage.js << 'EOF'
#!/usr/bin/env node

/**
 * Storage Migration Script
 * Downloads files from Supabase Storage to local filesystem
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Configuration - UPDATE THESE
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
const DOWNLOAD_PATH = './storage';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const BUCKETS = ['events', 'gallery', 'activities', 'team', 'volunteers'];

async function downloadBucket(bucketName) {
    console.log(`📦 Downloading bucket: ${bucketName}`);
    
    const bucketPath = path.join(DOWNLOAD_PATH, bucketName);
    if (!fs.existsSync(bucketPath)) {
        fs.mkdirSync(bucketPath, { recursive: true });
    }
    
    try {
        const { data: files, error } = await supabase.storage
            .from(bucketName)
            .list('', { limit: 1000 });
        
        if (error) {
            console.error(`❌ Error listing files in ${bucketName}:`, error);
            return;
        }
        
        for (const file of files) {
            try {
                const { data: fileData, error: downloadError } = await supabase.storage
                    .from(bucketName)
                    .download(file.name);
                
                if (downloadError) {
                    console.error(`❌ Error downloading ${file.name}:`, downloadError);
                    continue;
                }
                
                const filePath = path.join(bucketPath, file.name);
                const buffer = await fileData.arrayBuffer();
                fs.writeFileSync(filePath, Buffer.from(buffer));
                console.log(`✅ Downloaded: ${file.name}`);
                
            } catch (error) {
                console.error(`❌ Error processing file ${file.name}:`, error);
            }
        }
        
    } catch (error) {
        console.error(`❌ Error downloading bucket ${bucketName}:`, error);
    }
}

async function main() {
    console.log('🚀 Starting storage migration...');
    
    for (const bucket of BUCKETS) {
        await downloadBucket(bucket);
    }
    
    console.log('🎉 Storage migration completed!');
}

main().catch(console.error);
EOF

chmod +x migrate-storage.js

# 6. Create README
cat > README.md << EOF
# Supabase to VPS Migration

This directory contains all the files needed to migrate your Abbaquar San Dream Centre from Supabase to a VPS.

## Files included:

- \`schema.sql\` - Database schema
- \`data.sql\` - Database data
- \`storage/\` - Directory for storage files
- \`import-to-vps.sh\` - Script to import data to VPS
- \`migrate-storage.js\` - Script to download storage files
- \`.env.example\` - Environment variables template

## Next steps:

1. **Download storage files:**
   \`\`\`bash
   # Update the Supabase credentials in migrate-storage.js
   node migrate-storage.js
   \`\`\`

2. **Set up your VPS:**
   - Install PostgreSQL, Node.js, Nginx
   - Create database and user
   - Run the import script

3. **Import to VPS:**
   \`\`\`bash
   ./import-to-vps.sh
   \`\`\`

4. **Update your application code:**
   - Follow the code modification guide
   - Replace Supabase client with PostgreSQL
   - Update authentication and file storage

## VPS Setup Commands:

\`\`\`bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Nginx
sudo apt install nginx -y

# Install PM2 for process management
sudo npm install -g pm2
\`\`\`
EOF

echo ""
echo "🎉 Migration export completed!"
echo "📁 Migration files saved to: $MIGRATION_DIR"
echo ""
echo "Next steps:"
echo "1. Update Supabase credentials in migrate-storage.js"
echo "2. Run: node migrate-storage.js (to download files)"
echo "3. Follow the README.md instructions"
echo ""
echo "📋 Files created:"
echo "  - schema.sql (database schema)"
echo "  - data.sql (database data)"
echo "  - storage/ (directory for files)"
echo "  - import-to-vps.sh (VPS import script)"
echo "  - migrate-storage.js (storage download script)"
echo "  - .env.example (environment template)"
echo "  - README.md (instructions)"
