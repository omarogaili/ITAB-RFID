# RFID Test Application

##  Overview
The RFID Test Application consists of two main parts:
1. **Frontend**: A React-based user interface for configuring tests, visualizing results, and interacting with the backend.
2. **Backend**: A Python-based server that handles data processing, WebSocket communication, and database interactions.

---

## Features
### Frontend
- **Test Setup**: Configure test parameters such as quantity, test description, and transport method.
- **Live Heatmap**: Visualize real-time data from the backend.
- **Image Display**: View images captured by the Xovis sensor.
- **WebSocket Integration**: Real-time communication with the backend for live updates.

### Backend
- **API Endpoints**: Handles requests for test setup, image uploads, and test results.
- **WebSocket Server**: Sends real-time updates to the frontend.
- **Database Integration**: Stores test data and logs in a MySQL database.
- **Image Processing**: Processes images from the Xovis sensor.

---

## Setup Instructions

### 1. Clone the Repository
```bash
git clone  
cd RFIDApplication
```

---

### Backend Setup

#### 1. Install MySQL
- Install MySQL on your device.
- Create a schema named `RFID_Schema`:
  ```sql
  CREATE SCHEMA RFID_Schema;
  ```

#### 2. Update Database Credentials
- Navigate to `RFIDapi_Python/src/ProductsInformation.py`.
- Update the MySQL password to your own.

#### 3. Update Xovis Credentials
- Navigate to `RFIDapi_Python/src/Main.py`.
- Update the Xovis password in the `send_image_data_to_clients` function.

#### 4. Update MQTT Broker IP
- Navigate to `RFIDapi_Python/src/RfidHandler.py`.
- Update the IP address for the MQTT broker.

#### 5. Install Python Dependencies
- Navigate to the backend directory:
  ```bash
  cd RFIDapi_Python
  ```
- Create a virtual environment:
  ```bash
  python3 -m venv myenv
  source myenv/bin/activate
  ```
- Install dependencies:
  ```bash
  pip install -r requirements.txt
  ```

---

### Frontend Setup

#### 1. Install Node.js Dependencies
- Navigate to the frontend directory:
  ```bash
  cd RfidTestPage
  ```
- Install dependencies:
  ```bash
  npm install
  ```

#### 2. Configure Environment Variables
- Create a `.env` file in the `RfidTestPage` directory and add the following:
  ```bash
  VITE_API_URL=http://0.0.0.0:5001
  VITE_WEB_SOCKET_URL=ws://0.0.0.0:8765
  ```

---

## Project Structure
```
RFIDApplication/
├── RFIDapi_Python/       # Backend code
│   ├── src/              # Backend source files
│   ├── requirements.txt  # Python dependencies
│   └── myenv/            # Python virtual environment
├── RfidTestPage/         # Frontend code
│   ├── src/              # Frontend source files
│   ├── public/           # Static assets
│   └── package.json      # Node.js dependencies
└── RfidTest.sh           # Script to run the application
```

---

##  Run the Application

### 1. Run the Application Script
Alternatively, you can run the entire application using the provided script:
```bash
./RfidTest.sh
```

---

## Troubleshooting

### Common Issues
1. **WebSocket Connection Fails**:
   - Ensure the backend is running and the `VITE_WEB_SOCKET_URL` in `.env` is correct.
2. **API Errors**:
   - Verify that the backend API is running and accessible via the `VITE_API_URL`.
3. **Database Connection Issues**:
   - Ensure MySQL is running and the credentials in `ProductsInformation.py` are correct.

---
