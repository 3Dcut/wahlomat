import json
import os

def update_data_js():
    data_js_path = 'c:/repos/wahlomat/data.js'
    candidates_json_path = 'c:/repos/wahlomat/candidates_data.json'
    
    if not os.path.exists(data_js_path) or not os.path.exists(candidates_json_path):
        print("Error: Files not found.")
        return

    # Read the current data.js
    with open(data_js_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Find the candidates start line (robust check)
    candidates_start_idx = -1
    for i, line in enumerate(lines):
        if 'candidates:' in line:
            candidates_start_idx = i
            break
            
    if candidates_start_idx == -1:
        print("Error: Could not find 'candidates:' in data.js")
        return

    # Keep everything up to the candidates: line
    # We want to keep the 'candidates:' part itself if it doesn't already have the '[' 
    # In the current file, line 271 is '  candidates: '
    header = lines[:candidates_start_idx + 1]
    
    # Ensure line 271 doesn't have a trailing bracket if we're prepending one
    if '[' in header[-1]:
        header[-1] = header[-1].split('[')[0] + '\n'
    elif ':' in header[-1] and not header[-1].strip().endswith(':'):
        # clean up if there's garbage after the colon
        header[-1] = header[-1].split(':')[0] + ':\n'

    # Read the new candidates JSON
    with open(candidates_json_path, 'r', encoding='utf-8') as f:
        candidates_data = json.load(f)
        
    candidates_str = json.dumps(candidates_data, indent=2, ensure_ascii=False)
    
    # Write the updated data.js
    with open(data_js_path, 'w', encoding='utf-8') as f:
        f.writelines(header)
        f.write(candidates_str)
        f.write('\n};')
    
    print(f"Successfully updated data.js with {len(candidates_data)} candidates.")

if __name__ == "__main__":
    update_data_js()
