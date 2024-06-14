
const { Server } = require('socket.io')
const helper = require('../middleware/helper')
const socketController = require('./socketController')
const dbAuth = require('../database/auth')
class SocketService {


    constructor(server) {
        this.connections = new Map();
        this.io = new Server(server, { cors: { origin: "*", }, pingInterval: 10000, pingTimeout: 5000 });
        this.io.listen(8500)
        this.io.use((socket, next) => {
            try {
                // const {token} = socket.handshake.headers
                const { token } = socket.handshake.auth;
                // console.log('token: ', token);
                if (!token) {

                    return next(new Error("Token not provided"))
                }
                const decodedToken = helper.jwtDecode(token)
                if (decodedToken) {
                    const userId = decodedToken.subject._id
                    dbAuth.findById(userId)
                        .then((response) => {
                            if (response == null) {
                                return next(new Error("Invalid Token"))
                            } else {
                                next()
                            }
                        })
                        .catch((err) => {
                            console.log('err: ', err);
                            next(err)
                        })
                }
            } catch (error) {
                next(error)
            }
        })

        this.io.on('connection', (socket) => {
            socketController.handleConnection(socket, this.connections, this.io);
        });
    }

    // Getter method to get socket connection ID
    getConnectionId(adminId) {
        return this.connections.get(adminId) || null;
    }

    // Setter method to set socket connection ID
    setConnectionId(adminId, socketId) {
        this.connections.set(adminId, socketId);
    }

}


let socketInstance = null;

exports.socketRoute = (server = null) => {
    if (!socketInstance && server) {
        socketInstance = new SocketService(server)
        console.log("----------------------------Socket instance created successfully----------------------------",);
    }
    return socketInstance;
}