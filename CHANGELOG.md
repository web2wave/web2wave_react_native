## 1.3.0

- Send `device_model` header for identify fingerprinting
  - Android: `Platform.constants.Model`
  - iOS: optional `react-native-device-info` `getDeviceId()` (machine id)

## 1.2.0

- Fingerprint headers on API requests (`platform`, `screen_size`, `timezone`, `os_version`)
- `identify()` deferred deeplink support

## 1.1.1

- Initial React Native version
- Add possibility to manage webview history back events

## 1.1.0

- Add webview for paywall and quizzes

## 1.0.0

- Initial version with subscription and user properties management
