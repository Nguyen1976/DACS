import authorizeAxiosInstance from '@/utils/authorizeAxios'
import { API_ROOT } from '@/utils/constant'
import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import type { Message } from './messageSlice'

export interface ConversationMember {
  userId: string
  /** timestamp (ms) */
  lastReadMessageId?: string
  lastReadAt?: string
  username?: string
  avatar?: string
}

export interface Conversation {
  id: string
  type: string
  unreadCount?: string
  groupName?: string | undefined
  groupAvatar?: string | undefined
  createdAt: string
  updatedAt?: string | undefined
  members: ConversationMember[]
  lastMessage: Message | null
}

export type ConversationState = Conversation[]

const initialState: ConversationState = []

export const getConversations = createAsyncThunk(
  `/chat/conversations`,
  async (
    { limit = 10, page = 1 }: { limit: number; page: number },
    { getState }
  ) => {
    const state = getState() as RootState
    const userId = state.user.id

    const response = await authorizeAxiosInstance.get(
      `${API_ROOT}/chat/conversations?limit=${limit}&page=${page}`
    )
    return { userId, conversations: response.data.data.conversations }
  }
)

export const createConversation = createAsyncThunk(
  `/chat/create`,
  async ({
    members,
    groupName,
  }: {
    members: ConversationMember[]
    groupName?: string
  }) => {
    const response = await authorizeAxiosInstance.post(
      `${API_ROOT}/chat/create`,
      {
        members,
        groupName,
      }
    )
    return response.data.data
  }
)

export const conversationSlice = createSlice({
  name: 'conversations',
  initialState,
  reducers: {
    addConversation: (
      state,
      action: PayloadAction<{ conversation: Conversation; userId: string }>
    ) => {
      const { conversation, userId } = action.payload
      state.unshift({
        ...conversation,
        groupName:
          conversation.type === 'DIRECT'
            ? conversation.members.find(
                (p: ConversationMember) => p.userId !== userId
              )?.username || ''
            : conversation.groupName,
        groupAvatar:
          conversation.type === 'DIRECT'
            ? conversation.members.find(
                (p: ConversationMember) => p.userId !== userId
              )?.avatar || ''
            : conversation.groupAvatar,
        lastMessage:
          conversation.lastMessage !== undefined
            ? conversation.lastMessage
            : null,
      })
    },
    updateNewMessage: (
      state,
      action: PayloadAction<{ conversationId: string; lastMessage: Message }>
    ) => {
      const { conversationId, lastMessage } = action.payload

      const updatedConversation = state.find((c) => c.id === conversationId)
      if (!updatedConversation) return state

      const newConversation = {
        ...updatedConversation,
        lastMessage,
      }

      return [newConversation, ...state.filter((c) => c.id !== conversationId)]
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(
        getConversations.fulfilled,
        (
          state: ConversationState,
          action: PayloadAction<{
            conversations: Conversation[]
            userId: string
          }>
        ) => {
          const { conversations, userId } = action.payload
          const oldState = state || []
          state = [
            ...oldState,
            ...(conversations?.map((c) => ({
              ...c,
              groupName:
                c.type === 'DIRECT'
                  ? c.members.find(
                      (p: ConversationMember) => p.userId !== userId
                    )?.username || ''
                  : c.groupName,
              groupAvatar:
                c.type === 'DIRECT'
                  ? c.members.find(
                      (p: ConversationMember) => p.userId !== userId
                    )?.avatar || ''
                  : c.groupAvatar,
              lastMessage: c.lastMessage !== undefined ? c.lastMessage : null,
            })) as Conversation[]),
          ]
          return state
        }
      )
      .addCase(
        createConversation.fulfilled,
        (state, action: PayloadAction<{ conversation: Conversation }>) => {
          const c = action.payload.conversation
          state.unshift({
            ...c,
            lastMessage: c.lastMessage !== undefined ? c.lastMessage : null,
          })
        }
      )
  },
})

export const selectConversation = createSelector(
  (state: RootState) => state.conversations,
  (conversations) => conversations
)

export const selectMessagesByConversationId = (
  state: {
    conversations: ConversationState
  },
  conversationId: string
) => {
  const conversation = state.conversations?.find((c) => c.id === conversationId)
  return conversation ? conversation.lastMessage : null
}

export const { addConversation, updateNewMessage } = conversationSlice.actions
export default conversationSlice.reducer
