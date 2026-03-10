import dayjs from 'dayjs'
import 'dayjs/locale/id'
import relativeTime from 'dayjs/plugin/relativeTime'
import isToday from 'dayjs/plugin/isToday'
import isYesterday from 'dayjs/plugin/isYesterday'

dayjs.extend(relativeTime)
dayjs.extend(isToday)
dayjs.extend(isYesterday)
dayjs.locale('id')

/**
 * Format date to Indonesian locale string
 * @param {string|Date} date
 * @param {string} format
 * @returns {string}
 */
export function formatDate(date, format = 'D MMMM YYYY') {
  return dayjs(date).format(format)
}

/**
 * Get relative date label (Hari ini, Kemarin, or formatted date)
 * @param {string|Date} date
 * @returns {string}
 */
export function getDateLabel(date) {
  const d = dayjs(date)
  if (d.isToday()) return 'Hari Ini'
  if (d.isYesterday()) return 'Kemarin'
  return d.format('D MMMM YYYY')
}

/**
 * Get greeting based on time of day
 * @returns {string}
 */
export function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 11) return 'Selamat Pagi'
  if (hour < 15) return 'Selamat Siang'
  if (hour < 18) return 'Selamat Sore'
  return 'Selamat Malam'
}

/**
 * Get relative time string
 * @param {string|Date} date
 * @returns {string}
 */
export function timeAgo(date) {
  return dayjs(date).fromNow()
}

/**
 * Get start and end of month
 * @param {number} month - 1-12
 * @param {number} year
 * @returns {{ start: string, end: string }}
 */
export function getMonthRange(month, year) {
  const start = dayjs().year(year).month(month - 1).startOf('month').format('YYYY-MM-DD')
  const end = dayjs().year(year).month(month - 1).endOf('month').format('YYYY-MM-DD')
  return { start, end }
}

/**
 * Get month name in Indonesian
 * @param {number} month - 1-12
 * @returns {string}
 */
export function getMonthName(month) {
  return dayjs().month(month - 1).format('MMMM')
}

export { dayjs }
