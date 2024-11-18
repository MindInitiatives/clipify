import Clipify from '../src'; // Import your class

describe('Clipify', () => {
  let clipify: Clipify;

  beforeEach(() => {
    clipify = new Clipify();
    // Mock the clipboard writeText method using Object.defineProperty
    Object.defineProperty(global.navigator, 'clipboard', {
      value: {
        writeText: jest.fn().mockResolvedValue(undefined), // Mock resolved promise for success
      },
      writable: true, // Allow modification
    });
  });

  it('should copy text to the clipboard and notify listeners', async () => {
    const notifyListenersSpy = jest.spyOn(clipify, 'notifyListeners' as any); // Spy on public method

    const options = { text: 'Hello, world!' };

    // Call the public `copy` method
    await clipify.copy(options);

    // Assert that the clipboard was written to
    expect(global.navigator.clipboard.writeText).toHaveBeenCalledWith('Hello, world!');

    // Assert that the notifyListeners method was called
    expect(notifyListenersSpy).toHaveBeenCalledWith('copy', 'Hello, world!');
  });

  it('should throw an error if no text is provided', async () => {
    await expect(clipify.copy({ text: '' })).rejects.toThrow('Text is required to copy to clipboard.');
  });

  it('should handle clipboard write failures gracefully', async () => {
    // Spy on console.error to check if it's called with the correct error message
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  
    const options = { text: 'Hello, world!' };
  
    // Mock the clipboard write to fail
    navigator.clipboard.writeText = jest.fn().mockRejectedValue(new Error('Clipboard write failed'));
  
    // Call the copy method and expect it to log the error instead of throwing
    await clipify.copy(options);
  
    // Check if the error was logged correctly
    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to copy text:', expect.any(Error));
  
    // Restore the console.error to its original implementation
    consoleErrorSpy.mockRestore();
  });
  
});
