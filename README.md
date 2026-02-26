# NamsoTools - React Native Expo App

A React Native Expo application that works on both Android and iOS platforms.

## Project Details

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Platforms**: Android, iOS, Web
- **Expo SDK**: ~54.0.30
- **React**: 19.1.0
- **React Native**: 0.81.5

## Prerequisites

- Node.js 20.19.4 or higher (currently 20.19.0 installed - may show warnings)
- npm or yarn
- Expo CLI
- For iOS development: macOS with Xcode (or use Expo Go app)
- For Android development: Android Studio and Android SDK (or use Expo Go app)

## Installation

Dependencies are already installed. If you need to reinstall:

```bash
npm install
```

## Running the Project

### Start Development Server

```bash
npm start
```

This will start the Expo development server and show a QR code.

### Run on Android

```bash
npm run android
```

Requirements:
- Android Studio installed
- Android emulator running, or
- Physical Android device with Expo Go app installed

### Run on iOS

```bash
npm run ios
```

Requirements:
- macOS
- Xcode installed
- iOS Simulator running, or
- Physical iOS device with Expo Go app installed

### Run on Web

```bash
npm run web
```

Opens the app in your default web browser.

## Using Expo Go App

The easiest way to test on physical devices:

1. Install Expo Go from App Store (iOS) or Google Play Store (Android)
2. Run `npm start`
3. Scan the QR code with:
   - iOS: Camera app
   - Android: Expo Go app

## Project Structure

```
NamsoTools/
├── assets/          # Images, fonts, and other static assets
├── node_modules/    # Dependencies
├── .github/         # GitHub configuration
├── App.tsx          # Main application component
├── index.ts         # Entry point
├── app.json         # Expo configuration
├── package.json     # Dependencies and scripts
├── tsconfig.json    # TypeScript configuration
└── README.md        # This file
```

## Development

The main application code is in `App.tsx`. Start editing this file to build your app.

## Notes

- Node.js version warnings may appear (requires 20.19.4, currently 20.19.0). The project should still work.
- For iOS development without a Mac, use the Expo Go app on a physical iOS device.

## Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
