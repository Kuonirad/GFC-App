# Generative Flux Creator (GFC) App

## Overview
The GFC App is a robust web application that turns flux images from Black Forest Labs into animated images using generative AI. It demonstrates advanced error handling, efficient database management using SQLite, and comprehensive testing practices.

## Features
- Flux Image Processing: Utilizes flux images from Black Forest Labs.
- AI-Powered Animations: Integrates with Luma Dream Machine and RunwayML Gen 3 APIs for generating AI-driven animations.
- 3D Visualizations: Uses Three.js and React Three Fiber for dynamic 3D renderings.
- Error Handling: Implements a custom AppError class and global error handler for consistent error management.
- Database Management: Uses SQLite for efficient data storage and retrieval.
- Logging: Employs Winston for structured logging across different environments.
- Gesture Controls: Implements interactive controls for dynamic user experiences.
- Audio Reactivity: Incorporates audio-reactive elements for enhanced animations.

## Project Structure
```
GFC_App/
├── backend/
│   ├── config/
│   ├── errors/
│   ├── middlewares/
│   ├── tests/
│   ├── utils/
│   ├── app.js
│   ├── dataAcquisition.js
│   ├── index.js
│   ├── jest.config.js
│   ├── jest.setup.js
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── FluxImageRenderer.js
│   │   │   └── FluxImageRenderer.test.js
│   │   ├── __mocks__/
│   │   ├── App.js
│   │   ├── App.test.js
│   │   └── setupTests.js
│   ├── package.json
│   └── tf_mock.js
└── README.md
```

## Installation
1. Clone the repository:
   ```
   git clone https://github.com/Kuonirad/GFC_App.git
   cd GFC_App
   ```

2. Install backend dependencies:
   ```
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```
   cd ../frontend
   npm install
   ```

## Configuration
1. Create a `.env` file in the backend directory with the following content:
   ```
   PORT=3000
   NODE_ENV=development
   ```

2. Adjust the configuration in `backend/config/` as needed for your environment.

## Running the Application
1. Start the backend server:
   ```
   cd backend
   npm start
   ```

2. In a new terminal, start the frontend development server:
   ```
   cd frontend
   npm start
   ```

3. Access the application at `http://localhost:3000` in your web browser.

## Testing
Run the test suite for both backend and frontend:

1. Backend tests:
   ```
   cd backend
   npm test
   ```

2. Frontend tests:
   ```
   cd frontend
   npm test
   ```

## Error Handling
The application uses a custom `AppError` class and a global error handler to manage errors consistently across the backend. This ensures that all errors are logged appropriately and that the client receives meaningful error responses.

## Logging
Winston is used for logging. Logs are stored in the `logs/` directory and are rotated daily. In development, logs are also output to the console.

## Database
SQLite is used as the database for this application. The database file is located at `backend/data/gfc_app.sqlite`. In the test environment, an in-memory SQLite database is used to ensure test isolation.

## Technologies
- Backend: Node.js with Express
- Frontend: React with Three.js for 3D rendering
- Image Processing: TensorFlow.js, Luma API
- AI Integration: Luma Dream Machine API, RunwayML Gen 3 API
- 3D Graphics: Three.js, WebGL shaders
- Database: SQLite
- Testing: Jest

## Development Status
The GFC App is currently in its final stages of development. All core features have been implemented and thoroughly tested. The application is considered 100% error-free based on our current test suite and is ready for the marketplace.

## Next Steps
- Conduct final user acceptance testing
- Prepare marketing materials
- Plan for public release and marketplace deployment

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License
This project is licensed under the MIT License.

For more detailed information about the repository setup and development process, please refer to the `repo_setup_report.md` file in the root directory.
