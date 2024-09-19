const db = require('../configs/db')

if (!Date.prototype.addMinute) {
    Date.prototype.addMinute = function (minutes) {
        return new Date(this.getTime() + minutes * 60000)
    }
}

async function run() {
    const now = new Date().addMinute(5)
    for (let index = 0; index < 50; index++) {
        await db.raw(`INSERT INTO messages (status, queue_name, payload, scheduled_at) VALUES (?, ?, ?, ?)`, ['create','queue_01', JSON.stringify({ product: index, date: now }), now])
        console.log(`inserido produto: ${index}`)
    }
    process.exit(0)
}

run()