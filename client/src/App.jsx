import { useState } from "react";

function App() {
  const [company, setCompany] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const fetchData = async () => {
    if (!company.trim()) {
      setError("회사명을 입력해주세요.");
      return;
    }
    setLoading(true);
    setError("");
    setSearched(true);
    try {
      const res = await fetch(
        `https://web-project-eta-gray.vercel.app/api/data?company=${encodeURIComponent(company)}`
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || json.message || res.statusText);
      setData(json);
    } catch (e) {
      setError(e.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4">
      {/* Hero Section */}
      {!searched && (
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-6">내가 살려는 기업은?</h1>
          <div className="flex justify-center">
            <input
              className="w-80 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="회사명 입력"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
            <button
              className="px-6 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700"
              onClick={fetchData}
            >
              검색
            </button>
          </div>
          {error && <p className="text-red-600 mt-4">{error}</p>}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="mt-8 text-center">
          <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16 mx-auto mb-4"></div>
          <p className="text-gray-700">검색 중...</p>
        </div>
      )}

      {/* Results Section */}
      {searched && !loading && data && (
        <div className="w-full max-w-3xl bg-white shadow-md rounded-lg p-6 mt-8">
          <h2 className="text-2xl font-semibold mb-4">기업 소개</h2>
          <p className="mb-6 text-gray-800">{data.description}</p>

          <h2 className="text-2xl font-semibold mb-4">뉴스 요약</h2>
          {data.message && <p className="text-gray-600 mb-4">{data.message}</p>}
          <ul className="space-y-4">
            {data.summaries.map((item, i) => (
              <li
                key={i}
                className="border-l-4 border-blue-500 pl-4 py-2 hover:bg-gray-50 rounded"
              >
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-bold text-blue-600 hover:underline"
                >
                  {item.title}
                </a>
                <p className="text-gray-700 mt-1">{item.summary}</p>
              </li>
            ))}
          </ul>

          <button
            className="mt-6 bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
            onClick={() => {
              setSearched(false);
              setData(null);
              setCompany("");
            }}
          >
            새로운 검색
          </button>
        </div>
      )}

      {/* Loader Styles */}
      <style jsx>{`
        .loader {
          border-top-color: #3498db;
          animation: spinner 1s linear infinite;
        }
        @keyframes spinner {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default App;