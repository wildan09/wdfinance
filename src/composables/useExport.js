import { ref } from 'vue'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { formatCurrency } from '@/utils/currency'
import { formatDate } from '@/utils/date'

export function useExport() {
  const exporting = ref(false)

  /**
   * Export transactions to PDF
   */
  async function exportPDF(transactions, stats, period = 'Laporan Keuangan') {
    exporting.value = true
    try {
      const doc = new jsPDF()

      // Header
      doc.setFillColor(15, 23, 42)
      doc.rect(0, 0, 210, 40, 'F')
      doc.setTextColor(110, 231, 183)
      doc.setFontSize(20)
      doc.text('WilDev Finance', 14, 18)
      doc.setTextColor(148, 163, 184)
      doc.setFontSize(10)
      doc.text(period, 14, 26)
      doc.text(`Dicetak: ${formatDate(new Date())}`, 14, 33)

      // Summary
      doc.setTextColor(30, 30, 30)
      doc.setFontSize(14)
      doc.text('Ringkasan', 14, 52)

      doc.setFontSize(11)
      doc.setTextColor(34, 197, 94)
      doc.text(`Total Pemasukan: ${formatCurrency(stats.income)}`, 14, 62)
      doc.setTextColor(239, 68, 68)
      doc.text(`Total Pengeluaran: ${formatCurrency(stats.expense)}`, 14, 70)
      doc.setTextColor(30, 30, 30)
      doc.text(`Selisih: ${formatCurrency(stats.net)}`, 14, 78)

      // Transactions table
      if (transactions.length > 0) {
        doc.setFontSize(14)
        doc.text('Detail Transaksi', 14, 94)

        doc.autoTable({
          startY: 100,
          head: [['Tanggal', 'Kategori', 'Catatan', 'Tipe', 'Jumlah']],
          body: transactions.map(t => [
            formatDate(t.date, 'DD/MM/YYYY'),
            t.category?.name || '-',
            t.note || '-',
            t.type === 'income' ? 'Masuk' : t.type === 'expense' ? 'Keluar' : 'Transfer',
            formatCurrency(t.amount)
          ]),
          styles: { fontSize: 8, cellPadding: 3 },
          headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255] },
          alternateRowStyles: { fillColor: [241, 245, 249] }
        })
      }

      // Category breakdown
      if (stats.byCategory && stats.byCategory.length > 0) {
        const finalY = doc.lastAutoTable?.finalY || 100
        if (finalY > 240) doc.addPage()
        const startY = finalY > 240 ? 20 : finalY + 15

        doc.setFontSize(14)
        doc.setTextColor(30, 30, 30)
        doc.text('Pengeluaran per Kategori', 14, startY)

        doc.autoTable({
          startY: startY + 8,
          head: [['Kategori', 'Jumlah Transaksi', 'Total', 'Persentase']],
          body: stats.byCategory.map(c => {
            const pct = stats.expense ? Math.round((c.total / stats.expense) * 100) : 0
            return [
              `${c.icon} ${c.name}`,
              c.count.toString(),
              formatCurrency(c.total),
              `${pct}%`
            ]
          }),
          styles: { fontSize: 8, cellPadding: 3 },
          headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255] },
          alternateRowStyles: { fillColor: [241, 245, 249] }
        })
      }

      doc.save(`WilDev_Finance_${formatDate(new Date(), 'YYYY-MM-DD')}.pdf`)
    } finally {
      exporting.value = false
    }
  }

  /**
   * Export transactions to Excel
   */
  async function exportExcel(transactions, stats, wallets = []) {
    exporting.value = true
    try {
      const wb = XLSX.utils.book_new()

      // Sheet 1: Ringkasan
      const summaryData = [
        ['WilDev Finance - Ringkasan'],
        [''],
        ['Total Pemasukan', stats.income],
        ['Total Pengeluaran', stats.expense],
        ['Selisih', stats.net],
        ['Jumlah Transaksi', transactions.length]
      ]
      const wsSum = XLSX.utils.aoa_to_sheet(summaryData)
      XLSX.utils.book_append_sheet(wb, wsSum, 'Ringkasan')

      // Sheet 2: Semua Transaksi
      const txData = transactions.map(t => ({
        'Tanggal': formatDate(t.date, 'DD/MM/YYYY'),
        'Tipe': t.type === 'income' ? 'Pemasukan' : t.type === 'expense' ? 'Pengeluaran' : 'Transfer',
        'Kategori': t.category?.name || '-',
        'Wallet': t.wallet?.name || '-',
        'Catatan': t.note || '-',
        'Jumlah': Number(t.amount)
      }))
      const wsTx = XLSX.utils.json_to_sheet(txData)
      XLSX.utils.book_append_sheet(wb, wsTx, 'Semua Transaksi')

      // Sheet 3: Per Kategori
      if (stats.byCategory && stats.byCategory.length > 0) {
        const catData = stats.byCategory.map(c => ({
          'Kategori': `${c.icon} ${c.name}`,
          'Jumlah Transaksi': c.count,
          'Total': c.total,
          'Persentase': stats.expense ? `${Math.round((c.total / stats.expense) * 100)}%` : '0%'
        }))
        const wsCat = XLSX.utils.json_to_sheet(catData)
        XLSX.utils.book_append_sheet(wb, wsCat, 'Per Kategori')
      }

      // Sheet 4: Per Wallet
      if (wallets.length > 0) {
        const walData = wallets.map(w => ({
          'Wallet': `${w.icon} ${w.name}`,
          'Tipe': w.type,
          'Saldo': Number(w.balance)
        }))
        const wsWal = XLSX.utils.json_to_sheet(walData)
        XLSX.utils.book_append_sheet(wb, wsWal, 'Per Wallet')
      }

      XLSX.writeFile(wb, `WilDev_Finance_${formatDate(new Date(), 'YYYY-MM-DD')}.xlsx`)
    } finally {
      exporting.value = false
    }
  }

  return { exporting, exportPDF, exportExcel }
}
