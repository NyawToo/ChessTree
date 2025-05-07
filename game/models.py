from django.db import models
from Chess_Tree.models import ChessBoard
from Rey.models import ReyMove
from Reina.models import ReinaMove
from Alfil.models import AlfilMove
from Caballo.models import CaballoMove
from Torre.models import TorreMove
from Peon.models import PeonMove

class GameState:
    def __init__(self):
        self.board = ChessBoard()
        self.current_turn = 'white'
        self.move_validators = {
            'rey': ReyMove,
            'reina': ReinaMove,
            'alfil': AlfilMove,
            'caballo': CaballoMove,
            'torre': TorreMove,
            'peon': PeonMove
        }

    def validate_move(self, piece_type, from_pos, to_pos, is_white):
        """Valida si un movimiento es legal para una pieza específica"""
        if piece_type.lower() in self.move_validators:
            validator = self.move_validators[piece_type.lower()]
            return validator.validate_move(from_pos, to_pos, is_white, self.board.get_state())
        return False

    def get_valid_moves(self, piece_type, position, is_white):
        """Obtiene todos los movimientos válidos para una pieza específica"""
        if piece_type.lower() in self.move_validators:
            validator = self.move_validators[piece_type.lower()]
            return validator.get_valid_moves(position, is_white, self.board.get_state())
        return []

    def make_move(self, piece_type, from_pos, to_pos, is_white):
        """Realiza un movimiento si es válido"""
        if self.validate_move(piece_type, from_pos, to_pos, is_white):
            self.board.move_piece(from_pos, to_pos)
            self.current_turn = 'black' if self.current_turn == 'white' else 'white'
            return True
        return False