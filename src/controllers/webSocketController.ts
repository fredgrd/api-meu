import { WebSocket } from 'ws';
import { parse } from 'url';
import { IRoomMessage, IRoomUpdate, Room } from '../database/models/room';

import { wss } from '../index';
import { logMongooseError } from '../helpers/logError';

interface IRoomWebSocket extends WebSocket {
  room_id: string | undefined;
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
        messages: { sender: message.sender, message: message.message },
      },
    },
    { safe: true, new: true }
  ).catch((e) => {
    logMongooseError(e, 'webSocketController/onMessage');
    return;
  });

  const savedMessage = room?.messages[room?.messages.length - 1];

  wss.clients.forEach((wsClient) => {
    const client = wsClient as IRoomWebSocket;
    if (
      client !== ws &&
      client.room_id === ws.room_id &&
      client.readyState === WebSocket.OPEN
    ) {
      client.send(
        JSON.stringify({
          id: savedMessage?._id,
          kind: 'text',
          sender: message.sender,
          sender_name: message.sender_name,
          sender_number: message.sender_number,
          sender_thumbnail: message.sender_thumbnail,
          message: message.message,
          timestamp: savedMessage?.timestamp,
        })
      );
    }
  });
};

export const wsOnConnection = async (ws: IRoomWebSocket, req: Request) => {
  const roomID: string | null = parse(req.url).query;

  if (typeof roomID === 'string') {
    ws.room_id = roomID;
  } else {
    console.log('webSocketController/onConnection error: NoRoom');
    ws.close();
    return;
  }

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
