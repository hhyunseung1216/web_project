import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  // CORS 설정
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  const company = req.query.company;
  if (!company) {
    return res.status(400).json({ error: "company 파라미터가 필요합니다." });
  }

  try {
    // 1) 기업 소개 (2문장 이내)
    const descResp = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "한국어로 간단하게, 2문장 이내로 답해주세요." },
        { role: "user", content: `다음 회사에 대해 2문장 이내로 소개해줘: ${company}` }
      ]
    });
    const description = descResp.choices[0].message.content.trim();

    // 2) NewsAPI 호출 (언어 필터 해제)
    const newsRes = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(company)}&pageSize=5&apiKey=${process.env.NEWSAPI_KEY}`
    );
    if (!newsRes.ok) throw new Error(`NewsAPI 에러: ${newsRes.status}`);
    const { articles } = await newsRes.json();

    // 3) 기사 없음 처리
    if (!articles || articles.length === 0) {
      return res.status(200).json({
        description,
        summaries: [],
        message: "관련 뉴스가 없습니다. 다른 키워드로 검색해 보세요."
      });
    }

    // 4) 뉴스 요약·번역 요청 (JSON 형태) + URL 포함
    const payload = articles
      .map((a, i) => `${i + 1}. 제목: ${a.title}\n내용: ${a.description || a.content || ""}`)
      .join("\n\n");

    const sumResp = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "다음 기사 목록을 받아, JSON 배열로 응답해 주세요. 각 아이템은 'title', 'summary', 'url' 필드를 가지며, summary는 한국어 2문장 이내로 작성해 주세요."
        },
        { role: "user", content: payload }
      ]
    });
    let raw = sumResp.choices[0].message.content.trim();
    // 코드 블록 제거
    if (raw.startsWith("```")) {
      raw = raw.replace(/```json/, "").replace(/```/g, "").trim();
    }
    const summariesOpenAI = JSON.parse(raw);

    // 5) articles 에서 URL 결합: OpenAI 결과에 URL 매핑
    const summaries = summariesOpenAI.map((item, idx) => ({
      title: item.title,
      summary: item.summary,
      url: articles[idx]?.url || ""
    }));

    return res.status(200).json({ description, summaries });
  } catch (err) {
    console.error(err);
    if (err.status === 429) {
      return res.status(429).json({ error: "OpenAI 쿼터를 초과했습니다. 요금제 또는 결제 정보를 확인해주세요." });
    }
    return res.status(500).json({ error: err.message || `${err}` });
  }
}