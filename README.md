# ChessTree

## 🎮 Descripción General
ChessTree es una aplicación web de ajedrez 3D que permite jugar partidas tanto localmente como contra otros jugadores en línea. El proyecto utiliza tecnologías modernas para ofrecer una experiencia de juego inmersiva y fluida.

## 🛠️ Tecnologías Principales
- **Django**: Framework backend principal (v4.2.7)
- **Channels**: Implementación de WebSockets para juego en tiempo real
- **Three.js**: Renderizado 3D del tablero y piezas
- **WebSockets**: Comunicación en tiempo real entre jugadores

## 📁 Estructura del Proyecto

### Componentes Principales
- **Chess_Tree/**: Configuración principal del proyecto Django
  - `settings.py`: Configuración del proyecto
  - `asgi.py`: Configuración para WebSockets y HTTP
  - `urls.py`: Rutas principales

### Módulos de Piezas
- **Alfil/**: Lógica para el movimiento del alfil
- **Caballo/**: Lógica para el movimiento del caballo
- **Peon/**: Lógica para el movimiento del peón
- **Reina/**: Lógica para el movimiento de la reina
- **Rey/**: Lógica para el movimiento del rey
- **Torre/**: Lógica para el movimiento de la torre

### Recursos Estáticos
- **static/**
  - `js/`: Archivos JavaScript para la lógica del juego
  - `models/`: Modelos 3D de las piezas (.glb)

### Plantillas
- **templates/**
  - `home.html`: Página principal
  - `chess_local.html`: Interfaz para juego local
  - `chess_global.html`: Interfaz para juego en línea
  - `sala.html`: Gestión de salas de juego
  - `crear_sala.html`: Creación de nuevas salas
  - `unirme_a_sala.html`: Unirse a salas existentes

## 🚀 Características Principales
1. **Juego Local**
   - Partidas en el mismo dispositivo
   - Visualización 3D completa del tablero
   - Movimientos validados en tiempo real

2. **Juego en Línea**
   - Sistema de salas para partidas multijugador
   - Comunicación en tiempo real vía WebSockets
   - Sincronización de movimientos entre jugadores

## 💻 Requisitos del Sistema
```
Django==4.2.7
channels==4.0.0
channels-redis==4.1.0
daphne==4.0.0
three.js==0.160.0
```

## 🔧 Instalación y Configuración
1. Clonar el repositorio
2. Instalar dependencias:
   ```bash
   pip install -r requirements.txt
   ```
3. Configurar la base de datos:
   ```bash
   python manage.py migrate
   ```
4. Iniciar el servidor:
   ```bash
   concurrently "python manage.py runserver 0.0.0.0:8000" "daphne -b 0.0.0.0 -p 8001 Chess_Tree.asgi:application"
   ```
5. `Acceder a la aplicación en localhost:8001`

## 🎯 Cómo Jugar
1. **Modo Local**
   - Accede a la página principal
   - Haz clic en "¡Jugar Ahora Local!"
   - Mueve las piezas alternando turnos

2. **Modo Multijugador**
   - Haz clic en "¡Jugar Ahora Contra Otros Jugadores!"
   - Crea una nueva sala o únete a una existente
   - Espera a que se conecte otro jugador
   - ¡Comienza la partida!

## 🎨 Características Técnicas
- Renderizado 3D con Three.js
- Comunicación en tiempo real mediante WebSockets
- Validación de movimientos en el servidor
- Interfaz responsiva y moderna
- Sistema de salas para partidas multijugador

## 🔒 Seguridad
- Autenticación de WebSockets
- Validación de movimientos en el servidor
- Protección contra movimientos inválidos

## 🌟 Características Especiales
- Visualización 3D completa del tablero
- Rotación libre de la cámara
- Animaciones suaves de movimientos
- Interfaz intuitiva y moderna
- Sistema de salas en tiempo real