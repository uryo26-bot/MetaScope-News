from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import sys
import io
import pandas as pd
from pathlib import Path
import os
import json
import re
from typing import Literal
from pydantic import BaseModel
from anthropic import Anthropic

from dotenv import load_dotenv
load_dotenv()

# 標準出力のエンコーディングをUTF-8に変更
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

app = FastAPI()

# ===== CORS =====
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== パス =====
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
CSV_PATH = DATA_DIR / "EneChart" / "energy_mix_percentage.csv"

# ===== CSV =====
generation_df = pd.read_csv(CSV_PATH)

# ===== API =====
@app.get("/energy")
def get_energy(year: int | None = None):
    if year is not None:
        return generation_df[generation_df["year"] == year].to_dict(orient="records")
    return generation_df.to_dict(orient="records")


# 石炭・石油・天然ガスの輸入元割合: extractedData_AFpercentage のCSVを使用
IMPORT_AF_DIR = DATA_DIR / "EneChart" / "Japan_import" / "extractedData_AFpercentage"
SOURCE_TO_FILENAME = {
    "lng": "Natural_Gas_import.csv",
    "coal": "Coal_Fuel_import.csv",
    "oil": "Oil_Fuel_import.csv",
}


@app.get("/import-data/{source}")
def get_import_data(source: str, year: int = 2024):
    filename = SOURCE_TO_FILENAME.get(source.lower())
    if not filename:
        return []
    csv_path = IMPORT_AF_DIR / filename
    if not csv_path.exists():
        return []
    df = pd.read_csv(csv_path)
    df = df[df["year"] == year].copy()
    df["volume_percentage"] = pd.to_numeric(df["volume_percentage"], errors="coerce").fillna(0)
    # 国ごとに集計（同一国で複数行ある場合に合算）
    agg = df.groupby(["country_code", "country"], as_index=False)["volume_percentage"].sum()
    agg["percentage"] = agg["volume_percentage"].round(2)
    records = [
        {"country": row["country"], "percentage": float(row["percentage"]), "countryCode": row["country_code"]}
        for _, row in agg.iterrows()
    ]
    return records


# ===== ニュース分析（Anthropic） =====
ANALYZE_SYSTEM_PROMPT = """ニュースに登場する主要な主体（国・組織・人物）を2〜4個特定してください。
各主体について、以下の3つの視点でプラス面とマイナス面を
それぞれ20字以内で説明してください。

1. 国内政治（目的：政権の維持と政策実現）
2. 国際政治（目的：国益の確保と安全保障）
3. 経済（目的：成長・安定・資源確保）

20字という制限を必ず守ってください。
必ずJSON形式のみで返してください。

このニュースに至るまでの重要な出来事を、時系列で5〜7個挙げてください。
各出来事は1〜2文で簡潔に説明してください。最後の項目は必ず今回のニュースそのものにしてください。

返すJSONは次の形式に厳守してください（他に説明文は付けないでください）:
{
  "subjects": ["主体1", "主体2", "..."],
  "analyses": {
    "主体名": {
      "domestic": { "plus": "20字以内", "minus": "20字以内" },
      "international": { "plus": "20字以内", "minus": "20字以内" },
      "economic": { "plus": "20字以内", "minus": "20字以内" }
    }
  },
  "timeline": [
    { "year": "年または年代", "event": "出来事の説明（1〜2文）" }
  ],
  "related_resource": "oil" または "lng" または "coal" または "none"
}
subjects は2〜4個の主体のリストにしてください。
analyses の各キーは subjects の要素と一致させてください。
related_resource は、ニュースが石油・LNG・石炭のどれに最も関連するか、該当しなければ "none" にしてください。
timeline は5〜7個の出来事を含め、最後の項目は今回のニュースそのものにしてください。"""


class PerspectiveItem(BaseModel):
    plus: str
    minus: str


class SubjectAnalysis(BaseModel):
    domestic: PerspectiveItem
    international: PerspectiveItem
    economic: PerspectiveItem


class TimelineItem(BaseModel):
    year: str
    event: str


class AnalyzeNewsRequest(BaseModel):
    news: str

    class Config:
        str_strip_whitespace = True


class AnalyzeNewsResponse(BaseModel):
    subjects: list[str]
    analyses: dict[str, SubjectAnalysis]
    timeline: list[TimelineItem]
    related_resource: Literal["oil", "lng", "coal", "none"]


def _parse_analyze_json(text: str) -> dict:
    if not text or not text.strip():
        raise ValueError("レスポンスが空です")

    # ```json ``` で囲まれている場合を除去
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        text = "\n".join(lines[1:-1])

    return json.loads(text)


@app.post("/analyze-news", response_class=JSONResponse)
def analyze_news(body: AnalyzeNewsRequest):
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise ValueError("ANTHROPIC_API_KEY が設定されていません")

    client = Anthropic(api_key=api_key)

    is_valid = True

    # 分析処理
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4000,
        system=ANALYZE_SYSTEM_PROMPT,
        messages=[{"role": "user", "content": body.news}],
    )
    full_response = response.content[0].text
    data = _parse_analyze_json(full_response)
    analyses = {
        k: SubjectAnalysis(**v)
        for k, v in data.get("analyses", {}).items()
    }
    return {
        "is_valid": True,
        "subjects": data.get("subjects", []),
        "analyses": {k: v.model_dump() for k, v in analyses.items()},
        "timeline": [item.model_dump() for item in (TimelineItem(**i) for i in data.get("timeline", []))],
        "related_resource": data["related_resource"],
    }


# ===== 詳細説明（explain-detail） =====
EXPLAIN_DETAIL_PROMPT = """[subject]が[news]において[lens]の観点で
[content]という状況にある背景を、
中学生にも分かる言葉で3〜4文で説明してください。
また、この文脈で重要な国を3〜5個特定し、
それぞれの役割を20字以内で示してください。
必ずJSON形式のみで返してください。

返すJSONは次の形式に厳守してください（他に説明文は付けないでください）:
{
  "explanation": "3〜4文の詳細説明",
  "countries": [
    {
      "name": "英語の国名",
      "role": "役割の説明（20字以内）",
      "type": "ally" または "rival" または "neutral" または "subject"
    }
  ]
}
lens は "domestic"（国内政治）、"international"（国際政治）、"economic"（経済）のいずれかです。
type "subject" は分析対象の主体（国・組織）に該当する国を示します。"""


class ExplainDetailRequest(BaseModel):
    subject: str
    lens: str
    content: str
    news: str


class ExplainCountryItem(BaseModel):
    name: str
    role: str
    type: Literal["ally", "rival", "neutral", "subject"]


class ExplainDetailResponse(BaseModel):
    explanation: str
    countries: list[ExplainCountryItem]


@app.post("/explain-detail", response_model=ExplainDetailResponse)
def explain_detail(body: ExplainDetailRequest):
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise ValueError("ANTHROPIC_API_KEY が設定されていません")

    prompt = EXPLAIN_DETAIL_PROMPT.replace("[subject]", body.subject)
    prompt = prompt.replace("[lens]", body.lens)
    prompt = prompt.replace("[content]", body.content)
    prompt = prompt.replace("[news]", body.news)

    client = Anthropic(api_key=api_key)
    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        system=prompt,
        messages=[{"role": "user", "content": "上記の指示に従ってJSONのみを返してください。"}],
    )
    content = message.content
    if not content or not hasattr(content[0], "text"):
        raise ValueError("Anthropic API から空の応答が返りました")
    raw_text = content[0].text
    data = _parse_analyze_json(raw_text)
    return ExplainDetailResponse(
        explanation=data.get("explanation", ""),
        countries=[ExplainCountryItem(**item) for item in data.get("countries", [])],
    )


