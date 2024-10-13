# Troubleshooting Guide

This guide provides solutions to common issues you may encounter while using GFC-App.

## Installation Issues

### Problem: Dependencies fail to install
**Solution:** Try clearing the pnpm cache and reinstalling:
```bash
pnpm store prune
pnpm install
```

### Problem: Application fails to start
**Solution:** Ensure all environment variables are correctly set in your `.env` file. If the issue persists, try removing the `node_modules` folder and reinstalling dependencies:
```bash
rm -rf node_modules
pnpm install
```

## Runtime Errors

### Problem: TensorFlow.js related errors
**Solution:** Ensure you have a compatible version of Node.js installed. TensorFlow.js requires Node.js version 12.0.0 or higher.

### Problem: API Error
**Solution:** Check your network connection and ensure the API endpoint is correct. Verify that your API key is valid and has the necessary permissions.

## Performance Problems

### Problem: Slow performance with large images
**Solution:** Use images no larger than 2048x2048 pixels. Compress images using tools like ImageOptim or TinyPNG to reduce file sizes without significant quality loss.

### Problem: High CPU usage
**Solution:** Limit the number of layers in your project to 5-10. Enable GPU acceleration in your browser settings and ensure your graphics card drivers are up to date.

For any other issues, please check our [FAQ](FAQ.md) or open an issue on our [GitHub repository](https://github.com/Kuonirad/GFC-App/issues).

---
