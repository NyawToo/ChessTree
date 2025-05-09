#!/usr/bin/env bash
# exit on error
set -o errexit

# Instalar dependencias de Python
pip install -r requirements.txt

# Recolectar archivos estáticos
python manage.py collectstatic --no-input

# Aplicar migraciones
python manage.py migrate

# Asegurarse de que PORT tenga un valor predeterminado si no está definido
export PORT=${PORT:-8000}

# Iniciar Daphne
exec daphne -b 0.0.0.0 -p $PORT Chess_Tree.asgi:application