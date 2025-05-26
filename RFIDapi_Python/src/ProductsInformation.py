import mysql.connector
from datetime import datetime
import json
SqlConfig = {
    'host': 'localhost',
    'user': 'root',
    'password': '*******', # Replace with your actual password
    'database': 'RFID_Schema'
}
def get_products(tags):
    try:
        connection = mysql.connector.connect(**SqlConfig)
        cursor = connection.cursor(dictionary=True)
        if not tags:
            return []
        query = "SELECT id, EPC, Product FROM EPC WHERE EPC IN (%s)" % ', '.join(['%s'] * len(tags))
        cursor.execute(query, tags)
        products = cursor.fetchall()
        return products
    except mysql.connector.Error as e:
        print(f"Databasfel: {e}")
        return []
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'connection' in locals():
            connection.close()

def calculate_product_percentage(tags):
    try:
        connection = mysql.connector.connect(**SqlConfig)
        cursor = connection.cursor()
        cursor.execute("SELECT quantityProduct FROM TestInformation ORDER BY Id DESC LIMIT 1")
        result = cursor.fetchone()
        
        if result is None or result[0] == 0:
            return 0 
        
        last_product_quantity = result[0]
        percentage = (len(tags) / last_product_quantity) * 100
        formatted_percentage = round(percentage, 2)
        return formatted_percentage
    except mysql.connector.Error as e:
        print(f"Databasfel vid beräkning: {e}")
        return 0
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'connection' in locals():
            connection.close()

def AddTestDescription(quantity, test_description, transport):
    try:
        connection = mysql.connector.connect(**SqlConfig)
        cursor = connection.cursor()

        # Infoga i TestInformation
        cursor.execute("INSERT INTO TestInformation (quantityProduct, TestCase, Transport) VALUES (%s, %s, %s)", (quantity, test_description, transport))
        test_information_id = cursor.lastrowid  # Hämta ID

        # Skapa en rad i TestResult som har samma TestInformationId
        cursor.execute("INSERT INTO TestResult (TestInformationId) VALUES (%s)", (test_information_id,))

        connection.commit()
        return test_information_id  # Returnera ID så att det kan användas senare

    except mysql.connector.Error as e:
        print(f"Database Connection Error: {e}")
        return 0
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'connection' in locals():
            connection.close()



def get_Test_description():
    try:
        connection = mysql.connector.connect(**SqlConfig)
        cursor = connection.cursor(dictionary=True)
        # Hämta testinformation och dess relaterade resultat
        query = """
        SELECT 
            ti.Id AS TestInformationId,
            ti.quantityProduct,
            ti.TestCase,
            ti.Transport,
            tr.Id AS TestResultId,
            tr.heatmapImage,
            tr.JsonFile,
            tr.CreateAt
        FROM TestInformation ti
        LEFT JOIN TestResult tr ON ti.Id = tr.TestInformationId
        """
        cursor.execute(query)
        result = cursor.fetchall()
        return result
    except mysql.connector.Error as e:
        print(f"Database Connection Error: {e}")
        return []
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'connection' in locals():
            connection.close()

def save_test_Image_result(imagePath, imageName):
    try:
        print("Starting to save test image")
        connection = mysql.connector.connect(**SqlConfig)
        cursor = connection.cursor()
        cursor.execute("SELECT Id FROM TestResult WHERE JsonFile IS NOT NULL AND imageName IS NULL ORDER BY Id DESC LIMIT 1")
        existing_row = cursor.fetchone()

        if existing_row:
            last_id = existing_row[0]
            print(f"Updating existing row with ID: {last_id}")
            cursor.execute("UPDATE TestResult SET heatmapImage = %s, imageName = %s, CreateAt = %s WHERE Id = %s",
                           (imagePath, imageName, datetime.now(), last_id))
        else:
            print("No existing row found, inserting new row")
            cursor.execute("INSERT INTO TestResult (heatmapImage, CreateAt, imageName) VALUES (%s, %s, %s)",
                           (imagePath, datetime.now(), imageName))
            last_id = cursor.lastrowid

        connection.commit()
        print("Image saved successfully")
        return last_id  

    except mysql.connector.Error as e:
        print(f"Database Connection Error: {e}")
        return 0  

    finally:
        if 'cursor' in locals() and cursor:
            cursor.close()
        if 'connection' in locals() and connection:
            connection.close()

def get_all_the_image_from_Db():
    try:
        connection = mysql.connector.connect(**SqlConfig)
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM TestResult")
        result = cursor.fetchall()
        return result
    except mysql.connector.Error as e:
        print(f"Database Connection Error: {e}")
        return []
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'connection' in locals():
            connection.close()

def save_JSON_data(data):
    try:
        print("Starting to save test JSON")
        connection = mysql.connector.connect(**SqlConfig)
        cursor = connection.cursor()
        cursor.execute("SELECT Id FROM TestInformation ORDER BY Id DESC LIMIT 1")
        test_info = cursor.fetchone()
        if not test_info:
            print("No test information found, aborting...")
            return 0
        test_information_id = test_info[0]
        cursor.execute("SELECT Id FROM TestResult WHERE TestInformationId = %s AND JsonFile IS NULL ORDER BY Id DESC LIMIT 1", (test_information_id,))
        last_record = cursor.fetchone()

        if last_record:
            last_id = last_record[0]
            cursor.execute("UPDATE TestResult SET JsonFile = %s WHERE Id = %s", (data, last_id))
        else:
            cursor.execute("INSERT INTO TestResult (JsonFile, TestInformationId) VALUES (%s, %s)", (data, test_information_id))
            last_id = cursor.lastrowid

        connection.commit()
        print("JSON saved successfully with TestInformationId:", test_information_id)
        return last_id  

    except mysql.connector.Error as e:
        print(f"Database Connection Error: {e}")
        return 0  

    finally:
        if 'cursor' in locals() and cursor:
            cursor.close()
        if 'connection' in locals() and connection:
            connection.close()


def get_test_result_data(image_name):
    try:
        connection = mysql.connector.connect(**SqlConfig)
        cursor = connection.cursor(dictionary=True)
        query = """
        SELECT 
            tr.JsonFile,
            ti.TestCase,
            ti.Transport,
            ti.quantityProduct
        FROM TestResult tr
        LEFT JOIN TestInformation ti ON tr.TestInformationId = ti.Id
        WHERE tr.imageName = %s
        """
        cursor.execute(query, (image_name,))
        result = cursor.fetchone()
        
        if not result:
            return None 
        json_file_path = result.get('JsonFile')
        if isinstance(json_file_path, bytes):
            json_file_path = json_file_path.decode('utf-8')
        
        try:
            with open(json_file_path, 'r', encoding='utf-8') as file:
                json_data = json.load(file)
        except FileNotFoundError:
            print(f"File not found: {json_file_path}")
            json_data = None
        except json.JSONDecodeError:
            print(f"Error decoding JSON file: {json_file_path}")
            json_data = None
        return {
            "json_data": json_data,
            "test_case": result.get("TestCase"),
            "transport": result.get("Transport"),
            "quantity_product": result.get("quantityProduct")
        }
    except mysql.connector.Error as e:
        print(f"Database Connection Error: {e}")
        return None
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'connection' in locals():
            connection.close()