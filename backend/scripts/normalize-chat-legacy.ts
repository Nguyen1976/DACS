import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function normalizeConversationMemberRole() {
  await prisma.$runCommandRaw({
    update: 'conversationMember',
    updates: [
      {
        q: {
          $or: [
            { role: null },
            { role: { $exists: false } },
            { role: 'member' },
            { role: 'admin' },
            { role: 'owner' },
          ],
        },
        u: [
          {
            $set: {
              role: {
                $switch: {
                  branches: [
                    { case: { $eq: ['$role', 'admin'] }, then: 'ADMIN' },
                    { case: { $eq: ['$role', 'owner'] }, then: 'OWNER' },
                    { case: { $eq: ['$role', 'member'] }, then: 'MEMBER' },
                  ],
                  default: 'MEMBER',
                },
              },
            },
          },
        ],
        multi: true,
      },
    ],
  })
}

async function normalizeConversationDates() {
  await prisma.$runCommandRaw({
    update: 'conversation',
    updates: [
      {
        q: {
          $or: [{ updatedAt: null }, { updatedAt: { $exists: false } }],
        },
        u: [
          {
            $set: {
              updatedAt: {
                $ifNull: ['$createdAt', '$$NOW'],
              },
            },
          },
        ],
        multi: true,
      },
      {
        q: {
          $or: [{ lastMessageAt: null }, { lastMessageAt: { $exists: false } }],
        },
        u: [
          {
            $set: {
              lastMessageAt: {
                $ifNull: ['$updatedAt', '$createdAt', '$$NOW'],
              },
            },
          },
        ],
        multi: true,
      },
    ],
  })
}

async function normalizeMessages() {
  await prisma.$runCommandRaw({
    update: 'message',
    updates: [
      {
        q: {
          $or: [{ type: null }, { type: { $exists: false } }],
        },
        u: [
          {
            $set: {
              type: 'TEXT',
            },
          },
        ],
        multi: true,
      },
      {
        q: {
          $or: [{ content: null }, { content: { $exists: false } }],
        },
        u: [
          {
            $set: {
              content: {
                $ifNull: ['$text', ''],
              },
            },
          },
        ],
        multi: true,
      },
      {
        q: {
          $or: [
            { clientMessageId: null },
            { clientMessageId: { $exists: false } },
          ],
        },
        u: [
          {
            $set: {
              clientMessageId: {
                $concat: ['legacy-', { $toString: '$_id' }],
              },
            },
          },
        ],
        multi: true,
      },
      {
        q: {
          $or: [{ updatedAt: null }, { updatedAt: { $exists: false } }],
        },
        u: [
          {
            $set: {
              updatedAt: {
                $ifNull: ['$createdAt', '$$NOW'],
              },
            },
          },
        ],
        multi: true,
      },
      {
        q: {
          $or: [{ isDeleted: null }, { isDeleted: { $exists: false } }],
        },
        u: [
          {
            $set: {
              isDeleted: false,
            },
          },
        ],
        multi: true,
      },
    ],
  })
}

async function normalizeConversationLastMessageType() {
  await prisma.$runCommandRaw({
    update: 'conversation',
    updates: [
      {
        q: {
          $or: [
            { lastMessageType: null },
            { lastMessageType: { $exists: false } },
          ],
        },
        u: [
          {
            $set: {
              lastMessageType: 'TEXT',
            },
          },
        ],
        multi: true,
      },
    ],
  })
}

async function main() {
  console.log('[normalize-chat-legacy] start')

  await normalizeConversationMemberRole()
  await normalizeConversationDates()
  await normalizeMessages()
  await normalizeConversationLastMessageType()

  console.log('[normalize-chat-legacy] done')
}

main()
  .catch((error) => {
    console.error('[normalize-chat-legacy] failed', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
