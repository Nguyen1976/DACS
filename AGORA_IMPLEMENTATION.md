# Agora RTC Video/Audio Calling Implementation

This document describes the implementation of 1-1 and group video/audio calling using Agora RTC with secure token generation, integrated with the existing microservice architecture.

## Architecture Overview

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌─────────────┐
│   Client A  │────▶│  API Gateway │────▶│   RabbitMQ   │────▶│ Call Service │     │   Agora     │
│  (Frontend) │     │   (Port 3000)│     │   (Port 5672)│     │  (Port 3004) │     │  RTC Cloud  │
└─────────────┘     └──────────────┘     └──────┬───────┘     └──────────────┘     └─────────────┘
       │                                          │                                          │
       │                                          │                                          │
       │                                          ▼                                          │
       │                                  ┌──────────────┐                                   │
       │                                  │   Realtime   │                                   │
       │◀─────────Socket.IO───────────────│   Gateway    │                                   │
       │                                  │ (Port 3001)  │                                   │
       │                                  └──────────────┘                                   │
       │                                                                                      │
       └──────────────────────────────Agora RTC Token──────────────────────────────────────┘
```

## Backend Implementation

### 1. Call Service Microservice (`backend/apps/call/`)

**Purpose**: Generates Agora RTC tokens and manages call state.

**Key Files**:
- `call.service.ts` - Agora token generation using `agora-token` package
- `call.controller.ts` - Empty controller (listens via RabbitMQ)
- `rmq/publishers/call-events.publisher.ts` - Publishes call events
- `rmq/subscribers/call.subscriber.ts` - Subscribes to call actions

**Token Generation**:
```typescript
// Uses RtcTokenBuilder.buildTokenWithUserAccount
const token = RtcTokenBuilder.buildTokenWithUserAccount(
  appId,
  appCertificate,
  roomId,
  userId,
  RtcRole.PUBLISHER,
  tokenExpire: 3600,
  privilegeExpire,
)
```

**Call Flow**:
1. Receives `call.started` → Generates token → Publishes `call.started` with callId, roomId, token
2. Receives `call.accepted` → Generates token for acceptor → Publishes `call.accepted`
3. Receives `call.rejected` → Publishes `call.rejected`
4. Receives `call.ended` → Cleans up state → Publishes `call.ended`

### 2. API Gateway (`backend/apps/api-gateway/src/call/`)

**Endpoints**:
- `POST /call/start` - Initiates a call
  - Body: `{ targetUserIds, conversationId?, callType: 'DIRECT'|'GROUP', mediaType: 'AUDIO'|'VIDEO' }`
  - Protected by `@RequireLogin()` and `@UserInfo()`
  - Publishes to RabbitMQ: `call.events / call.started`

- `POST /call/accept` - Accepts an incoming call
  - Body: `{ callId, roomId }`
  - Publishes to RabbitMQ: `call.events / call.accepted`

- `POST /call/reject` - Rejects an incoming call
  - Body: `{ callId, roomId }`
  - Publishes to RabbitMQ: `call.events / call.rejected`

- `POST /call/end` - Ends an active call
  - Body: `{ callId, roomId, reason? }`
  - Publishes to RabbitMQ: `call.events / call.ended`

### 3. Realtime Gateway (`backend/apps/realtime-gateway/`)

**RabbitMQ Subscribers** (added to `realtime.gateway.ts`):
- `call.started` → Emits `call.incoming_call` to target users
- `call.accepted` → Emits `call.call_accepted` to all participants
- `call.rejected` → Emits `call.call_rejected` to all participants
- `call.ended` → Emits `call.call_ended` to all participants
- `call.participant.joined` → Emits `call.participant_joined`
- `call.participant.left` → Emits `call.participant_left`

### 4. Constants (`backend/libs/constant/`)

**RabbitMQ**:
```typescript
// Exchange
CALL_EVENTS: 'call.events'

// Routing Keys
CALL_STARTED, CALL_ACCEPTED, CALL_REJECTED, CALL_ENDED, 
CALL_PARTICIPANT_JOINED, CALL_PARTICIPANT_LEFT

// Queues
CALL_SERVICE_CALL_STARTED, REALTIME_CALL_STARTED, etc.
```

**Socket Events**:
```typescript
SOCKET_EVENTS.CALL = {
  INCOMING_CALL: 'call.incoming_call',
  CALL_ACCEPTED: 'call.call_accepted',
  CALL_REJECTED: 'call.call_rejected',
  CALL_ENDED: 'call.call_ended',
  PARTICIPANT_JOINED: 'call.participant_joined',
  PARTICIPANT_LEFT: 'call.participant_left',
}
```

## Frontend Implementation

### 1. Redux State Management (`frontend/src/redux/slices/callSlice.ts`)

**State Structure**:
```typescript
{
  callId: string | null
  roomId: string | null
  callType: 'DIRECT' | 'GROUP' | null
  mediaType: 'AUDIO' | 'VIDEO' | null
  status: 'idle' | 'outgoing' | 'incoming' | 'connected' | 'ended'
  participants: CallParticipant[]
  caller?: { userId, username, userAvatar }
  localAudioMuted: boolean
  localVideoMuted: boolean
  error: string | null
}
```

**Actions**:
- Async thunks: `startCall`, `acceptCall`, `rejectCall`, `endCall`
- Sync actions: `setIncomingCall`, `setCallConnected`, `addParticipant`, `removeParticipant`, `setCallEnded`, `resetCall`, `toggleLocalAudio`, `toggleLocalVideo`

### 2. Agora Hook (`frontend/src/hooks/useAgoraCall.ts`)

**Purpose**: Manages Agora RTC client lifecycle.

**Key Features**:
- Creates Agora client with `mode: 'rtc'`, `codec: 'vp8'`
- Joins channel with token
- Creates and publishes local audio/video tracks
- Subscribes to remote users automatically
- Handles user-joined/left events
- Provides toggle functions for mute/unmute
- Cleanup on unmount

**Usage**:
```typescript
const agora = useAgoraCall({
  appId: VITE_AGORA_APP_ID,
  channelName: roomId,
  token: agoraToken,
  userId: currentUserId,
})

await agora.joinChannel()
await agora.createLocalTracks(true, true) // audio, video
```

### 3. UI Components

**IncomingCallDialog** (`frontend/src/components/call/IncomingCallDialog.tsx`):
- Shows when `status === 'incoming'`
- Displays caller info (avatar, name)
- Accept/Reject buttons
- Triggers Redux actions on button click

**CallModal** (`frontend/src/components/call/CallModal.tsx`):
- Shows when `status === 'connected' || 'outgoing'`
- Video grid layout (local + remote users)
- Control buttons: Mute, Video toggle, End call
- Integrates with `useAgoraCall` hook
- Plays local/remote video tracks in refs

### 4. Socket Integration (`frontend/src/App.tsx`)

**Event Listeners**:
```typescript
socket.on('call.incoming_call', (data) => {
  dispatch(setIncomingCall(data))
})

socket.on('call.call_accepted', (data) => {
  dispatch(setCallConnected(data)) // Includes token!
})

socket.on('call.call_rejected', () => {
  dispatch(setCallEnded())
})

socket.on('call.call_ended', () => {
  dispatch(setCallEnded())
})
```

## Call Flow Diagrams

### 1-1 Call Flow

```
User A (Caller)                 Backend                    User B (Callee)
     │                              │                              │
     │  1. Click "Call" button      │                              │
     │──────────────────────────────▶                              │
     │  POST /call/start            │                              │
     │  {targetUserIds: [B]}        │                              │
     │                              │                              │
     │                        RabbitMQ: call.started               │
     │                              │                              │
     │                         Call Service                        │
     │                        • Generate token                     │
     │                        • Create callId                      │
     │                              │                              │
     │                    RabbitMQ: call.started                   │
     │                   {callId, roomId, token}                   │
     │                              │                              │
     │                      Realtime Gateway                       │
     │                              │                              │
     │                              │  Socket: incoming_call       │
     │                              ├─────────────────────────────▶│
     │                              │                              │
     │                              │         2. User B sees       │
     │                              │         IncomingCallDialog   │
     │                              │                              │
     │                              │  3. Click "Accept"           │
     │                              │◀─────────────────────────────│
     │                              │  POST /call/accept           │
     │                              │  {callId, roomId}            │
     │                              │                              │
     │                    RabbitMQ: call.accepted                  │
     │                              │                              │
     │                         Call Service                        │
     │                      • Generate token for B                 │
     │                              │                              │
     │                 RabbitMQ: call.accepted                     │
     │               {callId, roomId, token, userId}               │
     │                              │                              │
     │  Socket: call_accepted       │  Socket: call_accepted       │
     │◀─────────────────────────────┼─────────────────────────────▶│
     │  {token for A}               │  {token for B}               │
     │                              │                              │
     │  4. Join Agora with token    │  5. Join Agora with token    │
     │  • Create local tracks       │  • Create local tracks       │
     │  • Publish to room           │  • Publish to room           │
     │                              │                              │
     ◀═════════════ AGORA RTC CONNECTION (P2P or relayed) ════════▶
     │                                                              │
     │  6. Video/Audio streams                                     │
     ◀──────────────────────────────────────────────────────────────▶
```

### Group Call Flow

Similar to 1-1, but:
- `targetUserIds` contains multiple users
- `roomId` = `conversationId` (group chat ID)
- Each participant gets their own token when they accept
- Agora handles multi-party RTC automatically

## Environment Variables

### Backend (`.env`)
```env
AGORA_APP_ID=98bdf0b44c07441d8a143720963500f2
AGORA_APP_CERTIFICATE=1900cd1671234c6d9b5a7f989151f1cf
DATABASE_URL=postgresql://user:password@localhost:5432/dacs_db
REDIS_HOST=localhost
REDIS_PORT=6379
RABBITMQ_URI=amqp://user:user@localhost:5672
JWT_SECRET=your_jwt_secret_key
```

### Frontend (`.env`)
```env
VITE_AGORA_APP_ID=98bdf0b44c07441d8a143720963500f2
VITE_API_ROOT=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3001/realtime
```

## Running the Application

### Prerequisites
- Node.js (v18+)
- PostgreSQL
- Redis
- RabbitMQ

### Start Backend Services
```bash
cd backend

# Install dependencies
npm install

# Start all services (in separate terminals)
npm run start:dev              # API Gateway (port 3000)
npm run start call             # Call Service (port 3004)
npm run start realtime-gateway # Realtime Gateway (port 3001)
npm run start chat             # Chat Service
npm run start notification     # Notification Service
npm run start user             # User Service
```

### Start Frontend
```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev  # Usually port 5173
```

### Testing

1. Open two browser windows (or incognito + regular)
2. Login as two different users
3. In User A's window, start a call to User B
4. In User B's window, accept the incoming call
5. Verify video/audio streams are working
6. Test mute/unmute, video toggle, end call

## Security Considerations

✅ **Implemented**:
- Agora tokens generated server-side only
- APP_CERTIFICATE never exposed to frontend
- JWT authentication on all API endpoints
- Token expiry enforced (3600s)
- Socket authentication with JWT
- Redis-backed user session management

⚠️ **Additional Recommendations**:
- Rate limiting on call endpoints (already have CustomRateLimitGuard)
- Implement call history persistence with Prisma
- Add call duration limits
- Implement call recording with consent
- Add STUN/TURN server configuration for firewall traversal

## Troubleshooting

### Issue: Token generation fails
- Check `AGORA_APP_ID` and `AGORA_APP_CERTIFICATE` in backend `.env`
- Verify Call Service is running

### Issue: No incoming call notification
- Check RabbitMQ is running and accessible
- Verify Realtime Gateway is connected to RabbitMQ
- Check socket connection in browser DevTools

### Issue: Video not displaying
- Check browser permissions for camera/microphone
- Verify Agora SDK is loaded (check console)
- Check token validity
- Try different browser/device

### Issue: One-way audio/video
- Check firewall settings
- Verify both users have proper permissions
- Check Agora dashboard for connection logs

## Future Enhancements

- [ ] Call history persistence
- [ ] Screen sharing
- [ ] Chat during call
- [ ] Call recording
- [ ] Virtual backgrounds
- [ ] Noise cancellation
- [ ] Beauty filters
- [ ] Call quality indicators
- [ ] Network quality monitoring
- [ ] Fallback to audio-only on poor network
- [ ] Push notifications for missed calls
- [ ] Call scheduling
- [ ] Waiting room for group calls

## Dependencies

### Backend
- `agora-token@2.0.5` - Token generation
- `@golevelup/nestjs-rabbitmq` - RabbitMQ integration
- `@nestjs/websockets` - Socket.io server
- `socket.io` - WebSocket communication

### Frontend
- `agora-rtc-sdk-ng@4.24.2` - Agora RTC client
- `@reduxjs/toolkit` - State management
- `socket.io-client` - WebSocket client
- `lucide-react` - Icons

## References

- [Agora RTC Documentation](https://docs.agora.io/en/video-calling/overview/product-overview)
- [Agora Token Server](https://github.com/AgoraIO/Tools/tree/master/DynamicKey/AgoraDynamicKey)
- [NestJS Microservices](https://docs.nestjs.com/microservices/basics)
- [Socket.io Documentation](https://socket.io/docs/v4/)
