import json
import os

def update_data_js():
    data_js_path = 'c:/repos/wahlomat/data.js'
    candidates_json_path = 'c:/repos/wahlomat/candidates_data.json'
    
    if not os.path.exists(data_js_path) or not os.path.exists(candidates_json_path):
        print("Error: Files not found.")
        return

    # Read the current data.js to preserve the header, parties, and questions
    with open(data_js_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Find the candidates start line
    candidates_start_idx = -1
    for i, line in enumerate(lines):
        if 'candidates: [' in line:
            candidates_start_idx = i
            break
            
    if candidates_start_idx == -1:
        print("Error: Could not find candidates array in data.js")
        return

    # Keep everything up to the candidates: [ line
    new_lines = lines[:candidates_start_idx]
    new_lines.append('  candidates: \n')

    # Read the new candidates JSON
    with open(candidates_json_path, 'r', encoding='utf-8') as f:
        candidates_data = json.load(f)
        
    candidates_str = json.dumps(candidates_data, indent=2, ensure_ascii=False)
    new_lines.append(candidates_str)
    
    # Close the object structure
    new_lines.append('\n};')

    # Write the updated data.js
    with open(data_js_path, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    
    print("Successfully updated data.js with 58 candidates.")

if __name__ == "__main__":
    update_data_js()
