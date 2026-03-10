/**
 * Format a number to Indonesian Rupiah currency format
 * @param {number} amount
 * @param {boolean} showSymbol - whether to show 'Rp' prefix
 * @returns {string}
 */
export function formatCurrency(amount, showSymbol = true) {
  if (amount === null || amount === undefined) return showSymbol ? 'Rp 0' : '0'
  const formatter = new Intl.NumberFormat('id-ID', {
    style: showSymbol ? 'currency' : 'decimal',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })
  return formatter.format(amount)
}

/**
 * Parse a formatted currency string back to number
 * @param {string} str
 * @returns {number}
 */
export function parseCurrency(str) {
  if (!str) return 0
  const cleaned = String(str).replace(/[^\d-]/g, '')
  return parseInt(cleaned, 10) || 0
}

/**
 * Format number with thousand separators
 * @param {number} num
 * @returns {string}
 */
export function formatNumber(num) {
  if (!num && num !== 0) return '0'
  return new Intl.NumberFormat('id-ID').format(num)
}
