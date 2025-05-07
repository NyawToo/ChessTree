from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import GameState
import json

game_state = GameState()

@csrf_exempt
def validate_move(request):
    """Endpoint para validar un movimiento"""
    if request.method == 'POST':
        data = json.loads(request.body)
        piece_type = data.get('piece_type')
        from_pos = tuple(data.get('from_pos'))
        to_pos = tuple(data.get('to_pos'))
        is_white = data.get('is_white')

        is_valid = game_state.validate_move(piece_type, from_pos, to_pos, is_white)
        return JsonResponse({'valid': is_valid})

@csrf_exempt
def make_move(request):
    """Endpoint para realizar un movimiento"""
    if request.method == 'POST':
        data = json.loads(request.body)
        piece_type = data.get('piece_type')
        from_pos = tuple(data.get('from_pos'))
        to_pos = tuple(data.get('to_pos'))
        is_white = data.get('is_white')

        move_made = game_state.make_move(piece_type, from_pos, to_pos, is_white)
        return JsonResponse({
            'success': move_made,
            'current_turn': game_state.current_turn
        })

@csrf_exempt
def get_valid_moves(request):
    """Endpoint para obtener movimientos válidos de una pieza"""
    if request.method == 'POST':
        data = json.loads(request.body)
        piece_type = data.get('piece_type')
        position = tuple(data.get('position'))
        is_white = data.get('is_white')

        valid_moves = game_state.get_valid_moves(piece_type, position, is_white)
        return JsonResponse({'valid_moves': valid_moves})