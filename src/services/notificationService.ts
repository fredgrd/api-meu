import { MongooseError, Types } from 'mongoose';
import { User } from '../database/models/user';

export class NotificationService {
  constructor() {}

  async notifyFriends(userID: Types.ObjectId, connectedFriends: string[]) {
    try {
      const user = await User.findById(userID).select('friends').orFail();

      // Filter ids
      let ids = user.friends.map((e) => e.toString());
      ids.push(userID.toString());
      ids = ids.filter((e) => !connectedFriends.includes(e));

      console.log('NOTIFY THIS USERS', ids);
    } catch (error) {
      const mongooseError = error as MongooseError;
      console.log(
        `NotificationService/notifyFriends error: ${mongooseError.name} ${mongooseError.message}`
      );
      return;
    }
  }
}
