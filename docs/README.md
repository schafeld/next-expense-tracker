# Documentation

This directory contains comprehensive documentation for the Next.js Expense Tracker application.

## Structure

- **[dev/](./dev/)** - Technical documentation for developers
  - Implementation details
  - API specifications
  - Code architecture
  - Testing guidelines

- **[user/](./user/)** - User-friendly guides and tutorials
  - Step-by-step instructions
  - Feature explanations
  - Troubleshooting guides
  - FAQ sections

## Available Documentation

### Developer Documentation

- [Application Architecture](./dev/application-architecture.md)
- [Component System](./dev/component-system.md)
- [State Management](./dev/state-management.md)
- [Data Persistence](./dev/data-persistence.md)
- [Expense Export Implementation](./dev/expense-export-implementation.md)
- [Expense Filters Implementation](./dev/expense-filters-implementation.md) ✨ **New**

### User Documentation

- [Getting Started](./user/getting-started.md)
- [Managing Expenses](./user/managing-expenses.md)
- [Using Filters](./user/using-filters.md)
- [Exporting Data](./user/exporting-data.md)
- [How to Export Expenses](./user/how-to-export-expenses.md)
- [How to Filter Expenses](./user/how-to-filter-expenses.md) ✨ **New**

## Generating Documentation

Use the `document-feature` Claude Code command to automatically generate documentation for new features:

```bash
document-feature <feature-name>
```

This will create both technical and user documentation based on code analysis.

## Documentation Standards

- All documentation should be written in Markdown
- Use clear, descriptive headings and subheadings
- Include code examples where relevant
- Add screenshot placeholders in user documentation
- Cross-reference related documentation
- Keep content up-to-date with code changes

## Contributing

When adding new features:

1. Run `document-feature <feature-name>` to generate initial documentation
2. Review and enhance the generated content
3. Add any missing details or examples
4. Update cross-references and navigation
5. Include documentation updates in your pull request