# #!/bin/bash


# if ! command -v npm &> /dev/null; then
#     echo "Node.js is not installed. Please install it and try again."
#     exit 1
# fi

# if ! command -v python3 &> /dev/null; then
#     echo "Python3 is not installed. Please install it and try again."
#     exit 1
# fi


# echo "Starting backend setup..."
# cd RFIDapi_Python || exit


# if [ ! -d "../myenv" ]; then
#     echo "Creating Python virtual environment..."
#     python3 -m venv ../myenv
# else
#     echo "Python virtual environment already exists. Skipping creation."
# fi


# if [ ! -f "requirements.txt" ]; then
#     echo "Error: requirements.txt not found. Please add it to the RFIDapi_Python directory."
#     exit 1
# fi


# if [ -f "../myenv/bin/activate" ]; then
#     source ../myenv/bin/activate
# else
#     echo "Error: Virtual environment activation script not found. Please recreate the virtual environment."
#     exit 1
# fi


# if [ ! -f "requirements_installed.txt" ]; then
#     echo "Installing Python dependencies..."
#     pip install -r requirements.txt
#     touch requirements_installed.txt
# else
#     echo "Python dependencies already installed. Skipping installation."
# fi

# echo "Starting backend server..."
# nohup python3 src/Main.py > backend.log 2>&1 &
# BACKEND_PID=$!
# echo "Backend server started with PID $BACKEND_PID"
# cd ..


# echo "Starting frontend setup..."
# cd RfidTestPage || exit


# if [ ! -d "node_modules" ]; then
#     echo "Installing npm dependencies..."
#     npm install
# else
#     echo "npm dependencies already installed. Skipping installation."
# fi

# echo "Building frontend..."
# npm run build

# echo "Starting frontend server..."
# nohup npm run dev > frontend.log 2>&1 &
# FRONTEND_PID=$!
# echo "Frontend server started with PID $FRONTEND_PID"
# cd ..


# echo "Application is running!"
# echo "Frontend: http://localhost:5173"
# echo "Backend: http://localhost:8765"
# echo "To stop the application, use the following commands:"
# echo "  kill $BACKEND_PID  # Stop backend"
# echo "  kill $FRONTEND_PID # Stop frontend"


#!/bin/bash

if ! command -v npm &> /dev/null; then
    echo "Node.js is not installed. Please install it and try again."
    exit 1
fi

if ! command -v python3 &> /dev/null; then
    echo "Python3 is not installed. Please install it and try again."
    exit 1
fi

echo "Starting backend setup..."
cd RFIDapi_Python || exit

if [ ! -d "../myenv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv ../myenv
else
    echo "Python virtual environment already exists. Skipping creation."
fi

if [ ! -f "requirements.txt" ]; then
    echo "Error: requirements.txt not found. Please add it to the RFIDapi_Python directory."
    exit 1
fi

if [ -f "../myenv/bin/activate" ]; then
    source ../myenv/bin/activate
else
    echo "Error: Virtual environment activation script not found. Please recreate the virtual environment."
    exit 1
fi

if [ ! -f "requirements_installed.txt" ]; then
    echo "Installing Python dependencies..."
    pip install -r requirements.txt
    touch requirements_installed.txt
else
    echo "Python dependencies already installed. Skipping installation."
fi

echo "Starting backend server..."
python3 src/Main.py > backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend server started with PID $BACKEND_PID"
cd ..

echo "Starting frontend setup..."
cd RfidTestPage || exit

if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install
else
    echo "npm dependencies already installed. Skipping installation."
fi

echo "Building frontend..."
npm run build

echo "Starting frontend server..."
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend server started with PID $FRONTEND_PID"
cd ..

echo "Application is running!"
echo "ITAB-Rfid: http://localhost:5173"

# Wait for user to press Ctrl+D to stop both servers
echo "Press Ctrl+D to stop the application."
trap "echo 'Stopping backend and frontend...'; kill $BACKEND_PID $FRONTEND_PID; exit" SIGINT SIGTERM

# Keep the script running until Ctrl+D is pressed
while :; do
    read || break
done

# Stop backend and frontend when exiting
echo "Stopping backend and frontend..."
kill $BACKEND_PID $FRONTEND_PID
