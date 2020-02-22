import SocketController from "./socket/SocketController";
import TestAPI from "../app/config/test-config.js";

(async () => {
    var socketController = new SocketController("test-room"),
        connectSocket = async ()=>{
            await socketController.connect();
            socketController.registerConfig(TestAPI);
        };

    socketController.onDisconnect = connectSocket;

    connectSocket();
})();
