// Supabase Edge Function: send-sms
// This function sends SMS using Twilio or other SMS providers
// Deploy with: supabase functions deploy send-sms

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface SMSRequest {
  to: string
  message: string
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Verify user is authenticated
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const { to, message }: SMSRequest = await req.json()

    if (!to || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, message' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get SMS service credentials
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER')
    
    // Get alternative SMS service (Nexmo/Vonage)
    const nexmoApiKey = Deno.env.get('NEXMO_API_KEY')
    const nexmoApiSecret = Deno.env.get('NEXMO_API_SECRET')

    // Try Twilio
    if (twilioAccountSid && twilioAuthToken && twilioPhoneNumber) {
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`
      
      const credentials = btoa(`${twilioAccountSid}:${twilioAuthToken}`)
      
      const formData = new URLSearchParams()
      formData.append('To', to)
      formData.append('From', twilioPhoneNumber)
      formData.append('Body', message)

      const twilioResponse = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString()
      })

      if (!twilioResponse.ok) {
        const error = await twilioResponse.text()
        throw new Error(`Twilio API error: ${error}`)
      }

      const result = await twilioResponse.json()

      // Log successful SMS
      await supabase.from('sms_logs').insert({
        phone_number: to,
        message,
        status: 'sent',
        sent_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      })

      return new Response(
        JSON.stringify({ success: true, sid: result.sid }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Try Nexmo/Vonage as fallback
    if (nexmoApiKey && nexmoApiSecret) {
      const nexmoResponse = await fetch('https://api.nexmo.com/v2/sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Buffer.from(`${nexmoApiKey}:${nexmoApiSecret}`).toString('base64')}`
        },
        body: JSON.stringify({
          from: 'Restiqa',
          to: to.replace('+', ''),
          text: message
        })
      })

      if (!nexmoResponse.ok) {
        const error = await nexmoResponse.text()
        throw new Error(`Nexmo API error: ${error}`)
      }

      const result = await nexmoResponse.json()

      // Log successful SMS
      await supabase.from('sms_logs').insert({
        phone_number: to,
        message,
        status: 'sent',
        sent_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      })

      return new Response(
        JSON.stringify({ success: true, messageId: result['message-id'] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // If no SMS service configured, log and return
    await supabase.from('sms_logs').insert({
      phone_number: to,
      message,
      status: 'pending',
      error_message: 'No SMS service configured',
      created_at: new Date().toISOString()
    })

    return new Response(
      JSON.stringify({ message: 'SMS queued (no API key configured)', success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error sending SMS:', error)
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
