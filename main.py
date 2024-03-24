from app import app, socketio
import json
import os

with open('settings.json') as f:
    settings = json.load(f)
    
if __name__ == "__main__":
    socketio.run(app, host=settings['host'], port=settings['port'], debug=settings['debug'])