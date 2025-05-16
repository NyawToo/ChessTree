import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async

class ChessConsumer(AsyncWebsocketConsumer):
    connected_players = {}

    async def connect(self):
        self.sala_id = self.scope['url_route']['kwargs']['sala_id']
        self.room_group_name = f'chess_{self.sala_id}'

        # Unirse al grupo de la sala
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Abandonar el grupo de la sala
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_type = text_data_json.get('type')

        if message_type == 'player_connected':
            # Almacenar información del jugador
            self.connected_players[self.channel_name] = {
                'color': text_data_json.get('color'),
                'isCreator': text_data_json.get('isCreator')
            }
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chess_message',
                    'message': text_data_json
                }
            )
        elif message_type == 'move':
            # Validar que el jugador solo pueda mover sus propias piezas
            player_info = self.connected_players.get(self.channel_name)
            if player_info:
                piece_color = 'Blanco' if text_data_json.get('piece', '').endswith('Blanco') else 'Negro'
                if player_info['color'] == piece_color:
                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            'type': 'chess_message',
                            'message': text_data_json
                        }
                    )
                else:
                    # Si intenta mover una pieza del color opuesto, enviar mensaje de error
                    await self.send(text_data=json.dumps({
                        'type': 'error',
                        'message': 'No puedes mover las piezas del oponente'
                    }))
        else:
            # Para otros tipos de mensajes, enviar normalmente
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chess_message',
                    'message': text_data_json
                }
            )

    async def chess_message(self, event):
        message = event['message']

        # Enviar mensaje al WebSocket
        await self.send(text_data=json.dumps(message))