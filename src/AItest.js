import { GoogleGenAI } from '@google/genai';
import React, { useEffect, useMemo, useRef, useState } from 'react';

// 移除了 TypeScript 的型別定義
// export type Part = { text: string };
// export type ChatMsg = { role: 'user' | 'model'; parts: Part[] };

export default function AItest() {
  const [model, setModel] = useState('gemini-2.5-flash');
  const [apiKey, setApiKey] = useState('');
  // 移除了 useState 的型別註釋 <ChatMsg[]>
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  // 移除了 useState 的型別註釋 <'chat' | 'quiz'>
  const [mode, setMode] = useState('chat');
  const [error, setError] = useState('');
  // 移除了 useRef 的型別註釋 <HTMLDivElement | null>
  const listRef = useRef(null);

  // 預設歡迎訊息
  useEffect(() => {
    setHistory([
      {
        role: 'model',
        parts: [
          {
            text: '🍿 歡迎光臨「電影靈魂測驗室」！告訴我你想看什麼樣的電影，或開始測驗讓我幫你找到命中註定的片單 🎥',
          },
        ],
      },
    ]);
  }, []);

  // 自動滾動到底
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [history, loading]);

  const ai = useMemo(() => {
    try {
      // 移除了 new GoogleGenAI 的型別註釋 { apiKey }
      return apiKey ? new GoogleGenAI({ apiKey }) : null;
    } catch {
      return null;
    }
  }, [apiKey]);

  // 移除了參數 message 的型別註釋 string
  async function sendMessage(message) {
    const content = (message ?? input).trim();
    if (!content || loading) return;
    if (!ai) {
      setError('請輸入有效的 Gemini API Key');
      return;
    }

    setError('');
    setLoading(true);
    // 移除了 newHistory 的型別註釋
    const newHistory = [...history, { role: 'user', parts: [{ text: content }] }];
    setHistory(newHistory);
    setInput('');

    try {
      // 移除了 err 的型別註釋 : any
      const resp = await ai.models.generateContent({
        model,
        contents: [
          {
            role: 'user',
            parts: [
              {
                text:
                  mode === 'quiz'
                    ? '你是一位電影靈魂導師，透過一步步提問使用者的情緒、節奏、風格偏好，最後推薦3部最適合的電影。'
                    : '你是一位電影與影集推薦專家，根據使用者的描述推薦合適的作品。',
              },
            ],
          },
          ...newHistory,
        ],
      });

      const reply = resp.text || '[沒有回覆內容]';
      setHistory((h) => [...h, { role: 'model', parts: [{ text: reply }] }]);
    } catch (err) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  // 移除了參數 text 的型別註釋 string
  function renderMarkdownLike(text) {
    return text.split(/\n/).map((line, i) => (
      <div key={i} style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {line}
      </div>
    ));
  }

  // 底部快速題目選項
  // 移除了 quickPrompts 的型別註釋
  const quickPrompts = [
    '幫我推薦幾部最近好看的 Netflix 影集',
    '我想看溫馨又療癒的電影，有什麼推薦？',
    '幫我找一些像《權力遊戲》的懸疑片',
    '推薦幾部經典的愛情電影',
    '有沒有 2024 年新上映的科幻片？',
  ];

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        {/* 標題 + 模式切換 */}
        <div style={styles.header}>
          <h2>🎬 電影靈魂測驗室</h2>
          <button
            onClick={async () => {
              const next = mode === 'quiz' ? 'chat' : 'quiz';
              setMode(next);
              if (next === 'quiz') {
                await sendMessage(
                  '我想幫使用者測出他想看的電影類型，請你一步步詢問他喜歡的風格、情緒與節奏。最後推薦 3 部電影。'
                );
              }
            }}
            style={styles.modeBtn}
          >
            {mode === 'quiz' ? '💬 返回聊天模式' : '🧭 開始靈魂測驗'}
          </button>
        </div>

        {/* API Key 輸入 */}
        <div style={styles.keyArea}>
          <input
            type="password"
            value={apiKey}
            // 移除了 onChange 參數 e 的型別註釋 (e)
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="請輸入你的 Gemini API Key"
            style={styles.input}
          />
        </div>

        {/* 訊息區 */}
        <div ref={listRef} style={styles.messages}>
          {history.map((m, i) => (
            <div
              key={i}
              style={{
                ...styles.msg,
                ...(m.role === 'user' ? styles.userMsg : styles.botMsg),
              }}
            >
              <div style={styles.msgRole}>
                {m.role === 'user' ? '你 🎭' : '🎥 Gemini'}
              </div>
              <div style={styles.msgBody}>
                {m.parts && renderMarkdownLike(m.parts.map((p) => p.text).join('\n'))}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ ...styles.msg, ...styles.botMsg }}>🎞 思考中...</div>
          )}
        </div>

        {/* 錯誤提示 */}
        {error && <div style={styles.error}>⚠ {error}</div>}

        {/* 底部輸入區 */}
        <form
          // 移除了 onSubmit 參數 e 的型別註釋 (e)
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          style={styles.composer}
        >
          <input
            value={input}
            // 移除了 onChange 參數 e 的型別註釋 (e)
            onChange={(e) => setInput(e.target.value)}
            placeholder="輸入訊息..."
            style={styles.textInput}
          />
          <button type="submit" style={styles.sendBtn} disabled={!input.trim()}>
            發送 🚀
          </button>
        </form>

        {/* 🔹快速提問按鈕區 */}
        <div style={styles.quickContainer}>
          {quickPrompts.map((q, idx) => (
            <button key={idx} onClick={() => sendMessage(q)} style={styles.quickBtn}>
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// 移除了 styles 的型別註釋 : Record<string, React.CSSProperties>
const styles = {
  wrap: {
    height: '100vh',
    width: '100vw',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'radial-gradient(circle at top, #1e1b4b, #111827)',
    color: '#fff',
    fontFamily: 'Inter, sans-serif',
  },
  card: {
    width: '90%',
    maxWidth: 900,
    height: '90%',
    background: 'rgba(20,20,40,0.85)',
    border: '1px solid #334155',
    borderRadius: 20,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 0 25px rgba(0,0,0,0.4)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    background: 'rgba(255,255,255,0.05)',
    borderBottom: '1px solid #334155',
  },
  modeBtn: {
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: 999,
    padding: '8px 14px',
    cursor: 'pointer',
    fontSize: 14,
  },
  keyArea: {
    padding: '8px 20px',
    borderBottom: '1px solid #334155',
    background: 'rgba(255,255,255,0.03)',
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid #475569',
    background: '#0f172a',
    color: '#fff',
    fontSize: 14,
  },
  messages: {
    flex: 1,
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    overflowY: 'auto',
  },
  msg: {
    borderRadius: 12,
    padding: 12,
    maxWidth: '80%',
    wordBreak: 'break-word',
  },
  userMsg: {
    alignSelf: 'flex-end',
    background: '#2563eb',
    color: '#fff',
  },
  botMsg: {
    alignSelf: 'flex-start',
    background: '#1e293b',
    color: '#e2e8f0',
  },
  msgRole: { fontSize: 12, opacity: 0.8, marginBottom: 4 },
  msgBody: { fontSize: 15, lineHeight: 1.5 },
  composer: {
    display: 'flex',
    padding: 12,
    borderTop: '1px solid #334155',
    background: 'rgba(17,24,39,0.9)',
  },
  textInput: {
    flex: 1,
    borderRadius: 999,
    border: '1px solid #475569',
    padding: '10px 14px',
    background: '#0f172a',
    color: '#fff',
    fontSize: 14,
  },
  sendBtn: {
    marginLeft: 8,
    background: '#16a34a',
    color: '#fff',
    border: 'none',
    borderRadius: 999,
    padding: '10px 16px',
    fontSize: 14,
    cursor: 'pointer',
  },
  error: {
    color: '#f87171',
    padding: '4px 16px',
    fontSize: 13,
  },
  quickContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    padding: '10px 16px',
    background: 'rgba(255,255,255,0.04)',
    borderTop: '1px solid #334155',
    justifyContent: 'center',
  },
  quickBtn: {
    padding: '6px 12px',
    borderRadius: 999,
    border: '1px solid #475569',
    background: 'rgba(59,130,246,0.1)',
    color: '#93c5fd',
    fontSize: 13,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
};