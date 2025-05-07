from django.db import models
from Chess_Tree.models import ChessBoard

class CaballoMove:
    @staticmethod
    def get_valid_moves(position, is_white, board_state):
        """Calcula los movimientos válidos para un caballo"""
        valid_moves = []
        x, y = position
        
        # Movimientos en L del caballo
        moves = [
            (x+2, y+1), (x+2, y-1),
            (x-2, y+1), (x-2, y-1),
            (x+1, y+2), (x+1, y-2),
            (x-1, y+2), (x-1, y-2)
        ]
        
        # Filtrar movimientos dentro del tablero
        for move in moves:
            if 0 <= move[0] < 8 and 0 <= move[1] < 8:
                piece_at_pos = board_state.get(move)
                # Si no hay pieza o hay una pieza enemiga que podemos capturar
                if not piece_at_pos or piece_at_pos.is_white != is_white:
                    valid_moves.append(move)
        
        return valid_moves

    @staticmethod
    def validate_move(from_pos, to_pos, is_white, board_state):
        """Valida si el movimiento del caballo es legal"""
        valid_moves = CaballoMove.get_valid_moves(from_pos, is_white, board_state)
        return to_pos in valid_moves
