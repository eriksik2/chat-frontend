"use client"

import ChatComponent from '@/components/chat/ChatComponent'
import ChatBotList from '@/components/chatbot/ChatBotList';
import App from '@/state/App'
import { useReactive } from '@/util/Reactive';
import { useState } from 'react';

export default function Home() {
  const [state] = useState(new App());


  return (
    <main className="min-h-screen max-h-screen p-12 flex flex-col justify-stretch">
      <h1
        className=' text-7xl font-bold text-center'
      >Horik GPT</h1>
      <ChatBotList
        app={state}
      />
      <ChatComponent
        apiKey={"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"}
      />
    </main>
  )
}
