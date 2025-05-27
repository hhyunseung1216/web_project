import { useState } from "react";

function App() {
  const [company, setCompany] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    if (!company.trim()) {
      setError("회사명을 입력해주세요.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `https://web-project-eta-gray.vercel.app/api/data?company=${encodeURIComponent(company)}`
      );
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || json.message || res.statusText);
      }
      setData(json);
    } catch (e) {
      setError(e.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 font-sans max-w-xl mx-auto">
      <h1 className="text-3xl mb-4">기업 뉴스 요약</h1>

      <div className="flex mb-4">
        <input
          className="flex-1 border rounded px-3 py-2 mr-2"
          placeholder="회사명 입력"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700"
          onClick={fetchData}
          disabled={loading}
        >
          {loading ? "로딩..." : "조회"}
        </button>
      </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      {data && (
        <div className="space-y-6">
          <section>
            <h2 className="text-2xl mb-2">기업 소개</h2>
            <p>{data.description}</p>
          </section>

          <section>
            <h2 className="text-2xl mb-2">뉴스 요약</h2>
            {data.message && <p className="text-gray-600 mb-4">{data.message}</p>}
            {data.summaries.length > 0 && (
              <ul className="list-disc pl-5 space-y-2">
                {data.summaries.map((item, i) => (
                  <li key={i}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-semibold"
                    >
                      {item.title}
                    </a>
                    <p>{item.summary}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default App;