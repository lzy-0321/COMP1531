/**
 * The backend for a messaging system between users in a virtual room.
 * This system works based on a single room that users can be added to. Once a user
 * is added to the room, they are able to message any other user who has been added
 * to the room before. The details of the users and details of the messages can be
 * read at any time. Users are identified simply via a string, where each unique ASCII
 * string denotes a user (no need to create unique numeric IDs etc)
 */

interface Message {
  from: string;
  to: string;
  message: string;
}
// Put any global variables your implementation needs here

interface Users {
  users: string[];
}

let data = {
  users: [],
  messages: [],
};

/**
 * @returns an object, whose sole key "users", contains a list of all the users.
 * E.G. { users: ['Hayden', 'Rob', 'Emily', 'Bart'] }
 * The list is in reverse order in which they were added. So the
 * first element of the list is the most recently added user.
 */
export function get_users(): { users: string[] } {
  let result = { users: [] };
  for (let i = data.users.length - 1; i >= 0; i--) {
    result.users.push(data.users[i]);
  }
  return result;
}

/**
 * Adds a user to the room/broom.
 * If a user with the same name is already in the room, it throws an `Error`
 */
export function add_user(name: string): {} {
  if (data.users.includes(name)) {
    throw new Error('User already exists');
  }
  data.users.push(name);
  return {};
}

/**
 * @returns an object, whose sole key 'messages', contains a list of all the messages sent, who they came from,
 * and who they are going to. An example of the return value can be found in `brooms.test.ts`
 * The messages are listed in the order in which they were added. I.E. The first message
 * in the list is the oldest message that was sent.
 */
export function get_messages(): { messages: Message[] } {
  return { messages: data.messages };
}

/**
 * Sends a message from user `user_from` to user `user_to`
 * In reality the notion of what sending a message means is not something you have
 * to over-think here. You're simply trying to capture information and store it for
 * the get_messages function to work correctly.
 * If either user_from or user_to are not in the room, it throws an Error.
 */
export function send_message(user_from: string, user_to: string, message: string): {} {
  if (!data.users.includes(user_from) || !data.users.includes(user_to)) {
    throw new Error('User does not exist');
  }
  data.messages.push({ from: user_from, to: user_to, message: message });
  return {};
}

/**
 * Removes all data from the room/broom.
 */
export function clear(): {} {
  data = { users: [], messages: [] };
  return {};
}
