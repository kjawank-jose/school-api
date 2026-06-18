import subprocess
import sys

paquetes = ["fastapi", "uvicorn", "sqlalchemy", "pydantic"]

for paquete in paquetes:
    print(f"Instalando {paquete}...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", paquete])

print("\n✅ ¡Todas las dependencias instaladas correctamente!")
