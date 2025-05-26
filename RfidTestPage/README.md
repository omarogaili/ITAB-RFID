# RFID Test Application (Frontend)

##  Overview
This is the frontend application for the RFID Test System. It provides a user interface for interacting with the backend, visualizing test results, and managing test setups. The application is built using **React**, **TypeScript**, and **Vite** for fast development and performance.

---

## Features
- **Test Setup**: Configure test parameters such as quantity, test description, and transport method.
- **Live Heatmap**: Visualize real-time data from the backend.
- **Image Display**: View images captured by the Xovis sensor.
- **WebSocket Integration**: Real-time communication with the backend for live updates.

---

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/omarogaili/ITAB-RFID.git
cd RFIDApp/RfidTestPage
```

### 2. Install Dependencies
Make sure you have **Node.js** installed. Then run:
```bash
npm install
```

### 3. Configure Environment Variables
Update the `.env` file to configure the API and WebSocket URLs. By default, the application uses dynamic IPs:
```bash
VITE_API_URL=http://0.0.0.0:5001
VITE_WEB_SOCKET_URL=ws://0.0.0.0:8765
```
- **`VITE_API_URL`**: URL for connecting to the backend API.
- **`VITE_WEB_SOCKET_URL`**: URL for connecting to the WebSocket server.

### 4. Start the Development Server
Run the following command to start the frontend in development mode:
```bash
npm run dev
```
The application will be available at [http://localhost:5173](http://localhost:5173).

---

##  Project Structure
```
src/
├── Components/       # Reusable React components
├── Context/          # React Context for state management
├── Pages/            # Application pages (e.g., TestSetup, TestResultPage)
├── Styles/           # CSS and module styles
├── assets/           # Static assets (e.g., images)
├── App.tsx           # Main application component
├── main.tsx          # Entry point for the application
```

---


### Run Unit Tests
If you have unit tests configured, run them with:
```bash
npm test
```

---

##  Deployment
To build the application for production, run:
```bash
npm run build
```
The production-ready files will be available in the `dist/` directory.

---

##  Troubleshooting
### Common Issues
1. **WebSocket Connection Fails**:
   - Ensure the backend is running and the `VITE_WEB_SOCKET_URL` in `.env` is correct.
2. **API Errors**:
   - Verify that the backend API is running and accessible via the `VITE_API_URL`.

### Logs
Frontend logs are saved in `frontend.log`. Check this file for debugging information.

---


