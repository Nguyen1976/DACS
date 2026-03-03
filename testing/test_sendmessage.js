import http from "k6/http";
import ws from "k6/ws";
import { check } from "k6";
import { Counter, Rate } from "k6/metrics";
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

// ─── Config ──────────────────────────────────────────────
const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";
const WS_URL =
  __ENV.WS_URL || "ws://localhost:3001/socket.io/?EIO=4&transport=websocket";
const SIO_NAMESPACE = "/realtime";

const PASSWORD = "heheheee";
const CONVERSATION_ID = __ENV.CONVERSATION_ID || "69861483597e126521362d29";

const SOCKET_DURATION = 60000; // giữ socket 60s
const WARMUP_TIME = 5000; // chờ 5s cho user ổn định
const SEND_INTERVAL = 2000; // gửi mỗi 2s

// ─── Custom Metrics ──────────────────────────────────────
const sentMessages = new Counter("sent_messages");
const receivedMessages = new Counter("received_messages");
const sendSuccessRate = new Rate("send_success_rate");

// ─── Options ─────────────────────────────────────────────
export const options = {
  scenarios: {
    chat_load: {
      executor: "per-vu-iterations",
      vus: 200,
      iterations: 1,
      maxDuration: "90s",
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.05"],
    send_success_rate: ["rate>0.95"],
  },
};

function parseJsonBody(rawBody) {
  try {
    return JSON.parse(rawBody);
  } catch {
    return null;
  }
}

function getResponseData(body) {
  if (!body || typeof body !== "object") return null;
  return body.data && typeof body.data === "object" ? body.data : body;
}

function buildCookieHeader(setCookieHeader) {
  if (!setCookieHeader) return "";

  const headerValues = Array.isArray(setCookieHeader)
    ? setCookieHeader
    : [setCookieHeader];

  const cookiePairs = headerValues
    .map((cookieLine) => String(cookieLine).split(";")[0]?.trim())
    .filter(Boolean);

  return cookiePairs.join("; ");
}

function loginAndGetCookie(email) {
  const loginRes = http.post(
    `${BASE_URL}/user/login`,
    JSON.stringify({ email, password: PASSWORD }),
    {
      headers: { "Content-Type": "application/json" },
    },
  );

  const body = parseJsonBody(loginRes.body);
  const data = getResponseData(body);
  const setCookieHeader =
    loginRes.headers["Set-Cookie"] || loginRes.headers["set-cookie"];
  const cookieHeader = buildCookieHeader(setCookieHeader);

  const ok =
    (loginRes.status === 200 || loginRes.status === 201) &&
    Boolean(data?.id) &&
    Boolean(cookieHeader);

  return {
    ok,
    status: loginRes.status,
    cookieHeader,
  };
}

// ─── Main ────────────────────────────────────────────────
export default function () {
  const vuId = __VU;
  const email = `user${vuId}@test.com`;

  // ── Step 1: LOGIN ─────────────────────────────────────
  const loginSession = loginAndGetCookie(email);

  const loginOk = check(loginSession, {
    [`[VU ${vuId}] login success`]: (s) => s.ok,
  });

  if (!loginOk) {
    console.error(`[VU ${vuId}] Login failed: ${loginSession.status}`);
    return;
  }

  let sentCount = 0;
  let ackCount = 0;
  let errorCount = 0;
  let authenticated = false;
  let sequence = 0;

  const pendingMessages = {};

  // ── Step 2-4: WebSocket connect + send + listen ───────
  ws.connect(
    WS_URL,
    {
      headers: {
        Cookie: loginSession.cookieHeader,
      },
    },
    function (socket) {
      // ── On message: xử lý toàn bộ EIO4 / Socket.IO protocol ──
      socket.on("message", function (data) {
        // Engine.IO open packet "0{...}" → gửi Socket.IO CONNECT to /realtime namespace
        if (data.startsWith("0{")) {
          const connectPacket = "40" + SIO_NAMESPACE + ",";
          socket.send(connectPacket);
          return;
        }

        // Engine.IO ping → pong (giữ connection sống)
        if (data === "2") {
          socket.send("3");
          return;
        }

        // Socket.IO connect ACK cho namespace /realtime
        // Server trả: "40/realtime,{\"sid\":\"...\"}" hoặc "40/realtime"
        if (
          data === "40" + SIO_NAMESPACE ||
          data.startsWith("40" + SIO_NAMESPACE + ",")
        ) {
          authenticated = true;
          console.log(`[VU ${vuId}] Authenticated`);
          return;
        }

        // Socket.IO event cho namespace /realtime
        // Server gửi: "42/realtime,["chat.new_message", {...}]"
        const eventPrefix = "42" + SIO_NAMESPACE + ",";
        if (data.startsWith(eventPrefix)) {
          try {
            const payload = JSON.parse(data.substring(eventPrefix.length));

            const eventName = payload?.[0];
            const eventData = payload?.[1] || {};

            if (eventName === "message:ack") {
              const clientMessageId = eventData.clientMessageId;
              if (clientMessageId && pendingMessages[clientMessageId]) {
                delete pendingMessages[clientMessageId];
                ackCount++;
                receivedMessages.add(1);
                sendSuccessRate.add(true);
              }
              return;
            }

            if (eventName === "message:error") {
              const clientMessageId = eventData.clientMessageId;
              if (clientMessageId && pendingMessages[clientMessageId]) {
                delete pendingMessages[clientMessageId];
                errorCount++;
                sendSuccessRate.add(false);
              }
              return;
            }

            if (eventName === "chat.new_message") {
              receivedMessages.add(1);
            }
          } catch (_) {}
          return;
        }
      });

      // ── WARMUP: đợi 5s cho toàn bộ user connect ổn định ──
      socket.setTimeout(function () {
        // Bắt đầu gửi message:create mỗi 2s qua WebSocket
        socket.setInterval(function () {
          if (!authenticated) return;

          sequence += 1;
          const clientMessageId = `vu${vuId}-${Date.now()}-${sequence}`;

          const emitPayload = {
            conversationId: CONVERSATION_ID,
            content: `hello from user${vuId}`,
            clientMessageId,
            type: "TEXT",
            media: [],
          };

          const packet =
            "42" +
            SIO_NAMESPACE +
            "," +
            JSON.stringify(["message:create", emitPayload]);

          pendingMessages[clientMessageId] = true;
          sentCount++;
          sentMessages.add(1);

          socket.send(packet);
        }, SEND_INTERVAL);
      }, WARMUP_TIME);

      socket.setTimeout(function () {
        const unresolvedMessageIds = Object.keys(pendingMessages);

        if (unresolvedMessageIds.length > 0) {
          for (const unresolvedId of unresolvedMessageIds) {
            delete pendingMessages[unresolvedId];
            sendSuccessRate.add(false);
          }
        }

        if (vuId <= 3) {
          console.log(
            `[VU ${vuId}] Done. Sent=${sentCount}, Ack=${ackCount}, Error=${errorCount}, Pending=${unresolvedMessageIds.length}`,
          );
        }

        socket.close();
      }, SOCKET_DURATION);
    },
  );
}

export function handleSummary(data) {
  return {
    "report.html": htmlReport(data),
    stdout: textSummary(data, { indent: " ", enableColors: true }),
  };
}
