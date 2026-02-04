# Fleet Compliance Tracker

A full-stack web application for tracking CARB Clean Truck Check compliance. Fleet operators can monitor their trucks' testing status, receive automated reminders, and stay ahead of regulatory deadlines.

![Fleet Compliance Dashboard](https://via.placeholder.com/800x400?text=Fleet+Compliance+Dashboard)

## Features

- **Dashboard Overview**: At-a-glance view of fleet compliance status with color-coded indicators
- **Truck Management**: Add, edit, and track all fleet vehicles with VIN, license plate, and fleet tags
- **Test Record Tracking**: Log test results with automatic due date calculation
- **Status Calculation**: Automatic status updates (Compliant/Due Soon/Overdue) based on test due dates
- **Automated Reminders**: Configurable reminders at 30, 14, and 3 days before due dates
- **2027 Ready**: Toggle between semi-annual and quarterly testing schedules
- **Mobile Responsive**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React 18, Tailwind CSS, React Router, Axios
- **Backend**: Node.js, Express, Prisma ORM
- **Database**: PostgreSQL
- **Auth**: JWT-based authentication
- **Deployment**: Docker & Docker Compose

## Quick Start with Docker

The easiest way to run the application is with Docker Compose:

```bash
# Clone or navigate to the project directory
cd "Fleet Compliance"

# Start all services
docker-compose up --build

# The app will be available at:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:3001
```

### Demo Account

After starting the application, log in with:
- **Email**: `demo@cleantruckchecksd.com`
- **Password**: `demo123`

## Manual Setup (Development)

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Database Setup

1. Create a PostgreSQL database:
```sql
CREATE DATABASE fleet_compliance;
```

2. Update the `.env` file in the backend directory with your database URL.

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file and configure
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
npx prisma migrate dev

# Seed the database with demo data
npm run prisma:seed

# Start the development server
npm run dev
```

The API will be available at `http://localhost:3001`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Project Structure

```
Fleet Compliance/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.js            # Seed data script
│   ├── src/
│   │   ├── routes/            # API route handlers
│   │   ├── middleware/        # Auth middleware
│   │   ├── services/          # Business logic
│   │   └── utils/             # Helper functions
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Page components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── context/           # React context (auth)
│   │   ├── utils/             # API client & helpers
│   │   └── styles/            # Tailwind CSS
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Trucks
- `GET /api/trucks` - List all trucks (with filters)
- `GET /api/trucks/:id` - Get truck details
- `POST /api/trucks` - Create truck
- `PUT /api/trucks/:id` - Update truck
- `DELETE /api/trucks/:id` - Delete truck

### Test Records
- `GET /api/test-records/truck/:truckId` - Get truck's test history
- `POST /api/test-records` - Add test record
- `DELETE /api/test-records/:id` - Delete test record

### Reminders
- `GET /api/reminders` - List all reminders
- `GET /api/reminders/truck/:truckId` - Get truck's reminders
- `POST /api/reminders` - Create reminder
- `DELETE /api/reminders/:id` - Delete reminder
- `PATCH /api/reminders/:id/send` - Mark as sent

### Dashboard
- `GET /api/dashboard/stats` - Get compliance statistics
- `GET /api/dashboard/by-fleet-tag` - Stats grouped by fleet tag

### Settings
- `GET /api/settings` - Get user settings
- `PUT /api/settings/company` - Update company info
- `PUT /api/settings/schedule` - Update testing schedule
- `PUT /api/settings/reminders` - Update reminder preferences
- `PUT /api/settings/password` - Change password

## Business Logic

### Status Calculation
- **Compliant** (Green): Next test due date > 30 days away
- **Due Soon** (Yellow): Next test due date ≤ 30 days
- **Overdue** (Red): Past the due date

### Test Schedules
- **Semi-Annual**: Next due date = test date + 6 months (current CARB requirement)
- **Quarterly**: Next due date = test date + 3 months (2027 rule change)

### Failed Tests
When a test result is "Fail", the truck is flagged as "Needs Retest" and the due date is not advanced until a passing test is recorded.

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/fleet_compliance
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
PORT=3001
NODE_ENV=development
```

## Customization

### Branding Colors
The app uses Padres-themed colors (defined in `tailwind.config.js`):
- Brown: `#2F241D`
- Gold: `#FFC425`

To customize, edit `frontend/tailwind.config.js`:
```js
colors: {
  'padres-brown': '#2F241D',  // Change to your primary color
  'padres-gold': '#FFC425',    // Change to your accent color
}
```

## Production Deployment

For production deployment:

1. Update environment variables with secure values
2. Use a managed PostgreSQL database
3. Set up proper SSL/TLS certificates
4. Configure a reverse proxy (nginx/traefik)
5. Set up proper logging and monitoring

```bash
# Production build
docker-compose -f docker-compose.yml up --build -d
```

## License

MIT License - see LICENSE file for details.

## Support

For issues and feature requests, please open a GitHub issue.

---

Built with care for San Diego fleet operators.
