# Property Management System - Frontend

This is the frontend application for the Property Management System, built with React, TypeScript, and Tailwind CSS.

## Features

- Responsive UI for property management
- Role-based dashboards for administrators and renters
- Property, room, and renter management interfaces
- Document upload and management
- Authentication and authorization

## Tech Stack

- **React**: UI library
- **TypeScript**: For type safety
- **Zustand**: For state management
- **React Router**: For navigation
- **Tailwind CSS**: For styling
- **Axios**: For API communication
- **React Hook Form**: For form handling and validation

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd property-management-system/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   VITE_API_URL=http://localhost:5001/api/v1
   ```

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm run preview
```

## Project Structure

```
/frontend
│
├── /public              # Static assets
│
├── /src
│   ├── /components      # React components
│   │   ├── /shared      # Shared/common components
│   │   ├── /properties  # Property-related components
│   │   ├── /rooms       # Room-related components
│   │   ├── /renters     # Renter-related components
│   │   └── /auth        # Authentication components
│   │
│   ├── /pages           # Page components
│   ├── /stores          # Zustand stores
│   ├── /utils           # Utility functions and API client
│   ├── /hooks           # Custom React hooks
│   ├── /types           # TypeScript type definitions
│   ├── /assets          # Assets imported in components
│   ├── /styles          # Global styles
│   │
│   ├── App.tsx          # Main App component
│   ├── main.tsx         # Entry point
│   └── vite-env.d.ts    # Vite type definitions
│
├── index.html           # HTML template
├── tailwind.config.js   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Dependencies and scripts
```

## State Management

The application uses Zustand for state management. The stores are organized as follows:

- **authStore**: Handles authentication state and user information
- **propertyStore**: Manages property data and operations
- **roomStore**: Manages room data and operations
- **renterStore**: Manages renter data and operations
- **documentStore**: Handles document uploads and management
- **uiStore**: Manages UI state like sidebar visibility

## Routing

React Router is used for navigation with protected routes based on user roles:

- Public routes: Login, Register, Forgot Password
- Admin routes: Properties, Rooms, Renters, Contracts, Admin Dashboard
- Renter routes: My Room, Payments, Maintenance, Renter Dashboard

## Component Design

Components follow a modular structure:

- **Page components**: Top-level components that represent routes
- **Feature components**: Components specific to a feature (e.g., PropertyList)
- **Shared components**: Reusable components used across features (e.g., Modal, Button)

## API Communication

The application communicates with the backend API using Axios:

- API client is configured in `/src/utils/apiClient.ts`
- Each entity has its own service for API operations
- Authentication tokens are managed automatically

## License

[MIT](LICENSE)