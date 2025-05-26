from aiohttp import web
import os
import base64
from aiohttp import web
import subprocess
import logging
from aiohttp import web
import subprocess
from aiohttp_cors import setup as setup_cors, ResourceOptions
from ProductsInformation import save_test_Image_result, get_test_result_data,AddTestDescription

UPLOAD_FOLDER = "/home/omar/Desktop/Desktop-omar/RFIDApp/RfidTestPage/src/assets"
LOG_DIR = "/home/omar/Desktop/Desktop-omar/RFIDApp/TestLog"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(LOG_DIR, exist_ok=True)

async def handle_test_info_submission(request):
    data = await request.json()
    quantity = data.get("quantity")
    test_description = data.get("test_description")
    if not quantity or not test_description:
        return web.json_response({"error": "Missing required fields"}, status=400)
    return web.json_response({"quantity": quantity, "test_description": test_description})

logging.basicConfig(level=logging.INFO)
async def upload_image_and_save_result(request):
    """
    Hanterar uppladdning av bilder från frontend.
    - Tar emot en bild i Base64-format och ett bildnamn.
    - Sparar bilden i den angivna mappen och lagrar resultatet i databasen.

    Args:
        request (aiohttp.web.Request): HTTP-förfrågan som innehåller bilddata och bildnamn.

    Returns:
        aiohttp.web.Response: JSON-svar som indikerar om uppladdningen lyckades eller misslyckades.
    """
    logging.info("Received request to upload image and save result")
    try:
        data = await request.json()
        image_data = data.get("image")
        image_name = data.get("image_name")
        if not image_data or not image_name:
            logging.warning("Missing image data or image name")
            return web.json_response({"error": "Image and image_name are required"}, status=400)
        image_data = image_data.split(",")[1]
        image_path = os.path.join(UPLOAD_FOLDER, image_name)
        with open(image_path, "wb") as f:
            f.write(base64.b64decode(image_data))
        save_test_Image_result(image_path, image_name)
        logging.info(f"Image {image_name} saved successfully")
        return web.json_response({"message": "Image saved", "path": image_path})
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)
    
## Function to get all images from the UPLOAD_FOLDER and return them as base64 encoded data
async def fetch_all_uploaded_images(request):
    image_files = [f for f in os.listdir(UPLOAD_FOLDER) if f.endswith(".png")]
    images = []
    for image_name in image_files:
        image_path = os.path.join(UPLOAD_FOLDER, image_name)
        with open(image_path, "rb") as f:
            image_data = base64.b64encode(f.read()).decode()
            images.append({"name": image_name, "data": image_data})
    return web.json_response({"images": images})


## Restart the Python script if needed/ used to restart the backend to create a new JSON file 
async def restart_python_script(request):
    try:
        subprocess.Popen(["/bin/bash", "/path/to/restart_backend.sh"])
        return web.json_response({"message": "Python script restarted successfully"})

    except Exception as e:
        print(f"Error restarting Python script: {e}")
        return web.json_response({"error": str(e)}, status=500)

async def fetch_test_result_by_image_name(request):
    image_name = request.match_info.get("image_name", "")
    if not image_name:
        return web.json_response({"error": "image_name is required"}, status=400)
    try:
        result = get_test_result_data(image_name)
        if not result:
            return web.json_response({"error": "No data found for this image"}, status=404)
        return web.json_response(result)
    except Exception as e:
        print(f"Unexpected error: {e}")
        return web.json_response({"error": str(e)}, status=500)
async def handle_add_test_description_request(request):
    try:
        data = await request.json()
        quantity = data.get("quantity")
        test_description = data.get("test_description")
        transport = data.get("transport")
        print(f"Received data: quantity={quantity}, test_description={test_description}, transport={transport}")

        if not quantity or not str(quantity).isdigit():
            return web.json_response({"error": "Invalid or missing quantity"}, status=400)
        if not test_description:
            return web.json_response({"error": "Missing test description"}, status=400)
        if not transport:
            return web.json_response({"error": "Missing transport"}, status=400)
        
        result = AddTestDescription(int(quantity), test_description, transport)
        if result:
            return web.json_response({"message": "Test description saved successfully", "id": result})
        else:
            return web.json_response({"error": "Failed to save test description"}, status=500)

    except Exception as e:
        print(f"Unexpected error: {e}")
        return web.json_response({"error": str(e)}, status=500)


app = web.Application()
app.router.add_post("/api/test_info", handle_test_info_submission)
app.router.add_post("/api/image_upload", upload_image_and_save_result)
app.router.add_get("/api/all_images", fetch_all_uploaded_images)
app.router.add_get("/api/test_result/{image_name}", fetch_test_result_by_image_name)
app.router.add_post("/api/add_test_description", handle_add_test_description_request)
app.router.add_post("/api/restart_script", restart_python_script)


cors = setup_cors(app, defaults={
    "*": ResourceOptions(
        allow_credentials=True,
        expose_headers="*",
        allow_headers="*",
        allow_methods="*",
    )
})

for route in list(app.router.routes()):
    cors.add(route)

async def start_api_server():
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, "0.0.0.0", 5001)
    await site.start()
    print("API Server Started Successfully")