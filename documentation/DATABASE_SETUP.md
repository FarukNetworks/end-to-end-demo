# Database Setup Guide

## Overview

This project uses PostgreSQL with Prisma ORM for data persistence. The database runs in Docker for local development.

## Prerequisites

- Docker Desktop installed and running
- Node.js 18+ installed

## Quick Start

### 1. Start PostgreSQL Database

```bash
docker-compose up -d
```

This will:

- Pull PostgreSQL 14 Alpine image
- Create a database named `budgetbuddy_dev`
- Start the database on port 5432
- Create a persistent volume for data

### 2. Run Database Migration

```bash
npx prisma migrate dev --name init
```

This creates the initial database schema with all tables, indexes, and constraints.

### 3. Verify Setup

```bash
npx prisma studio
```

Opens Prisma Studio in your browser to inspect the database.

## Database Configuration

### Connection String

The database connection is configured in `.env`:

```
DATABASE_URL="postgresql://budgetbuddy:budgetbuddy_dev_pass@localhost:5432/budgetbuddy_dev?schema=public"
```

### Docker Configuration

See `docker-compose.yml` for container configuration:

- **User:** budgetbuddy
- **Password:** budgetbuddy_dev_pass (development only!)
- **Database:** budgetbuddy_dev
- **Port:** 5432
- **Health check:** Every 10s

## Database Schema

The schema includes 5 main models:

1. **User** - Authentication and user data
2. **Account** - User financial accounts (bank, cash, etc.)
3. **Category** - Transaction categories (expenses/income)
4. **Transaction** - Individual transactions
5. **Budget** - Monthly budget targets per category

### Indexes

- `Account`: (userId, name)
- `Category`: (userId, type, name)
- `Transaction`: (userId, txnDate), (userId, categoryId)

### Unique Constraints

- `User.email` - Unique emails
- `Budget`: (userId, categoryId, year, month) - One budget per category per month

## Available Scripts

```bash
# Open Prisma Studio (database GUI)
npm run db:studio

# Run migrations
npm run db:migrate

# Push schema changes (dev only, skips migration)
npm run db:push

# Seed database (placeholder - TASK-FOUND-007)
npm run db:seed
```

## Common Tasks

### Reset Database

```bash
npx prisma migrate reset
```

### View Migration Status

```bash
npx prisma migrate status
```

### Stop Database

```bash
docker-compose down
```

### Stop and Remove Data

```bash
docker-compose down -v
```

## Troubleshooting

### Docker Not Running

```
Error: Cannot connect to the Docker daemon
```

**Solution:** Start Docker Desktop

### Port Already in Use

```
Error: port 5432 already allocated
```

**Solution:** Stop other PostgreSQL instances or change port in `docker-compose.yml`

### Migration Conflicts

```bash
# Drop database and start fresh
npx prisma migrate reset
```

## Production Considerations

⚠️ **Security Notes:**

- Change default passwords before production deployment
- Use managed PostgreSQL service (AWS RDS, Render, etc.)
- Enable SSL connections
- Configure appropriate connection pooling limits
- Set up automated backups

## Next Steps

After database setup is complete:

- [ ] Implement seed scripts (TASK-FOUND-007)
- [ ] Configure NextAuth (TASK-FOUND-004)
- [ ] Build authentication endpoints (EPIC-02)
- [ ] Implement transaction CRUD (EPIC-03)
