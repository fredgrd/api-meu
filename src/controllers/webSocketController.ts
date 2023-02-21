import { WebSocket } from 'ws';
import { parse } from 'url';
import { IRoomMessage, IRoomUpdate, Room } from '../database/models/room';

import { wss } from '../index';
import { logMongooseError } from '../helpers/logError';
import { NotificationService } from '../services/notificationService';

interface IRoomWebSocket extends WebSocket {
  room_id: string | undefined;
  user_id: string | undefined;
}

const isRoomMessage = (message: any): message is IRoomMessage => {
  const castedMessage = message as IRoomMessage;

  return (
    castedMessage.sender !== undefined && castedMessage.message !== undefined
  );
};

const isRoomUpdate = (update: any): update is IRoomUpdate => {
  const castedUpdate = update as IRoomUpdate;

  return (
    castedUpdate.kind !== undefined && castedUpdate.sender_name !== undefined
  );
};

const brodcastUpdate = (ws: IRoomWebSocket, update: IRoomUpdate) => {
  wss.clients.forEach((wsClient) => {
    const client = wsClient as IRoomWebSocket;

    if (
      client !== ws &&
      client.room_id === ws.room_id &&
      client.readyState === WebSocket.OPEN
    ) {
      client.send(JSON.stringify(update));
    }
  });
};

const broadcastMessage = async (ws: IRoomWebSocket, message: IRoomMessage) => {
  const room = await Room.findByIdAndUpdate(
    ws.room_id,
    {
      $push: {
        messages: {
          sender: message.sender,
          kind: message.kind,
          message: message.message,
        },
      },
    },
    { safe: true, new: true }
  ).catch((e) => {
    logMongooseError(e, 'webSocketController/onMessage');
    return;
  });

  if (!room || !ws.user_id) {
    return;
  }

  const savedMessage = room.messages[room.messages.length - 1];

  const connectedClients: string[] = [ws.user_id];
  wss.clients.forEach((wsClient) => {
    const client = wsClient as IRoomWebSocket;
    if (
      client !== ws &&
      client.room_id === ws.room_id &&
      client.readyState === WebSocket.OPEN
    ) {
      if (client.user_id) connectedClients.push(client.user_id);

      client.send(
        JSON.stringify({
          id: savedMessage?._id,
          sender: message.sender,
          sender_name: message.sender_name,
          sender_number: message.sender_number,
          sender_thumbnail: message.sender_thumbnail,
          message: message.message,
          kind: message.kind,
          timestamp: savedMessage?.timestamp,
        })
      );
    }
  });

  const notificationService = new NotificationService();
  await notificationService.notifyFriends(
    room.id,
    room.user.toString(),
    ws.user_id,
    message.message,
    message.kind,
    connectedClients
  );
};

export const wsOnConnection = async (ws: IRoomWebSocket, req: Request) => {
  const query: string | null = parse(req.url).query;

  if (query === null) {
    console.log('webSocketController/onConnection error: NoData');
    ws.close();
    return;
  }

  const matches = query.match(/room_id=([\w]+)&user_id=([\w]+)/);

  if (matches === null) {
    console.log('webSocketController/onConnection error: NoData');
    ws.close();
    return;
  }

  ws.room_id = matches[1];
  ws.user_id = matches[2];

  ws.on('message', async (data) => {
    const dataString = data.toString();
    const payload: IRoomMessage | IRoomUpdate | any = JSON.parse(dataString);

    if (isRoomUpdate(payload)) {
      brodcastUpdate(ws, payload);
    }

    if (isRoomMessage(payload)) {
      await broadcastMessage(ws, payload);
    }
  });
};
