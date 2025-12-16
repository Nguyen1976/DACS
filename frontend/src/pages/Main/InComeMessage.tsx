type Reaction = { emoji: string; count?: number }
type InComeMessageProps = {
  avatarUrl?: string
  name?: string
  text?: string
  time?: string
  reactions?: Reaction[]
}

const InComeMessage = ({
  avatarUrl = 'https://placehold.co/200x/ffa8e4/ffffff.svg?text=ʕ•́ᴥ•̀ʔ&font=Lato',
  name,
  text = "Hey Bob, how's it going?",
  time = '11:22',
  reactions = [{ emoji: '❤️', count: 3 }],
}: InComeMessageProps) => {
  return (
    <div className='group flex items-end gap-2 mb-3'>
      <img
        src={avatarUrl}
        alt='User Avatar'
        className='w-8 h-8 rounded-full shrink-0'
      />
      <div>
        {name ? <div className='text-xs text-gray-500 mb-1'>{name}</div> : null}
        <div className='relative max-w-[70%] bg-white rounded-2xl rounded-tl-sm px-3 py-2 shadow-sm'>
          <p className='text-gray-800 leading-relaxed'>{text}</p>
          <div className='mt-1 flex items-center gap-2'>
            <span className='text-[11px] text-gray-400'>{time}</span>
            {reactions.length ? (
              <div className='flex items-center gap-1 text-[11px] bg-white border border-gray-200 rounded-full px-2 py-0.5 shadow-sm'>
                {reactions.map((r, i) => (
                  <span key={i} className='flex items-center gap-1'>
                    <span>{r.emoji}</span>
                    {r.count ? (
                      <span className='text-gray-500'>{r.count}</span>
                    ) : null}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
          <span className='absolute -left-1 top-2 w-2 h-2 bg-white rotate-45'></span>
        </div>
      </div>
      <button
        className='opacity-0 group-hover:opacity-100 transition text-gray-400 hover:text-gray-600 p-1 rounded'
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
    </div>
  )
}

export default InComeMessage
