import '@testing-library/jest-dom/vitest';

// Mock scrollTo to avoid not implemented errors in jsdom tests
window.scrollTo = window.scrollTo || (() => undefined);

// Basic localStorage mock for jsdom tests
const needsLocalStorageMock =
  !window.localStorage ||
  typeof window.localStorage.setItem !== "function" ||
  typeof window.localStorage.getItem !== "function";

if (needsLocalStorageMock) {
  const storage = new Map<string, string>();
  Object.defineProperty(window, "localStorage", {
    value: {
      getItem: (key: string) => (storage.has(key) ? storage.get(key)! : null),
      setItem: (key: string, value: string) => {
        storage.set(key, String(value));
      },
      removeItem: (key: string) => {
        storage.delete(key);
      },
      clear: () => {
        storage.clear();
      },
    },
    configurable: true,
  });
}
