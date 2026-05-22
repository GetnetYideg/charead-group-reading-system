import { supabase } from "./config/supabaseClient.js"

console.log('Listening for messages...')

supabase
  .channel('chat-room')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'Message'
    },
    (payload) => {
      console.log('NEW MESSAGE:')
      console.log(payload.new)
    }
  )
  .subscribe()