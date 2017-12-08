const puppeteer = require('puppeteer')
const WebSocket = require('ws')
const zlib = require('zlib')

process.on('message', async message => {
    const browser = await puppeteer.launch()
    const page = (await browser.pages())[0]
    await page.setRequestInterception(true)
    const api = 'http://h5api.m.taobao.com/h5/mtop.mediaplatform.live.encryption/1.0/'
    const { url } = message

    // intercept request obtaining the web socket token
    page.on('request', req => {
        if (req.url.includes(api)) {
            console.log(`[${url}] getting token`)
        }
        req.continue()
    })
    page.on('response', async res => {
        if (!res.url.includes(api)) return

        const data = await res.text()
        const token = data.match(/"result":"(.*?)"/)[1]

        // establish web socket connection (won't be ready immediately)
        setTimeout(() => {
            const url = `ws://acs.m.taobao.com/accs/auth?token=${token}`
            const ws = new WebSocket(url)

            ws.on('open', () => {
                console.log(`\nOPEN:  ${url}\n`)
            })
            ws.on('close', () => {
                console.log('DISCONN')
            })
            ws.on('message', msg => {
                decode(JSON.parse(msg))
                // console.log('--------------------------------------')
            })
        }, 1000)
    })

    // open the taobao live page
    await page.goto(url, { timeout: 0 })
    console.log(`[${url}] page loaded`)

    // kill current child proc after 1 min
    setTimeout(async () => {
        console.log(`[${url}] closing browser`)
        console.log(`[${url}] SIGINT`)
        // kill current browser
        browser.close()
        // kill current child proc
        process.exit(0)
    }, 60000)
})

function decode(msg) {
    // base64 decode
    let buffer = Buffer.from(msg.data, 'base64')
    if (msg.compressType === 'GZIP') {
        // gzip decode
        buffer = zlib.gunzipSync(buffer)
    }
    const bufferStr = buffer.join(',')

    // [followed] notifications are ignored
    const followedPattern = '226,129,130,226,136,176,226,143,135,102,111,108,108,111,119'
    if (bufferStr.includes(followedPattern)) {
        return
    }

    // // print for debugging
    // console.log(bufferStr)
    // console.log(buffer.toString())

    // first match is nick name and second match is barrage content
    const barragePattern = /.*,[0-9]+,0,18,[0-9]+,(.*?),32,[0-9]+,[0-9]+,[0-9]+,[0-9]+,[0-9]+,44,50,2,116,98,[0-9]+,0,10,[0-9]+,(.*?),18,20,10,12/
    const matched = bufferStr.match(barragePattern)
    if (matched) {
        // console.log(bufferStr, buffer.toString())
        const nick = parseStr(matched[1])
        const barrage = parseStr(matched[2])
        console.log(`${nick}:  ${barrage}`)
    }
}

function parseStr(bufferStr) {
    return new Buffer(bufferStr.split(',')).toString()
}
