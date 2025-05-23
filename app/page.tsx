'use client';

import { useEffect, useState } from 'react';

interface ItemInfo {
  名前: string;
  シリアル: number;
  最小ダメージ: number;
  最大ダメージ: number;
  価格: number;
  ドロップレベル: number;
}

interface ItemStats {
  レベル: number;
  力: number;
}

interface Item {
  基本情報: ItemInfo;
  要求ステータス: ItemStats;
  アイテム情報: string[];
  ユニーク情報: string[];
}

// Shift-JISの文字列をUTF-8に変換する関数
function sjisToUtf8(sjisArray: Uint8Array): string {
  const decoder = new TextDecoder('shift-jis');
  return decoder.decode(sjisArray);
}

// 特殊文字を削除する関数
function cleanItemName(name: string) {
  return name
    .replace(/★/g, '')
    .replace(/<c:[^>]+>/g, '')
    .replace(/<n>/g, '')
    .replace(/<\/c>/g, '');
}

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    setLoading(true);
    fetch('/items.json')
      .then(res => {
        if (!res.ok) {
          throw new Error('データの読み込みに失敗しました');
        }
        return res.arrayBuffer().then(buffer => {
          try {
            const sjisText = sjisToUtf8(new Uint8Array(buffer));
            return JSON.parse(sjisText);
          } catch (e) {
            console.error('JSONパースエラー:', e);
            throw new Error('JSONデータの解析に失敗しました');
          }
        });
      })
      .then(data => {
        console.log('読み込んだデータ:', data);
        const itemList = data["アイテム一覧"] || [];
        console.log('アイテム数:', itemList.length);
        setItems(itemList);
      })
      .catch(err => {
        console.error('エラー:', err);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const suggestions = items
    .map(item => cleanItemName(item["基本情報"]["名前"]))
    .filter(name => name.includes(query))
    .slice(0, 5);

  const filteredItems = items.filter(item => {
    const info = item["基本情報"];
    return cleanItemName(info["名前"]).includes(query);
  });

  const sortedAndFilteredItems = filteredItems.sort((a, b) => {
    const levelA = a["基本情報"]["ドロップレベル"];
    const levelB = b["基本情報"]["ドロップレベル"];
    return sortOrder === 'asc' ? levelA - levelB : levelB - levelA;
  });

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="sticky top-0 z-20 bg-gray-100 pt-4 pb-4 border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-6">
            <h1 className="text-3xl font-bold text-gray-800">アイテム検索</h1>
            <span className="text-sm text-gray-600">
              <span className="text-red-600 font-semibold">Lv1000以上</span>のアイテムは赤色で表示
            </span>
          </div>
          {loading && <p className="text-gray-600 mb-4">データを読み込み中...</p>}
          {error && <p className="text-red-600 mb-4">エラー: {error}</p>}
          {!loading && !error && items.length === 0 && (
            <p className="text-yellow-600 mb-4">アイテムデータが見つかりません</p>
          )}
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="アイテム名で検索"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 bg-white"
              />
              {showSuggestions && query && suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 text-gray-800"
                      onClick={() => {
                        setQuery(suggestion);
                        setShowSuggestions(false);
                      }}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <span>ドロップレベル</span>
              <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-3xl mx-auto p-6">
        <div className="space-y-4">
          {sortedAndFilteredItems.map((item, i) => {
            const info = item["基本情報"];
            const stats = item["要求ステータス"];
            return (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <h2 className={`text-2xl font-bold mb-3 ${info["ドロップレベル"] >= 1000 ? 'text-red-600' : 'text-gray-800'}`}>
                  {cleanItemName(info["名前"])}
                </h2>
                <div className="grid grid-cols-2 gap-4 text-gray-700">
                  <p>ダメージ: {info["最小ダメージ"]} - {info["最大ダメージ"]}</p>
                  <p>価格: {info["価格"]} G</p>
                  <p>ドロップレベル: {info["ドロップレベル"]}</p>
                  <p>必要レベル: {stats["レベル"]}</p>
                  <p>必要力: {stats["力"]}</p>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">アイテム情報</h3>
                  <ul className="space-y-1 text-gray-600">
                    {item["アイテム情報"].map((line, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        {line.replace(/\u0001|\u0002/g, "")}
                      </li>
                    ))}
                  </ul>
                </div>
                {item["ユニーク情報"] && item["ユニーク情報"].length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold text-purple-800 mb-2">ユニーク情報</h3>
                    <ul className="space-y-1 text-purple-600">
                      {item["ユニーク情報"].map((line, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-purple-500 mr-2">•</span>
                          {line.replace(/\u0001|\u0002/g, "")}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
