from django.db import models
from Chess_Tree.models import ChessBoard

class PeonMove:
    @staticmethod
    def get_valid_moves(position, is_white, board_state):
        """Calcula los movimientos válidos para un peón"""
        valid_moves = []
        x, y = position
        
        # Dirección del movimiento (hacia arriba para blancas, hacia abajo para negras)
        direction = -1 if is_white else 1
        
        # Movimiento básico hacia adelante
        forward = (x, y + direction)
        if 0 <= forward[1] < 8:
            # Verificar si hay una pieza bloqueando el camino
            if not board_state.get(forward):
                valid_moves.append(forward)
                
                # Movimiento inicial de dos casillas solo si el camino está libre
                if (is_white and y == 6) or (not is_white and y == 1):
                    double_forward = (x, y + 2 * direction)
                    if 0 <= double_forward[1] < 8 and not board_state.get(double_forward):
                        valid_moves.append(double_forward)
        
        # Capturas en diagonal
        diagonals = [(x-1, y + direction), (x+1, y + direction)]
        for diagonal in diagonals:
            if 0 <= diagonal[0] < 8 and 0 <= diagonal[1] < 8:
                # Solo permitir captura en diagonal si hay una pieza enemiga
                piece_at_diagonal = board_state.get(diagonal)
                if piece_at_diagonal and piece_at_diagonal.is_white != is_white:
                    valid_moves.append(diagonal)
        
        return valid_moves

    @staticmethod
    def validate_move(from_pos, to_pos, is_white, board_state):
        """Valida si el movimiento del peón es legal"""
        valid_moves = PeonMove.get_valid_moves(from_pos, is_white, board_state)
        return to_pos in valid_moves
