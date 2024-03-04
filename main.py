from app import app
import json
import os

with open('settings.json') as f:
    settings = json.load(f)
    
if __name__ == "__main__":
    app.run(host=settings['host'], port=settings['port'], debug=settings['debug'])