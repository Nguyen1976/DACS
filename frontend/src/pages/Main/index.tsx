import InComeMessage from './InComeMessage'
import OutMessage from './OutMessage'

const Main = () => {
  return (
    <>
      <div className='flex h-screen overflow-hidden bg-gray-50'>
        {/* Left sidebar */}
        <div className='w-72 bg-white border-r border-gray-200 flex flex-col'>
          <header className='p-4 border-b border-gray-200 bg-indigo-600 text-white'>
            <div className='flex items-center justify-between'>
              <h1 className='text-xl font-semibold'>Chat Web</h1>
              <button
                className='p-2 rounded hover:bg-white/10'
                title='New chat'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  fill='currentColor'
                  className='w-5 h-5'
                >
                  <path d='M12 4.5a.75.75 0 01.75.75V11h5.75a.75.75 0 010 1.5H12.75v5.75a.75.75 0 01-1.5 0V12.5H5.5a.75.75 0 010-1.5h5.75V5.25A.75.75 0 0112 4.5z' />
                </svg>
              </button>
            </div>
            <div className='mt-3 flex gap-2'>
              <button className='px-3 py-1.5 rounded-full text-sm bg-white/20'>
                Tất cả
              </button>
              <button className='px-3 py-1.5 rounded-full text-sm hover:bg-white/10'>
                Chưa đọc
              </button>
            </div>
            <div className='mt-3 relative'>
              <input
                className='w-full rounded-full bg-white/95 text-gray-700 placeholder-gray-400 px-10 py-2 outline-none'
                placeholder='Tìm kiếm'
              />
              <svg
                className='absolute left-3 top-2.5 w-5 h-5 text-gray-400'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M21 21l-4.35-4.35M16.65 16.65A7.5 7.5 0 101.5 9a7.5 7.5 0 0015.15 7.65z'
                />
              </svg>
            </div>
          </header>
          <div className='overflow-y-auto p-2 space-y-1'>
            {[
              {
                name: 'Alice',
                msg: 'Hoorayy!!',
                avatar:
                  'https://placehold.co/200x/ffa8e4/ffffff.svg?text=ʕ•́ᴥ•̀ʔ&font=Lato',
                unread: 2,
              },
              {
                name: 'Martin',
                msg: 'Pizza was amazing 🍕',
                avatar:
                  'https://placehold.co/200x/ad922e/ffffff.svg?text=ʕ•́ᴥ•̀ʔ&font=Lato',
                unread: 0,
              },
              {
                name: 'Jack',
                msg: "Can't stop laughing!",
                avatar:
                  'https://placehold.co/200x/30916c/ffffff.svg?text=ʕ•́ᴥ•̀ʔ&font=Lato',
                unread: 1,
              },
            ].map((c) => (
              <div
                key={c.name}
                className='flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer'
              >
                <img
                  src={c.avatar}
                  className='w-11 h-11 rounded-full'
                  alt={c.name}
                />
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center justify-between'>
                    <p className='font-medium text-gray-900 truncate'>
                      {c.name}
                    </p>
                    {c.unread ? (
                      <span className='ml-2 text-[11px] bg-indigo-600 text-white rounded-full px-1.5 py-0.5'>
                        {c.unread}
                      </span>
                    ) : null}
                  </div>
                  <p className='text-sm text-gray-500 truncate'>{c.msg}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center chat area */}
        <div className='flex-1 relative flex flex-col min-w-0'>
          <header className='bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between'>
            <div>
              <h2 className='text-lg font-semibold text-gray-800'>
                NCKH_1_2025_2026_GRAP...
              </h2>
              <p className='text-xs text-gray-500'>
                4 thành viên • Liên kết nhóm
              </p>
            </div>
            <div className='flex items-center gap-2'>
              <button
                className='p-2 rounded hover:bg-gray-100'
                title='Tìm kiếm'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth='1.5'
                  stroke='currentColor'
                  className='w-5 h-5'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M21 21l-4.35-4.35M16.65 16.65A7.5 7.5 0 101.5 9a7.5 7.5 0 0015.15 7.65z'
                  />
                </svg>
              </button>
              <button
                className='p-2 rounded hover:bg-gray-100'
                title='Gọi thoại'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  fill='currentColor'
                  className='w-5 h-5'
                >
                  <path d='M2.25 6.75A2.25 2.25 0 014.5 4.5h3.586a2.25 2.25 0 011.59.659l2.915 2.915a2.25 2.25 0 010 3.182l-1.06 1.06a.75.75 0 000 1.06l3.54 3.54a.75.75 0 001.06 0l1.06-1.06a2.25 2.25 0 013.182 0l2.915 2.915c.42.42.659.99.659 1.59V19.5A2.25 2.25 0 0121.75 21.75h-1.5a18.75 18.75 0 01-18-18v-1.5z' />
                </svg>
              </button>
              <button
                className='p-2 rounded hover:bg-gray-100'
                title='Gọi video'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  fill='currentColor'
                  className='w-5 h-5'
                >
                  <path d='M15.75 7.5A2.25 2.25 0 0118 9.75v4.5A2.25 2.25 0 0115.75 16.5H6.75A2.25 2.25 0 014.5 14.25v-4.5A2.25 2.25 0 016.75 7.5h9z' />
                  <path d='M19.5 8.25l3.75-1.5v10.5l-3.75-1.5v-7.5z' />
                </svg>
              </button>
              <button className='p-2 rounded hover:bg-gray-100' title='Thêm'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  fill='currentColor'
                  className='w-5 h-5'
                >
                  <path d='M12 6.75a.75.75 0 01.75.75v3.75H16.5a.75.75 0 010 1.5h-3.75V16.5a.75.75 0 01-1.5 0v-3.75H7.5a.75.75 0 010-1.5h3.75V7.5a.75.75 0 01.75-.75z' />
                </svg>
              </button>
            </div>
          </header>

          <div className='flex-1 overflow-y-auto px-4 py-4 space-y-3'>
            {/* Pinned message */}
            <div className='bg-blue-50 border border-blue-100 text-blue-700 text-sm px-3 py-2 rounded-lg'>
              Nhớ họp lúc 8pm thứ 4 (17/12) dùng link ở đầu nhóm.
            </div>

            {/* Date divider */}
            <div className='flex items-center gap-3 py-2'>
              <div className='flex-1 h-px bg-gray-200'></div>
              <span className='text-xs text-gray-500'>Hôm nay</span>
              <div className='flex-1 h-px bg-gray-200'></div>
            </div>

            {/* Messages */}
            <InComeMessage
              name='Nguyễn Lệ Thu'
              text='Mình online meeting thứ 5 này nhé'
              time='11:09'
              reactions={[{ emoji: '❤️', count: 3 }]}
            />
            <InComeMessage
              text='Vậy mình online meeting lúc 8pm, ngày 17/12 nhé'
              time='11:22'
            />
            <OutMessage
              text='Dạ vâng ạ'
              time='11:22'
              reactions={[{ emoji: '👍', count: 1 }]}
            />
            <InComeMessage
              name='Quân CNTT4'
              text='Vâng ạ'
              time='Hôm nay 12:38'
              reactions={[{ emoji: '❤️', count: 1 }]}
            />
          </div>

          <footer className='bg-white border-t border-gray-200 px-3 py-3'>
            <div className='flex items-center gap-2'>
              <button
                className='p-2 rounded hover:bg-gray-100'
                title='Đính kèm'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  fill='currentColor'
                  className='w-5 h-5 text-gray-600'
                >
                  <path d='M18.364 5.636a4.5 4.5 0 00-6.364 0L4.5 13.136a3 3 0 104.243 4.243l6.01-6.01a1.5 1.5 0 00-2.121-2.122L7.5 14.378' />
                </svg>
              </button>
              <div className='flex-1 flex items-center bg-gray-100 rounded-full px-3'>
                <input
                  type='text'
                  placeholder='Nhập tin nhắn...'
                  className='flex-1 bg-transparent py-2 outline-none text-gray-800'
                />
                <button
                  className='p-2 rounded hover:bg-gray-200'
                  title='Biểu tượng'
                >
                  <span>😊</span>
                </button>
                <button
                  className='p-2 rounded hover:bg-gray-200'
                  title='Ghi âm'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='currentColor'
                    className='w-5 h-5 text-gray-600'
                  >
                    <path d='M12 3.75a3 3 0 00-3 3v6a3 3 0 006 0v-6a3 3 0 00-3-3z' />
                    <path d='M5.25 12a.75.75 0 011.5 0 5.25 5.25 0 0010.5 0 .75.75 0 011.5 0 6.75 6.75 0 01-6 6.708V21h2.25a.75.75 0 010 1.5H9.75a.75.75 0 010-1.5H12v-2.292A6.75 6.75 0 015.25 12z' />
                  </svg>
                </button>
              </div>
              <button className='bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-500'>
                Gửi
              </button>
            </div>
          </footer>
        </div>

        {/* Right info panel */}
        <aside className='hidden lg:block w-80 bg-white border-l border-gray-200 p-4 space-y-4'>
          <div>
            <h3 className='text-sm font-semibold text-gray-700'>
              Thông tin nhóm
            </h3>
            <div className='mt-3 flex -space-x-2'>
              {['ffa8e4', 'ad922e', '30916c', 'b7a8ff'].map((c, i) => (
                <img
                  key={i}
                  src={`https://placehold.co/200x/${c}/ffffff.svg?text=ʕ•́ᴥ•̀ʔ&font=Lato`}
                  alt='member'
                  className='w-9 h-9 rounded-full border-2 border-white'
                />
              ))}
            </div>
          </div>
          <div>
            <h3 className='text-sm font-semibold text-gray-700'>
              Liên kết tham gia
            </h3>
            <div className='mt-2 flex items-center justify-between bg-gray-50 border border-gray-200 rounded-md px-3 py-2'>
              <span className='text-xs text-gray-600 truncate'>
                zalo.me/g/obelki255
              </span>
              <button className='text-indigo-600 text-xs font-medium'>
                Sao chép
              </button>
            </div>
          </div>
          <div>
            <h3 className='text-sm font-semibold text-gray-700'>Ghi chú</h3>
            <ul className='mt-2 space-y-2 text-sm text-gray-600'>
              <li>• Danh sách nhắc hẹn</li>
              <li>• Ghi chú, ghim, bình chọn</li>
            </ul>
          </div>
          <div>
            <h3 className='text-sm font-semibold text-gray-700'>Ảnh/Video</h3>
            <div className='mt-2 grid grid-cols-3 gap-2'>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className='aspect-square bg-gray-100 rounded-md'
                ></div>
              ))}
            </div>
          </div>
          <div>
            <h3 className='text-sm font-semibold text-gray-700'>File</h3>
            <div className='mt-2 space-y-2 text-sm text-gray-600'>
              <div className='flex items-center justify-between'>
                <span>GridSearchHyperTuningParamters.pdf</span>
                <span className='text-xs text-gray-400'>2.33 MB</span>
              </div>
              <div className='flex items-center justify-between'>
                <span>Luudothuatoan.pdf</span>
                <span className='text-xs text-gray-400'>105.25 KB</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  )
}

export default Main
