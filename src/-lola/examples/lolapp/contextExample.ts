// ./lola/lolapp/contextExample.ts

// Import the ContextManager class from the library
import { ContextManager } from '../../seludom/ctx';

// Function to demonstrate context management
export function contextExample() {
    console.log('--- Context Management Example ---');

    // Set a value in the public context
    // Public context is shared globally and accessible by any part of the application
    ContextManager.setPublicContext('appConfig', { version: '1.0.0', name: 'lolapp' });
    // Retrieve the value from the public context
    const appConfig = ContextManager.getPublicContext('appConfig');
    console.log('Public Context - appConfig:', appConfig);

    // Use a private context to store data specific to an object
    const user = { id: 'user123' };
    // Set user-specific settings in the private context
    ContextManager.setPrivateContext(user, 'settings', { theme: 'dark' });
    // Retrieve the user-specific settings from the private context
    const userSettings = ContextManager.getPrivateContext(user, 'settings');
    console.log('Private Context - user settings:', userSettings);
}
