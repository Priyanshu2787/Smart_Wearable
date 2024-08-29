import mysql.connector
import bluepy.btle as btle

# BLE Device and Service UUIDs
DEVICE_UUID = "YOUR_DEVICE_UUID"
SERVICE_UUID = "YOUR_SERVICE_UUID"
CHARACTERISTIC_UUID = "YOUR_CHARACTERISTIC_UUID"

# MySQL database connection
conn = mysql.connector.connect(
    host="YOUR_MYSQL_HOST",
    user="YOUR_MYSQL_USER",
    password="YOUR_MYSQL_PASSWORD",
    database="YOUR_MYSQL_DATABASE"
)
cursor = conn.cursor()

# Create a table to store map data if it doesn't exist
cursor.execute('''
    CREATE TABLE IF NOT EXISTS map_data (
        id INT AUTO_INCREMENT PRIMARY KEY,
        source VARCHAR(255),
        destination VARCHAR(255),
        route VARCHAR(255),
        coordinates TEXT
    )
''')
conn.commit()

# Raspberry Pi BLE GATT Server
class MyBLEServer(btle.Peripheral):
    def __init__(self):
        btle.Peripheral.__init__(self)

    def onNotification(self, handle, data):
        # Handle received data from mobile app
        print("Received data:", data.decode())

        # Process the received data
        data_parts = data.decode().split(',')
        if len(data_parts) == 4:
            source = data_parts[0]
            destination = data_parts[1]
            route = data_parts[2]
            coordinates = data_parts[3]
            save_to_database(source, destination, route, coordinates)

def save_to_database(source, destination, route, coordinates):
    # Save data to the database
    sql = "INSERT INTO map_data (source, destination, route, coordinates) VALUES (%s, %s, %s, %s)"
    values = (source, destination, route, coordinates)
    cursor.execute(sql, values)
    conn.commit()
    print("Data saved to the database.")

# Main function
def main():
    # Initialize BLE GATT server
    server = MyBLEServer()

    try:
        # Start advertising the GATT service
        server.getServiceByUUID(SERVICE_UUID)
        characteristic = server.getCharacteristics(uuid=CHARACTERISTIC_UUID)[0]
        characteristic.write(b"\x01\x00", withResponse=True)

        # Run the server
        while True:
            if server.waitForNotifications(1.0):
                continue
    except KeyboardInterrupt:
        print("Server stopped.")
        conn.close()

if __name__ == "__main__":
    main()
