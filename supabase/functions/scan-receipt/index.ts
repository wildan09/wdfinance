import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { image, mimeType } = await req.json()

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': Deno.env.get('ANTHROPIC_API_KEY')!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mimeType, data: image }
            },
            {
              type: 'text',
              text: `Analisa struk belanja ini. Kembalikan HANYA JSON murni tanpa markdown, tanpa backtick. Format:
{
  "merchant_name": "string",
  "date": "YYYY-MM-DD",
  "total_amount": 0,
  "currency": "IDR",
  "category_suggestion": "Makanan & Minuman | Belanja | Transportasi | Kesehatan | Hiburan | Tagihan | Pendidikan | Lainnya",
  "items": [{"name": "string", "qty": 1, "price": 0, "subtotal": 0}],
  "subtotal": 0,
  "tax": 0,
  "discount": 0,
  "payment_method": "Cash | Debit | Credit | QRIS | Transfer | Tidak Diketahui",
  "notes": "string",
  "confidence": "high | medium | low"
}
Jika bukan struk: {"error": "Bukan struk belanja atau gambar tidak jelas"}`
            }
          ]
        }]
      })
    })

    const aiData = await response.json()
    const result = JSON.parse(aiData.content[0].text.trim())

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch {
    return new Response(
      JSON.stringify({ error: 'Gagal memproses. Coba foto ulang dengan lebih jelas.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
