# Property Management System - Project Summary

## Overview
This is a property management SaaS application built with React, TypeScript, and Tailwind CSS. It provides a comprehensive dashboard for managing rental properties, rooms, renters, and financial data.

## Tech Stack
* **Frontend Framework**: React 18 with TypeScript
* **Styling**: Tailwind CSS with custom theme variables
* **Icons**: Lucide-React icon components
* **Routing**: React Router for navigation
* **Charts**: Chart.js with React-Chartjs-2 for data visualization
* **UI Framework**: Custom components with Radix UI primitives
* **State Management**: React hooks (useState) and Zustand for global state
* **Notifications**: Custom toast component system

## Project Structure
* **/src**: Main source code
  * **/components**: UI components organized by feature
    * **/dashboard**: Main dashboard and analytics visualizations
    * **/rooms**: Room/unit management components
    * **/renters**: Renter management features
    * **/services**: Property services management
    * **/settings**: User and system settings
    * **/contracts**: Rental agreements and documents
    * **/shared**: Reusable components (StatusBadge, ViewModeSwitcher, etc.)
    * **/ui**: Basic UI primitives (toast, modals, buttons)
    * **/plans**: Subscription plan components
  * **/data**: Mock data (units, renters, statistics)
  * **/types**: TypeScript type definitions
  * **/styles**: CSS styling including theme variables
  * **/utils**: Utility functions and helpers

## Key Features
1. **Dashboard**:
   * Key property statistics (occupancy, revenue, etc.)
   * Visual data representation with charts
   * Upcoming tasks and notifications

2. **Room Management**:
   * Grid and list view of available rooms
   * Filtering by status (Occupied, Available, Reserved, Maintenance)
   * Sorting by various properties including status
   * Room creation and editing
   * Detailed room information pages

3. **Renter Management**:
   * Comprehensive renter listing with filtering and sorting
   * Detailed renter profiles with edit functionality
   * Grid/list view options
   * Room assignment functionality
   * Contact information and documentation

4. **Financial Features**:
   * Revenue tracking
   * Expense monitoring
   * Payment collection and history
   * Financial performance analytics

5. **Settings**:
   * Profile management (avatar, name, contact info)
   * Payment methods management
   * Theme customization (colors, font size, dark mode)
   * System preferences

6. **Subscription Plans**:
   * Tiered pricing based on property size:
     * $10/month for up to 10 rooms
     * $20/month for 11-50 rooms
     * $40/month for 51-100 rooms
     * $80/month for over 100 rooms
   * Feature differentiation between plans

## Recent Updates
* Fixed RenterForm to show current information when editing
* Removed 3-dot menu from renter listings
* Added ViewModeSwitcher component for consistent UI across pages
* Added status sorting functionality to rooms page
* Implemented subscription plan page with pricing tiers
* Improved UI for status badges across the application

## UI/UX Features
* Consistent status indicators across the application
* Responsive design for all screen sizes
* Dark mode support
* Grid/list view toggle for data-heavy pages
* Intuitive navigation and information hierarchy
* Accessibility considerations in all components

## Development Rules for Cursor

### Coding Style
* Always follow the existing code style conventions
* Use TypeScript for type safety
* Follow component naming conventions (PascalCase for components)
* Organize imports logically (React, third-party, local)
* Use proper function/type annotations

### Component Structure
* Maintain separation of concerns (UI, logic, data)
* Keep components focused on a single responsibility
* Prefer functional components with hooks
* Limit component size - extract complex logic to custom hooks
* Use React.FC for functional components

### State Management
* Use local state for component-specific state
* Extract shared state to parent components when needed
* Use Zustand for global application state
* Be careful with state updates and re-renders

### UI/UX Consistency
* Follow the existing color schemes and variables
* Maintain consistent spacing
* Use the design system components (buttons, modals, etc.)
* Ensure responsive behavior on all components
* Use StatusBadge for all status indicators

### Performance
* Memoize expensive calculations
* Use appropriate React hooks for performance (useMemo, useCallback)
* Avoid unnecessary re-renders
* Keep bundle size in mind when adding dependencies

### Liquid Templates and JavaScript Integration
* When working with Liquid files, use proper syntax highlighting
* Maintain clean separation between Liquid templates and JavaScript
* Follow consistent indentation and formatting patterns
* Document complex Liquid logic with comments

### Testing
* Write tests for critical functionality
* Test edge cases and error handling
* Ensure accessibility in components

### Pull Requests
* Keep PRs focused on a single feature or fix
* Write clear PR descriptions with context
* Link to related issues or tickets
* Request reviews from appropriate team members

By following these guidelines, we ensure a consistent and maintainable codebase.