const helper = require('../middleware/helper')
const db = require('../database/auth')
const dbMsg = require('../database/messageModel')
const { addMessage } = require('../controller/messageController')

const extractIdFromToken = (token = null) => {
    if (token) {
        const payload = helper.jwtDecode(token);
        return payload?.subject?._id || null;
    }
    return null;
};

exports.handleConnection = function (socket, connections, io) {

    // const { token } = socket.handshake.headers;
    const { token } = socket.handshake.auth;
    if (!token) {
        console.log("Token not provided in handshake authentication");
        return;
    }

    try {
        const userId = extractIdFromToken(token);
        if (userId) {
            (socket.$userId = userId);
            connections.set(userId, socket.id)
        }

        // socket.on('userActive', (data) => {
        //     console.log('------------------------data:------------------------ ', data);
        //     console.log("inside userActive event===========================================================", data);
        //     // handleUserActiveStatus(userId, data, { connections, io })
        //     db.findById(data)
        //         .then((data) => {
        //             console.log('data: ', data.email);
        //             socket.emit('data', data.email)
        //         })
        // })

        socket.on('message', async (data) => {
            console.log('data: ', data);
            if(data.receiver === null || undefined){
                return null
            }

            const receiver = data.receiver;
            const query = {
                $or: [
                    { $and: [{ sender: userId }, { receiver: receiver }] },
                    { $and: [{ sender: receiver }, { receiver: userId }] }
                ]
            };

            if (data.message) {
                await addMessage(userId, data.receiver, data.message)
                await dbMsg.find(query)
                    .then((messages) => {
                        // console.log('messages: ', messages);
                        // socket.emit('getmsg', messages)
                        const socketId = connections.get(data.receiver) || null;
                        if (socketId) io.to(socketId).emit("getmsg", messages);
                    }).catch((err) => {
                        console.log('err: ', err);
                    });


            } else {
                await dbMsg.find(query)
                    .then((messages) => {
                        // console.log('messages: ', messages);
                        // socket.emit('getmsg', messages)
                        const socketId = connections.get(data.receiver) || null;
                        if (socketId) io.to(socketId).emit("getmsg", messages);
                    }).catch((err) => {
                        console.log('err: ', err);
                    });
            }
        })

    } catch (error) {
        console.log(error, "from connection socket");
    }
    console.log(connections, "From hanldeConnections");

    socket?.on('disconnect', (data) => {
        handleDisconnection(socket, data, connections, io)
    });


}
const handleDisconnection = async function (socket, data, connections, io) {
    console.log('disconnection occures ======================================###########################---------------------');

    const userId = socket.$userId;
    if (data === "ping timeout") {
        console.log("=============================================================inside ping timeout", userId)
        // handleUserActiveStatus(userId, { updates: { activeStatus: false } }, { connections, io })
    }
    connections.has(userId) && connections.delete(userId)
    console.log(connections, "From handleDisconnection");
}














