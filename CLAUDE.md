# Project: Next.js Expense Tracker Application

## Core Principles

**IMPORTANT**: Whenever you write code, it MUST follow SOLID design principles. Never write code that violates these principles. If you do, you will be asked to refactor it.

## Development Workflow

1. Before making any changes, create and checkout a feature branch named `feature-[brief-description]`
2. Write comprehensive tests for all new functionality using Jest and React Testing Library
3. Compile code and run all tests before committing
4. Write detailed commit messages explaining the changes and rationale
5. Commit all changes to the feature branch

## Architecture Overview

- **Frontend**: Next.js 15 with TypeScript 5 and Tailwind CSS 4
- **State Management**: React useState/useEffect with localStorage persistence
- **UI Components**: Custom components with consistent Tailwind styling
- **Data Storage**: Browser localStorage (no backend required)
- **Testing**: Jest for unit tests, React Testing Library for component tests
- **Export Features**: CSV and PDF generation for expense reports

## Code Standards

- Use TypeScript for all new code with strict type checking
- Follow the established component structure in `/src/components`
- All components must be functional components using React hooks
- Use Tailwind utilities for styling; avoid custom CSS unless absolutely necessary
- Implement proper TypeScript interfaces for all data structures
- Follow existing naming conventions (PascalCase for components, camelCase for functions)

## Component Architecture Rules

### Component Organization
- **Core Components**: Place in `/src/components/[ComponentName].tsx`
- **Page Components**: Place in `/src/app/[route]/page.tsx` 
- **Component Index**: Export all components through `/src/components/index.ts`
- **Component Tests**: Place in `/src/components/__tests__/[ComponentName].test.tsx`

### Component Patterns
- Use props interfaces with TypeScript for all component props
- Implement loading states with `isLoading` boolean patterns
- Handle empty states with conditional rendering
- Use consistent styling patterns with Tailwind classes
- Follow the established responsive design patterns (mobile-first)

### Component Naming Conventions
- Components: `PascalCase` (e.g., `ExpenseForm`, `TopVendorsCard`)
- Props interfaces: `[ComponentName]Props` (e.g., `ExpenseFormProps`)
- Hook functions: `use[FeatureName]` (e.g., `useExpenses`)
- Utility functions: `camelCase` (e.g., `filterExpenses`, `calculateSummary`)

### Required Component Structure
```typescript
interface ComponentNameProps {
  // Define all props with proper types
}

export const ComponentName: React.FC<ComponentNameProps> = ({ prop1, prop2 }) => {
  // Component logic
  return (
    <div className="tailwind-classes">
      {/* Component JSX */}
    </div>
  );
};
```

## Data Management Patterns

### Type Definitions
- **Core Types**: Define in `/src/types/[domain].ts` (e.g., `expense.ts`, `vendor.ts`)
- **Export Pattern**: Re-export through `/src/types/index.ts`
- **Strict Typing**: All data structures must have proper TypeScript interfaces
- **Immutable Updates**: Use spread operators for state updates, never mutate directly

### Data Storage Architecture
- **Primary Storage**: Browser localStorage for persistence
- **Storage Utils**: Use centralized storage utilities in `/src/lib/storage.ts`
- **Data Flow**: localStorage ↔ React state ↔ Components
- **No Backend**: This is a client-side only application

### State Management Rules
- **Hook Pattern**: Use custom hooks for data operations (`useExpenses`)
- **Single Source of Truth**: All expense data flows through the main hook
- **Async Loading**: Implement loading states for all data operations
- **Error Handling**: Handle storage errors gracefully with fallbacks

### Required Data Patterns
```typescript
// All data operations must follow this pattern
const [data, setData] = useState<DataType[]>([]);
const [isLoading, setIsLoading] = useState(true);

// Load from storage
useEffect(() => {
  const loadedData = storageUtils.getData();
  setData(loadedData);
  setIsLoading(false);
}, []);

// Save to storage
const updateData = (newData: DataType[]) => {
  setData(newData);
  storageUtils.saveData(newData);
};
```

### Type Safety Requirements
## Feature-Specific Development Rules

### Expense Management Core Features
- **CRUD Operations**: Follow the established pattern in `useExpenses` hook
- **Form Validation**: Implement proper validation for amount, description, category, date
- **Vendor Filtering Support**: Implement vendor-specific filtering capabilities

## Testing Standards

### Test Organization
- **Unit Tests**: Place in `src/[module]/__tests__/[file].test.ts`
- **Component Tests**: Place in `src/components/__tests__/[Component].test.tsx`
- **Test Coverage**: Maintain above 80% coverage for all utility functions
- **Test Naming**: Use descriptive test names that explain the expected behavior

### Required Testing Patterns
- **Component Testing**: Use React Testing Library for all component tests
- **Utility Testing**: Use Jest for all utility function tests
- **Mock Data**: Create realistic mock data that reflects actual usage patterns
- **Edge Cases**: Test empty states, invalid inputs, and boundary conditions
- **TypeScript Testing**: Ensure all tests are properly typed

### Test Categories to Implement
```typescript
describe('ComponentName', () => {
  // Setup and teardown
  beforeEach(() => {
    // Common setup
  });

  describe('rendering', () => {
    // Test component rendering
  });

  describe('user interactions', () => {
    // Test user events and interactions
  });

  describe('data handling', () => {
    // Test props, state, and data flow
  });

  describe('edge cases', () => {
    // Test error states, empty data, etc.
  });
});
```

### Utility Function Testing Rules
- Test all exported functions from `utils.ts` and `vendorUtils.ts`
- Test mathematical calculations with various inputs
- Test filtering logic with different filter combinations
- Test data transformations and aggregations
- Verify type safety and error handling

## Quality Gates

- All code must compile without TypeScript warnings
- Test coverage must remain above 80%
- All tests must pass before committing
- ESLint must pass without errors
- No console.log statements in production code

## File Organization

- **Components**: `/src/components/[ComponentName].tsx`
- **Pages**: `/src/app/[route]/page.tsx`
- **Utilities**: `/src/lib/[utility].ts`
- **Types**: `/src/types/[domain].ts`
- **Hooks**: `/src/hooks/[hookName].ts`
- **Tests**: Co-located with source files in `__tests__` directories

## Performance and Accessibility Guidelines

### Performance Requirements
- **Client-side Optimization**: Minimize localStorage read/write operations
- **Efficient Filtering**: Use efficient algorithms for large expense datasets
- **Component Optimization**: Use React.memo for expensive components when needed
- **Bundle Size**: Keep dependencies minimal, prefer native solutions over libraries
- **Memory Management**: Clean up event listeners and avoid memory leaks

### Responsive Design Patterns
- **Mobile-First Approach**: Design for mobile, enhance for desktop
- **Breakpoint Strategy**: Use Tailwind's responsive utilities (sm:, md:, lg:, xl:)
- **Grid Layouts**: Use CSS Grid for complex layouts, Flexbox for simple ones
- **Touch Targets**: Ensure buttons and interactive elements are touch-friendly (min 44px)
- **Horizontal Scrolling**: Avoid horizontal scrolling on mobile devices

### Accessibility Standards
- **Semantic HTML**: Use proper HTML elements (buttons, forms, headings)
- **ARIA Labels**: Provide proper labels for screen readers
- **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible
- **Color Contrast**: Maintain WCAG AA color contrast ratios
- **Focus Management**: Provide visible focus indicators for all interactive elements

### Established UI Patterns
- **Loading States**: Use consistent loading indicators with `isLoading` state
- **Empty States**: Provide helpful empty state messages with actionable guidance
- **Error Handling**: Show user-friendly error messages, not technical details
- **Form Validation**: Provide immediate feedback on form inputs
- **Progressive Enhancement**: Ensure core functionality works without JavaScript

## Deployment and Maintenance

### Build Requirements
- **Static Export**: Application must build as static files for deployment
- **Environment Variables**: Use Next.js environment variable patterns
- **Asset Optimization**: Optimize images and assets for production
- **Error Boundaries**: Implement proper error boundaries for production stability

### Documentation Standards
- **Component Documentation**: Document complex components with usage examples
- **API Documentation**: Document all utility functions and their parameters
- **Feature Documentation**: Maintain user and developer documentation for features
- **README Updates**: Keep README.md current with setup and deployment instructions

### Maintenance Practices
- **Dependency Updates**: Regularly update dependencies for security
- **Performance Monitoring**: Monitor application performance in production
- **User Feedback**: Collect and address user feedback systematically
- **Feature Evolution**: Plan feature additions with backward compatibility
