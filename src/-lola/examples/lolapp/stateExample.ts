// ./lola/lolapp/stateExample.ts

import { stateManager } from '../../seludom/state';

export function stateExample() {
    console.log('--- State Management Example ---');

    // Set and get state
    stateManager.setState('isLoggedIn', true);
    const isLoggedIn = stateManager.getState<boolean>('isLoggedIn');
    console.log('State - isLoggedIn:', isLoggedIn);

    // Update state
    stateManager.setState('isLoggedIn', false);
    const updatedLoginState = stateManager.getState<boolean>('isLoggedIn');
    console.log('Updated State - isLoggedIn:', updatedLoginState);

    // Remove state
    stateManager.removeState('isLoggedIn');
    const removedLoginState = stateManager.getState<boolean>('isLoggedIn');
    console.log('State after removal - isLoggedIn:', removedLoginState);
}
