import { io, Socket } from "socket.io-client";

const URL = import.meta.env.VITE_SERVER_LINK;
const socket: Socket = io(URL, {
    autoConnect: true,
    transports: ["websocket"],
});

export default socket;

