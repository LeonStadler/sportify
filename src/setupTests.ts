import '@testing-library/jest-dom/vitest';

// Mock scrollTo to avoid not implemented errors in jsdom tests
window.scrollTo = window.scrollTo || (() => undefined);
