import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const isBlank = (value?: string | null) => {
  return !value || value.trim() === ''
}

async function backfillConversationMemberProfiles() {
  const members = await prisma.conversationMember.findMany({
    where: {
      OR: [
        { username: null },
        { username: '' },
        { fullName: null },
        { fullName: '' },
        { avatar: null },
      ],
    },
    select: {
      conversationId: true,
      userId: true,
      username: true,
      fullName: true,
      avatar: true,
    },
  })

  if (members.length === 0) {
    console.log(
      '[backfill-conversation-member-profile] no member needs backfill',
    )
    return
  }

  const userIds = Array.from(new Set(members.map((member) => member.userId)))

  const users = await prisma.user.findMany({
    where: {
      id: {
        in: userIds,
      },
    },
    select: {
      id: true,
      username: true,
      fullName: true,
      avatar: true,
    },
  })

  const userById = new Map(users.map((user) => [user.id, user]))

  let updatedCount = 0
  let skippedNoUserCount = 0

  for (const member of members) {
    const user = userById.get(member.userId)
    if (!user) {
      skippedNoUserCount += 1
      continue
    }

    const data: {
      username?: string
      fullName?: string
      avatar?: string | null
    } = {}

    if (isBlank(member.username) && !isBlank(user.username)) {
      data.username = user.username
    }

    if (isBlank(member.fullName) && !isBlank(user.fullName)) {
      data.fullName = user.fullName
    }

    if (!member.avatar && user.avatar) {
      data.avatar = user.avatar
    }

    if (Object.keys(data).length === 0) {
      continue
    }

    await prisma.conversationMember.updateMany({
      where: {
        conversationId: member.conversationId,
        userId: member.userId,
      },
      data,
    })

    updatedCount += 1
  }

  console.log(
    `[backfill-conversation-member-profile] done: scanned=${members.length}, updated=${updatedCount}, skippedNoUser=${skippedNoUserCount}`,
  )
}

async function main() {
  console.log('[backfill-conversation-member-profile] start')
  await backfillConversationMemberProfiles()
  console.log('[backfill-conversation-member-profile] finished')
}

main()
  .catch((error) => {
    console.error('[backfill-conversation-member-profile] failed', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
