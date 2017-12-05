const redis = require("redis")
const pub = redis.createClient()

pub.publish("crawler", "message 1", () => console.log('published 1'))
pub.publish("crawler", "message 2", () => console.log('published 2'))
pub.publish("crawler", "message 3", () => console.log('published 3'))

setTimeout(() => process.exit(0), 1000)
