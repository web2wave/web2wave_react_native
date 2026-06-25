# Web2Wave React Native

Web2Wave is a lightweight React Native package that provides a simple interface for managing user subscriptions and properties through a REST API.

## Features

- Fetch subscription status for users
- Check for active subscriptions
- Manage user properties
- Identify web2wave user via device fingerprinting
- Set third-party profiles (Adapty, RevenueCat, Qonversion)
- WebView integration for quizzes and landing pages
- Thread-safe singleton design
- Async/await API support
- Built-in error handling
- TypeScript support

## Installation

### npm

```bash
npm install web2wave react-native-webview
```

### yarn

```bash
yarn add web2wave react-native-webview
```

### Additional Setup

For React Native 0.60+, autolinking should handle the setup automatically. However, you may need to:

**iOS:**
```bash
cd ios && pod install
```

**Android:**
No additional setup required.

## Setup

Before using Web2Wave, you need to configure the API key:

```typescript
import { Web2Wave } from 'web2wave';

Web2Wave.shared.initialize('your-api-key');
```

## Usage

### Checking Subscription Status

```typescript
import { Web2Wave } from 'web2wave';

// Fetch subscriptions
const subscriptions = await Web2Wave.shared.fetchSubscriptions('userID');

// Check if user has an active subscription
const isActive = await Web2Wave.shared.hasActiveSubscription('userID');
```

### External Subscription Cancel/Refund

```typescript
// Cancel subscription in external Stripe/Paddle/PayPal
const resultCancelSubscription = await Web2Wave.shared.cancelSubscription(
  'sub_1PzNJzCsRq5tBi2bbfNsAf86', // paySystemId
  'may be null' // optional comment
);

if (resultCancelSubscription.isSuccess) {
  console.log('Subscription canceled');
} else {
  console.log('Failed to cancel subscription:', resultCancelSubscription.errorMessage);
}

// Refund subscription with invoiceID in external Stripe/Paddle/PayPal
const resultRefundSubscription = await Web2Wave.shared.refundSubscription(
  'sub_1PzNJzCsRq5tBi2bbfNsAf86', // paySystemId
  'your_invoice_id', // invoiceId
  'may be null' // optional comment
);

if (resultRefundSubscription.isSuccess) {
  console.log('Subscription refunded');
} else {
  console.log('Failed to refund subscription:', resultRefundSubscription.errorMessage);
}
```

### Managing User Properties

```typescript
// Fetch user properties
const properties = await Web2Wave.shared.fetchUserProperties('userID');

// Update a user property
const result = await Web2Wave.shared.updateUserProperty(
  'userID',
  'preferredTheme',
  'dark'
);

if (result.isSuccess) {
  console.log('Property updated successfully');
} else {
  console.log('Failed to update property:', result.errorMessage);
}
```

### Identify web2wave user

The `identify()` method identifies a user using device fingerprinting and returns identification metadata including the `user_id`. Use it as an **alternative to MMP attribution** (AppsFlyer, Adjust, Branch, etc.) when you do not run those tools — call it on first app launch instead of reading an install deeplink.

```typescript
const identificationData = await Web2Wave.shared.identify();

if (identificationData?.success === 1 && identificationData.user_id) {
  const userId = identificationData.user_id;
  console.log('Identified user:', userId);

  await Web2Wave.shared.setAdaptyProfileID(userId, '{adaptyProfileID}');
} else {
  console.log('Failed to identify user');
}
```

**Response format:**

```typescript
{
  success: 1,
  user_id: 'identified_user_guid',
  match_method: 'match_method_used',
  platform: 'iOS' // or 'Android'
}
```

### Managing Third-Party Profiles

```typescript
// Save Adapty profileID
const resultAdapty = await Web2Wave.shared.setAdaptyProfileID(
  'userID',
  '{adaptyProfileID}'
);

if (resultAdapty.isSuccess) {
  console.log('Adapty profileID saved');
} else {
  console.log('Failed to save Adapty profileID:', resultAdapty.errorMessage);
}

// Save RevenueCat profileID
const resultRevcat = await Web2Wave.shared.setRevenuecatProfileID(
  'userID',
  '{revenueCatProfileID}'
);

if (resultRevcat.isSuccess) {
  console.log('RevenueCat profileID saved');
} else {
  console.log('Failed to save RevenueCat profileID:', resultRevcat.errorMessage);
}

// Save Qonversion profileID
const resultQonversion = await Web2Wave.shared.setQonversionProfileID(
  'userID',
  '{qonversionProfileID}'
);

if (resultQonversion.isSuccess) {
  console.log('Qonversion profileID saved');
} else {
  console.log('Failed to save Qonversion profileID:', resultQonversion.errorMessage);
}
```

### Working with Quiz or Landing Web Page

First, add the webview hook to your root component:

```typescript
import React from 'react';
import { useWeb2WaveWebView } from 'web2wave';

function App() {
  const { webViewComponent } = useWeb2WaveWebView();

  return (
    <>
      <YourAppContent />
      {webViewComponent}
    </>
  );
}
```

Then, you can open web pages from anywhere in your app:

```typescript
import { openWebPage, closeWebPage } from 'web2wave';

// Create an event listener
const eventListener = {
  onEvent: (event: string, data?: Record<string, any>) => {
    console.log('Event received:', event, data);
  },
  onClose: (data?: Record<string, any>) => {
    console.log('WebView closed:', data);
    closeWebPage();
  },
  onQuizFinished: (data?: Record<string, any>) => {
    console.log('Quiz finished:', data);
    closeWebPage();
  },
};

// Open web page
openWebPage({
  webPageURL: 'https://your-url.com',
  allowBackNavigation: true,
  listener: eventListener,
  backgroundColor: '#133C75', // Optional, defaults to white
});

// Close web page programmatically
closeWebPage();
```

The `backgroundColor` parameter in `openWebPage` is optional. If not provided, the default background color will be white.

## API Reference

### `Web2Wave.shared`

The singleton instance of the Web2Wave client.

#### Properties

- `isInitialized: boolean` - Check if the SDK is initialized

#### Methods

##### `initialize(apiKey: string): void`

Initializes the Web2Wave SDK with your API key.

##### `fetchSubscriptions(web2waveUserId: string): Promise<Subscription[] | null>`

Fetches the subscription status for a given user ID.

##### `hasActiveSubscription(web2waveUserId: string): Promise<boolean>`

Checks if the user has an active subscription (including trial status).

##### `fetchUserProperties(web2waveUserId: string): Promise<UserProperties | null>`

Retrieves all properties associated with a user.

##### `updateUserProperty(web2waveUserId: string, property: string, value: string): Promise<Web2WaveResponse>`

Updates a specific property for a user.

##### `chargeUser(web2waveUserId: string, priceId: number): Promise<Web2WaveResponse>`

Charge existing user with saved payment method.

##### `cancelSubscription(paySystemId: string, comment?: string): Promise<Web2WaveResponse>`

Cancel external subscription.

##### `refundSubscription(paySystemId: string, invoiceId: string, comment?: string): Promise<Web2WaveResponse>`

Refund external subscription.

##### `setRevenuecatProfileID(web2waveUserId: string, revenuecatProfileId: string): Promise<Web2WaveResponse>`

Set RevenueCat profileID.

##### `setAdaptyProfileID(web2waveUserId: string, adaptyProfileId: string): Promise<Web2WaveResponse>`

Set Adapty profileID.

##### `setQonversionProfileID(web2waveUserId: string, qonversionProfileId: string): Promise<Web2WaveResponse>`

Set Qonversion ProfileID.

##### `identify(): Promise<IdentifyResponse | null>`

Identifies a user using the device fingerprint. Alternative to MMP-based deeplink attribution.

### `openWebPage(options): void`

Open web quiz or landing page.

**Options:**
- `webPageURL: string` - The URL to open
- `listener?: Web2WaveWebListener` - Event listener callbacks
- `allowBackNavigation?: boolean` - Allow back navigation (default: false)
- `backgroundColor?: ColorValue` - Background color (default: white)

### `closeWebPage(): void`

Close web quiz or landing page.

### `useWeb2WaveWebView(): { webViewComponent: React.ReactElement | null }`

React hook that returns the webview component. Use this in your root component to enable webview functionality.

## Requirements

- React Native >= 0.60.0
- React >= 16.8.0
- react-native-webview >= 11.0.0

## TypeScript

This package includes TypeScript definitions. No additional type definitions needed.

## License

MIT

## Support

- GitHub Issues: https://github.com/web2wave/web2wave_react_native/issues
- Homepage: https://web2wave.com