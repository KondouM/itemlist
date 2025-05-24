'use client';

import { useEffect, useState } from 'react';

interface ItemInfo {
  名前: string;
  シリアル: number;
  最小ダメージ: number;
  最大ダメージ: number;
  攻撃範囲: string;
  攻撃速度: string;
  価格: number;
  ドロップレベル: number;
}

interface ItemStats {
  レベル: number;
  力: number;
  敏捷: number;
  健康: number;
  知恵: number;
  知識: number;
  カリスマ: number;
  運: number;
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
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [showNews, setShowNews] = useState(false);
  const [news, setNews] = useState<{ date: string; content: string }[]>([]);

  useEffect(() => {
    // アイテムデータの読み込み
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

    // お知らせデータの読み込み
    fetch('/api/news')
      .then(res => {
        if (!res.ok) {
          throw new Error('お知らせの読み込みに失敗しました');
        }
        return res.json();
      })
      .then(data => {
        setNews(data);
      })
      .catch(err => {
        console.error('お知らせの読み込みエラー:', err);
        setNews([]);
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
            <div className="flex items-center gap-2 ml-auto relative">
              <span className="text-sm text-gray-500">最終更新: 2024/05/24</span>
              <button
                onClick={() => setShowNews(!showNews)}
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                お知らせ
              </button>
              {showNews && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">お知らせ</h3>
                    <button
                      onClick={() => setShowNews(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {news && news.length > 0 ? (
                      news.map((item, index) => (
                        <div key={index} className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-gray-600">{item.date}</p>
                          <p className="text-gray-800">{item.content}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">お知らせはありません</p>
                    )}
                  </div>
                </div>
              )}
            </div>
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
        <div className="space-y-2">
          {sortedAndFilteredItems.map((item, i) => {
            const info = item["基本情報"];
            const isSelected = selectedItem === item;
            return (
              <div key={i}>
                <div
                  className={`bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer ${
                    isSelected ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedItem(isSelected ? null : item)}
                >
                  <h2 className={`text-lg font-semibold ${info["ドロップレベル"] >= 1000 ? 'text-red-600' : 'text-gray-800'}`}>
                    {cleanItemName(info["名前"])}
                  </h2>
                </div>
                {isSelected && (
                  <div className="mt-2 bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="grid grid-cols-2 gap-3 text-gray-700">
                        <p>ダメージ: {info["最小ダメージ"]} - {info["最大ダメージ"]}</p>
                        <p>価格: {info["価格"]} G</p>
                        <p>ドロップレベル: {info["ドロップレベル"]}</p>
                        <p>必要レベル: {item["要求ステータス"]["レベル"]}</p>
                        <p>攻撃範囲: {info["攻撃範囲"]}</p>
                        <p>攻撃速度: {info["攻撃速度"]}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        <span className="w-1 h-6 bg-blue-500 rounded-full mr-2"></span>
                        要求ステータス
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-gray-700 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100 shadow-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-blue-600 font-medium">力</span>
                          <span className="text-gray-900">{item["要求ステータス"]["力"]}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-blue-600 font-medium">敏捷</span>
                          <span className="text-gray-900">{item["要求ステータス"]["敏捷"]}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-blue-600 font-medium">健康</span>
                          <span className="text-gray-900">{item["要求ステータス"]["健康"]}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-blue-600 font-medium">知恵</span>
                          <span className="text-gray-900">{item["要求ステータス"]["知恵"]}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-blue-600 font-medium">知識</span>
                          <span className="text-gray-900">{item["要求ステータス"]["知識"]}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-blue-600 font-medium">カリスマ</span>
                          <span className="text-gray-900">{item["要求ステータス"]["カリスマ"]}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-blue-600 font-medium">運</span>
                          <span className="text-gray-900">{item["要求ステータス"]["運"]}</span>
                        </div>
                      </div>
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
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
