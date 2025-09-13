# Screenshot Placeholders

This directory contains screenshot placeholders for the documentation. In a full implementation, these would be automatically captured and inserted during the documentation generation process.

## Expense Export Feature Screenshots

### User Documentation Screenshots

- `main-dashboard.png` - Main dashboard showing expense list and summary cards
- `export-button-location.png` - Location of the export button in the header
- `filtered-expenses.png` - Example of filtered expenses view
- `export-button-click.png` - Visual indication of clicking the export button
- `download-notification.png` - Browser download notification
- `excel-import.png` - Expense data opened in Microsoft Excel

### Technical Documentation Screenshots

- `component-structure.png` - ExportButton component in React DevTools
- `network-requests.png` - No network requests during export process
- `browser-console.png` - Console output during successful export
- `file-structure.png` - Project file structure showing export components

## Screenshot Automation

In a full implementation, screenshots would be automatically captured using tools like:

- **Playwright** - For automated browser testing and screenshot capture
- **Puppeteer** - For programmatic screenshot generation
- **Cypress** - For integration testing with visual documentation

### Example Automation Script

```javascript
// playwright-screenshots.js
const { chromium } = require('playwright');

async function captureExportScreenshots() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Navigate to app
  await page.goto('http://localhost:3000');
  
  // Capture main dashboard
  await page.screenshot({ 
    path: 'docs/screenshots/main-dashboard.png',
    fullPage: true 
  });
  
  // Highlight export button
  await page.locator('[data-testid="export-button"]').highlight();
  await page.screenshot({ 
    path: 'docs/screenshots/export-button-location.png' 
  });
  
  await browser.close();
}
```

## Manual Screenshot Guidelines

When capturing screenshots manually:

1. Use consistent browser window size (1200x800)
2. Ensure clean, representative data in the app
3. Highlight interactive elements with red borders or arrows
4. Use consistent file naming convention
5. Optimize images for web (PNG format, reasonable file sizes)
6. Include alt text descriptions in documentation

## Future Enhancements

- Automated screenshot updates when UI changes
- Multiple resolution captures for responsive documentation
- Dark/light mode screenshot variants
- Internationalization screenshot sets
- Interactive screenshot annotations