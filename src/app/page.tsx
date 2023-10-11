"use client"

import ChatComponent from '@/components/chat/ChatComponent'
import ChatsList from '@/components/chat/ChatsList';
import ChatBotList from '@/components/chatbot/ChatBotList';
import { navPage } from '@/components/nav/NavController';
import TabsNav from '@/components/nav/SideTabs/TabsNav';
import App from '@/state/App'
import ChatSession from '@/state/ChatSession';
import { useReactive } from '@/util/Reactive';
import { useState } from 'react';
import { FaGithub, FaRegComments, FaUsersGear } from 'react-icons/fa6';

export default function Home() {
  const [state] = useState(new App());
  const app = useReactive(state);

  const [keyInput, setKeyInput] = useState("");

  return (
    <main className="h-screen relative bg-slate-200 flex flex-col">
      <div className='flex items-center justify-start py-4 px-3 gap-2 bg-slate-400 relative'>
        <h1 className='flex text-2xl gap-2'>
          chat.eriksik
        </h1>

        <div className='absolute top-0 bottom-0 right-0 flex text-4xl items-center gap-4 px-4'>
          <a href="https://github.com/eriksik2/chat-frontend"><FaGithub /></a>
        </div>

      </div>
      <TabsNav
        tabsLocation='bottom'
        pages={[
          navPage("Chatbots", <ChatBotList app={state} />, {
            icon: <FaUsersGear className="text-2xl" />,
          }),
          navPage("Chats", <ChatsList app={app} />, {
            //navPage("Chat", <ChatComponent chat={state.getDefaultChat()} />, {
            icon: <FaRegComments className="text-2xl" />,
          }),
        ]}
      />
    </main>
  )
}
