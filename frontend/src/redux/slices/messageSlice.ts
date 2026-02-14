import authorizeAxiosInstance from '@/utils/authorizeAxios'
import { API_ROOT } from '@/utils/constant'
import {
  createAsyncThunk,
  createSelector,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit'
import type { RootState } from '../store'

export interface SenderMember {
  userId: string
  username: string
  fullName: string
  avatar: string
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  text: string
  replyToMessageId?: string | undefined
  isDeleted?: boolean
  deleteType?: string
  createdAt?: string
  senderMember?: SenderMember | undefined
  status?: 'sent' | 'pending'
  tempMessageId?: string
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
      `${API_ROOT}/chat/messages/${conversationId}?limit=${limit}&page=${page}`,
    )
    return response.data.data
  },
)

export const messageSlice = createSlice({
  name: 'message',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Message>) => {
      const message = action.payload
      //2 trường hợp 1 là emssage của mình 2 là message của họ
      //nhưng có vấn đề đó chính là khi message về có senđẻ member nhưng mình sẽ k biết được vì mình đang chx biết userId của mình
      //nhưng mình có thể dựa vào tempId nếu trong tempId có tồn tại trong list message thì đó sẽ là message của mình chỉ cần update trạng thái

      if (!state.messages[message.conversationId]) {
        state.messages[message.conversationId] = []
      }
      const currentMessages = state.messages[message.conversationId]
      //check trong message có message nào tồn tại id giống với tempId k
      const index = currentMessages.findIndex(
        (m) => m.id === message.tempMessageId,
      )
      if (index !== -1) {
        //messsage của mình
        currentMessages[index] = {
          ...currentMessages[index],
          ...message,
          status: 'sent',
        }
        return
      } else {
        //message của họ
        state.messages[message.conversationId].unshift(message)
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      getMessages.fulfilled,
      (state, action: PayloadAction<{ messages: Message[] }>) => {
        const { messages } = action.payload
        const conversationId = messages[0]?.conversationId
        if (!state.messages[conversationId || '']) {
          state.messages[conversationId || ''] = []
        }
        state.messages[conversationId || ''] = [
          ...messages,
          ...state.messages[conversationId || ''],
        ]
      },
    )
  },
})

export const selectMessage = createSelector(
  [
    (state: RootState) => state.message.messages,
    (_: RootState, conversationId?: string) => conversationId,
  ],
  (messagesMap, conversationId) => {
    if (!conversationId) return []
    const messages = messagesMap[conversationId]
    if (!messages) return []

    return [...messages].reverse()
  },
)

export const { addMessage } = messageSlice.actions
export default messageSlice.reducer
