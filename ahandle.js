const CP = require('child_process')

const url = 'http://p.kwi9.com/h.CQLKMg'

const child = CP.fork('./acrawler')
child.send({ url })



// const redis = require('redis')
// const client = redis.createClient()

// client.sadd('cpids', 10000)
// client.smembers('cpids', (err, list) => {
//     // list.forEach(pid => process.kill(pid))
// })

// process.on('SIGINT', function () {
//     console.log('\ngoodbye')
//     process.exit(0)
// })
