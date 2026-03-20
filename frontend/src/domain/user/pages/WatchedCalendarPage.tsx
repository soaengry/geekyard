import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { getWatchedCalendar } from '../api/watchedApi'
import WatchedDateModal from '../components/WatchedDateModal'
import type { WatchedCalendarItem } from '../../anime/types'

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const

const WatchedCalendarPage: FC = () => {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [items, setItems] = useState<WatchedCalendarItem[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const fetchCalendar = useCallback(async (y: number, m: number) => {
    setLoading(true)
    try {
      const data = await getWatchedCalendar(y, m)
      setItems(data)
    } catch {
      toast.error('캘린더 데이터를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCalendar(year, month)
  }, [year, month, fetchCalendar])

  const handlePrev = () => {
    if (month === 1) {
      setYear(year - 1)
      setMonth(12)
    } else {
      setMonth(month - 1)
    }
  }

  const handleNext = () => {
    if (month === 12) {
      setYear(year + 1)
      setMonth(1)
    } else {
      setMonth(month + 1)
    }
  }

  // Group items by date
  const itemsByDate = useMemo(() => {
    const map = new Map<string, WatchedCalendarItem[]>()
    for (const item of items) {
      const dateKey = item.date
      if (!map.has(dateKey)) map.set(dateKey, [])
      map.get(dateKey)!.push(item)
    }
    return map
  }, [items])

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1).getDay()
    const daysInMonth = new Date(year, month, 0).getDate()
    const cells: (number | null)[] = []
    for (let i = 0; i < firstDay; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(d)
    return cells
  }, [year, month])

  const formatDateKey = (day: number) => {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const selectedItems = selectedDate ? itemsByDate.get(selectedDate) ?? [] : []

  return (
    <div className="watched-calendar-page max-w-2xl mx-auto">
      <h1 className="watched-calendar-title text-2xl font-bold text-content mb-6">
        본 작품 캘린더
      </h1>

      <div className="watched-calendar-nav flex items-center justify-between mb-4">
        <button
          onClick={handlePrev}
          className="watched-calendar-prev p-2 text-subtle hover:text-content transition-colors"
        >
          ◀
        </button>
        <span className="watched-calendar-month text-lg font-semibold text-content">
          {year}년 {month}월
        </span>
        <button
          onClick={handleNext}
          className="watched-calendar-next p-2 text-subtle hover:text-content transition-colors"
        >
          ▶
        </button>
      </div>

      <div className="watched-calendar-grid bg-surface rounded-xl border border-content/10 overflow-hidden">
        <div className="watched-calendar-header grid grid-cols-7 border-b border-content/10">
          {DAY_LABELS.map((label, i) => (
            <div
              key={label}
              className={`watched-calendar-day-label text-center py-2 text-xs font-medium ${
                i === 0 ? 'text-error' : i === 6 ? 'text-accent' : 'text-subtle'
              }`}
            >
              {label}
            </div>
          ))}
        </div>

        {loading ? (
          <div className="watched-calendar-loading p-8 text-center text-subtle text-sm animate-pulse">
            불러오는 중...
          </div>
        ) : (
          <div className="watched-calendar-body grid grid-cols-7">
            {calendarDays.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="watched-calendar-cell-empty p-1 min-h-[80px]" />
              }
              const dateKey = formatDateKey(day)
              const dayItems = itemsByDate.get(dateKey)
              const dayOfWeek = idx % 7

              return (
                <button
                  key={day}
                  onClick={() => dayItems && setSelectedDate(dateKey)}
                  className={`watched-calendar-cell p-1 min-h-[80px] border-t border-r border-content/5 text-left transition-colors ${
                    dayItems ? 'hover:bg-content/5 cursor-pointer' : 'cursor-default'
                  }`}
                >
                  <span
                    className={`watched-calendar-day-number text-xs font-medium ${
                      dayOfWeek === 0 ? 'text-error' : dayOfWeek === 6 ? 'text-accent' : 'text-subtle'
                    }`}
                  >
                    {day}
                  </span>
                  {dayItems && (
                    <div className="watched-calendar-thumbnails mt-1 flex flex-wrap gap-0.5">
                      {dayItems.slice(0, 3).map((item) => (
                        item.animeImg ? (
                          <img
                            key={item.animeId}
                            src={item.animeImg}
                            alt={item.animeName}
                            className="watched-calendar-thumb w-5 h-7 rounded-sm object-cover"
                          />
                        ) : (
                          <div
                            key={item.animeId}
                            className="watched-calendar-thumb-placeholder w-5 h-7 rounded-sm bg-content/20"
                          />
                        )
                      ))}
                      {dayItems.length > 3 && (
                        <span className="watched-calendar-more text-[10px] text-subtle self-end">
                          +{dayItems.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {selectedDate && selectedItems.length > 0 && (
        <WatchedDateModal
          date={selectedDate}
          items={selectedItems}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  )
}

export default WatchedCalendarPage
