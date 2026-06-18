import subprocess
import sys

subprocess.run([
    sys.executable, "-m", "uvicorn", 
    "main:app", "--reload", "--port", "8000"
])

#cd backend
#python start.py
# py -3.13 -m uvicorn main:app --reload --port 8000