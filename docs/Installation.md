# Installation Guide for GFC-App

## Prerequisites
Before installing GFC-App, ensure you have the following software and tools:

- Node.js (version 14 or higher)
- npm (usually comes with Node.js)
- Git

## Installation Steps

1. Clone the GFC-App repository:
   ```
   git clone https://github.com/Kuonirad/GFC-App.git
   ```

2. Navigate to the project directory:
   ```
   cd GFC-App
   ```

3. Install the required dependencies:
   ```
   npm install
   ```

4. Start the application:
   ```
   npm start
   ```

5. Open your web browser and go to `http://localhost:3000` to access GFC-App.

## Troubleshooting

### Issue: "npm install" fails
- **Solution**: Try clearing the npm cache with `npm cache clean --force` and then run `npm install` again.

### Issue: Application doesn't start
- **Solution**: Ensure all dependencies are installed correctly. Try deleting the `node_modules` folder and running `npm install` again.

### Issue: "Module not found" error
- **Solution**: Make sure you're in the correct directory and that all dependencies are listed in the `package.json` file. Run `npm install` to ensure all modules are installed.

If you encounter any other issues during installation, please open an issue on our GitHub repository with details about the problem and your system configuration.
