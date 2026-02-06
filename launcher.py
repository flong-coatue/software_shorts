import subprocess
import os
import signal
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))

APPS = [
    ("CRM",  3000, "vibe_apps_code/CRM/app"),
    ("INTU", 3001, "vibe_apps_code/INTU/app"),
    ("MNDY", 3002, "vibe_apps_code/MNDY/app"),
    ("FDS",  3003, "vibe_apps_code/FDS/app"),
]

processes = []

def cleanup(sig=None, frame=None):
    print("\n\nStopping all apps...")
    for p in processes:
        p.terminate()
    sys.exit(0)

signal.signal(signal.SIGINT, cleanup)
signal.signal(signal.SIGTERM, cleanup)

print("🚀 Starting all vibe code apps...\n")

for name, port, path in APPS:
    app_dir = os.path.join(ROOT, path)
    if os.path.exists(app_dir):
        print(f"  {name}: http://localhost:{port}/{name.lower()}")
        p = subprocess.Popen(
            ["npm", "run", "dev", "--", "-p", str(port)],
            cwd=app_dir,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        processes.append(p)

print("\nPress Ctrl+C to stop all servers")

for p in processes:
    p.wait()
