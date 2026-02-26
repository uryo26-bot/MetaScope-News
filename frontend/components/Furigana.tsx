"use client";

import { ReactNode } from "react";

// 294単語のふりがなマッピング
const furiganaMap: Record<string, string> = {
  // 共通語彙
  目: "め",
  前: "まえ",
  現象: "げんしょう",
  起点: "きてん",
  社会: "しゃかい",
  産業: "さんぎょう",
  資源: "しげん",
  構造: "こうぞう",
  理解: "りかい",
  探索: "たんさく",
  型: "がた",
  アプリ: "あぷり",
  提供: "ていきょう",
  専門: "せんもん",
  知識: "ちしき",
  前提: "ぜんてい",
  設計: "せっけい",
  
  // EneChart語彙
  日本: "にほん",
  電源: "でんげん",
  割合: "わりあい",
  年度: "ねんど",
  消費: "しょうひ",
  電力: "でんりょく",
  電力情報: "でんりょくじょうほう",
  発電量: "はつでんりょう",
  詳細: "しょうさい",
  情報: "じょうほう",
  表示: "ひょうじ",
  選択: "せんたく",
  各: "かく",
  上: "うえ",
  下: "した",
  
  // エネルギー種類
  天然: "てんねん",
  ガス: "がす",
  石炭: "せきたん",
  石油: "せきゆ",
  石油等: "せきゆとう",
  等: "とう",
  原子力: "げんしりょく",
  水力: "すいりょく",
  風力: "ふうりょく",
  地熱: "ちねつ",
  バイオマス: "ばいおます",
  太陽光: "たいようこう",
  
  // 評価語彙
  評価: "ひょうか",
  指標: "しひょう",
  費用: "ひよう",
  安定性: "あんていせい",
  環境: "かんきょう",
  負荷: "ふか",
  供給: "きょうきゅう",
  コスト: "こすと",
  供給安定性: "きょうきゅうあんていせい",
  環境負荷: "かんきょうふか",
  
  // 輸入語彙
  輸入: "ゆにゅう",
  輸入元: "ゆにゅうもと",
  輸入元国: "ゆにゅうもとこく",
  輸入元国の割合: "ゆにゅうもとこくのわりあい",
  国: "くに",
  国内: "こくない",
  自給: "じきゅう",
  エネルギー源: "えねるぎーげん",
  国内エネルギー源: "こくないえねるぎーげん",
  各国: "かっこく",
  国旗: "こっき",
  クリック: "くりっく",
  
  // プロセス語彙
  プロセス: "ぷろせす",
  発電: "はつでん",
  発電プロセス: "はつでんぷろせす",
  採掘: "さいくつ",
  輸送: "ゆそう",
  貯蔵: "ちょぞう",
  送電: "そうでん",
  燃焼: "ねんしょう",
  核分裂: "かくぶんれつ",
  水流: "すいりゅう",
  回転: "かいてん",
  自動: "じどう",
  再生: "さいせい",
  停止: "ていし",
  手動: "しゅどう",
  
  // 技術語彙
  液化: "えきか",
  冷却: "れいきゃく",
  体積: "たいせき",
  効率的: "こうりつてき",
  専用: "せんよう",
  二重: "にじゅう",
  特殊: "とくしゅ",
  タービン: "たーびん",
  原子炉: "げんしろ",
  ダム: "だむ",
  落水: "らくすい",
  水車: "すいしゃ",
  蒸気: "じょうき",
  熱源: "ねつげん",
  
  // UI語彙
  閉じる: "とじる",
  ボタン: "ぼたん",
  モーダル: "もーだる",
  説明: "せつめい",
  定義: "ていぎ",
  フキダシ: "ふきだし",
  アイコン: "あいこん",
  タイトル: "たいとる",
  ステップ: "すてっぷ",
  拡大: "かくだい",
  カード: "かーど",
  
  // その他
  億: "おく",
  kWh: "きろわっと",
  単位: "たんい",
  パーセント: "ぱーせんと",
  年: "ねん",
  の: "の",
  を: "を",
  に: "に",
  が: "が",
  と: "と",
  で: "で",
  から: "から",
  まで: "まで",
  へ: "へ",
  読み込み中: "よみこみちゅう",
  エラー: "えらー",
  高い: "たかい",
  中: "ちゅう",
  安い: "やすい",
  少ない: "すくない",
  多い: "おおい",
  最も: "もっとも",
  気候: "きこう",
  変動: "へんどう",
  影響: "えいきょう",
  排出: "はいしゅつ",
};

// 長い単語から順にマッチするようにソート
const sortedKeys = Object.keys(furiganaMap).sort((a, b) => b.length - a.length);

/** 文字列がすべてひらがなかどうか（ひらがなのみの語にはふりがなを付けない） */
function isAllHiragana(str: string): boolean {
  return /^[\u3040-\u309F]+$/.test(str);
}

interface FuriganaTextProps {
  children: ReactNode;
  enabled: boolean;
}

export function FuriganaText({ children, enabled }: FuriganaTextProps): ReactNode {
  // 文字列以外（数値や要素ツリー）はそのまま返す
  if (!enabled || typeof children !== "string") {
    return <>{children}</>;
  }

  const text = children;
  const elements: ReactNode[] = [];
  let processedRanges: Array<{ start: number; end: number; key: string }> = [];

  // 長い単語から順にマッチして、重複しない範囲を記録
  for (const key of sortedKeys) {
    const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
    let match;
    while ((match = regex.exec(text)) !== null) {
      const start = match.index;
      const end = start + key.length;
      
      // 既存の範囲と重複しないかチェック
      // ひらがなのみの語にはふりがなを付けない（の・が・から など）
      if (isAllHiragana(key)) continue;

      const overlaps = processedRanges.some(
        (range) => !(end <= range.start || start >= range.end)
      );
      
      if (!overlaps) {
        processedRanges.push({ start, end, key });
      }
    }
  }

  // 開始位置でソート
  processedRanges.sort((a, b) => a.start - b.start);

  let lastIndex = 0;
  for (const range of processedRanges) {
    // 前のテキストを追加
    if (range.start > lastIndex) {
      elements.push(
        <span key={`text-${lastIndex}`}>{text.substring(lastIndex, range.start)}</span>
      );
    }

    // ふりがな付きテキストを追加
    const furigana = furiganaMap[range.key];
    elements.push(
      <ruby key={`ruby-${range.start}`}>
        {range.key}
        <rt>{furigana}</rt>
      </ruby>
    );

    lastIndex = range.end;
  }

  // 残りのテキストを追加
  if (lastIndex < text.length) {
    elements.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex)}</span>);
  }

  return elements.length > 0 ? <span className="furigana-text">{elements}</span> : <>{text}</>;
}
