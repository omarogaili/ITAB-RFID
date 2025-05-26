import time
import cv2
import json
import numpy as np
import requests
import base64
import signal

import cv2.aruco as aruco
import asyncio
import websockets
import os

from ProductsInformation import get_products, calculate_product_percentage, save_JSON_data
from RfidHandler import start_mqtt_client, tags, connected_clients
from APiEndpoint import start_api_server
from DataModel import DataModel
from Product import Products


stop_script = False
LOG_DIR = "/home/omar/Desktop/Desktop-omar/RFIDApp/TestLog"
os.makedirs(LOG_DIR, exist_ok=True)
def filename():
    i = 1
    while True:
        filename = os.path.join(LOG_DIR, f"test{i}.json")
        if not os.path.exists(filename):
            return filename
        i += 1
current_filename = filename()
last_saved_data= None
json_saved = False 

def save_test_log_to_file(testLog):
    """
    Saves the test log to a JSON file. If the log is already saved, it skips saving.
    
    Args:
        testLog (dict): The test log data to save.
    """
    global last_saved_data, json_saved, current_filename
    if last_saved_data == testLog:
        return
    last_saved_data = testLog
    try:
        if os.path.exists(current_filename):
            with open(current_filename, 'r') as file:
                existing_data = json.load(file)
        else:
            existing_data = []
        existing_data.append(testLog)
        with open(current_filename, 'w') as file:
            json.dump(existing_data, file, indent=4)
        print(f"Testlogg sparad i {current_filename}")
        if not json_saved:
            last_id = save_JSON_data(current_filename)
            if last_id > 0:
                json_saved = True 
            else:
                print("Misslyckades med att spara JSON i databasen.")
    except Exception as e:
        print(f"Error writing to file: {e}")

def signal_handler(sig, frame):
    global stop_script
    print("Stoppsignal mottagen, avslutar skriptet...")
    stop_script = True
signal.signal(signal.SIGTERM, signal_handler)
signal.signal(signal.SIGINT, signal_handler)

# Fetch an image from the given URL using HTTP Basic Authentication
def fetch_image_from_url(image_url, username, password):
    headers = {'X-Requested-With': 'XmlHttpRequest'}
    try:
        response = requests.get(image_url, headers=headers, auth=(username, password), verify=False)
        response.raise_for_status()
        return cv2.imdecode(np.frombuffer(response.content, np.uint8), cv2.IMREAD_COLOR)
    except requests.exceptions.RequestException as e:
        print(f"Misslyckades med att hämta bild från {image_url}. Fel: {e}")
        return None

def detect_aruco_markers(image):
    dictionary = aruco.getPredefinedDictionary(aruco.DICT_6X6_250)
    parameters = aruco.DetectorParameters()
    corners, ids, _ = aruco.detectMarkers(image, dictionary, parameters=parameters)
    detected_data = []

    if len(corners) > 0:
        aruco.drawDetectedMarkers(image, corners, ids)
        if ids is not None:
            for i, marker_id in enumerate(ids):
                corner_points = corners[i][0]
                axelX = int(np.mean(corner_points[:, 0]))
                axelY = int(np.mean(corner_points[:, 1]))
                detected_data.append({
                    "marker_id": int(marker_id[0]),
                    "corners": [list(map(int, corner)) for corner in corner_points],
                    "axelX": axelX,
                    "axelY": axelY
                })
    return detected_data

async def send_image_data_to_clients():
    image_url = "http://192.168.30.81/api/v5/singlesensor/blocked_space/images/live.jpg"
    username = "admin"
    password = "Itab4Sesame" ## Replace with your actual password
    image_saved= False
    while not stop_script:
        try:
            image = fetch_image_from_url(image_url, username, password)
            if image is not None:
                _, buffer = cv2.imencode('.jpg', image)
                detected_data = detect_aruco_markers(image)
                image_base64 = base64.b64encode(buffer).decode('utf-8')
                data_to_send = {
                    "type": "image",
                    "detected_data": detected_data,
                    "image_base64": image_base64,
                }
                products = get_products(tags)
                products = [Products(id=str(product['id']), EPC=product['EPC'], Product=product['Product']) for product in products]
                test_send_data = DataModel(detected_data=detected_data, percentage=calculate_product_percentage(tags), products=products)
                save_test_log_to_file(test_send_data.model_dump())
                for client in connected_clients.copy():
                    try:
                        await client.send(json.dumps(data_to_send))
                    except websockets.exceptions.ConnectionClosed:
                        print("WebSocket-klient kopplad från")
                        connected_clients.remove(client)
            await asyncio.sleep(.01)
        except Exception as e:
            print(f"Fel vid skickning av data: {e}")
            await asyncio.sleep(1)

async def handle_client(websocket):
    connected_clients.add(websocket)
    print("Ny WebSocket-klient ansluten")
    
    try:
        await websocket.wait_closed()
    except websockets.exceptions.ConnectionClosedError:
        print("WebSocket-klient kopplad från oväntat")
    except Exception as e:
        print(f"WebSocket-fel: {e}")
    finally:
        if websocket in connected_clients:
            connected_clients.remove(websocket)
        await websocket.close()
        print("WebSocket-klient frånkopplad")

async def start_mqtt_async():
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, lambda: start_mqtt_client())

async def main():
    await start_api_server()
    await asyncio.gather(
        start_mqtt_async(),
        websockets.serve(handle_client, "0.0.0.0", 8765),
        send_image_data_to_clients(),
    )
if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    try:
        loop.run_until_complete(main())
    except KeyboardInterrupt:
        print("Avslutar programmet...")
    finally:
        loop.close()