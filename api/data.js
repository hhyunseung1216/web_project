// api/data.js
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  // CORS 설정 (필요 없으면 제거)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  const company = req.query.company;
  if (!company) {
    return res.status(400).json({ error: "company 파라미터가 필요합니다." });
  }

  try {
    // 1) 기업 설명 (2문장 이내)
    const descResp = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "한국어로 간단하게, 2문장 이내로 답해주세요." },
        { role: "user", content: `다음 회사에 대해 2문장 이내로 소개해줘: ${company}` }
      ]
    });
    const description = descResp.choices[0].message.content.trim();

    // 2) NewsAPI 호출
    const newsRes = await fetch(
      `https://newsapi.org/v2/everything?` +
      `q=${encodeURIComponent(company)}` +
      `&language=ko&pageSize=5&apiKey=${process.env.NEWSAPI_KEY}`
    );
    if (!newsRes.ok) throw new Error(`NewsAPI 에러: ${newsRes.status}`);
    const { articles } = await newsRes.json();

    // 3) 뉴스 요약·번역 요청 (JSON 형태)
    const payload = articles
      .map((a, i) => `${i+1}. 제목: ${a.title}\n내용: ${a.description || a.content || ""}`)
      .join("\n\n");
    const sumResp = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "다음 기사 목록을 받아, JSON 배열로 응답해 주세요. 각 아이템은 'title'과 'summary' 필드를 가지며, summary는 한국어 2문장 이내로 작성해 주세요."
        },
        { role: "user", content: payload }
      ]
    });
    const summaries = JSON.parse(sumResp.choices[0].message.content);

    // 최종 응답
    return res.status(200).json({ description, summaries });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || `${err}` });
  }
}
