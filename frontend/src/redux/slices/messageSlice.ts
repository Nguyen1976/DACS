import authorizeAxiosInstance from '@/utils/authorizeAxios'
import { API_ROOT } from '@/utils/constant'
import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit'

export interface SenderMember {
  userId: string
  username: string
  avatar: string
}

export interface Message {
  id?: string
  conversationId: string
  senderId: string
  text: string
  replyToMessageId?: string | undefined
  isDeleted?: boolean
  deleteType?: string
  createdAt?: string
  senderMember?: SenderMember | undefined
  tempMessageId?: string | undefined
}

export interface MessageState {
  messages: Record<string, Message[]>
}

const initialState: MessageState = {
  messages: {},
}

export const getMessages = createAsyncThunk(
  `/chat/messages`,
  async ({
    conversationId,
    limit = 20,
    page = 1,
  }: {
    conversationId: string
    limit?: number
    page?: number
  }) => {
    const response = await authorizeAxiosInstance.get(
      `${API_ROOT}/chat/messages/${conversationId}?limit=${limit}&page=${page}`
    )
    return response.data.data
  }
)

export const messageSlice = createSlice({
  name: 'message',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Message>) => {
      const message = action.payload
      const list = state.messages[message.conversationId] || []
      
      if (message.tempMessageId) {
        for (const key in state.messages) {
          const msgs = state.messages[key]
          const index = msgs.findIndex(
            (m) => m.tempMessageId === message.tempMessageId
          )
          if (index !== -1) {
            msgs[index] = message
            return
          }
        }
      } else {
        list.push(message)
        state.messages[message.conversationId] = list
      }
      return state
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      getMessages.fulfilled,
      (
        state,
        action: PayloadAction<{ messages: Message[]; conversationId: string }>
      ) => {
        const { messages, conversationId } = action.payload
        const existing = state.messages[conversationId] || []
        state.messages[conversationId] = [...messages.reverse(), ...existing]
      }
    )
  },
})

export const selectMessage = (
  state: { message: MessageState },
  conversationId?: string
) => {
  if (!conversationId) return []
  const messageData = state.message.messages[conversationId]
  return messageData || []
}

export const { addMessage } = messageSlice.actions
export default messageSlice.reducer
