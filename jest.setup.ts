// jest.setup.ts

// Mocking the clipboard methods
Object.defineProperty(global.navigator, 'clipboard', {
    value: {
      writeText: jest.fn().mockResolvedValue(undefined), // Resolves successfully when called
      readText: jest.fn().mockResolvedValue('mocked text'), // Returns mocked text
    },
    writable: true, // Make sure the property can be redefined
  });
  