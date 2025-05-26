import paho.mqtt.client as mqtt
from ProductsInformation import get_products, calculate_product_percentage
import json
import websockets
import asyncio
MQTT_BROKER = "192.168.31.26"
MQTT_PORT = 1883
MQTT_TOPIC = "#"
tags = []
connected_clients = set()
def update_tags(new_tags):
    global tags
    tags = new_tags
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Connected to MQTT-broker!")
        client.subscribe(MQTT_TOPIC)
    else:
        print(f"Connection FAILED {rc}")

def on_message(client, userdata, msg):
    global tags
    payload = msg.payload.decode("utf-8")
    print(f"Mottaget: {msg.topic} - {payload}")
    if "/Rfid/TagAppear" in msg.topic:
        try:
            data = json.loads(payload)
            epcs = data["Payload"].keys()
            for epc in epcs:
                if epc not in tags:
                    tags.append(epc)
        except json.JSONDecodeError as e:
            print(f"JSON-fel: {e}")
    elif "/Rfid/TagDisappear" in msg.topic:
        try:
            data = json.loads(payload)
            epcs = data["Payload"].keys()
            for epc in epcs:
                if epc in tags:
                    print(f"Tag need to be deleted {epc} tomt")
                    tags.remove(epc)
        except json.JSONDecodeError as e:
            print(f"JSON-fel: {e}")
    products = get_products(tags)
    percentage = calculate_product_percentage(tags)
    data_to_send = {"type": "Mqtt_data", "products": products, "percentage": percentage}
    print(f"this is the product we found :  {products}")
    asyncio.run(send_data_to_clients(data_to_send))

async def send_data_to_clients(data):
    for client in connected_clients.copy():
        try:
            await client.send(json.dumps(data))
        except websockets.exceptions.ConnectionClosed:
            print(" WebSocket-klient kopplad från")
            connected_clients.remove(client)

def start_mqtt_client():
    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message
    client.connect(MQTT_BROKER, MQTT_PORT, 60)
    client.loop_start()