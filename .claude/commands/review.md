## Usage
`@review.md <CODE_SCOPE>`

## Context
- Code scope for review: $ARGUMENTS
- Target files will be referenced using @ file syntax.
- Project coding standards and conventions will be considered from @CLAUDE.md.
- **Tech Stack**: Next.js 15, React 19, TypeScript 5, Tailwind CSS 4, Jest with React Testing Library
- **Project Type**: Client-side expense tracker with localStorage persistence

## Your Role

You are the Code Review Coordinator directing four review specialists:

1. **Quality Auditor** – examines code quality, readability, and maintainability against expense tracker patterns.
2. **Security Analyst** – identifies vulnerabilities, localStorage security, and client-side data exposure.
3. **Performance Reviewer** – evaluates filtering algorithms, React rendering, and localStorage optimization.
4. **Architecture Assessor** – validates component patterns, hook usage, and TypeScript implementation.

## Process

1. **Code Examination**: Systematically analyze target code sections and dependencies.
2. **Multi-dimensional Review**:
   - **Quality Auditor**: Assess naming conventions, component structure, TypeScript usage, and test coverage against established patterns in `/src/components`, `/src/lib`, and `/src/hooks`
   - **Security Analyst**: Review localStorage operations, data validation, XSS prevention in user inputs, and client-side data sanitization 
   - **Performance Reviewer**: Analyze filtering algorithms efficiency, React rendering optimization, bundle size impact, and localStorage access patterns
   - **Architecture Assessor**: Evaluate adherence to established patterns from `useExpenses` hook, component composition, utility function organization, and SOLID principles
3. **Expense Tracker Specific Checks**:
   - **Data Flow**: Verify localStorage ↔ React state ↔ Components pattern
   - **Filtering Logic**: Validate multi-criteria filtering performance and accuracy
   - **Export Features**: Review CSV/PDF generation and browser download handling
   - **Type Safety**: Ensure proper TypeScript interfaces for Expense, Vendor, and Filter types
   - **Testing**: Verify Jest/RTL test patterns and coverage for utilities and components
4. **Synthesis**: Consolidate findings into prioritized actionable feedback.
5. **Validation**: Ensure recommendations align with Next.js 15, React 19, and established expense tracker patterns.

## Output Format

1. **Review Summary** – high-level assessment with priority classification and alignment with expense tracker architecture.
2. **Detailed Findings** – specific issues with code examples, references to established patterns in existing components.
3. **Improvement Recommendations** – concrete refactoring suggestions following patterns from TopExpenseCategories, useExpenses, or utility functions.
4. **Action Plan** – prioritized tasks with effort estimates, testing requirements, and integration steps.
5. **Next Actions** – follow-up reviews, test coverage validation, and performance monitoring requirements.

## Expense Tracker Specific Review Criteria

### Component Quality Standards
- Follow established patterns from `/src/components/ExpenseForm.tsx`, `/src/components/TopVendorsCard.tsx`
- Implement proper loading states with `isLoading` boolean patterns
- Use Tailwind CSS classes consistently with mobile-first responsive design
- Include proper TypeScript interfaces for all props and state

### Data Management Review Points
- Verify localStorage operations follow `/src/lib/storage.ts` patterns
- Ensure immutable state updates using spread operators
- Validate proper error handling for storage failures
- Check adherence to `useExpenses` hook patterns for data operations

### Testing Requirements Review
- Verify Jest/React Testing Library setup following `/src/__tests__/` patterns
- Check test coverage for utility functions (>80% requirement)
- Validate mock data patterns similar to existing test files
- Ensure proper TypeScript typing in test files

### Performance Considerations
- Review filtering algorithm efficiency for large datasets
- Check React.memo usage for expensive components
- Validate localStorage read/write optimization
- Assess bundle size impact of new dependencies
