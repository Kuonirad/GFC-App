# Usage Guide for GFC_App

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Running the Application](#running-the-application)
4. [Using the Application](#using-the-application)
5. [Troubleshooting](#troubleshooting)

## Prerequisites
Before you begin, ensure you have the following installed:
- Node.js (version 14 or later)
- npm or pnpm
- Git

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/Kuonirad/GFC_App.git
   cd GFC_App
   ```

2. Install dependencies:
   ```
   pnpm install
   ```

## Running the Application

1. Start the backend server:
   ```
   cd backend
   pnpm start
   ```

2. In a new terminal, start the frontend application:
   ```
   cd frontend
   pnpm start
   ```

3. Open your web browser and navigate to `http://localhost:3000` to view the application.

## Using the Application

1. **Flux Image Renderer**:
   - The main component of the application is the Flux Image Renderer.
   - It will automatically attempt to load an image and set up audio input.

2. **AI Animation**:
   - The application uses TensorFlow.js to generate AI animations.
   - These animations are based on audio input from your microphone.

3. **Interacting with the 3D Scene**:
   - You can interact with the 3D scene using your mouse:
     - Click and drag to rotate the view
     - Scroll to zoom in and out

## Troubleshooting

1. **Audio Input Issues**:
   - Ensure your browser has permission to access your microphone.
   - Check that your microphone is properly connected and selected as the input device.

2. **Image Loading Issues**:
   - If images fail to load, check your internet connection.
   - Ensure the backend server is running and accessible.

3. **Performance Issues**:
   - If you experience lag or poor performance, try closing other resource-intensive applications.
   - Ensure your graphics drivers are up to date.

For more detailed information about the API and architecture, please refer to the API.md and Architecture.md documents in the docs folder.
