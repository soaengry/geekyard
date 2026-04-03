import { FC, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { getWatchedStatistics } from '../api/watchedApi'
import type { WatchedStatistics } from '../../anime/types'

const CHART_COLORS = [
  '#A252C2', '#F5A623', '#4A90E2', '#27AE60', '#E74C3C',
  '#8E44AD', '#E67E22', '#2980B9', '#16A085', '#C0392B',
  '#9B59B6', '#F39C12',
]

const WatchedStatisticsPage: FC = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState<WatchedStatistics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getWatchedStatistics()
        setStats(data)
      } catch {
        toast.error('통계 데이터를 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  if (loading) {
    return (
      <div className="watched-statistics-page max-w-2xl mx-auto">
        <div className="watched-statistics-title flex items-center gap-2 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="watched-statistics-back text-subtle hover:text-content transition-colors"
          >
            &lt;
          </button>
          <h1 className="text-2xl font-bold text-content">본 작품 통계</h1>
        </div>
        <div className="watched-statistics-loading space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-xl bg-content/10" />
          ))}
        </div>
      </div>
    )
  }

  if (!stats) return null

  const hasData = stats.monthlyCounts.some((m) => m.count > 0)

  if (!hasData) {
    return (
      <div className="watched-statistics-page max-w-2xl mx-auto">
        <div className="watched-statistics-title flex items-center gap-2 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="watched-statistics-back text-subtle hover:text-content transition-colors"
          >
            &lt;
          </button>
          <h1 className="text-2xl font-bold text-content">본 작품 통계</h1>
        </div>
        <p className="watched-statistics-empty text-center text-subtle text-sm py-12">
          아직 시청 기록이 없습니다.
        </p>
      </div>
    )
  }

  // Format month labels: "2026-03" → "3월"
  const monthlyData = stats.monthlyCounts.map((m) => ({
    ...m,
    label: `${parseInt(m.month.split('-')[1])}월`,
  }))

  return (
    <div className="watched-statistics-page max-w-2xl mx-auto">
      <h1 className="watched-statistics-title text-2xl font-bold text-content mb-6">
        본 작품 통계
      </h1>

      {/* Monthly watch count - Bar chart */}
      <section className="watched-statistics-monthly bg-surface rounded-xl border border-content/10 p-4 mb-4">
        <h2 className="watched-statistics-section-title text-base font-semibold text-content mb-4">
          월별 시청 횟수
        </h2>
        <div className="watched-statistics-bar-chart w-full h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-content, #888)" opacity={0.15} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: 'var(--color-subtle, #888)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: 'var(--color-subtle, #888)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-surface, #fff)',
                  border: '1px solid var(--color-content, #333)',
                  borderRadius: 8,
                  fontSize: 13,
                }}
              />
              <Bar dataKey="count" name="시청 수" fill="#A252C2" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Genre ratio - Donut chart */}
      {stats.genreRatios.length > 0 && (
        <section className="watched-statistics-genre bg-surface rounded-xl border border-content/10 p-4 mb-4">
          <h2 className="watched-statistics-section-title text-base font-semibold text-content mb-4">
            장르별 시청 비율
          </h2>
          <div className="watched-statistics-pie-chart w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.genreRatios}
                  dataKey="count"
                  nameKey="genre"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                >
                  {stats.genreRatios.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-surface, #fff)',
                    border: '1px solid var(--color-content, #333)',
                    borderRadius: 8,
                    fontSize: 13,
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* Genre avg rating - Horizontal bar list */}
      {stats.genreAvgRatings.length > 0 && (
        <section className="watched-statistics-rating bg-surface rounded-xl border border-content/10 p-4 mb-4">
          <h2 className="watched-statistics-section-title text-base font-semibold text-content mb-4">
            장르별 평균 평점
          </h2>
          <div className="watched-statistics-rating-list space-y-2.5">
            {stats.genreAvgRatings.map((item) => (
              <div key={item.genre} className="watched-statistics-rating-item flex items-center gap-3">
                <span className="watched-statistics-rating-genre text-sm text-content w-20 shrink-0 truncate">
                  {item.genre}
                </span>
                <div className="watched-statistics-rating-bar flex-1 h-5 bg-content/10 rounded-full overflow-hidden">
                  <div
                    className="watched-statistics-rating-fill h-full bg-secondary rounded-full transition-all"
                    style={{ width: `${(item.avgRating / 5) * 100}%` }}
                  />
                </div>
                <span className="watched-statistics-rating-value text-sm font-medium text-content w-10 text-right">
                  {item.avgRating}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default WatchedStatisticsPage
