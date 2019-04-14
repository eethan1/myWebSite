module.exports = {
    // The host and port for the website
    host:"127.0.0.1",
    port:"3000",
    
    // The host and port for the socket.io
    socketHost:"localhost",
    socketPort:"3001",
    socket:"localhost:3001",
    
    // The setting for MongoDB
    dbIP: "127.0.0.1",

    // The setting for Dcard Request Limitation
    ipLimitInterval:60*60*1000,
    ipLimitTimes:1000,

    // The setting for photoUploader
    uploadPosition: '/tmp/'
}
