from django.db import models
from Chess_Tree.models import ChessBoard

class AlfilMove:
    @staticmethod
    def get_valid_moves(position, is_white, board_state):
        """Calcula los movimientos válidos para un alfil"""
        valid_moves = []
        x, y = position
        
        # Direcciones diagonales: arriba-derecha, arriba-izquierda, abajo-derecha, abajo-izquierda
        directions = [(1, 1), (1, -1), (-1, 1), (-1, -1)]
        
        for dx, dy in directions:
            current_x, current_y = x, y
            while True:
                current_x += dx
                current_y += dy
                
                # Verificar si la posición está dentro del tablero
                if 0 <= current_x < 8 and 0 <= current_y < 8:
                    current_pos = (current_x, current_y)
                    piece_at_pos = board_state.get(current_pos)
                    
                    # Si hay una pieza en la posición
                    if piece_at_pos:
                        # Si es una pieza enemiga, podemos capturarla
                        if piece_at_pos.is_white != is_white:
                            valid_moves.append(current_pos)
                        break  # No podemos seguir en esta dirección
                    else:
                        valid_moves.append(current_pos)
                else:
                    break
        
        return valid_moves

    @staticmethod
    def validate_move(from_pos, to_pos, is_white, board_state):
        """Valida si el movimiento del alfil es legal"""
        valid_moves = AlfilMove.get_valid_moves(from_pos, is_white, board_state)
        return to_pos in valid_moves
