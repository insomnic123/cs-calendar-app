import csv
import json

CSV_TO_JSON_MAPPING = {
    "Title": "name",
    "Description": None,  
    "AllDay": None,      
    "Colour": "color",
    "Tag": "type",      
    "StartTime": "startTime",
    "EndTime": "endTime",
}

def csv_lines_to_json(csv_lines):
    headers = ["Title", "Description", "AllDay", "Colour", "Tag", "StartTime", "EndTime"]

    reader = csv.DictReader(csv_lines.splitlines(), fieldnames=headers)

    json_list = []
    for csv_data in reader:
        json_data = {}
        for csv_key, json_key in CSV_TO_JSON_MAPPING.items():
            if json_key:
                json_data[json_key] = csv_data[csv_key]

        if "type" in json_data:
            json_data["type"] = "Nonnegotiable" if csv_data["Tag"] == "Test" else csv_data["Tag"]

        json_list.append(json_data)

    return json.dumps(json_list, indent=4)

print("Paste CSV lines (end with an empty line):")
csv_lines = ""
while True:
    line = input()
    if line.strip() == "":
        break
    csv_lines += line + "\n"

try:
    json_output = csv_lines_to_json(csv_lines)
    print("\nGenerated JSON:")
    print(json_output)
except Exception as e:
    print(f"Error: {e}")
