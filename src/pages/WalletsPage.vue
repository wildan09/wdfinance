<template>
  <AppShell>
    <TopBar title="Dompet Saya" />
    <div class="px-5 pb-4 space-y-5">
      <div class="glass rounded-2xl p-5 text-center">
        <p class="text-xs text-muted mb-1">Total Saldo</p>
        <h2 class="text-2xl font-bold font-display gradient-text">{{ formatCurrency(totalBalance) }}</h2>
      </div>
      <SkeletonCard v-if="loading" :count="4" />
      <div v-else-if="wallets.length" class="grid grid-cols-2 gap-3">
        <div v-for="w in wallets" :key="w.id" @click="openDetail(w)"
          class="rounded-2xl p-4 cursor-pointer hover:scale-[1.02] transition-transform"
          :style="{background:`linear-gradient(135deg,${w.color}15,${w.color}08)`,border:`1px solid ${w.color}25`}">
          <div class="flex items-center justify-between mb-3">
            <span class="text-2xl">{{ w.icon }}</span>
            <span class="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-muted">{{ getWalletTypeLabel(w.type) }}</span>
          </div>
          <p class="text-xs text-muted truncate">{{ w.name }}</p>
          <p class="text-sm font-bold mt-0.5" :class="Number(w.balance)>=0?'text-text':'text-expense'">{{ formatCurrency(w.balance) }}</p>
        </div>
      </div>
      <EmptyState v-else icon="💳" title="Belum ada wallet" description="Buat wallet pertamamu." actionLabel="Buat Wallet" @action="showForm=true" />
    </div>
    <button @click="showForm=true" class="fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-2xl text-bg shadow-lg shadow-primary/30 hover:scale-105 transition-transform btn-press z-40" style="right:max(1rem,calc((100vw - 430px)/2 + 1rem))">+</button>
    <BottomSheet v-model="showForm" :title="editW?'Edit Wallet':'Wallet Baru'">
      <div class="px-5 pb-6 space-y-5">
        <div><label class="text-xs text-muted mb-1.5 block">Nama</label><input v-model="wf.name" type="text" placeholder="BCA" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-text text-sm focus:outline-none focus:border-primary/50"/></div>
        <div><label class="text-xs text-muted mb-2 block">Tipe</label>
          <div class="flex flex-wrap gap-2"><button v-for="t in wTypes" :key="t.value" @click="wf.type=t.value" class="px-4 py-2 rounded-xl text-sm transition-all" :class="wf.type===t.value?'bg-primary/15 text-primary ring-1 ring-primary/30':'glass text-muted'">{{t.icon}} {{t.label}}</button></div>
        </div>
        <div><label class="text-xs text-muted mb-1.5 block">Saldo Awal</label><CurrencyInput v-model="wf.balance"/></div>
        <div class="grid grid-cols-2 gap-3">
          <div><label class="text-xs text-muted mb-2 block">Ikon</label><div class="flex flex-wrap gap-2"><button v-for="e in wEmojis" :key="e" @click="wf.icon=e" class="w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all" :class="wf.icon===e?'bg-primary/15 ring-1 ring-primary/30':'glass'">{{e}}</button></div></div>
          <div><label class="text-xs text-muted mb-2 block">Warna</label><div class="flex flex-wrap gap-2"><button v-for="c in wColors" :key="c" @click="wf.color=c" class="w-8 h-8 rounded-lg transition-all" :class="wf.color===c?'ring-2 ring-white/50 scale-110':''" :style="{background:c}"></button></div></div>
        </div>
        <button @click="saveWallet" :disabled="!wf.name" class="w-full py-3.5 bg-primary text-bg rounded-xl font-semibold hover:bg-primary-dark transition-colors disabled:opacity-40">{{editW?'Perbarui':'Simpan'}}</button>
      </div>
    </BottomSheet>
    <BottomSheet v-model="showDetail" :title="dw?.name||'Wallet'">
      <div v-if="dw" class="px-5 pb-6 space-y-4">
        <div class="text-center"><span class="text-5xl block mb-2">{{dw.icon}}</span><p class="text-2xl font-bold">{{formatCurrency(dw.balance)}}</p><p class="text-xs text-muted mt-1">{{getWalletTypeLabel(dw.type)}}</p></div>
        <div class="flex gap-3"><button @click="startEdit" class="flex-1 py-3 rounded-xl glass text-sm font-medium hover:bg-white/10">✏️ Edit</button><button @click="delWallet" class="flex-1 py-3 rounded-xl bg-expense/10 text-expense text-sm font-medium hover:bg-expense/20">🗑️ Hapus</button></div>
      </div>
    </BottomSheet>
  </AppShell>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import AppShell from '@/components/layout/AppShell.vue'
import TopBar from '@/components/layout/TopBar.vue'
import BottomSheet from '@/components/common/BottomSheet.vue'
import SkeletonCard from '@/components/common/SkeletonCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import CurrencyInput from '@/components/common/CurrencyInput.vue'
import { useWalletsStore } from '@/stores/wallets'
import { formatCurrency } from '@/utils/currency'
import { getWalletTypeLabel } from '@/utils/formatters'

const ws = useWalletsStore()
const toast = inject('toast')
const wallets = computed(() => ws.wallets)
const totalBalance = computed(() => ws.totalBalance)
const loading = computed(() => ws.loading)
const showForm = ref(false), showDetail = ref(false), editW = ref(null), dw = ref(null)
const wTypes = [{value:'cash',icon:'💵',label:'Tunai'},{value:'bank',icon:'🏦',label:'Bank'},{value:'ewallet',icon:'📱',label:'E-Wallet'},{value:'investment',icon:'📈',label:'Investasi'},{value:'other',icon:'💳',label:'Lainnya'}]
const wEmojis = ['💳','💵','🏦','📱','💰','🪙','📈','💎']
const wColors = ['#10B981','#34D399','#60A5FA','#A78BFA','#F472B6','#FBBF24','#FB923C','#F87171']
const defWf = () => ({ name:'',type:'cash',balance:0,icon:'💳',color:'#10B981' })
const wf = ref(defWf())
function openDetail(w){dw.value=w;showDetail.value=true}
function startEdit(){editW.value=dw.value;wf.value={name:dw.value.name,type:dw.value.type,balance:Number(dw.value.balance),icon:dw.value.icon,color:dw.value.color};showDetail.value=false;showForm.value=true}
async function saveWallet(){try{if(editW.value)await ws.updateWallet(editW.value.id,wf.value);else await ws.addWallet(wf.value);showForm.value=false;editW.value=null;wf.value=defWf()}catch(e){console.error(e)}}
async function delWallet(){
  if(!dw.value||!confirm('Hapus wallet ini? Hati-hati, jika ada transaksi terkait, wallet tidak bisa dihapus.'))return;
  try {
    await ws.deleteWallet(dw.value.id);
    showDetail.value=false;
    toast.show({ title: 'Berhasil', message: 'Wallet terhapus.', type: 'success' })
  } catch(e) {
    console.error(e);
    toast.show({ title: 'Gagal', message: 'Wallet tidak bisa dihapus karena masih digunakan di riwayat transaksi.', type: 'error' })
  }
}
onMounted(()=>ws.fetchWallets())
</script>
