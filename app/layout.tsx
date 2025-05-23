import './globals.css'
import { ReactNode } from 'react'

export const metadata = {
  title: 'アイテム検索',
  description: 'JSONでアイテムを検索できるアプリ',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}