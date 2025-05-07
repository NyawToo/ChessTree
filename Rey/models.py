from django.db import models
from Chess_Tree.models import ChessBoard

class ReyMove:
    @staticmethod
    def get_valid_moves(position, is_white, board_state):
        """Calcula los movimientos válidos para un rey"""
        valid_moves = []
        x, y = position
        
        # Movimientos en todas las direcciones, pero solo una casilla
        directions = [
            (0, 1), (0, -1), (1, 0), (-1, 0),  # horizontal y vertical
            (1, 1), (1, -1), (-1, 1), (-1, -1)   # diagonal
        ]
        
        for dx, dy in directions:
            new_x = x + dx
            new_y = y + dy
            
            # Verificar si la posición está dentro del tablero
            if 0 <= new_x < 8 and 0 <= new_y < 8:
                current_pos = (new_x, new_y)
                piece_at_pos = board_state.get(current_pos)
                
                # Si no hay pieza o hay una pieza enemiga que podemos capturar
                if not piece_at_pos or piece_at_pos.is_white != is_white:
                    valid_moves.append(current_pos)
        
        return valid_moves

    @staticmethod
    def validate_move(from_pos, to_pos, is_white, board_state):
        """Valida si el movimiento del rey es legal"""
        valid_moves = ReyMove.get_valid_moves(from_pos, is_white, board_state)
        return to_pos in valid_moves
