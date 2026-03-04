// Supabase Edge Function: send-email
// This function sends emails using Resend or any SMTP service
// Deploy with: supabase functions deploy send-email

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface EmailRequest {
  to: string
  subject: string
  html: string
  text?: string
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
    const { to, subject, html, text }: EmailRequest = await req.json()

    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, subject, html' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get email service API key (Resend, SendGrid, etc.)
    const emailApiKey = Deno.env.get('RESEND_API_KEY') || Deno.env.get('SENDGRID_API_KEY')
    
    if (!emailApiKey) {
      // Log email to database for later sending (fallback)
      await supabase.from('email_logs').insert({
        to_email: to,
        subject,
        type: 'api_fallback',
        status: 'pending',
        error_message: 'No email service configured',
        created_at: new Date().toISOString()
      })
      
      return new Response(
        JSON.stringify({ message: 'Email queued (no API key configured)', success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Try to send with Resend (most common)
    if (Deno.env.get('RESEND_API_KEY')) {
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Restiqa <noreply@restiqa.com>',
          to: [to],
          subject,
          html,
          text: text || html.replace(/<[^>]*>/g, '')
        })
      })

      if (!resendResponse.ok) {
        const error = await resendResponse.text()
        throw new Error(`Resend API error: ${error}`)
      }

      const result = await resendResponse.json()

      // Log successful email
      await supabase.from('email_logs').insert({
        to_email: to,
        subject,
        type: 'resend',
        status: 'sent',
        sent_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      })

      return new Response(
        JSON.stringify({ success: true, id: result.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Try SendGrid as fallback
    if (Deno.env.get('SENDGRID_API_KEY')) {
      const sendgridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SENDGRID_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: 'noreply@restiqa.com', name: 'Restiqa' },
          subject,
          content: [
            { type: 'text/html', value: html },
            { type: 'text/plain', value: text || html.replace(/<[^>]*>/g, '') }
          ]
        })
      })

      if (!sendgridResponse.ok) {
        const error = await sendgridResponse.text()
        throw new Error(`SendGrid API error: ${error}`)
      }

      // Log successful email
      await supabase.from('email_logs').insert({
        to_email: to,
        subject,
        type: 'sendgrid',
        status: 'sent',
        sent_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      })

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    throw new Error('No email service configured')
  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
