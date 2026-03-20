import axiosInstance from '../../../global/api/axiosInstance'
import { USER_ACTIVITY_ENDPOINTS } from '../../feed/feed.constants'
import type { WatchedCalendarItem, WatchedStatistics } from '../../anime/types'

export const getWatchedCalendar = async (
  year: number,
  month: number,
): Promise<WatchedCalendarItem[]> => {
  const response = await axiosInstance.get<{ data: WatchedCalendarItem[] }>(
    `${USER_ACTIVITY_ENDPOINTS.WATCHED_CALENDAR}?year=${year}&month=${month}`,
  )
  return response.data.data
}

export const getWatchedStatistics = async (): Promise<WatchedStatistics> => {
  const response = await axiosInstance.get<{ data: WatchedStatistics }>(
    USER_ACTIVITY_ENDPOINTS.WATCHED_STATISTICS,
  )
  return response.data.data
}
