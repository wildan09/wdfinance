/**
 * Truncate text to specified length
 * @param {string} text
 * @param {number} maxLen
 * @returns {string}
 */
export function truncate(text, maxLen = 30) {
  if (!text) return ''
  return text.length > maxLen ? text.slice(0, maxLen) + '...' : text
}

/**
 * Get initials from a name
 * @param {string} name
 * @returns {string}
 */
export function getInitials(name) {
  if (!name) return '?'
  return name.split(' ')
    .filter(Boolean)
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Calculate percentage
 * @param {number} value
 * @param {number} total
 * @returns {number}
 */
export function calcPercent(value, total) {
  if (!total) return 0
  return Math.min(Math.round((value / total) * 100), 100)
}

/**
 * Generate a random color from a list of predefined colors
 * @returns {string}
 */
export function randomColor() {
  const colors = ['#34D399', '#F87171', '#FBBF24', '#60A5FA', '#A78BFA', '#F472B6', '#FB923C']
  return colors[Math.floor(Math.random() * colors.length)]
}

/**
 * Debounce function
 * @param {Function} fn
 * @param {number} delay
 * @returns {Function}
 */
export function debounce(fn, delay = 300) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

/**
 * Generate a unique ID
 * @returns {string}
 */
export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

/**
 * Wallet type labels in Indonesian
 */
export const walletTypeLabels = {
  cash: 'Tunai',
  bank: 'Bank',
  ewallet: 'E-Wallet',
  investment: 'Investasi',
  other: 'Lainnya'
}

/**
 * Get wallet type label
 * @param {string} type
 * @returns {string}
 */
export function getWalletTypeLabel(type) {
  return walletTypeLabels[type] || type
}
