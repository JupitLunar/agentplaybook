# Database Setup Report - FAILURE

## Date: 2026-02-27
## Task: Create missing `playgrounds` and `wellness` tables in Supabase

## Current State Confirmed
✅ `leads` table exists and is accessible via REST API
❌ `playgrounds` table does NOT exist (error 42P01)
❌ `wellness` table does NOT exist (error 42P01)
❌ `places_view` view does NOT exist

## Connection Attempts Made

### 1. PostgreSQL Pooler (Port 6543/5432)
**Status:** ❌ FAILED - "Tenant or user not found"

Tested configurations:
- `aws-0-ca-central-1.pooler.supabase.com:6543`
- `aws-0-ca-central-1.pooler.supabase.com:5432`
- `aws-0-us-west-1.pooler.supabase.com:6543`
- `aws-0-us-east-1.pooler.supabase.com:6543`
- `aws-0-ap-southeast-1.pooler.supabase.com:6543`
- `aws-0-eu-west-1.pooler.supabase.com:6543`
- `aws-0-ap-northeast-1.pooler.supabase.com:6543`

All failed with "Tenant or user not found" error.

**Root Cause:** The pooler requires the actual database password, NOT the Supabase service role key.

### 2. Direct Connection
**Status:** ❌ FAILED - Hostname not found

Tested: `db.lalpxtoxziyjibifibsx.supabase.co:5432`

Error: `getaddrinfo ENOTFOUND db.lalpxtoxziyjibifibsx.supabase.co`

**Root Cause:** Direct connections may be disabled or require IPv4 addon.

### 3. Supabase REST API
**Status:** ✅ WORKING for queries, ❌ CANNOT execute DDL

Confirmed working:
- `leads` table is accessible
- REST API responds correctly
- Service role key is valid

**Limitation:** The `exec_sql` function does NOT exist in the database:
```
Error: Could not find the function public.exec_sql(sql) in the schema cache
```

Without `exec_sql`, cannot execute CREATE TABLE statements via REST API.

### 4. Supabase CLI
**Status:** ❌ NOT CONFIGURED

The Supabase CLI is installed but the project is not linked.
Requires: `supabase login` or access token for authentication.

## Required Tables (Not Created)

### 1. playgrounds table
```sql
CREATE TABLE playgrounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id TEXT NOT NULL,
  external_id TEXT,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  city TEXT,
  province TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'Canada',
  phone TEXT,
  email TEXT,
  website TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  amenities JSONB,
  images JSONB,
  hours JSONB,
  price_range TEXT,
  rating DECIMAL(2,1),
  review_count INTEGER,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(site_id, external_id)
);
```

### 2. wellness table
```sql
CREATE TABLE wellness (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id TEXT NOT NULL,
  external_id TEXT,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  city TEXT,
  province TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'Canada',
  phone TEXT,
  email TEXT,
  website TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  services JSONB,
  images JSONB,
  hours JSONB,
  price_range TEXT,
  rating DECIMAL(2,1),
  review_count INTEGER,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(site_id, external_id)
);
```

### 3. places_view
```sql
CREATE OR REPLACE VIEW places_view AS
SELECT 
  id, site_id, external_id, name, description, address, city, province, country,
  phone, email, website, latitude, longitude,
  COALESCE(amenities, services) as features,
  images, hours, price_range, rating, review_count, status, created_at, updated_at,
  CASE 
    WHEN site_id LIKE '%playground%' THEN 'playground'
    WHEN site_id LIKE '%wellness%' OR site_id LIKE '%clinic%' THEN 'wellness'
    ELSE 'other'
  END as vertical
FROM playgrounds
UNION ALL
SELECT 
  id, site_id, external_id, name, description, address, city, province, country,
  phone, email, website, latitude, longitude,
  services as features,
  images, hours, price_range, rating, review_count, status, created_at, updated_at,
  'wellness' as vertical
FROM wellness;
```

## Resolution Options

### Option 1: Get Database Password (RECOMMENDED)
1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/lalpxtoxziyjibifibsx/settings/database
2. Copy the database password (NOT the service role key)
3. Add to `.env`: `SUPABASE_DB_PASSWORD=your_password`
4. Run: `node src/scripts/create-tables-pg.js`

### Option 2: Enable exec_sql Function
Run this in Supabase SQL Editor:
```sql
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
END;
$$;
```
Then the automated scripts can use `supabase.rpc('exec_sql', { sql: '...' })`.

### Option 3: Manual SQL Execution
Copy the SQL statements from this report and run them directly in the Supabase Dashboard SQL Editor:
https://supabase.com/dashboard/project/lalpxtoxziyjibifibsx/sql/new

### Option 4: Enable IPv4 Addon
Enable the IPv4 addon in Supabase Dashboard to get a direct connection string.

## Files Created for Testing
- `setup-tables.js` - Script to create tables (failed due to auth)
- `check-db-js.js` - Database state verification
- `health-check.js` - Connection health check
- `test-postgres-js.js` - Postgres.js connection tests
- `test-all-connections.js` - Multiple connection method tests

## Conclusion
**STATUS: FAILURE**

Unable to create the required database tables due to authentication constraints. The service role key works for REST API access but cannot be used for direct PostgreSQL connections. Database password or alternative execution method required.

## Next Steps
1. Obtain the database password from Supabase Dashboard, OR
2. Manually execute the SQL in the Supabase Dashboard SQL Editor, OR
3. Enable the `exec_sql` function for programmatic SQL execution
