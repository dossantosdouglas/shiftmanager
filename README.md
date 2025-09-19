# Shift Management Panel

A comprehensive Next.js application for managing employee shift actions including cancellations, modifications, and additions.

## Features

- **Shift Logging**: Employees can log three types of actions:

  - Cancel a shift
  - Modify a shift
  - Add a shift

- **Comprehensive Data Capture**: Each shift record contains:

  - Employee name
  - Action type (Cancel, Modify, Add)
  - Date of the shift (with calendar input, stored in MST)
  - Time range (start/end times)
  - Shift type (Voice or Chat)

- **Advanced Filtering**: Filter shifts by:

  - Employee name
  - Action type
  - Shift type
  - Date range

- **Reporting Dashboard**:
  - Summary statistics by employee and action type
  - CSV export functionality
  - Visual overview with charts and metrics

## Tech Stack

- **Frontend**: Next.js 15 with App Router, React, TypeScript
- **UI**: shadcn/ui components with Tailwind CSS
- **Database**: SQLite with Prisma ORM
- **Form Validation**: React Hook Form with Zod validation
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd shiftmanage
```

2. Install dependencies:

```bash
npm install
```

3. Set up the database:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

4. Seed the database with sample data (optional):

```bash
npx tsx prisma/seed.ts
```

5. Start the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── shifts/          # Shift CRUD operations
│   │   └── reports/         # Reporting endpoints
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main application page
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── ShiftForm.tsx        # Shift submission form
│   ├── ShiftsTable.tsx      # Shifts listing with filters
│   └── Reports.tsx          # Reports dashboard
├── lib/
│   ├── prisma.ts            # Prisma client configuration
│   └── utils.ts             # Utility functions
└── types/
    └── shift.ts             # TypeScript type definitions

prisma/
├── schema.prisma            # Database schema
├── migrations/              # Database migrations
└── seed.ts                  # Sample data seed script
```

## API Endpoints

### Shifts

- `POST /api/shifts` - Create a new shift record
- `GET /api/shifts` - Get shifts with optional filtering

### Reports

- `GET /api/reports` - Get aggregated reports data

## Database Schema

The application uses SQLite with the following main model:

```prisma
model Shift {
  id           String     @id @default(cuid())
  employeeName String
  actionType   ActionType
  shiftDate    DateTime
  startTime    String
  endTime      String
  shiftType    ShiftType
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
}

enum ActionType {
  CANCEL
  MODIFY
  ADD
}

enum ShiftType {
  VOICE
  CHAT
}
```

## Usage

### Logging a Shift Action

1. Navigate to the "Log Shift" tab
2. Fill in the required information:
   - Employee name
   - Action type (Cancel, Modify, or Add)
   - Shift date (using the calendar picker)
   - Start and end times (24-hour format)
   - Shift type (Voice or Chat)
3. Submit the form

### Viewing Shifts

1. Navigate to the "View Shifts" tab
2. Use the filters to narrow down results:
   - Search by employee name
   - Filter by action type
   - Filter by shift type
   - Set date range
3. Click "Apply Filters" to update the table

### Generating Reports

1. Navigate to the "Reports" tab
2. Apply any desired filters
3. View the summary statistics
4. Export data to CSV using the "Export CSV" button

## Development

### Running Tests

```bash
npm test
```

### Building for Production

```bash
npm run build
```

### Database Management

```bash
# Reset database
npx prisma migrate reset

# Generate Prisma client
npx prisma generate

# Open Prisma Studio
npx prisma studio
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
