// api/data.js
export default async function handler(req, res) {
    // CORS 허용 (개발용)
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET");
  
    const { company } = req.query || {};
  
    // 더미 응답: 잘 들어오는지 확인용
    return res.status(200).json({
      description: `테스트용 소개: ${company || "없음"}`,
      summaries: [
        { title: "테스트 뉴스 1", summary: "첫 번째 테스트 요약입니다." },
        { title: "테스트 뉴스 2", summary: "두 번째 테스트 요약입니다." }
      ]
    });
  }
  