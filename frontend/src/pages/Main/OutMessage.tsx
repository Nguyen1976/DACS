type Reaction = { emoji: string; count?: number }
type OutMessageProps = {
  avatarUrl?: string
  text?: string
  time?: string
  reactions?: Reaction[]
  status?: 'sent' | 'delivered' | 'seen'
}

const OutMessage = ({
  avatarUrl = 'https://placehold.co/200x/b7a8ff/ffffff.svg?text=ʕ•́ᴥ•̀ʔ&font=Lato',
  text = "Hi Alice! I'm good, just finished a great book. How about you?",
  time = '12:38',
  reactions = [],
  status = 'seen',
}: OutMessageProps) => {
  return (
    <div className='group flex justify-end items-end gap-2 mb-3'>
      <button
        className='opacity-0 group-hover:opacity-100 transition text-gray-400 hover:text-gray-600 p-1 rounded order-1'
        title='More'
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 24 24'
          fill='currentColor'
          className='w-4 h-4'
        >
          <path d='M6.75 12a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM13.5 12a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM21.75 12a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z' />
        </svg>
      </button>
      <div className='order-2'>
        <div className='relative max-w-[70%] bg-indigo-500 text-white rounded-2xl rounded-tr-sm px-3 py-2 shadow-sm'>
          <p className='leading-relaxed'>{text}</p>
          <div className='mt-1 flex items-center gap-2'>
            <span className='text-[11px] text-indigo-100'>{time}</span>
            {reactions.length ? (
              <div className='flex items-center gap-1 text-[11px] bg-indigo-400/30 border border-indigo-300/40 rounded-full px-2 py-0.5'>
                {reactions.map((r, i) => (
                  <span key={i} className='flex items-center gap-1'>
                    <span>{r.emoji}</span>
                    {r.count ? <span>{r.count}</span> : null}
                  </span>
                ))}
              </div>
            ) : null}
            <span className='text-[11px] text-indigo-100'>
              {status === 'seen'
                ? 'Đã xem'
                : status === 'delivered'
                ? 'Đã nhận'
                : 'Đã gửi'}
            </span>
          </div>
          <span className='absolute -right-1 top-2 w-2 h-2 bg-indigo-500 rotate-45'></span>
        </div>
      </div>
      <img
        src={avatarUrl}
        alt='My Avatar'
        className='w-8 h-8 rounded-full order-3'
      />
    </div>
  )
}

export default OutMessage
