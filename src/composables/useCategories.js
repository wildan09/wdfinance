import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export function useCategories() {
  const categories = ref([])
  const loading = ref(false)

  async function fetchCategories(type = null) {
    loading.value = true
    try {
      let query = supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true })

      if (type) query = query.eq('type', type)

      const { data, error } = await query
      if (error) throw error
      
      if (data.length === 0 && !type) {
        await seedDefaultCategories()
        const { data: newData } = await supabase.from('categories').select('*').order('sort_order', { ascending: true })
        categories.value = newData || []
      } else {
        categories.value = data || []
      }
    } finally {
      loading.value = false
    }
  }

  async function seedDefaultCategories() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const defaultCategories = [
      { user_id: user.id, name: 'Gaji', type: 'income', icon: '💰', color: '#10B981', sort_order: 1 },
      { user_id: user.id, name: 'Bonus', type: 'income', icon: '🎁', color: '#3B82F6', sort_order: 2 },
      { user_id: user.id, name: 'Investasi', type: 'income', icon: '📈', color: '#8B5CF6', sort_order: 3 },
      { user_id: user.id, name: 'Makanan', type: 'expense', icon: '🍔', color: '#EF4444', sort_order: 4 },
      { user_id: user.id, name: 'Transportasi', type: 'expense', icon: '🚗', color: '#F59E0B', sort_order: 5 },
      { user_id: user.id, name: 'Belanja', type: 'expense', icon: '🛒', color: '#EC4899', sort_order: 6 },
      { user_id: user.id, name: 'Hiburan', type: 'expense', icon: '🎮', color: '#6366F1', sort_order: 7 },
      { user_id: user.id, name: 'Tagihan', type: 'expense', icon: '🧾', color: '#14B8A6', sort_order: 8 }
    ]
    await supabase.from('categories').insert(defaultCategories)
  }

  async function addCategory(cat) {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('categories')
      .insert({ ...cat, user_id: user.id })
      .select()
      .single()
    if (error) throw error
    categories.value.push(data)
    return data
  }

  async function updateCategory(id, updates) {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    const idx = categories.value.findIndex(c => c.id === id)
    if (idx !== -1) categories.value[idx] = data
    return data
  }

  async function deleteCategory(id) {
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) throw error
    categories.value = categories.value.filter(c => c.id !== id)
  }

  const incomeCategories = () => categories.value.filter(c => c.type === 'income')
  const expenseCategories = () => categories.value.filter(c => c.type === 'expense')

  return {
    categories, loading,
    fetchCategories, addCategory, updateCategory, deleteCategory,
    incomeCategories, expenseCategories
  }
}
