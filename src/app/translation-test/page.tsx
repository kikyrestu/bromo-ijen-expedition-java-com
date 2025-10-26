'use client';

import { useState } from 'react';

export default function TranslationTest() {
  const [text, setText] = useState('Selamat datang di Bromo Ijen Tour!');
  const [from, setFrom] = useState('id');
  const [to, setTo] = useState('en');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testTranslation = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, from, to }),
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data.data.translatedText);
      } else {
        setResult(`Error: ${data.error}`);
      }
    } catch (error) {
      setResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Translation Test</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Text to translate:</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full p-3 border rounded-lg"
            rows={3}
            placeholder="Enter text to translate..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">From:</label>
            <select
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full p-3 border rounded-lg"
            >
              <option value="id">Indonesian</option>
              <option value="en">English</option>
              <option value="de">German</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">To:</label>
            <select
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full p-3 border rounded-lg"
            >
              <option value="id">Indonesian</option>
              <option value="en">English</option>
              <option value="de">German</option>
            </select>
          </div>
        </div>

        <button
          onClick={testTranslation}
          disabled={loading}
          className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Translating...' : 'Translate'}
        </button>

        {result && (
          <div>
            <label className="block text-sm font-medium mb-2">Result:</label>
            <div className="p-3 bg-gray-100 rounded-lg">
              {result}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Test Cases:</h2>
        <div className="space-y-2">
          <button
            onClick={() => setText('Selamat datang di Bromo Ijen Tour!')}
            className="block w-full text-left p-2 bg-gray-100 rounded hover:bg-gray-200"
          >
            "Selamat datang di Bromo Ijen Tour!"
          </button>
          <button
            onClick={() => setText('Tentang Kami')}
            className="block w-full text-left p-2 bg-gray-100 rounded hover:bg-gray-200"
          >
            "Tentang Kami"
          </button>
          <button
            onClick={() => setText('Mengapa Memilih Kami')}
            className="block w-full text-left p-2 bg-gray-100 rounded hover:bg-gray-200"
          >
            "Mengapa Memilih Kami"
          </button>
          <button
            onClick={() => setText('Paket Wisata Bromo Ijen')}
            className="block w-full text-left p-2 bg-gray-100 rounded hover:bg-gray-200"
          >
            "Paket Wisata Bromo Ijen"
          </button>
          <button
            onClick={() => setText('Pemandu Profesional')}
            className="block w-full text-left p-2 bg-gray-100 rounded hover:bg-gray-200"
          >
            "Pemandu Profesional"
          </button>
        </div>
      </div>
    </div>
  );
}
