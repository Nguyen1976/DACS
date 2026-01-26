const axios = require('axios')
const { io } = require('socket.io-client')
const os = require('os')
const { monitorEventLoopDelay } = require('perf_hooks')

// ==========================
// CONFIG
// ==========================
const BASE_URL = 'http://localhost:3000'
const SOCKET_URL = 'http://localhost:3001/realtime'

const TOTAL_USERS = 10000
const PASSWORD = 'heheheee'
const DELAY_BETWEEN_USERS = 1 // ms (giảm nếu muốn stress mạnh hơn)

// ==========================
// STATS
// ==========================
let loginSuccess = 0
let loginFail = 0
let connectedCount = 0
let connectFail = 0

const sockets = []

// ==========================
// EVENT LOOP MONITOR
// ==========================
const h = monitorEventLoopDelay({ resolution: 20 })
h.enable()

// ==========================
// SYSTEM MONITOR (mỗi 5s)
// ==========================
setInterval(() => {
  const mem = process.memoryUsage()
  const cpu = process.cpuUsage()

  console.clear()

  console.log('================ SYSTEM =================')
  console.log('CPU Cores:', os.cpus().length)
  console.log('Load Avg:', os.loadavg())

  console.log('\n================ PROCESS =================')
  console.log('RSS MB:', (mem.rss / 1024 / 1024).toFixed(2))
  console.log('Heap Used MB:', (mem.heapUsed / 1024 / 1024).toFixed(2))
  console.log('Heap Total MB:', (mem.heapTotal / 1024 / 1024).toFixed(2))

  console.log('CPU User (ms):', (cpu.user / 1000).toFixed(0))
  console.log('CPU System (ms):', (cpu.system / 1000).toFixed(0))

  console.log(
    'Event Loop Delay (ms):',
    (h.mean / 1e6).toFixed(2),
  )

  console.log('\n================ LOAD =================')
  console.log('Login Success:', loginSuccess)
  console.log('Login Fail:', loginFail)
  console.log('Socket Connected:', connectedCount)
  console.log('Socket Connect Fail:', connectFail)
  console.log('Active Sockets:', sockets.length)

  console.log('========================================')
}, 5000)

// ==========================
// LOGIN
// ==========================
async function login(email) {
  try {
    const res = await axios.post(`${BASE_URL}/user/login`, {
      email,
      password: PASSWORD,
    })

    loginSuccess++
    return res.data.data.token
  } catch (err) {
    loginFail++
    return null
  }
}

// ==========================
// CONNECT SOCKET
// ==========================
function connectSocket(token, userIndex) {
  return new Promise((resolve) => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      auth: { token },
      reconnection: false,
      timeout: 10000,
    })

    socket.on('connect', () => {
      connectedCount++
      sockets.push(socket)
      resolve()
    })

    socket.on('connect_error', () => {
      connectFail++
      resolve()
    })

    socket.on('error', () => {
      connectFail++
    })
  })
}

// ==========================
// MAIN
// ==========================
async function run() {
  console.log(`Starting load test with ${TOTAL_USERS} users...`)

  for (let i = 1; i <= TOTAL_USERS; i++) {
    const email = `user${i}@test.com`

    const token = await login(email)

    if (token) {
      await connectSocket(token, i)
    }

    await new Promise((r) =>
      setTimeout(r, DELAY_BETWEEN_USERS),
    )
  }

  console.log('Finished spawning users.')
}

process.on('uncaughtException', (err) => {
  console.log('Uncaught:', err.message)
})

process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection:', err)
})

run()
