import '@testing-library/jest-dom';

// Mock jsPDF to avoid issues in test environment
jest.mock('jspdf', () => {
  return {
    __esModule: true,
    default: jest.fn(() => ({
      setFontSize: jest.fn(),
      text: jest.fn(),
      save: jest.fn(),
    })),
  };
});

jest.mock('jspdf-autotable', () => {
  return {
    __esModule: true,
    default: jest.fn(),
  };
});

// Polyfills for Node.js test environment
global.TextEncoder = global.TextEncoder || require('util').TextEncoder;
global.TextDecoder = global.TextDecoder || require('util').TextDecoder;
