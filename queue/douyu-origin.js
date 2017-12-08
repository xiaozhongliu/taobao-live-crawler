const net = require('net')
const readline = require('readline')

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

let roomid
rl.question('输入房间号', (answer) => {
    roomid = answer
    rl.close()

    const s = net.connect({ port: 8601, host: 'openbarrage.douyutv.com' }, () => {
        console.log('connect success')
    })

    var msg = 'type@=loginreq/roomid@=' + roomid + '/'
    sendData(s, msg)
    msg = 'type@=joingroup/rid@=' + roomid + '/gid@=-9999/'
    sendData(s, msg)

    s.on('data', (chunk) => {
        formatData(chunk)
    })

    s.on('error', (err) => {
        console.log(err)
    })

    setInterval(() => {
        let timestamp = parseInt(new Date() / 1000)
        let msg = 'type@=keeplive/tick@=' + timestamp + '/'
        sendData(s, msg)
    }, 45000)
})



function sendData(s, msg) {
    let data = new Buffer(msg.length + 13)
    data.writeInt32LE(msg.length + 9, 0)
    data.writeInt32LE(msg.length + 9, 4)
    data.writeInt32LE(689, 8)
    data.write(msg + '\0', 12)
    s.write(data)
}

function formatData(msg) {
    const sliced = msg.slice(12).toString()
    // 减二删掉最后的'/'和'\0'
    const splited = sliced.substring(0, sliced.length - 2).split('/')
    const map = formatDanmu(splited)
    analyseDanmu(map)
}

function formatDanmu(msg) {
    let map = {}
    for (let i in msg) {
        let splited = msg[i].split('@=')
        map[splited[0]] = splited[1]
    }
    return map
}

function analyseDanmu(msg) {
    if (msg['type'] == 'chatmsg') {
        console.log(msg['nn'] + ':' + msg['txt'])
    }
    if (msg['type'] == 'uenter') {
        console.log('<=========[' + msg['nn'] + ']来了=========>')
    }
    if (msg['type'] == 'dgb') {
        console.log('<$$$$$$$$$[' + msg['nn'] + ']送礼物了$$$$$$$$$>')
    }
}
