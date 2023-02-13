import { WebSocket } from 'ws';
import { parse } from 'url';
import { IRoomMessage, Room } from '../database/models/room';

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

export const wsOnConnection = async (ws: IRoomWebSocket, req: Request) => {
  const roomID: string | null = parse(req.url).query;

  console.log('RECEIVED WSCONNECTION', roomID);

  if (typeof roomID === 'string') {
    ws.room_id = roomID;
  } else {
    console.log('webSocketController/onConnection error: NoRoom');
    ws.close();
    return;
  }

  ws.on('message', async (data) => {
    console.log('RECEIVED WSMESSAGE');
    const dataString = data.toString();
    let message: IRoomMessage | any = JSON.parse(dataString);

    console.log('MESSAGE DATA', dataString, data, message);

    if (isRoomMessage(message)) {
      // Save to database
      const room = await Room.findByIdAndUpdate(
        ws.room_id,
        { $push: { messages: message } },
        { safe: true, new: true }
      ).catch((e) => {
        logMongooseError(e, 'webSocketController/onMessage');
        return;
      });

      message = room?.messages[room?.messages.length - 1];

      wss.clients.forEach((wsClient) => {
        const client = wsClient as IRoomWebSocket;
        if (
          client !== ws &&
          client.room_id === ws.room_id &&
          client.readyState === WebSocket.OPEN
        ) {
          client.send(JSON.stringify(message));
        }
      });
    }
  });
};
