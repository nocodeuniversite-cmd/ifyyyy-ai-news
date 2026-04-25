export async function POST(request) {
  const { category, query } = await request.json();

  const searchTerm = query
    ? `${query} AI tech news`
    : {
        All: "latest AI and tech news this week",
        "AI Models": "new AI model releases this week",
        "Big Tech": "Google Apple Microsoft Meta tech news this week",
        Startups: "AI startup funding news this week",
        Research: "AI research breakthroughs this week",
        Policy: "AI regulation policy news this week",
      }[category] || "latest AI tech news";

  const prompt = `You are a tech news aggregator. Search for and return exactly 8 recent news articles about: "${searchTerm}".

Return ONLY a valid JSON array. No markdown, no explanation, just the array.

Each object must have:
- title: string (compelling headline)
- summary: string (2 sentences summarizing the article)
- detail: string (2-3 sentences with more context)
- source: string (publication name like TechCrunch, Wired, The Verge, etc.)
- category: string (one of: AI Models, Big Tech, Startups, Research, Policy)
- time: string (like "2h ago" or "1d ago")

Base this on real recent AI and tech developments. Return only the JSON array.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
        }),
      }
    );

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const jsonMatch = text.match(/\[[\s\S]*\]/);

    if (!jsonMatch) {
      return Response.json({ error: "No articles found" }, { status: 500 });
    }

    const articles = JSON.parse(jsonMatch[0]);
    return Response.json({ articles });
  } catch (err) {
    return Response.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}
