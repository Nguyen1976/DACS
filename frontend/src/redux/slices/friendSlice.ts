import authorizeAxiosInstance from '@/utils/authorizeAxios'
import { API_ROOT } from '@/utils/constant'
import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'

export interface Friend {
  id: string
  email: string
  username: string
  avatar?: string
  fullName?: string
}

export interface FriendState {
  page: number
  friends: Array<Friend>
}

const initialState: FriendState = {
  page: 1,
  friends: [],
}

export const getFriends = createAsyncThunk(
  `/user/list-friends`,
  async ({ limit, page }: { limit: number; page: number }) => {
    const response = await authorizeAxiosInstance.get(
      `${API_ROOT}/user/list-friends?limit=${limit}&page=${page}`,
    )
    return { ...response.data.data, page: page }
  },
)

export const friendSlice = createSlice({
  name: 'friend',
  initialState,
  reducers: {

  },
  extraReducers: (builder) => {
    builder.addCase(
      getFriends.fulfilled,
      (state, action: PayloadAction<FriendState>) => {
        //push thêm vào state

        state.friends = [...state.friends, ...action.payload.friends]
        state.page = action.payload.page
        return state
      },
    )
  },
})

// export const selectFriend = (state: { friend: FriendState }) => {
//   return state.friend.friends
// }

export const selectFriend = createSelector(
  (state: RootState) => state.friend,
  (friend) => friend.friends,
)

export const selectFriendPage = createSelector(
  (state: RootState) => state.friend,
  (friend) => friend.page,
)

// export const {} = friendSlice.actions
export default friendSlice.reducer
