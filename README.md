# SQUAADS Project Management

A comprehensive project management application built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Project Management**: Create, edit, and track projects with detailed timelines and budgets
- **Team Management**: Manage team members with different compensation types and availability
- **Resource Allocation**: Assign team members to projects with flexible scheduling
- **Calendar View**: Visual calendar showing project assignments and workload
- **Analytics & Reports**: Comprehensive reporting on utilization, profitability, and team performance
- **Work Days Editor**: Granular control over individual work days and hours

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **State Management**: Zustand with persistence
- **Validation**: Zod schemas
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd squaads-project-management
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── calendar/          # Calendar view pages
│   ├── projects/          # Project management pages
│   ├── team/              # Team management pages
│   ├── reports/           # Analytics and reports
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   └── work-days-editor.tsx
├── lib/                   # Utility functions and types
│   ├── constants.ts       # Application constants
│   ├── errors.ts          # Error handling
│   ├── store.ts           # Zustand store
│   ├── types.ts           # TypeScript types
│   ├── utils.ts           # Utility functions
│   └── validation.ts      # Zod schemas
└── hooks/                 # Custom React hooks
```

## Key Features

### Project Management
- Create projects with budgets, timelines, and descriptions
- Track estimated vs actual hours
- Extend project deadlines with history tracking
- Calculate project profitability and costs

### Team Management
- Add team members with hourly or monthly compensation
- Set availability and working hours
- Track utilization rates and stress levels
- Prevent deletion of members assigned to projects

### Resource Allocation
- Assign members to projects with daily or fixed hour allocations
- Customize work days with granular hour control
- Visual calendar showing all assignments
- Automatic conflict detection and validation

### Analytics
- Team utilization and stress level reports
- Project profitability analysis
- Role distribution charts
- Estimated vs actual hours tracking

## Data Validation

The application uses Zod schemas for comprehensive data validation:

- **Member validation**: Name, role, compensation, and availability constraints
- **Project validation**: Title, dates, budget, and hour requirements
- **Assignment validation**: Member-project relationships and scheduling rules

## Error Handling

Robust error handling with:
- Custom error classes for different error types
- User-friendly error messages
- Development error details
- Graceful fallbacks for data corruption

## Performance Optimizations

- Memoized date calculations with caching
- Debounced search inputs
- Optimized re-renders with proper state management
- Lazy loading of components where appropriate

## Testing

Run tests with:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Generate coverage report:
```bash
npm run test:coverage
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License.