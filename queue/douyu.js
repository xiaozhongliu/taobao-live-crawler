const net = require('net')

const roomid = process.argv[2]
if (!roomid) {
    console.log('please pass in douyu room id as the first argument')
    console.log('e.g.: node queue/douyu 606118')
    process.exit(0)
}

const client = net.connect({ host: 'openbarrage.douyutv.com', port: 8601 })
sendData(client, `type@=loginreq/roomid@=${roomid}/`)
sendData(client, `type@=joingroup/rid@=${roomid}/gid@=-9999/`)

client.on('data', formatData)
client.on('error', console.log)

setInterval(() => {
    const stamp = new Date().getTime() / 1000
    sendData(client, `type@=keeplive/tick@=${stamp}/`)
}, 45000)

function sendData(client, msg) {
    const data = new Buffer(msg.length + 13)
    data.writeInt32LE(msg.length + 9, 0)
    data.writeInt32LE(msg.length + 9, 4)
    data.writeInt32LE(689, 8)
    data.write(msg + '\0', 12)
    client.write(data)
}

function formatData(data) {
    const sliced = data.slice(12).toString()
    const splited = sliced.substring(0, sliced.length - 2).split('/')
    const map = {}
    for (let item in splited) {
        let pair = splited[item].split('@=')
        map[pair[0]] = pair[1]
    }
    if (map.type == 'chatmsg') {
        console.log(map.nn + ':' + map.txt)
    }
}
