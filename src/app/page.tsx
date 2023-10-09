import Chat from '@/components/Chat'
import Image from 'next/image'

export default function Home() {
  return (
    <main className="min-h-screen max-h-screen p-12 flex flex-col justify-stretch">
      <h1
        className=' text-7xl font-bold text-center'
      >Horik GPT</h1>
      <Chat
        apiKey={"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"}
      />
    </main>
  )
}
