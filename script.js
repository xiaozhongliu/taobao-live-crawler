const CP = require('child_process')

// kill all non-vscode node procs
const ps = CP.spawn('ps', ['ax'])
const grep = CP.spawn('grep', ['node'])

ps.stdout.on('data', (data) => {
    grep.stdin.write(data)
})
ps.on('close', (code) => {
    grep.stdin.end()
})
grep.stdout.on('data', (data) => {
    for (const line of data.toString().split('\n')) {
        if (line.includes('Visual Studio Code.app')) continue

        const values = line.trimLeft(' ').split(' ')
        const pid = values[0]
        if (!/^[0-9]+$/.test(pid)) continue

        console.log(pid)
        process.kill(parseInt(pid))
    }
})
