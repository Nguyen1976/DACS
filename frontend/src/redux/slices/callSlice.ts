import authorizeAxiosInstance from '@/utils/authorizeAxios'
import { API_ROOT } from '@/utils/constant'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'

export interface CallParticipant {
  userId: string
  username: string
  userAvatar?: string
  token?: string
  isLocalUser?: boolean
}

export interface CallState {
  callId: string | null
  roomId: string | null
  callType: 'DIRECT' | 'GROUP' | null
  mediaType: 'AUDIO' | 'VIDEO' | null
  status: 'idle' | 'outgoing' | 'incoming' | 'connected' | 'ended'
  participants: CallParticipant[]
  caller?: {
    userId: string
    username: string
    userAvatar?: string
  }
  localAudioMuted: boolean
  localVideoMuted: boolean
  error: string | null
}

const initialState: CallState = {
  callId: null,
  roomId: null,
  callType: null,
  mediaType: null,
  status: 'idle',
  participants: [],
  localAudioMuted: false,
  localVideoMuted: false,
  error: null,
}

// Async thunks
export const startCall = createAsyncThunk(
  'call/start',
  async (payload: {
    targetUserIds: string[]
    conversationId?: string
    callType: 'DIRECT' | 'GROUP'
    mediaType: 'AUDIO' | 'VIDEO'
  }) => {
    const response = await authorizeAxiosInstance.post(`${API_ROOT}/call/start`, payload)
    return response.data
  },
)

export const acceptCall = createAsyncThunk(
  'call/accept',
  async (payload: { callId: string; roomId: string }) => {
    const response = await authorizeAxiosInstance.post(`${API_ROOT}/call/accept`, payload)
    return response.data
  },
)

export const rejectCall = createAsyncThunk(
  'call/reject',
  async (payload: { callId: string; roomId: string }) => {
    const response = await authorizeAxiosInstance.post(`${API_ROOT}/call/reject`, payload)
    return response.data
  },
)

export const endCall = createAsyncThunk(
  'call/end',
  async (payload: { callId: string; roomId: string; reason?: string }) => {
    const response = await authorizeAxiosInstance.post(`${API_ROOT}/call/end`, payload)
    return response.data
  },
)

export const callSlice = createSlice({
  name: 'call',
  initialState,
  reducers: {
    setIncomingCall: (
      state,
      action: PayloadAction<{
        callId: string
        roomId: string
        callerId: string
        callerName: string
        callerAvatar?: string
        callType: 'DIRECT' | 'GROUP'
        mediaType: 'AUDIO' | 'VIDEO'
      }>,
    ) => {
      state.callId = action.payload.callId
      state.roomId = action.payload.roomId
      state.callType = action.payload.callType
      state.mediaType = action.payload.mediaType
      state.status = 'incoming'
      state.caller = {
        userId: action.payload.callerId,
        username: action.payload.callerName,
        userAvatar: action.payload.callerAvatar,
      }
    },
    setCallConnected: (
      state,
      action: PayloadAction<{
        callId: string
        roomId: string
        userId: string
        username: string
        userAvatar?: string
        token: string
      }>,
    ) => {
      state.status = 'connected'
      const existingParticipant = state.participants.find(
        (p) => p.userId === action.payload.userId,
      )
      if (!existingParticipant) {
        state.participants.push({
          userId: action.payload.userId,
          username: action.payload.username,
          userAvatar: action.payload.userAvatar,
          token: action.payload.token,
        })
      }
    },
    addParticipant: (
      state,
      action: PayloadAction<{
        userId: string
        username: string
        userAvatar?: string
      }>,
    ) => {
      const exists = state.participants.find((p) => p.userId === action.payload.userId)
      if (!exists) {
        state.participants.push(action.payload)
      }
    },
    removeParticipant: (state, action: PayloadAction<{ userId: string }>) => {
      state.participants = state.participants.filter(
        (p) => p.userId !== action.payload.userId,
      )
    },
    setCallEnded: (state) => {
      state.status = 'ended'
    },
    resetCall: (state) => {
      return initialState
    },
    toggleLocalAudio: (state) => {
      state.localAudioMuted = !state.localAudioMuted
    },
    toggleLocalVideo: (state) => {
      state.localVideoMuted = !state.localVideoMuted
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(startCall.pending, (state) => {
        state.status = 'outgoing'
        state.error = null
      })
      .addCase(startCall.fulfilled, (state, action) => {
        // Call started, waiting for other party to accept
      })
      .addCase(startCall.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to start call'
        state.status = 'idle'
      })
      .addCase(acceptCall.fulfilled, (state) => {
        state.status = 'connected'
      })
      .addCase(acceptCall.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to accept call'
      })
      .addCase(rejectCall.fulfilled, (state) => {
        state.status = 'ended'
      })
      .addCase(endCall.fulfilled, (state) => {
        state.status = 'ended'
      })
  },
})

export const {
  setIncomingCall,
  setCallConnected,
  addParticipant,
  removeParticipant,
  setCallEnded,
  resetCall,
  toggleLocalAudio,
  toggleLocalVideo,
  setError,
} = callSlice.actions

export const selectCall = (state: RootState) => state.call

export default callSlice.reducer
