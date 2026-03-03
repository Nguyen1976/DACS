import http from "k6/http";
import { check } from "k6";
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

const BASE_URL = "http://localhost:3000";

const MAIN_EMAIL = "nguyen2202794@gmail.com";
const MAIN_PASSWORD = "heheheee";

const USERS_PER_VU = 100; // 100 VU × 100 = 10000 user

export const options = {
  scenarios: {
    create_users: {
      executor: "per-vu-iterations",
      vus: 100,
      iterations: USERS_PER_VU,
      maxDuration: "10m",
    },
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

function loginAndGetSession(email, password) {
  const loginRes = http.post(
    `${BASE_URL}/user/login`,
    JSON.stringify({ email, password }),
    {
      headers: { "Content-Type": "application/json" },
    },
  );

  const ok = loginRes.status === 200 || loginRes.status === 201;
  if (!ok) {
    return { ok: false, id: null, cookieHeader: "" };
  }

  const body = parseJsonBody(loginRes.body);
  const data = getResponseData(body);

  const setCookieHeader =
    loginRes.headers["Set-Cookie"] || loginRes.headers["set-cookie"];
  const cookieHeader = buildCookieHeader(setCookieHeader);

  return {
    ok: Boolean(data?.id) && Boolean(cookieHeader),
    id: data?.id || null,
    cookieHeader,
  };
}

// Setup: login main account
export function setup() {
  console.log("Login main account...");

  const mainSession = loginAndGetSession(MAIN_EMAIL, MAIN_PASSWORD);

  if (!mainSession.ok) {
    throw new Error("Main account login failed or missing auth cookies");
  }

  return {
    mainCookieHeader: mainSession.cookieHeader,
    mainId: mainSession.id,
  };
}

// Mỗi iteration tạo 1 user
export default function (data) {
  const globalIndex = (__VU - 1) * USERS_PER_VU + __ITER + 1;

  const email = `user${globalIndex}@test.com`;
  const username = `user${globalIndex}`;
  const password = "heheheee";

  // 1️⃣ Register
  http.post(
    `${BASE_URL}/user/register`,
    JSON.stringify({ email, username, password }),
    {
      headers: { "Content-Type": "application/json" },
    },
  );

  // 2️⃣ Main gửi lời mời kết bạn
  http.post(`${BASE_URL}/user/make-friend`, JSON.stringify({ email }), {
    headers: {
      "Content-Type": "application/json",
      Cookie: data.mainCookieHeader,
    },
  });

  // 3️⃣ Login user test
  const userSession = loginAndGetSession(email, password);
  if (!userSession.ok) {
    return;
  }

  // 4️⃣ Accept lời mời
  http.post(
    `${BASE_URL}/user/update-status-make-friend`,
    JSON.stringify({
      inviterId: data.mainId,
      status: "ACCEPTED",
      inviteeName: username,
    }),
    {
      headers: {
        "Content-Type": "application/json",
        Cookie: userSession.cookieHeader,
      },
    },
  );

  // Chỉ VU cuối cùng tạo group sau khi xong iteration cuối
  // if (__VU === 100 && __ITER === USERS_PER_VU - 1) {
  //   console.log('Creating group...')

  //   http.post(
  //     `${BASE_URL}/chat/create`,
  //     JSON.stringify({
  //       groupName: 'Nguyen',
  //       members: globalThis.memberIds.map((id) => ({ userId: id })),
  //     }),
  //     {
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Cookie: data.mainCookieHeader,
  //       },
  //     },
  //   )
  // }
}

// Xuất report
export function handleSummary(data) {
  return {
    "report.html": htmlReport(data),
    stdout: textSummary(data, { indent: " ", enableColors: true }),
  };
}
