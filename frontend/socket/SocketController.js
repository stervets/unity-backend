import Socket from 'socket.io-client';

export default class SocketController {
    GAME_SERVER_ADDRESS = 'http://localhost:3000';

    socket = null;

    busHandlers = {
        /*
        play(params) {
            if (params.play) {
                this.socket.emit('RunScript', params);
            }
        }

         */
    };

    socketHandlers      = {
        connect(...attrs) {
            this.socket.emit('register', {
                type: 'editor',
                room: this.roomName
            });
        },

        disconnect() {
            this.$bus && this.$bus.$emit('editor-removeAllTabs');
        },

        q(data) {
            this.queryHandlers[data.com] && this.queryHandlers[data.com].call(this, data.vars);
        }
    };

    queryHandlers = {
        /*
         async scripts(vars) {
         if (!this.$bus.editorReady) {
         await new Promise((resolve) => {
         this.$bus.$once('editor-ready', resolve);
         });
         }

         Array.isArray(vars) && vars.forEach((script) => {
         this.$bus.$emit('editor-createNewTab', {
         name: script.prefabName,
         data: script.script,
         play: false,
         id  : script.id
         });
         });
         },

         create(vars) {
         this.$bus.$emit('editor-createNewTab', {
         name: vars.name,
         id  : vars.id,
         play: false,
         data: ''
         });
         }
         */
    };

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;

            this.$bus && Object.keys(this.busHandlers).forEach((handlerName) => {
                this.$bus.$off(`editor-${handlerName}`);
            });
        }
    }

    registerAPI(api){

    }

    constructor(roomName, $bus) {
        this.$bus = $bus;
        this.roomName = roomName;

        this.disconnect();
        this.socket = Socket.connect(this.GAME_SERVER_ADDRESS);

        Object.keys(this.socketHandlers).forEach((handlerName) => {
            this.socket.on(handlerName, this.socketHandlers[handlerName].bind(this));
        });

        if (this.$bus) {
            setTimeout(() => {
                Object.keys(this.busHandlers).forEach((handlerName) => {
                    this.$bus.$on(`editor-${handlerName}`, this.busHandlers[handlerName].bind(this));
                });
            }, 500);
        }
    }
}
