#!/usr/bin/env bash
# exit on error
set -o errexit

# Instalar dependencias de Python
pip install -r requirements.txt

# Recolectar archivos estáticos
python manage.py collectstatic --no-input

# Aplicar migraciones
python manage.py migrate

# Iniciar Daphne
daphne -b 0.0.0.0 -p $PORT Chess_Tree.asgi:application