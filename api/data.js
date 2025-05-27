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

    // 2) NewsAPI 호출
    const newsRes = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(company)}&language=ko&pageSize=5&apiKey=${process.env.NEWSAPI_KEY}`
    );
    if (!newsRes.ok) throw new Error(`NewsAPI 에러: ${newsRes.status}`);
    const { articles } = await newsRes.json();

    // 3) 뉴스 요약·번역 요청 (JSON 형태) + URL 포함
    const payload = articles
      .map((a, i) => `${i + 1}. 제목: ${a.title}\n내용: ${a.description || a.content || ""}`)
      .join("\n\n");

    const sumResp = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "응답은 **JSON 배열** 형태로만 보내주세요. **절대** ``` 같은 마크다운 구분자는 포함하지 말고, 순수 JSON 텍스트만 출력해 주세요."
        },
        { role: "user", content: payload }
      ]
    });
    const summariesOpenAI = JSON.parse(sumResp.choices[0].message.content);

    // 4) articles 에서 URL 결합: OpenAI 결과에 URL 매핑
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