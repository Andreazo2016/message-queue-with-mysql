const db = require('./configs/db')

if (!Date.prototype.addMinute) {
    Date.prototype.addMinute = function (minutes) {
        return new Date(this.getTime() + minutes * 60000)
    }
}

const EVERY_ONE_MINUTE = 1000 * 60

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

const status = {
    DONE: 'done',
    CREATE: 'create',
    PROCESSING: 'processing',
    ERROR: 'error',
}

async function releaseRows(messages, transaction = null) {
    const ids = messages.map(message => message.id)
    const query = `
        UPDATE messages
        SET status = ?
        WHERE id in (?)
    `
    await transaction?.raw(query, [status.PROCESSING, ids])
    await transaction?.commit()
    console.log('liberou linhas')
}

async function markAsDone(messages) {
    const ids = messages.map(message => message.id)
    const query = `
        UPDATE messages
        SET status = ?
        WHERE id in (?)
    `
    await db?.raw(query, [status.DONE, ids])
}

async function doAnything(messages) {
    console.log(`--- start processing ----- `)
    messages.forEach(message => {
        console.log(`putting ${JSON.stringify(message.payload)} into queue ${message.queue_name}`)
    })
    console.log(`---- finished ---------`)
    await markAsDone(messages)
}

async function fetch() {
    for (;;) {
        const trx = await db.transaction()
        try {
            console.log('--------- starting fetching ' + new Date() + ' ---------------')
            const [messages] = await trx.raw(`
            SELECT
                *
            FROM messages 
            WHERE status = 'create' AND scheduled_at <= now()
            ORDER BY scheduled_at desc
            LIMIT 10
            FOR UPDATE SKIP LOCKED
            ;
            `)
            if (messages.length > 0){
              await releaseRows(messages, trx)
              await doAnything(messages)
            } else {
                console.log('NAO PEGOU')
            }
            await trx.commit()
            console.log('------------------------')
            console.log('sleeping')
            await sleep(EVERY_ONE_MINUTE)
        } catch (ex) {
            console.log(ex)
            await trx.rollback()
        }
    }
}

fetch()