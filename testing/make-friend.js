import http from 'k6/http'
import { check } from 'k6'
import { scenario } from 'k6/execution'


// export const options = {
//   stages: [
//     { duration: '30s', target: 100 },  // ramp up
//     { duration: '1m', target: 100 },   // giữ tải
//     { duration: '30s', target: 0 },    // ramp down
//   ],
//   thresholds: {
//     http_req_duration: ['p(95)<300'],  // SLA
//     http_req_failed: ['rate<0.01'],
//   },
// }
export const options = {
  scenarios: {
    rps_test: {
      executor: 'constant-arrival-rate',
      rate: 50,
      timeUnit: '1s',
      duration: '30s',
      preAllocatedVUs: 50,
      maxVUs: 200,
    },
  },

  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<300'],
  },
}

const BASE_URL = 'http://localhost:3000'
const LOGIN_EMAIL = '23010310@st.phenikaa-uni.edu.vn'
const PASSWORD = 'heheheee'

export function setup() {
  const res = http.post(
    `${BASE_URL}/user/login`,
    JSON.stringify({
      email: LOGIN_EMAIL,
      password: PASSWORD,
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    },
  )

  check(res, {
    'login success': (r) => r.status === 200,
  })
  const token = res.json('data.token')

  return { token }
}

export default function (data) {
  const userId = scenario.iterationInTest + 1

  const email = `user${userId}@test.com`

  const res = http.post(
    `${BASE_URL}/user/make-friend`,
    JSON.stringify({ email }),
    {
      headers: {
        Authorization: `Bearer ${data.token}`,
        'Content-Type': 'application/json',
      },
    },
  )

  check(res, {
    'make friend success': (r) => r.status === 200,
  })
  // sleep(1) // think time
}


import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js'
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js'

export function handleSummary(data) {
  return {
    'report.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  }
}