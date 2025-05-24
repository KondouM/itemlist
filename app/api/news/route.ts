import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'news.txt');
    
    if (!fs.existsSync(filePath)) {
      console.error('news.txtが見つかりません:', filePath);
      return NextResponse.json([], { status: 404 });
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    if (!fileContent) {
      console.error('news.txtが空です');
      return NextResponse.json([], { status: 404 });
    }

    const newsItems = fileContent
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        const [date, content] = line.split(':');
        if (!date || !content) {
          console.error('不正な行形式:', line);
          return null;
        }
        return { date: date.trim(), content: content.trim() };
      })
      .filter(item => item !== null)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json(newsItems);
  } catch (error) {
    console.error('お知らせの読み込みエラー:', error);
    return NextResponse.json([], { status: 500 });
  }
} 