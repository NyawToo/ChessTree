// Importaciones necesarias para el funcionamiento del juego 3D
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';

// Cache para almacenar los modelos cargados
const modelCache = new Map();

// Elementos de la pantalla de carga
const loadingScreen = document.createElement('div');
loadingScreen.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 1000;';

const loadingText = document.createElement('h2');
loadingText.style.cssText = 'color: white; margin-bottom: 20px;';
loadingText.textContent = 'Cargando partida';

const progressBar = document.createElement('div');
progressBar.style.cssText = 'width: 200px; height: 20px; background: #333; border-radius: 10px; overflow: hidden;';

const progressFill = document.createElement('div');
progressFill.style.cssText = 'width: 0%; height: 100%; background: #4CAF50; transition: width 0.3s;';

progressBar.appendChild(progressFill);
loadingScreen.appendChild(loadingText);
loadingScreen.appendChild(progressBar);
document.body.appendChild(loadingScreen);

// Configuración inicial de la escena Three.js
const scene = new THREE.Scene();
scene.background = new THREE.Color('#262035');
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

// Configuración de los controles orbitales
const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 10, 10);
controls.target.set(0, 0, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 10;
controls.maxDistance = 10;
controls.enableZoom = false;
controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI / 2;
controls.maxAzimuthAngle = Math.PI * 2;
controls.minAzimuthAngle = -Math.PI * 2;

// Sistema de iluminación
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

// const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0);
// directionalLight.position.set(5, 25, 5);
// directionalLight.castShadow = true;
// directionalLight.shadow.mapSize.width = 2048;
// directionalLight.shadow.mapSize.height = 2048;
// scene.add(directionalLight);

// const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1.2);
// directionalLight2.position.set(-5, 15, 25);
// directionalLight2.castShadow = true;
// scene.add(directionalLight2);

// const directionalLight3 = new THREE.DirectionalLight(0xffffff, 1.2);
// directionalLight3.position.set(25, 15, -5);
// directionalLight3.castShadow = true;
// scene.add(directionalLight3);

// Constantes del tablero
const BOARD_SIZE = 8;
const SQUARE_SIZE = 1;

// Sistema de detección de interacción
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Carga del tablero
const boardLoader = new GLTFLoader();
boardLoader.load('/static/models/Tablero.glb', (gltf) => {
    const board = gltf.scene;
    board.scale.set(1, 1, 1);
    board.position.set(0, 0, 0);
    board.rotation.y = Math.PI / 2;
    board.traverse((child) => {
        if (child.isMesh) {
            if (child.material) {
                child.material.needsUpdate = true;
            }
        }
    });
    scene.add(board);
    loadingScreen.style.display = 'none';
}, undefined, (error) => {
    console.error('Error al cargar el tablero:', error);
});

// Estado del tablero y piezas
const boardState = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(null));
const pieces = [];

// Variables para el manejo de selección y movimientos
let selectedPiece = null;
let validMoveMarkers = [];
let validCaptureMarkers = [];

// Materiales para los marcadores
const moveMarkerMaterial = new THREE.MeshStandardMaterial({ color: 0x00A300, transparent: true, opacity: 0.7 });
const captureMarkerMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000, transparent: true, opacity: 0.8 });
const markerGeometry = new THREE.SphereGeometry(0.3, 32, 32);

// Función para crear marcadores de movimiento
// INDICADOR MOVIMIENTO
function createMarker(position, isCapture) {
    const material = isCapture ? captureMarkerMaterial : moveMarkerMaterial;
    const marker = new THREE.Mesh(markerGeometry, material);
    marker.position.set(
        3.5 - position[0] * SQUARE_SIZE,
        0.4,
        -3.5 + position[1] * SQUARE_SIZE
    );
    return marker;
}

// Función para limpiar marcadores
function clearMarkers() {
    validMoveMarkers.forEach(marker => scene.remove(marker));
    validCaptureMarkers.forEach(marker => scene.remove(marker));
    validMoveMarkers = [];
    validCaptureMarkers = [];
}

// Función para mostrar movimientos válidos
function showValidMoves(piece, position) {
    clearMarkers();
    
    // Aquí implementaremos la lógica de movimientos válidos según el tipo de pieza
    const validMoves = getValidMovesForPiece(piece, position);
    
    validMoves.forEach(move => {
        const marker = createMarker(move.position, move.isCapture);
        scene.add(marker);
        if (move.isCapture) {
            validCaptureMarkers.push(marker);
        } else {
            validMoveMarkers.push(marker);
        }
    });
}

// Función para obtener movimientos válidos según el tipo de pieza
function getValidMovesForPiece(piece, position) {
    const moves = [];
    const [x, y] = position;
    const isWhite = piece.name.includes('Blanco');

    // Lógica para peones
    if (piece.name.includes('Peon')) {
        const direction = isWhite ? 1 : -1;
        // Movimiento hacia adelante
        if (y + direction >= 0 && y + direction < BOARD_SIZE) {
            // Verificar si hay una pieza bloqueando el movimiento hacia adelante
            const forwardPiece = boardState[y + direction][x];
            if (!forwardPiece) {
                moves.push({ position: [x, y + direction], isCapture: false });
                // Movimiento inicial de dos casillas
                if ((isWhite && y === 1) || (!isWhite && y === 6)) {
                    const doubleMoveBlocked = boardState[y + 2 * direction][x];
                    if (!doubleMoveBlocked) {
                        moves.push({ position: [x, y + 2 * direction], isCapture: false });
                    }
                }
            }
        }
        // Capturas diagonales
        [-1, 1].forEach(dx => {
            if (x + dx >= 0 && x + dx < BOARD_SIZE && y + direction >= 0 && y + direction < BOARD_SIZE) {
                const targetPiece = boardState[y + direction][x + dx];
                if (targetPiece && targetPiece.name.includes(isWhite ? 'Negro' : 'Blanco')) {
                    moves.push({ position: [x + dx, y + direction], isCapture: true });
                }
            }
        });
    }

    // Lógica para torres
    if (piece.name.includes('Torre')) {
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        directions.forEach(([dx, dy]) => {
            let currentX = x;
            let currentY = y;
            while (true) {
                currentX += dx;
                currentY += dy;
                if (currentX >= 0 && currentX < BOARD_SIZE && currentY >= 0 && currentY < BOARD_SIZE) {
                    const targetPiece = boardState[currentY][currentX];
                    if (!targetPiece) {
                        moves.push({ position: [currentX, currentY], isCapture: false });
                    } else {
                        // Solo permitir captura si la pieza objetivo es del color opuesto
                        const targetIsWhite = targetPiece.name.includes('Blanco');
                        if (isWhite !== targetIsWhite) {
                            moves.push({ position: [currentX, currentY], isCapture: true });
                        }
                        break;
                    }
                } else {
                    break;
                }
            }
        });
    }

    // Lógica para caballos
    if (piece.name.includes('Caballo')) {
        const knightMoves = [
            [2, 1], [2, -1], [-2, 1], [-2, -1],
            [1, 2], [1, -2], [-1, 2], [-1, -2]
        ];
        knightMoves.forEach(([dx, dy]) => {
            const newX = x + dx;
            const newY = y + dy;
            if (newX >= 0 && newX < BOARD_SIZE && newY >= 0 && newY < BOARD_SIZE) {
                const targetPiece = boardState[newY][newX];
                if (!targetPiece) {
                    moves.push({ position: [newX, newY], isCapture: false });
                } else if (targetPiece.name.includes(isWhite ? 'Negro' : 'Blanco')) {
                    moves.push({ position: [newX, newY], isCapture: true });
                }
            }
        });
    }

    // Lógica para alfiles
    if (piece.name.includes('Alfil')) {
        const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
        directions.forEach(([dx, dy]) => {
            let currentX = x;
            let currentY = y;
            while (true) {
                currentX += dx;
                currentY += dy;
                if (currentX >= 0 && currentX < BOARD_SIZE && currentY >= 0 && currentY < BOARD_SIZE) {
                    const targetPiece = boardState[currentY][currentX];
                    if (!targetPiece) {
                        moves.push({ position: [currentX, currentY], isCapture: false });
                    } else {
                        // Solo permitir captura si la pieza objetivo es del color opuesto
                        const targetIsWhite = targetPiece.name.includes('Blanco');
                        if (isWhite !== targetIsWhite) {
                            moves.push({ position: [currentX, currentY], isCapture: true });
                        }
                        break;
                    }
                } else {
                    break;
                }
            }
        });
    }

    // Lógica para reina
    if (piece.name.includes('Reina')) {
        const directions = [
            [0, 1], [0, -1], [1, 0], [-1, 0],
            [1, 1], [1, -1], [-1, 1], [-1, -1]
        ];
        directions.forEach(([dx, dy]) => {
            let currentX = x;
            let currentY = y;
            while (true) {
                currentX += dx;
                currentY += dy;
                if (currentX >= 0 && currentX < BOARD_SIZE && currentY >= 0 && currentY < BOARD_SIZE) {
                    const targetPiece = boardState[currentY][currentX];
                    if (!targetPiece) {
                        moves.push({ position: [currentX, currentY], isCapture: false });
                    } else {
                        // Solo permitir captura si la pieza objetivo es del color opuesto
                        const targetIsWhite = targetPiece.name.includes('Blanco');
                        if (isWhite !== targetIsWhite) {
                            moves.push({ position: [currentX, currentY], isCapture: true });
                        }
                        break;
                    }
                } else {
                    break;
                }
            }
        });
    }

    // Lógica para rey
    if (piece.name.includes('Rey')) {
        const directions = [
            [0, 1], [0, -1], [1, 0], [-1, 0],
            [1, 1], [1, -1], [-1, 1], [-1, -1]
        ];
        directions.forEach(([dx, dy]) => {
            const newX = x + dx;
            const newY = y + dy;
            if (newX >= 0 && newX < BOARD_SIZE && newY >= 0 && newY < BOARD_SIZE) {
                const targetPiece = boardState[newY][newX];
                if (!targetPiece) {
                    moves.push({ position: [newX, newY], isCapture: false });
                } else if (targetPiece.name.includes(isWhite ? 'Negro' : 'Blanco')) {
                    moves.push({ position: [newX, newY], isCapture: true });
                }
            }
        });
    }

    return moves;
}

// Definición de piezas
const pieceDefinitions = {
    pawn: { model: 'Peon', positions: [
        { pos: [0,1], isWhite: true }, { pos: [1,1], isWhite: true },
        { pos: [2,1], isWhite: true }, { pos: [3,1], isWhite: true },
        { pos: [4,1], isWhite: true }, { pos: [5,1], isWhite: true },
        { pos: [6,1], isWhite: true }, { pos: [7,1], isWhite: true },
        { pos: [0,6], isWhite: false }, { pos: [1,6], isWhite: false },
        { pos: [2,6], isWhite: false }, { pos: [3,6], isWhite: false },
        { pos: [4,6], isWhite: false }, { pos: [5,6], isWhite: false },
        { pos: [6,6], isWhite: false }, { pos: [7,6], isWhite: false }
    ]},
    rook: { model: 'Torre', positions: [
        { pos: [0,0], isWhite: true }, { pos: [7,0], isWhite: true },
        { pos: [0,7], isWhite: false }, { pos: [7,7], isWhite: false }
    ]},
    knight: { model: 'Caballo', positions: [
        { pos: [1,0], isWhite: true }, { pos: [6,0], isWhite: true },
        { pos: [1,7], isWhite: false }, { pos: [6,7], isWhite: false }
    ]},
    bishop: { model: 'Alfil', positions: [
        { pos: [2,0], isWhite: true }, { pos: [5,0], isWhite: true },
        { pos: [2,7], isWhite: false }, { pos: [5,7], isWhite: false }
    ]},
    queen: { model: 'Reina', positions: [
        { pos: [3,0], isWhite: true }, { pos: [3,7], isWhite: false }
    ]},
    king: { model: 'Rey', positions: [
        { pos: [4,0], isWhite: true }, { pos: [4,7], isWhite: false }
    ]}
};

// Sistema de precarga de modelos
async function preloadModels() {
    const loader = new GLTFLoader();
    const modelTypes = ['Peon', 'Torre', 'Caballo', 'Alfil', 'Reina', 'Rey'];
    const colors = ['Blanco', 'Negro'];
    
    for (const type of modelTypes) {
        for (const color of colors) {
            const modelName = `${type}_${color}`;
            const modelPath = `/static/models/${modelName}.glb`;
            try {
                const gltf = await new Promise((resolve, reject) => {
                    loader.load(modelPath, resolve, undefined, reject);
                });
                modelCache.set(modelName, gltf.scene.clone());
            } catch (error) {
                console.error(`Error cargando modelo ${modelName}:`, error);
            }
        }
    }
}

// Carga individual de piezas
function loadPiece(type, position, isWhite) {
    const modelName = `${type}_${isWhite ? 'Blanco' : 'Negro'}`;
    const model = modelCache.get(modelName);
    
    if (model) {
        const piece = model.clone();
        piece.position.set(
            3.5 - position[0] * SQUARE_SIZE,
            0.05,
            -3.5 + position[1] * SQUARE_SIZE
        );
        piece.scale.set(1, 1, 1);
        piece.rotation.y = Math.PI / 2;
        piece.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        scene.add(piece);
        pieces.push(piece);
        return piece;
    }
    return null;
}
// ____________________________________________________________________________________________
// Creación de etiquetas de coordenadas
function createCoordinateLabels() {
    const loader = new FontLoader();
    loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function(font) {
        const textMaterial = new THREE.MeshStandardMaterial({
            color: 0x1c1c1c,
            metalness: 0.1,
            roughness: 0.5,
            transparent: true,
            opacity: 1.0,
            side: THREE.DoubleSide
        });

        for(let i = 0; i < 8; i++) {
            const letter = String.fromCharCode(65 + i);
            for(let j = 0; j < 8; j++) {
                const number = j + 1;
                const label = `o`;
                
                const textGeometry = new TextGeometry(label, {
                    font: font,
                    size: 0.1,
                    height: 0.05,
                    curveSegments: 12,
                    bevelEnabled: true,
                    bevelThickness: 0.01,
                    bevelSize: 0.01,
                    bevelSegments: 3
                });
                
                textGeometry.computeBoundingBox();
                const centerOffset = -0.5 * (textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x);
                
                const textMesh = new THREE.Mesh(textGeometry, textMaterial);
                textMesh.position.set(
                    3.5 - j * SQUARE_SIZE + centerOffset,
                    0.05,
                    -3.5 + i * SQUARE_SIZE
                );
                
                const pointLight = new THREE.PointLight(0xffffff, 1, 2);
                pointLight.position.set(
                    3.5 - j * SQUARE_SIZE,
                    0.5,
                    -3.5 + i * SQUARE_SIZE
                );
                scene.add(pointLight);
                textMesh.rotation.x = -Math.PI / 2;
                textMesh.rotation.y = Math.PI / 2;
                textMesh.scale.set(0.4, 0.4, 0.4);
                
                textMesh.castShadow = true;
                textMesh.receiveShadow = true;
                
                scene.add(textMesh);
            }
        }
    });
}

// Inicialización del juego
function initializeGame() {
    preloadModels().then(() => {
        Object.entries(pieceDefinitions).forEach(([pieceType, definition]) => {
            definition.positions.forEach(pieceInfo => {
                const piece = loadPiece(definition.model, pieceInfo.pos, pieceInfo.isWhite);
                if (piece) {
                    piece.name = `${definition.model}_${pieceInfo.isWhite ? 'Blanco' : 'Negro'}`;
                    const [x, y] = pieceInfo.pos;
                    boardState[y][x] = piece;
                }
            });
        });
        createCoordinateLabels();
        console.log('Juego inicializado:', pieces.length, 'piezas cargadas');
        console.log('Estado del tablero:', boardState);
    }).catch(error => {
        console.error('Error al inicializar el juego:', error);
    });
}

// Botones de control
const rotateButton = document.createElement('button');
rotateButton.textContent = 'Rotar Tablero';
rotateButton.style.cssText = 'position: fixed; bottom: 20px; right: 20px; padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; z-index: 1000;';
document.body.appendChild(rotateButton);

const mirrorButton = document.createElement('button');
mirrorButton.textContent = 'Espejo';
mirrorButton.style.cssText = 'position: fixed; bottom: 20px; left: 20px; padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; z-index: 1000;';
document.body.appendChild(mirrorButton);

// Variables de control de rotación
let isRotated = false;
let isRotating = false;
let isMirrored = false;
let isMirroring = false;

// Funciones de rotación
function rotateBoard() {
    if (isRotating) return;
    isRotating = true;

    const targetRotation = isRotated ? 0 : Math.PI;
    const duration = 1000;
    const startRotation = scene.rotation.y;
    const startTime = Date.now();

    function animate() {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);

        scene.rotation.y = startRotation + (targetRotation - startRotation) * easeProgress;

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            isRotated = !isRotated;
            isRotating = false;
        }
    }

    animate();
}

function mirrorBoard() {
    if (isMirroring) return;
    isMirroring = true;

    const targetRotation = isMirrored ? 0 : Math.PI;
    const duration = 1000;
    const startRotation = scene.rotation.y;
    const startTime = Date.now();

    function animate() {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);

        scene.rotation.y = startRotation + (targetRotation - startRotation) * easeProgress;

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            isMirrored = !isMirrored;
            isMirroring = false;
        }
    }

    animate();
}

// Eventos de los botones
rotateButton.addEventListener('click', rotateBoard);
mirrorButton.addEventListener('click', mirrorBoard);

// Eventos del mouse
function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onMouseDown(event) {
    if (pieces.length === 0) {
        console.log('Esperando a que las piezas se carguen...');
        return;
    }

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    if (intersects.length > 0) {
        let clickedObject = intersects[0].object;
        while (clickedObject && !pieces.includes(clickedObject)) {
            clickedObject = clickedObject.parent;
        }

        if (clickedObject && pieces.includes(clickedObject)) {
            console.log('Pieza seleccionada:', clickedObject.name);
            if (!selectedPiece) {
                selectedPiece = clickedObject;
                const piecePosition = [
                    Math.round(3.5 - clickedObject.position.x),
                    Math.round(3.5 + clickedObject.position.z)
                ];
                console.log('Posición de la pieza:', piecePosition);
                showValidMoves(clickedObject, piecePosition);
            }
        } else if (selectedPiece) {
            const boardIntersects = raycaster.intersectObjects([...validMoveMarkers, ...validCaptureMarkers]);
            if (boardIntersects.length > 0) {
                const marker = boardIntersects[0].object;
                const newX = Math.round(3.5 - marker.position.x);
                const newZ = Math.round(3.5 + marker.position.z);
                
                console.log('Moviendo pieza a:', [newX, newZ]);
                
                if (validCaptureMarkers.includes(marker)) {
                    const capturedPiece = pieces.find(p => 
                        Math.round(3.5 - p.position.x) === newX && 
                        Math.round(3.5 + p.position.z) === newZ
                    );
                    if (capturedPiece) {
                        console.log('Capturando pieza:', capturedPiece.name);
                        scene.remove(capturedPiece);
                        pieces.splice(pieces.indexOf(capturedPiece), 1);
                        
                        // Actualizar estado del tablero
                        const oldY = Math.round(3.5 + capturedPiece.position.z);
                        const oldX = Math.round(3.5 - capturedPiece.position.x);
                        boardState[oldY][oldX] = null;

                        // Verificar si se capturó un Rey
                        if (capturedPiece.name.includes('Rey')) {
                            const messageDiv = document.createElement('div');
                            messageDiv.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); padding: 20px; font-size: 48px; font-weight: bold; z-index: 1000; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);';
                            
                            if (capturedPiece.name.includes('Blanco')) {
                                messageDiv.textContent = 'Ganador';
                                messageDiv.style.color = '#4CAF50';
                            } else {
                                messageDiv.textContent = 'Perdiste';
                                messageDiv.style.color = '#FF0000';
                            }
                            
                            document.body.appendChild(messageDiv);
                            
                            // Eliminar todas las piezas después de 2 segundos
                            setTimeout(() => {
                                [...pieces].forEach(piece => {
                                    scene.remove(piece);
                                    pieces.splice(pieces.indexOf(piece), 1);
                                });
                                document.body.removeChild(messageDiv);
                                
                                // Limpiar el estado del tablero
                                for (let i = 0; i < BOARD_SIZE; i++) {
                                    for (let j = 0; j < BOARD_SIZE; j++) {
                                        boardState[i][j] = null;
                                    }
                                }
                            }, 2000);
                        }
                    }
                }
                
                // Actualizar estado del tablero
                const oldY = Math.round(3.5 + selectedPiece.position.z);
                const oldX = Math.round(3.5 - selectedPiece.position.x);
                boardState[oldY][oldX] = null;
                
                // Mover la pieza seleccionada
                selectedPiece.position.x = 3.5 - newX;
                selectedPiece.position.z = -3.5 + newZ;
                
                // Actualizar nueva posición en el estado del tablero
                boardState[newZ][newX] = selectedPiece;
                
                console.log('Estado del tablero actualizado:', boardState);
            }
            
            selectedPiece = null;
            clearMarkers();
        }
    } else {
        selectedPiece = null;
        clearMarkers();
    }
}

function onMouseUp() {}

window.addEventListener('mousemove', onMouseMove);
window.addEventListener('mousedown', onMouseDown);
window.addEventListener('mouseup', onMouseUp);

// Adaptación a cambios de ventana
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize);

// Cuadrícula de ayuda (oculta)
const gridHelper = new THREE.GridHelper(8, 8, 0x00ff00, 0x00ff00);
gridHelper.position.set(-3.5, 0.201, -3.5);
gridHelper.material.opacity = 0.3;
gridHelper.material.transparent = true;
gridHelper.visible = false;
scene.add(gridHelper);

// Inicio del juego y animación
initializeGame();

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();