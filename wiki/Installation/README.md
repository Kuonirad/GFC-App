# Installation Guide

Welcome to the installation guide for GFC-App. This guide will walk you through the process of setting up GFC-App on your system.

## System Requirements

Before installing GFC-App, ensure your system meets the following requirements:

- Operating System: Windows 10+, macOS 10.14+, or Linux (Ubuntu 18.04+)
- CPU: 4+ cores, 2.5 GHz or higher
- RAM: 8 GB minimum, 16 GB recommended
- GPU: NVIDIA GPU with CUDA support (for optimal performance)
- Disk Space: 5 GB of free space

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/Kuonirad/GFC-App.git
cd GFC-App
```

### 2. Set Up a Virtual Environment (Optional but Recommended)

```bash
python -m venv gfc-env
source gfc-env/bin/activate  # On Windows, use `gfc-env\Scripts\activate`
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the root directory and add the following:

```
API_KEY=your_api_key_here
DEBUG=True
```

### 5. Start the Application

```bash
npm start
```

## Verifying the Installation

After following these steps, open your web browser and navigate to `http://localhost:3000`. You should see the GFC-App welcome page.

## Troubleshooting

If you encounter any issues during installation, please refer to our [Troubleshooting](../Troubleshooting.md) guide or contact the repository owner for assistance.

## Next Steps

Now that you have GFC-App installed, check out our [Usage Guide](../Usage/README.md) to learn how to create your first flux animation!

<details>
<summary>Installation Checker Unavailable</summary>

<p>The interactive installation checker is temporarily unavailable. We apologize for the inconvenience.</p>
<p>If you encounter any issues during installation, please refer to our <a href="../Troubleshooting.md">Troubleshooting</a> guide for assistance.</p>

</details>
