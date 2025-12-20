import React, { useState } from 'react'
import {
  Search,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Send,
  Mic,
  X,
  Bell,
  BellOff,
  Moon,
  Sun,
  FileText,
  Image as ImageIcon,
  UserPlus,
} from 'lucide-react'

// --- DỮ LIỆU GIẢ (MOCK DATA) ---
const USERS = [
  {
    id: 1,
    name: 'Yong Tonghyon',
    avatar: 'https://i.pravatar.cc/150?u=1',
    lastMsg: 'What makes it different from...',
    time: '11:32 AM',
    unread: 2,
    online: true,
  },
  {
    id: 2,
    name: 'Sarah Miller',
    avatar: 'https://i.pravatar.cc/150?u=2',
    lastMsg: 'The project deadline is approach...',
    time: '10:45 AM',
    unread: 0,
    online: true,
  },
  {
    id: 3,
    name: 'David Chen',
    avatar: 'https://i.pravatar.cc/150?u=3',
    lastMsg: 'Can we schedule a meeting f...',
    time: '9:20 AM',
    unread: 3,
    online: false,
  },
  {
    id: 4,
    name: 'Emma Thompson',
    avatar: 'https://i.pravatar.cc/150?u=4',
    lastMsg: 'I reviewed the proposal and...',
    time: '8:15 AM',
    unread: 0,
    online: false,
  },
  {
    id: 5,
    name: 'James Wilson',
    avatar: 'https://i.pravatar.cc/150?u=5',
    lastMsg: 'The client loved our presentation!',
    time: 'Yesterday',
    unread: 0,
    online: true,
  },
]

const MESSAGES = [
  {
    id: 1,
    sender: 'them',
    type: 'text',
    content: 'Check this out https://short.ly/ghiz82k',
    time: '10:45 AM',
  },
  { id: 2, sender: 'system', content: 'Video call ended · 13m 40s' },
  {
    id: 3,
    sender: 'them',
    type: 'text',
    content: 'Have you seen the latest updates?',
    time: '10:55 AM',
  },
  {
    id: 4,
    sender: 'me',
    type: 'text',
    content: 'Nope. Can you please upload it here?',
    time: '10:56 AM',
  },
  {
    id: 5,
    sender: 'them',
    type: 'file',
    content: 'CryptoCoin-Release.pdf',
    size: '12 mb',
    time: '10:57 AM',
  },
  {
    id: 6,
    sender: 'me',
    type: 'text',
    content: "Wait. I'm looking into it!",
    time: '10:58 AM',
  },
  {
    id: 7,
    sender: 'them',
    type: 'text',
    content: 'Let me know if it works or not?',
    time: '11:11 AM',
  },
  {
    id: 8,
    sender: 'me',
    type: 'text',
    content: 'I checked it. Yep, that works!',
    time: '11:13 AM',
  },
]

// --- COMPONENTS CON ---

// 1. Sidebar Trái (Danh sách chat)
const Sidebar = ({ isDarkMode, toggleTheme, onOpenNewChat }) => {
  return (
    <div
      className={`w-80 flex flex-col border-r ${
        isDarkMode ? 'bg-[#18181b] border-gray-800' : 'bg-white border-gray-200'
      }`}
    >
      {/* Header Sidebar */}
      <div className='p-4 flex justify-between items-center'>
        <h1
          className={`text-2xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          Chats
        </h1>
        <div className='flex gap-3'>
          <button
            onClick={toggleTheme}
            className='p-2 rounded-full hover:bg-gray-700/20 transition'
          >
            {isDarkMode ? (
              <Moon size={20} className='text-gray-400' />
            ) : (
              <Sun size={20} className='text-yellow-500' />
            )}
          </button>
          <button
            onClick={onOpenNewChat}
            className='p-2 rounded-full hover:bg-gray-700/20 transition'
          >
            <UserPlus
              size={20}
              className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}
            />
          </button>
        </div>
      </div>

      {/* User List */}
      <div className='flex-1 overflow-y-auto'>
        {USERS.map((user) => (
          <div
            key={user.id}
            className={`flex items-center p-4 cursor-pointer transition hover:bg-opacity-10 hover:bg-violet-500 ${
              user.id === 2
                ? 'bg-violet-500/10 border-l-4 border-violet-500'
                : ''
            }`}
          >
            <div className='relative'>
              <img
                src={user.avatar}
                alt={user.name}
                className='w-12 h-12 rounded-full object-cover'
              />
              {user.online && (
                <div className='absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#18181b]'></div>
              )}
            </div>
            <div className='ml-4 flex-1 overflow-hidden'>
              <div className='flex justify-between items-center mb-1'>
                <h3
                  className={`font-semibold truncate ${
                    isDarkMode ? 'text-gray-100' : 'text-gray-900'
                  }`}
                >
                  {user.name}
                </h3>
                <span
                  className={`text-xs ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`}
                >
                  {user.time}
                </span>
              </div>
              <p
                className={`text-sm truncate ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                {user.lastMsg}
              </p>
            </div>
            {user.unread > 0 && (
              <div className='ml-2 bg-violet-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full'>
                {user.unread}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// 2. Cửa sổ Chat Chính (Giữa)
const ChatWindow = ({ isDarkMode, onOpenProfile, onCall }) => {
  return (
    <div
      className={`flex-1 flex flex-col ${
        isDarkMode ? 'bg-[#0f0f13]' : 'bg-gray-50'
      }`}
    >
      {/* Chat Header */}
      <div
        className={`h-16 flex items-center justify-between px-6 border-b ${
          isDarkMode
            ? 'border-gray-800 bg-[#18181b]'
            : 'border-gray-200 bg-white'
        }`}
      >
        <div
          className='flex items-center cursor-pointer'
          onClick={onOpenProfile}
        >
          <img
            src={USERS[1].avatar}
            alt='Current User'
            className='w-10 h-10 rounded-full mr-3'
          />
          <div>
            <h2
              className={`font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Sarah Miller
            </h2>
            <p className='text-xs text-green-500'>Last seen recently</p>
          </div>
        </div>
        <div
          className={`flex gap-4 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          <Phone
            size={20}
            className='cursor-pointer hover:text-violet-500'
            onClick={onCall}
          />
          <Video size={20} className='cursor-pointer hover:text-violet-500' />
          <MoreVertical
            size={20}
            className='cursor-pointer hover:text-violet-500'
          />
        </div>
      </div>

      {/* Message List */}
      <div className='flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar'>
        {MESSAGES.map((msg) => {
          if (msg.sender === 'system') {
            return (
              <div key={msg.id} className='flex justify-center my-4'>
                <span
                  className={`text-xs px-3 py-1 rounded-full ${
                    isDarkMode
                      ? 'bg-gray-800 text-gray-400'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {msg.content}
                </span>
              </div>
            )
          }

          const isMe = msg.sender === 'me'
          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl p-4 ${
                  isMe
                    ? 'bg-violet-600 text-white rounded-br-none'
                    : isDarkMode
                    ? 'bg-[#1e1e24] text-gray-200 rounded-bl-none'
                    : 'bg-white text-gray-800 shadow-sm rounded-bl-none'
                }`}
              >
                {msg.type === 'file' ? (
                  <div className='flex items-center gap-3'>
                    <div className='p-2 bg-black/20 rounded-lg'>
                      <FileText size={24} />
                    </div>
                    <div>
                      <p className='font-medium text-sm'>{msg.content}</p>
                      <p className='text-xs opacity-70'>{msg.size}</p>
                    </div>
                  </div>
                ) : (
                  <p className='text-sm'>{msg.content}</p>
                )}
                <p
                  className={`text-[10px] mt-1 text-right ${
                    isMe ? 'text-violet-200' : 'text-gray-500'
                  }`}
                >
                  {msg.time}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Input Area */}
      <div className={`p-4 ${isDarkMode ? 'bg-[#18181b]' : 'bg-white'}`}>
        <div
          className={`flex items-center gap-2 p-2 rounded-xl ${
            isDarkMode ? 'bg-[#27272a]' : 'bg-gray-100'
          }`}
        >
          <Paperclip
            size={20}
            className='text-gray-400 cursor-pointer ml-2 hover:text-violet-500'
          />
          <input
            type='text'
            placeholder='Write a message...'
            className='flex-1 bg-transparent border-none focus:ring-0 text-sm px-2 outline-none'
            style={{ color: isDarkMode ? '#fff' : '#000' }}
          />
          <Smile
            size={20}
            className='text-gray-400 cursor-pointer hover:text-violet-500'
          />
          <button className='p-2 bg-violet-600 rounded-lg text-white hover:bg-violet-700 transition'>
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

// 3. User Profile (Bên phải)
const UserProfile = ({ isDarkMode, onClose }) => {
  return (
    <div
      className={`w-80 border-l flex flex-col ${
        isDarkMode ? 'bg-[#18181b] border-gray-800' : 'bg-white border-gray-200'
      }`}
    >
      <div className='p-4 flex justify-end'>
        <X
          size={24}
          className='cursor-pointer text-gray-400 hover:text-red-500'
          onClick={onClose}
        />
      </div>

      <div className='flex flex-col items-center px-6 pb-6 border-b border-gray-800'>
        <img
          src={USERS[1].avatar}
          alt='Profile'
          className='w-24 h-24 rounded-full mb-4 object-cover ring-4 ring-violet-600/20'
        />
        <h2
          className={`text-xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          Sarah Miller
        </h2>
        <p
          className={`text-sm mt-1 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}
        >
          Life is mirror, smile at it 😊
        </p>
      </div>

      <div className='p-6 space-y-6'>
        <div>
          <label className='text-xs font-semibold text-gray-500 uppercase'>
            Mobile
          </label>
          <p
            className={`text-sm font-medium mt-1 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            +1 (646) 266-2535
          </p>
        </div>

        {/* Options */}
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <BellOff size={18} className='text-gray-400' />
              <span
                className={`text-sm ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-700'
                }`}
              >
                Mute Chat
              </span>
            </div>
            <div className='w-10 h-5 bg-gray-700 rounded-full relative cursor-pointer'>
              <div className='w-3 h-3 bg-white rounded-full absolute top-1 left-1'></div>
            </div>
          </div>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='w-4 h-4 border border-gray-400 rounded-full flex items-center justify-center text-[10px]'>
                D
              </div>
              <span
                className={`text-sm ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-700'
                }`}
              >
                Disappearing Messages
              </span>
            </div>
            <div className='w-10 h-5 bg-violet-600 rounded-full relative cursor-pointer'>
              <div className='w-3 h-3 bg-white rounded-full absolute top-1 right-1'></div>
            </div>
          </div>
        </div>

        {/* Media */}
        <div>
          <label className='text-xs font-semibold text-gray-500 uppercase mb-3 block'>
            Media, Links and Docs
          </label>
          <div className='grid grid-cols-3 gap-2'>
            <div className='h-20 bg-gray-700 rounded-lg'></div>
            <div className='h-20 bg-gray-600 rounded-lg'></div>
            <div className='h-20 bg-gray-700 rounded-lg'></div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 4. Modal: Incoming Call
const CallModal = ({ onClose }) => {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm'>
      <div className='bg-[#1e1e24] p-8 rounded-2xl w-80 flex flex-col items-center shadow-2xl border border-gray-700 relative'>
        <button
          onClick={onClose}
          className='absolute top-4 right-4 text-gray-400 hover:text-white'
        >
          <X size={20} />
        </button>
        <div className='w-24 h-24 rounded-full p-1 border-2 border-violet-500 mb-4'>
          <img
            src={USERS[1].avatar}
            alt='Calling'
            className='w-full h-full rounded-full object-cover'
          />
        </div>
        <h3 className='text-xl font-bold text-white mb-1'>Sarah Miller</h3>
        <p className='text-violet-400 text-sm mb-8 animate-pulse'>
          Voice calling...
        </p>

        <div className='flex gap-6'>
          <button className='p-4 bg-gray-700 rounded-full text-white hover:bg-gray-600'>
            <Mic size={24} />
          </button>
          <button
            onClick={onClose}
            className='p-4 bg-red-500 rounded-full text-white hover:bg-red-600'
          >
            <Phone size={24} className='rotate-[135deg]' />
          </button>
          <button className='p-4 bg-gray-700 rounded-full text-white hover:bg-gray-600'>
            <MoreVertical size={24} />
          </button>
        </div>
      </div>
    </div>
  )
}

// 5. Modal: New Chat
const NewChatModal = ({ isDarkMode, onClose }) => {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
      <div
        className={`w-96 rounded-xl shadow-xl overflow-hidden ${
          isDarkMode ? 'bg-[#1e1e24]' : 'bg-white'
        }`}
      >
        <div className='p-4 border-b border-gray-700 flex justify-between items-center'>
          <h3
            className={`font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            New Chat
          </h3>
          <X
            size={20}
            className='cursor-pointer text-gray-500'
            onClick={onClose}
          />
        </div>
        <div className='p-4'>
          <div
            className={`flex items-center px-3 py-2 rounded-lg border ${
              isDarkMode
                ? 'bg-black/20 border-gray-700'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <Search size={18} className='text-gray-500 mr-2' />
            <input
              type='text'
              placeholder='Search users...'
              className='bg-transparent outline-none flex-1 text-sm text-gray-500'
            />
          </div>
          <div className='mt-4 space-y-3'>
            {['Alice Chen', 'Bob Smith', 'Carol Johnson'].map((name, i) => (
              <div
                key={i}
                className='flex items-center gap-3 p-2 hover:bg-gray-700/10 rounded-lg cursor-pointer'
              >
                <div className='w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold'>
                  {name[0]}
                </div>
                <span
                  className={`text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-800'
                  }`}
                >
                  {name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// --- APP CHÍNH ---
export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [showProfile, setShowProfile] = useState(true)
  const [isCalling, setIsCalling] = useState(false)
  const [showNewChat, setShowNewChat] = useState(false)

  const toggleTheme = () => setIsDarkMode(!isDarkMode)

  return (
    <div
      className={`h-screen w-full flex overflow-hidden font-sans ${
        isDarkMode ? 'dark' : ''
      }`}
    >
      {/* Sidebar */}
      <Sidebar
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        onOpenNewChat={() => setShowNewChat(true)}
      />

      {/* Main Chat Area */}
      <ChatWindow
        isDarkMode={isDarkMode}
        onOpenProfile={() => setShowProfile(true)}
        onCall={() => setIsCalling(true)}
      />

      {/* Right Profile Sidebar (Optional) */}
      {showProfile && (
        <div className='hidden lg:block'>
          <UserProfile
            isDarkMode={isDarkMode}
            onClose={() => setShowProfile(false)}
          />
        </div>
      )}

      {/* Modals */}
      {isCalling && <CallModal onClose={() => setIsCalling(false)} />}
      {showNewChat && (
        <NewChatModal
          isDarkMode={isDarkMode}
          onClose={() => setShowNewChat(false)}
        />
      )}
    </div>
  )
}
