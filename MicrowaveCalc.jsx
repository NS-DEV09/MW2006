import { useState, useEffect } from "react";
import { Zap, ChevronUp, ChevronDown, RotateCcw, Flame, Thermometer, Clock, Info, CheckCircle } from "lucide-react";

// ============================================================
//  📦 DATA CONFIGURATION — ここを編集して食材・時間を調整できます
// ============================================================

/**
 * 電子レンジ（NE-BS8D）の加熱データ
 * baseTime: 基準グラム数(baseWeight)あたりの秒数
 * watt: ワット数
 * unit: "g" | "個" | "人前"
 * step: カウンター増減のステップ
 * tips: ワンポイントアドバイス
 */
const MICROWAVE_DATA = {
  あたため: [
    {
      id: "rice",
      label: "ご飯",
      emoji: "🍚",
      watt: 500,
      baseWeight: 150,
      baseTime: 120, // 150gで2分
      unit: "g",
      step: 50,
      min: 100,
      max: 500,
      defaultAmount: 150,
      tips: "ラップをふんわりかけて加熱。途中で均一になるよう混ぜるとムラなく仕上がります。",
    },
    {
      id: "side_dish",
      label: "おかず",
      emoji: "🍱",
      watt: 600,
      baseWeight: 150,
      baseTime: 90, // 150gで1分30秒
      unit: "g",
      step: 50,
      min: 100,
      max: 500,
      defaultAmount: 150,
      tips: "ラップをふんわりかけて加熱。熱が均一になるよう途中で混ぜてください。",
    },
    {
      id: "drink",
      label: "飲み物",
      emoji: "☕",
      watt: 600,
      baseWeight: 150,
      baseTime: 60, // 150mlで1分
      unit: "ml",
      step: 50,
      min: 100,
      max: 500,
      defaultAmount: 200,
      tips: "突沸に注意！スプーンなどを入れて加熱すると安心。ラップは不要です。",
    },
    {
      id: "frozen_food",
      label: "冷凍食品",
      emoji: "🧊",
      watt: 600,
      baseWeight: 100,
      baseTime: 90, // 100gで1分30秒
      unit: "g",
      step: 50,
      min: 100,
      max: 400,
      defaultAmount: 200,
      tips: "袋の表示に従ってください。ラップをかけて端から中央に向けて混ぜると均一に。",
    },
  ],
  ゆで野菜: [
    {
      id: "leafy_veg",
      label: "葉茎菜類",
      emoji: "🥦",
      description: "ほうれん草・小松菜・キャベツなど",
      watt: 600,
      baseWeight: 100,
      baseTime: 90, // 100gで1分30秒
      unit: "g",
      step: 50,
      min: 50,
      max: 400,
      defaultAmount: 100,
      tips: "耐熱容器に入れて大さじ1の水を加え、ラップをかけて加熱。茎の向きを揃えると均一に火が通ります。",
    },
    {
      id: "root_veg",
      label: "根菜類",
      emoji: "🥕",
      description: "にんじん・じゃがいも・大根など",
      watt: 600,
      baseWeight: 100,
      baseTime: 120, // 100gで2分
      unit: "g",
      step: 50,
      min: 50,
      max: 500,
      defaultAmount: 150,
      tips: "大きさを均等に切りそろえて。水にさらしてからラップをかけると均一に火が通ります。",
    },
    {
      id: "broccoli",
      label: "ブロッコリー",
      emoji: "🌿",
      watt: 600,
      baseWeight: 100,
      baseTime: 110,
      unit: "g",
      step: 50,
      min: 50,
      max: 400,
      defaultAmount: 150,
      tips: "大さじ1の水をふりかけてラップで包み加熱。鮮やかな緑色を保つために加熱後すぐに広げて冷ます。",
    },
    {
      id: "potato",
      label: "じゃがいも",
      emoji: "🥔",
      watt: 600,
      baseWeight: 100,
      baseTime: 130,
      unit: "g",
      step: 50,
      min: 100,
      max: 600,
      defaultAmount: 200,
      tips: "皮ごとの場合は数か所フォークで穴をあけてから加熱。途中で裏返すと均一に仕上がります。",
    },
  ],
  解凍: [
    {
      id: "meat",
      label: "肉類",
      emoji: "🥩",
      watt: 200,
      baseWeight: 100,
      baseTime: 120, // 100gで2分
      unit: "g",
      step: 50,
      min: 100,
      max: 600,
      defaultAmount: 200,
      tips: "解凍モード（200W）でゆっくり解凍。途中で上下を返し、端が加熱されすぎないよう注意。",
    },
    {
      id: "fish",
      label: "魚類",
      emoji: "🐟",
      watt: 200,
      baseWeight: 100,
      baseTime: 120,
      unit: "g",
      step: 50,
      min: 100,
      max: 500,
      defaultAmount: 150,
      tips: "解凍モード（200W）で。半解凍くらいで取り出して常温で自然解凍すると旨みが逃げません。",
    },
    {
      id: "bread",
      label: "パン",
      emoji: "🍞",
      watt: 200,
      baseWeight: 60,
      baseTime: 40,
      unit: "g",
      step: 30,
      min: 30,
      max: 300,
      defaultAmount: 60,
      tips: "解凍後はトースターで温めると外はカリッと中はふっくらした仕上がりに。",
    },
  ],
};

/**
 * レンジメートプロのデータ
 * type: "grill" 両面焼き可能なもの
 */
const RANGEMATE_DATA = {
  肉・魚: [
    {
      id: "rm_fish",
      label: "焼き魚",
      emoji: "🐠",
      watt: 600,
      unit: "切れ",
      step: 1,
      min: 1,
      max: 4,
      defaultAmount: 1,
      timePerUnit: 240, // 1切れ4分
      tips: "塩をして5分おき、水気をふいてから庫内プレートに乗せて加熱。途中で裏返すときれいな焼き目に。",
    },
    {
      id: "rm_chicken",
      label: "鶏もも肉",
      emoji: "🍗",
      watt: 600,
      baseWeight: 100,
      baseTime: 150, // 100gで2分30秒
      unit: "g",
      step: 50,
      min: 100,
      max: 400,
      defaultAmount: 200,
      tips: "皮目を下にしてセット。途中で裏返すと全体にこんがりした焼き目がつきます。",
    },
    {
      id: "rm_hamburg",
      label: "ハンバーグ",
      emoji: "🍔",
      watt: 600,
      unit: "個",
      step: 1,
      min: 1,
      max: 4,
      defaultAmount: 1,
      timePerUnit: 210, // 1個3分30秒
      tips: "真ん中を少しへこませて形成するとムラなく火が通ります。途中で裏返してください。",
    },
    {
      id: "rm_bacon",
      label: "ベーコン・ソーセージ",
      emoji: "🥓",
      watt: 600,
      unit: "人前",
      step: 1,
      min: 1,
      max: 4,
      defaultAmount: 1,
      timePerUnit: 90, // 1人前1分30秒
      tips: "ソーセージは切り込みを入れてから置くと破裂防止になります。",
    },
  ],
  卵・野菜: [
    {
      id: "rm_egg",
      label: "目玉焼き",
      emoji: "🍳",
      watt: 600,
      unit: "個",
      step: 1,
      min: 1,
      max: 4,
      defaultAmount: 2,
      timePerUnit: 75, // 1個1分15秒
      tips: "黄身に爪楊枝で穴をあけてから加熱すると破裂防止になります。ふたをして加熱。",
    },
    {
      id: "rm_toast",
      label: "トースト",
      emoji: "🍞",
      watt: 600,
      unit: "枚",
      step: 1,
      min: 1,
      max: 4,
      defaultAmount: 2,
      timePerUnit: 150, // 1枚2分30秒
      tips: "食パンはそのままプレートに乗せて加熱。表面がカリッとなるまでお好みで調整を。",
    },
    {
      id: "rm_grilled_veg",
      label: "グリル野菜",
      emoji: "🫑",
      watt: 600,
      baseWeight: 100,
      baseTime: 120, // 100gで2分
      unit: "g",
      step: 50,
      min: 100,
      max: 400,
      defaultAmount: 200,
      tips: "厚さを均等に切りそろえて並べると均一に焼き目がつきます。途中で裏返してください。",
    },
    {
      id: "rm_corn",
      label: "とうもろこし",
      emoji: "🌽",
      watt: 600,
      unit: "本",
      step: 1,
      min: 1,
      max: 2,
      defaultAmount: 1,
      timePerUnit: 300, // 1本5分
      tips: "皮をむかずそのまま加熱すると甘みが逃げません。加熱後に皮をむいてどうぞ。",
    },
  ],
};

// ============================================================
//  🔧 ユーティリティ
// ============================================================

function calcMicrowaveTime(item, amount) {
  if (item.timePerUnit) {
    return item.timePerUnit * amount;
  }
  return Math.round((item.baseTime / item.baseWeight) * amount);
}

function formatTime(seconds) {
  if (seconds < 60) return { min: 0, sec: seconds };
  return { min: Math.floor(seconds / 60), sec: seconds % 60 };
}

function formatTimeStr(seconds) {
  const { min, sec } = formatTime(seconds);
  if (min === 0) return `${sec}秒`;
  if (sec === 0) return `${min}分`;
  return `${min}分 ${sec}秒`;
}

// ============================================================
//  🎨 UI Components
// ============================================================

function DeviceTab({ active, onClick, icon, label, color }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl transition-all duration-200 ${
        active
          ? `${color} text-white shadow-lg scale-[1.02]`
          : "bg-white/60 text-gray-500 border border-gray-200"
      }`}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-xs font-semibold tracking-wide">{label}</span>
    </button>
  );
}

function CategoryTab({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-150 ${
        active
          ? "bg-orange-500 text-white shadow"
          : "bg-white text-gray-500 border border-gray-200"
      }`}
    >
      {label}
    </button>
  );
}

function FoodCard({ item, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-150 w-full text-left ${
        selected
          ? "border-orange-400 bg-orange-50 shadow-md"
          : "border-gray-100 bg-white"
      }`}
    >
      <span className="text-3xl">{item.emoji}</span>
      <div className="flex-1">
        <div className="font-bold text-gray-800 text-base">{item.label}</div>
        {item.description && (
          <div className="text-xs text-gray-400 mt-0.5">{item.description}</div>
        )}
      </div>
      {selected && <CheckCircle size={20} className="text-orange-500 shrink-0" />}
    </button>
  );
}

function AmountCounter({ amount, step, min, max, unit, onChange }) {
  return (
    <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-200 p-4">
      <div className="text-gray-600 font-semibold text-sm">量</div>
      <div className="flex items-center gap-4">
        <button
          onClick={() => onChange(Math.max(min, amount - step))}
          disabled={amount <= min}
          className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center active:scale-95 transition-transform disabled:opacity-30"
        >
          <ChevronDown size={22} className="text-gray-600" />
        </button>
        <div className="text-center min-w-[70px]">
          <span className="text-2xl font-bold text-gray-800">{amount}</span>
          <span className="text-sm text-gray-500 ml-1">{unit}</span>
        </div>
        <button
          onClick={() => onChange(Math.min(max, amount + step))}
          disabled={amount >= max}
          className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center active:scale-95 transition-transform disabled:opacity-30"
        >
          <ChevronUp size={22} className="text-gray-600" />
        </button>
      </div>
    </div>
  );
}

function ResultCard({ item, amount, device }) {
  const totalSeconds = calcMicrowaveTime(item, amount);
  const { min, sec } = formatTime(totalSeconds);

  const isRangeMate = device === "rangemate";
  const accentColor = isRangeMate ? "from-red-500 to-orange-500" : "from-blue-500 to-cyan-400";
  const bgColor = isRangeMate ? "bg-red-50" : "bg-blue-50";
  const textColor = isRangeMate ? "text-red-600" : "text-blue-600";
  const borderColor = isRangeMate ? "border-red-200" : "border-blue-200";

  return (
    <div className={`rounded-3xl border-2 ${borderColor} ${bgColor} overflow-hidden`}>
      {/* Header */}
      <div className={`bg-gradient-to-r ${accentColor} px-5 py-3 flex items-center gap-2`}>
        <Zap size={18} className="text-white" />
        <span className="text-white font-bold text-sm">加熱の目安</span>
      </div>

      {/* Main Result */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-end justify-around mb-4">
          {/* Watt */}
          <div className="text-center">
            <div className={`text-4xl font-black ${textColor} leading-none`}>
              {item.watt}
            </div>
            <div className="text-gray-500 text-sm font-semibold mt-1">W</div>
          </div>

          <div className="text-gray-300 text-3xl font-light">×</div>

          {/* Time */}
          <div className="text-center">
            {min > 0 && (
              <span className={`text-4xl font-black ${textColor} leading-none`}>
                {min}
                <span className="text-xl font-bold">分</span>
              </span>
            )}
            {sec > 0 && (
              <span className={`text-4xl font-black ${textColor} leading-none ${min > 0 ? "ml-1" : ""}`}>
                {sec}
                <span className="text-xl font-bold">秒</span>
              </span>
            )}
            <div className="text-gray-500 text-sm font-semibold mt-1">加熱時間</div>
          </div>
        </div>

        {/* Summary Row */}
        <div className="bg-white rounded-2xl p-3 flex items-center justify-center gap-2 mb-4">
          <Clock size={16} className="text-gray-400" />
          <span className="text-gray-700 font-semibold text-sm">
            {item.emoji} {item.label}（{amount}{item.unit}）→ {item.watt}W / {formatTimeStr(totalSeconds)}
          </span>
        </div>

        {/* Tips */}
        {item.tips && (
          <div className="flex gap-2 bg-amber-50 border border-amber-200 rounded-2xl p-3">
            <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-amber-800 text-xs leading-relaxed">{item.tips}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
//  🏠 Main App
// ============================================================

export default function MicrowaveCalcApp() {
  const [device, setDevice] = useState("microwave"); // "microwave" | "rangemate"
  const [mwCategory, setMwCategory] = useState("あたため");
  const [rmCategory, setRmCategory] = useState("肉・魚");
  const [selectedItem, setSelectedItem] = useState(null);
  const [amount, setAmount] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const mwCategories = Object.keys(MICROWAVE_DATA);
  const rmCategories = Object.keys(RANGEMATE_DATA);

  const currentCategory = device === "microwave" ? mwCategory : rmCategory;
  const currentItems =
    device === "microwave"
      ? MICROWAVE_DATA[mwCategory]
      : RANGEMATE_DATA[rmCategory];

  // Reset when device or category changes
  useEffect(() => {
    setSelectedItem(null);
    setShowResult(false);
  }, [device, mwCategory, rmCategory]);

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setAmount(item.defaultAmount);
    setShowResult(false);
  };

  const handleCalc = () => {
    if (!selectedItem) return;
    setShowResult(true);
    // scroll to result
    setTimeout(() => {
      document.getElementById("result-section")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleReset = () => {
    setSelectedItem(null);
    setShowResult(false);
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-white"
      style={{ fontFamily: "'Hiragino Sans', 'Yu Gothic', 'Noto Sans JP', sans-serif" }}
    >
      {/* Status Bar Spacer */}
      <div className="h-3" />

      {/* Header */}
      <header className="px-4 pt-2 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow">
            <Flame size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-black text-gray-800 leading-tight">加熱時間 計算アプリ</h1>
            <p className="text-[10px] text-gray-400">NE-BS8D ＆ レンジメートプロ</p>
          </div>
        </div>
      </header>

      <main className="px-4 pb-24 space-y-4">
        {/* ① Device Selector */}
        <section>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 pl-1">① 調理器具</p>
          <div className="flex gap-2">
            <DeviceTab
              active={device === "microwave"}
              onClick={() => setDevice("microwave")}
              icon="📡"
              label="電子レンジ"
              color="bg-gradient-to-br from-blue-500 to-cyan-500"
            />
            <DeviceTab
              active={device === "rangemate"}
              onClick={() => setDevice("rangemate")}
              icon="🔥"
              label="レンジメートプロ"
              color="bg-gradient-to-br from-red-500 to-orange-500"
            />
          </div>
        </section>

        {/* ② Category Selector */}
        <section>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 pl-1">② カテゴリ</p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {(device === "microwave" ? mwCategories : rmCategories).map((cat) => (
              <CategoryTab
                key={cat}
                label={cat}
                active={currentCategory === cat}
                onClick={() => {
                  device === "microwave" ? setMwCategory(cat) : setRmCategory(cat);
                }}
              />
            ))}
          </div>
        </section>

        {/* ③ Food Item Selector */}
        <section>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 pl-1">③ 食材を選ぶ</p>
          <div className="space-y-2">
            {currentItems.map((item) => (
              <FoodCard
                key={item.id}
                item={item}
                selected={selectedItem?.id === item.id}
                onClick={() => handleSelectItem(item)}
              />
            ))}
          </div>
        </section>

        {/* ④ Amount */}
        {selectedItem && (
          <section>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 pl-1">④ 量の設定</p>
            <AmountCounter
              amount={amount}
              step={selectedItem.step}
              min={selectedItem.min}
              max={selectedItem.max}
              unit={selectedItem.unit}
              onChange={(v) => {
                setAmount(v);
                setShowResult(false);
              }}
            />
          </section>
        )}

        {/* Calc Button */}
        {selectedItem && (
          <button
            onClick={handleCalc}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-black text-lg shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            <Thermometer size={22} />
            加熱時間を計算する
          </button>
        )}

        {/* ⑤ Result */}
        {showResult && selectedItem && (
          <section id="result-section">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 pl-1">⑤ 結果</p>
            <ResultCard item={selectedItem} amount={amount} device={device} />

            {/* Reset */}
            <button
              onClick={handleReset}
              className="mt-3 w-full py-3 rounded-2xl border-2 border-gray-200 bg-white text-gray-500 font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <RotateCcw size={16} />
              最初からやり直す
            </button>
          </section>
        )}
      </main>

      {/* Bottom Nav Placeholder */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-white/80 backdrop-blur border-t border-gray-100 flex items-center justify-center">
        <p className="text-[11px] text-gray-400">加熱時間はあくまでも目安です。様子を見ながら調整してください。</p>
      </div>
    </div>
  );
}
