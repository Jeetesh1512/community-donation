let ioInstance = null;

function setSocketIO(io){
    ioInstance=io;
}

function getSocketIO(io){
    return ioInstance;
}

module.exports = {
    setSocketIO,
    getSocketIO
};