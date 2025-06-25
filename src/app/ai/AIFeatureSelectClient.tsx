"use client";
import { useRouter } from "next/navigation";
import { FaLightbulb, FaFileAlt, FaStar, FaCalendar } from "react-icons/fa";

const aiFeatures = [
  {
    id: "mood-recommendation",
    name: "今の気分に合う作品を提案",
    description: "気分に合わせて映画・アニメ・ドラマを提案",
    icon: FaLightbulb,
    available: true,
    href: "/ai/recommendation"
  },
  {
    id: "summary",
    name: "作品の要約（開発中）",
    description: "作品の内容をAIが要約・解説",
    icon: FaFileAlt,
    available: false,
    href: "#"
  },
  {
    id: "review",
    name: "レビュー自動生成（開発中）",
    description: "複数のレビューをAIが分析・比較",
    icon: FaStar,
    available: false,
    href: "#"
  },
  {
    id: "schedule",
    name: "視聴スケジュール提案（開発中）",
    description: "時間に合わせた視聴スケジュールを提案",
    icon: FaCalendar,
    available: false,
    href: "#"
  },
];

export default function AIFeatureSelectClient() {
  const router = useRouter();
  return (
    <div className="bg-dark text-white px-4 mt-[-8px]">
      <div className="max-w-2xl w-full mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2 mt-[-64px]">AI機能メニュー</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {aiFeatures.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <button
                key={feature.id}
                onClick={() => feature.available && router.push(feature.href)}
                disabled={!feature.available}
                className={`group p-8 rounded-xl transition-all duration-300 flex flex-col items-center justify-center space-y-4 shadow-lg border border-gray-700 ${feature.available
                  ? 'bg-lightgray hover:bg-primary/80 hover:text-white cursor-pointer hover:scale-105 hover:shadow-2xl'
                  : 'bg-gray-800 cursor-not-allowed opacity-50'
                  }`}
              >
                <IconComponent className="text-4xl text-primary group-hover:text-white transition-colors duration-300" />
                <div className="text-xl font-semibold text-center">{feature.name}</div>
                <div className="text-gray-400 text-center text-sm">{feature.description}</div>
                {!feature.available && (
                  <div className="text-yellow-500 text-xs mt-2 font-medium">開発中</div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
} 