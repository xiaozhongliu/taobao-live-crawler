const puppeteer = require('puppeteer')
const WebSocket = require('ws')

const url = 'http://t.vyxq8.com/h.C65nzN'

puppeteer.launch().then(async browser => {
    const page = await browser.newPage()
    await page.setRequestInterception(true)
    const api = 'http://h5api.m.taobao.com/h5/mtop.mediaplatform.live.encryption/1.0/'

    page.on('request', req => {
        if (req.url.includes(api)) {
            console.log(`GET:   ${req.url}\n`)
        }
        req.continue()
    })
    page.on('response', async res => {
        if (!res.url.includes(api)) return

        const data = await res.text()
        const token = data.match(/"result":"(.*?)"/)[1]
        console.log(`RES:   ${await token}\n`)

        setTimeout(() => {
            const url = `ws://acs.m.taobao.com/accs/auth?token=${token}`
            const ws = new WebSocket(url)

            ws.on('open', () => {
                console.log(`OPEN:  ${url}\n`)
            })
            ws.on('message', msg => {
                console.log(JSON.parse(msg).data)
            })
        }, 2000)

        // await browser.disconnect()
        // await browser.close()
        // process.exit()
    })

    await page.goto(url, { timeout: 0 })
    console.log('\npage loaded\n')
})
