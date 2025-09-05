# Rentverse Backend

Template Express.js backend dengan Prisma, PostgreSQL, Swagger UI, dan Husky pre-commit hooks.

## Features

- ✅ Express.js server dengan struktur folder yang terorganisir
- ✅ Prisma ORM dengan PostgreSQL
- ✅ Swagger UI documentation di `/docs`
- ✅ Authentication & Authorization dengan JWT
- ✅ CORS, Helmet, Morgan middleware
- ✅ Husky pre-commit hooks
- ✅ Prettier & ESLint untuk code formatting
- ✅ Environment variables support
- ✅ Error handling middleware
- ✅ Database seeding
- ✅ Health check endpoint

## Struktur Proyek

```
rentverse-backend/
├── index.js                    # Entry point aplikasi
├── package.json               # Dependencies dan scripts
├── prisma/                    # Prisma schema dan migrations
│   ├── schema.prisma          # Database schema
│   └── seed.js               # Database seeding
├── src/                      # Source code utama
│   ├── app.js                # Express app configuration
│   ├── config/               # Konfigurasi aplikasi
│   │   ├── database.js       # Database connection
│   │   └── swagger.js        # Swagger configuration
│   ├── middleware/           # Custom middleware
│   │   └── auth.js          # Authentication middleware
│   └── routes/              # API routes
│       ├── auth.js          # Authentication endpoints
│       ├── users.js         # User management endpoints
│       ├── properties.js    # Property management endpoints
│       └── bookings.js      # Booking management endpoints
├── .husky/                  # Git hooks
├── .env.example            # Environment variables template
├── .prettierrc             # Prettier configuration
├── .eslintrc.json          # ESLint configuration
└── README.md              # Dokumentasi proyek
```

## Installation

1. **Clone repository dan install dependencies:**

```bash
cd rentverse-backend
pnpm install
```

2. **Setup environment variables:**

```bash
cp .env.example .env
# Edit .env dengan konfigurasi database dan JWT secret Anda
```

3. **Setup PostgreSQL database:**
   - Pastikan PostgreSQL sudah terinstall dan berjalan
   - Buat database baru untuk project
   - Update `DATABASE_URL` di file `.env`

4. **Generate Prisma client dan run migrations:**

```bash
pnpm db:generate
pnpm db:migrate
```

5. **Seed database dengan data contoh:**

```bash
pnpm db:seed
```

6. **Jalankan server:**

```bash
# Development mode
pnpm dev

# Production mode
pnpm start
```

## Environment Variables

Buat file `.env` berdasarkan `.env.example`:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/rentverse?schema=public"

# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# API
API_VERSION=v1
```

## API Endpoints

Server akan berjalan di `http://localhost:3000`

### Dokumentasi API

- **Swagger UI**: `http://localhost:3000/docs`

### General Endpoints

- `GET /` - Welcome message
- `GET /health` - Health check

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile

### User Endpoints

- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin only)

### Property Endpoints

- `GET /api/properties` - Get all properties (with filters)
- `GET /api/properties/:id` - Get property by ID
- `GET /api/properties/geojson` - **🗺️ Get properties in GeoJSON format for maps**
- `POST /api/properties` - Create new property (Landlord/Admin)
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property

#### 🗺️ GeoJSON Map Endpoint

**High-performance endpoint for map integration:**

```bash
GET /api/properties/geojson?bbox=minLng,minLat,maxLng,maxLat[&limit=1000][&clng=][&clat=][&q=]
```

**Parameters:**

- `bbox` (required): Bounding box "minLng,minLat,maxLng,maxLat"
- `limit` (optional): Max properties (1-1000, default: 1000)
- `clng,clat` (optional): Center coordinates for distance sorting
- `q` (optional): Search query

**Example:**

```bash
curl "http://localhost:3000/api/properties/geojson?bbox=106.7,-6.3,106.9,-6.1&limit=100"
```

**Features:**

- ⚡ Raw SQL queries for maximum performance
- 🎯 PostGIS geometry support for spatial queries
- 📍 Distance-based sorting from center point
- 🔍 Full-text search on title/city/address
- 🎨 GeoJSON format ready for Leaflet/Mapbox
- 💰 Pre-formatted price display
- 🖼️ Thumbnail image included

### Booking Endpoints

- `GET /api/bookings` - Get bookings
- `GET /api/bookings/:id` - Get booking by ID
- `POST /api/bookings` - Create new booking
- `PATCH /api/bookings/:id/status` - Update booking status
- `DELETE /api/bookings/:id` - Cancel booking

## Database Schema

Project ini menggunakan tiga model utama:

### User

- Menyimpan informasi pengguna (tenant, landlord, admin)
- Authentication dan role-based access control

### Property

- Menyimpan informasi properti yang disewakan
- Relasi dengan User (owner)

### Booking

- Menyimpan informasi pemesanan
- Relasi dengan User dan Property

## Scripts

- `pnpm start` - Jalankan server production
- `pnpm dev` - Jalankan server development dengan nodemon
- `pnpm db:generate` - Generate Prisma client
- `pnpm db:migrate` - Run database migrations
- `pnpm db:studio` - Open Prisma Studio
- `pnpm db:seed` - Seed database dengan data contoh
- `pnpm db:reset` - Reset database dan run migrations ulang
- `pnpm format` - Format code dengan Prettier
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint issues

## Authentication

API menggunakan JWT untuk authentication. Setelah login, gunakan token di header:

```
Authorization: Bearer <your-jwt-token>
```

### Demo Credentials

Setelah menjalankan `pnpm db:seed`, Anda bisa login dengan:

- **Admin**: `admin@rentverse.com` / `password123`
- **Landlord**: `landlord@rentverse.com` / `password123`
- **Tenant**: `tenant@rentverse.com` / `password123`

## Development Tools

### Code Quality

- **Prettier**: Code formatting
- **ESLint**: Code linting
- **Husky**: Git hooks untuk pre-commit checks

### Database

- **Prisma**: Modern ORM dengan type safety
- **PostgreSQL**: Robust relational database

### API Documentation

- **Swagger UI**: Interactive API documentation
- **JSDoc**: Code documentation dalam route files

## Deployment

Untuk deploy ke production:

1. Set environment variables yang sesuai
2. Run database migrations: `pnpm db:deploy`
3. Start application: `pnpm start`

## Contributing

1. Pastikan code ter-format dengan Prettier: `pnpm format`
2. Pastikan tidak ada ESLint errors: `pnpm lint`
3. Test API endpoints menggunakan Swagger UI
4. Commit akan otomatis menjalankan pre-commit hooks

## License

ISC
