import './globals.css'

export const metadata = {
  title: 'アイテム検索',
  description: 'JSONでアイテムを検索できるアプリ',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}