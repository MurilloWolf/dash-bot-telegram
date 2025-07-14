export * from './callbacks/index.ts';

import { NavigationCallbackHandler } from './callbacks/index.ts';

// Automatic registration of shared callback handlers
// This allows the callback handlers to be automatically registered in the CallbackRegistry
export const sharedCallbackHandlers = [new NavigationCallbackHandler()];
