from django.db import models
from Chess_Tree.models import ChessBoard

class ReinaMove:
    @staticmethod
    def get_valid_moves(position, is_white, board_state):
        """Calcula los movimientos válidos para una reina"""
        valid_moves = []
        x, y = position
        
        # Movimientos en todas las direcciones (horizontal, vertical y diagonal)
        directions = [
            (0, 1), (0, -1), (1, 0), (-1, 0),  # movimientos de torre
            (1, 1), (1, -1), (-1, 1), (-1, -1)   # movimientos de alfil
        ]
        
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
        """Valida si el movimiento de la reina es legal"""
        valid_moves = ReinaMove.get_valid_moves(from_pos, is_white, board_state)
        return to_pos in valid_moves
