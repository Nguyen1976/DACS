import authorizeAxiosInstance from '@/utils/authorizeAxios'
import { API_ROOT } from '@/utils/constant'

export const makeFriendRequest = async (
  email: string
): Promise<{ status: string }> => {
  const response = await authorizeAxiosInstance.post(
    `${API_ROOT}/user/make-friend`,
    { email }
  )
  return response.data
}

export const getFriendRequestDetail = async (friendRequestId: string) => {
  const response = await authorizeAxiosInstance.get(
    `${API_ROOT}/user/detail-friend-request?friendRequestId=${friendRequestId}`
  )
  return response.data.data
}

export const updateFriendRequestStatus = async ({
  inviterId,
  inviteeName,
  status,
}: {
  inviterId: string
  inviteeName: string
  status: 'ACCEPTED' | 'REJECTED'
}): Promise<{ status: string }> => {
  const response = await authorizeAxiosInstance.post(
    `${API_ROOT}/user/update-status-make-friend`,
    { inviterId, inviteeName, status }
  )
  return response.data
}
