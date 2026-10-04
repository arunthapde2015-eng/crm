import '@testing-library/jest-dom/vitest';

// A sign-in in one test must not carry over to the next.
afterEach(() => {
  sessionStorage.clear();
});
