const WebSocket = require('ws')

const url = 'ws://acs.m.taobao.com/accs/auth?token=AAAIWiYTGCKNIEDz7zORzzM8XiapmSL1l0cq7feftE73c4c1pDCNU7jzwWADtxZZtEr7o0DlUmIWuInsLMyqwynW6fInW5Q='
const ws = new WebSocket(url)

ws.on('open', () => {
    console.log(`OPEN:  ${url}\n`)
})
ws.on('close', () => {
    console.log('DISCONN')
})
ws.on('message', msg => {
    msg = JSON.parse(msg)
    decode(msg)
})

const zlib = require('zlib')
function decode(msg) {
    let buffer
    if (msg.compressType === 'COMMON') {
        buffer = Buffer.from(msg.data, 'base64')
    }

    if (msg.compressType === 'GZIP') {
        buffer = zlib.gunzipSync(new Buffer(msg.data, 'base64'))
    }

    const bufferStr = buffer.join(',')

    // console.log(bufferStr, buffer.toString())

    // 'follow' notifications are ignored
    if (bufferStr.includes('226,129,130,226,136,176,226,143,135,102,111,108,108,111,119')) {
        return
    }

    const matched = bufferStr.match(/.*,[0-9]+,0,18,[0-9]+,(.*?),32,[0-9]+,[0-9]+,[0-9]+,[0-9]+,130,44,50,2,116,98,[0-9]+,0,10,[0-9]+,(.*?),18,20,10,12/)
    if (matched) {

        // console.log(bufferStr, buffer.toString())

        const nick = new Buffer(matched[1].split(',')).toString()
        const barrage = new Buffer(matched[2].split(',')).toString()
        console.log(`${nick}:  ${barrage}`)
    }

    // console.log('=======================================================')
}
