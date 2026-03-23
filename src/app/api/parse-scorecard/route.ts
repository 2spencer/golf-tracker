import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(request: Request) {
  try {
    const { imageBase64, mimeType, passcode } = await request.json();

    const expectedPasscode = process.env.UPLOAD_PASSCODE;
    if (!expectedPasscode || passcode !== expectedPasscode) {
      return NextResponse.json({ error: "Invalid passcode" }, { status: 401 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 500 }
      );
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mimeType as
                  | "image/jpeg"
                  | "image/png"
                  | "image/gif"
                  | "image/webp",
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: `Analyze this golf scorecard image and extract the data into the following JSON format. Return ONLY valid JSON, no other text.

{
  "course": "Course Name",
  "date": "YYYY-MM-DD",
  "players": [
    {
      "name": "Player Name",
      "scores": [4, 5, 3, 4, 5, 4, 3, 4, 5, 4, 5, 3, 4, 5, 4, 3, 4, 5]
    }
  ]
}

Rules:
- scores array must have exactly 18 elements (one per hole)
- If a hole score is illegible, use null
- If the date is not visible, use null for date
- Extract all players shown on the scorecard
- Return ONLY the JSON object, nothing else`,
            },
          ],
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { error: "No text response from API" },
        { status: 500 }
      );
    }

    // Parse the JSON from the response, handling possible markdown code blocks
    let jsonStr = textBlock.text.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const parsed = JSON.parse(jsonStr);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Parse scorecard error:", error);
    return NextResponse.json(
      { error: "Failed to parse scorecard" },
      { status: 500 }
    );
  }
}
