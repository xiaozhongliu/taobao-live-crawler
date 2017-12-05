var redis = require("redis")
var sub = redis.createClient()

sub.on("subscribe", (channel, count) => {
    console.log('subscribed channel [crawler]')
})
sub.on("message", (channel, message) => {
    console.log(message)
})

sub.subscribe("crawler")
