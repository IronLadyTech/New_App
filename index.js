import { registerRootComponent } from 'expo';

// Initialize Firebase before any screen (splash → login) so Auth / reCAPTCHA never run against a missing app.
import './services/firebase';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
