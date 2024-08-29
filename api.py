import requests
import json
import tkinter as tk
from tkinter import messagebox

def get_directions():
    origin = entry_origin.get()
    destination = entry_destination.get()

    if not origin or not destination:
        messagebox.showerror("Error", "Please enter both origin and destination.")
        return

    url = f"https://maps.googleapis.com/maps/api/directions/json?origin={origin}&destination={destination}&key=YOUR_API_KEY"
    response = requests.get(url)
    data = json.loads(response.text)

    if data['status'] == 'OK':
        # Process the directions_data as needed
        # For example, you can extract and display the route steps or duration.
        messagebox.showinfo("Directions", "Directions fetched successfully!")
    else:
        messagebox.showerror("Error", "Unable to fetch directions. Please check your input or try again later.")

# Create the main application window
app = tk.Tk()
app.title("Get Directions")

# Create labels and entry widgets for user input
label_origin = tk.Label(app, text="Enter your current location:")
label_origin.pack()
entry_origin = tk.Entry(app)
entry_origin.pack()

label_destination = tk.Label(app, text="Enter your destination:")
label_destination.pack()
entry_destination = tk.Entry(app)
entry_destination.pack()

# Create a button to fetch directions
btn_get_directions = tk.Button(app, text="Get Directions", command=get_directions)
btn_get_directions.pack()

# Run the GUI application
app.mainloop()
