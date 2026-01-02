
import React, { useState } from 'react';
import { Sparkles, BookOpen, AlertCircle, RefreshCw, Download, User } from 'lucide-react';
import { MagicButton } from './components/MagicButton';
import { StoryCard } from './components/StoryCard';
import { generateStoryStructure, generateIllustration } from './services/geminiService';
import { Story, AppStatus, StoryParams } from './types';

const App: React.FC = () => {
  const [params, setParams] = useState<StoryParams>({
    keywords: '',
    moral: '團隊合作的力量',
    style: '彩色水彩繪本風格，角色溫柔可愛'
  });

  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [story, setStory] = useState<Story | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!params.keywords.trim()) {
      setErrorMessage('請輸入故事關鍵字！');
      return;
    }

    try {
      setErrorMessage(null);
      setStatus(AppStatus.WRITING);
      setStory(null);

      const newStory = await generateStoryStructure(params.keywords, params.moral, params.style);
      setStory(newStory);
      setStatus(AppStatus.ILLUSTRATING);

      const updatedPages = [...newStory.pages];
      for (let i = 0; i < updatedPages.length; i++) {
        try {
          const imgUrl = await generateIllustration(updatedPages[i].visualPrompt);
          updatedPages[i] = { ...updatedPages[i], imageUrl: imgUrl };
          setStory(prev => prev ? { ...prev, pages: [...updatedPages] } : null);
        } catch (err) {
          console.error(`Page ${i+1} image error:`, err);
        }
      }

      setStatus(AppStatus.FINISHED);
    } catch (err: any) {
      console.error(err);
      setStatus(AppStatus.ERROR);
      setErrorMessage(err.message || '魔法連線中斷，請確認 API Key 是否設定正確。');
    }
  };

  const handleReset = () => {
    setStory(null);
    setStatus(AppStatus.IDLE);
    setParams({ ...params, keywords: '' });
  };

  return (
    <div className="min-h-screen bg-[#fdf6e3] text-gray-800 pb-10 px-4 flex flex-col">
      <header className="max-w-4xl mx-auto pt-12 pb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-2xl shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            班級專屬繪本魔法師
          </h1>
        </div>
        
        <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-1.5 rounded-full border border-purple-100 mb-6 shadow-sm">
          <User className="w-4 h-4 text-purple-500" />
          <span className="text-purple-600 font-bold text-sm">作者：Jacky鐘</span>
        </div>

        <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
          將課堂點子化為啟迪心靈的繪本。讓品格教育在魔法中萌芽。
        </p>
      </header>

      <main className="max-w-5xl mx-auto flex-grow w-full">
        {status === AppStatus.IDLE && (
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border-2 border-amber-100 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-500" /> 故事關鍵字
                  </label>
                  <textarea
                    className="w-full h-40 p-4 rounded-2xl bg-amber-50/50 border-2 border-transparent focus:border-purple-400 focus:bg-white outline-none transition-all text-lg shadow-inner"
                    placeholder="輸入課堂趣事，例如：小明帶了彩色青蛙、外星人來校餐..."
                    value={params.keywords}
                    onChange={(e) => setParams({ ...params, keywords: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-lg font-bold text-gray-700 mb-3">教育重點</label>
                  <select
                    className="w-full p-4 rounded-2xl bg-amber-50/50 border-2 border-transparent focus:border-purple-400 focus:bg-white outline-none transition-all text-lg shadow-inner cursor-pointer"
                    value={params.moral}
                    onChange={(e) => setParams({ ...params, moral: e.target.value })}
                  >
                    <option value="誠實的重要性">誠實的重要性</option>
                    <option value="團隊合作的力量">團隊合作的力量</option>
                    <option value="尊重每個人的獨特性">尊重每個人的獨特性</option>
                    <option value="面對失敗的勇氣">面對失敗的勇氣</option>
                    <option value="愛護環境與珍惜資源">愛護環境與珍惜資源</option>
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-bold text-gray-700 mb-3">繪本風格</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['水彩溫馨', '手繪蠟筆', '像素冒險', '3D 立體'].map((styleName) => {
                      const stylePromptMap: Record<string, string> = {
                        '水彩溫馨': '彩色水彩繪本風格，角色溫柔可愛',
                        '手繪蠟筆': '充滿童趣的蠟筆畫風格，色彩鮮豔',
                        '像素冒險': '復古像素藝術風格，具有電子遊戲感',
                        '3D 立體': '現代 3D 動畫風格，明亮且充滿細節'
                      };
                      return (
                        <button
                          key={styleName}
                          onClick={() => setParams({ ...params, style: stylePromptMap[styleName] })}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            params.style === stylePromptMap[styleName] 
                              ? 'border-purple-500 bg-purple-50 text-purple-700 font-bold' 
                              : 'border-amber-100 bg-white hover:border-amber-200'
                          }`}
                        >
                          {styleName}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center pt-6">
                  <MagicButton 
                    onClick={handleGenerate} 
                    loading={status !== AppStatus.IDLE}
                  >
                    施展故事魔法
                  </MagicButton>
                  {errorMessage && (
                    <div className="mt-4 flex items-center gap-2 text-red-500 font-medium">
                      <AlertCircle className="w-5 h-5" />
                      {errorMessage}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {(status === AppStatus.WRITING || status === AppStatus.ILLUSTRATING) && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="relative mb-10">
              <div className="absolute inset-0 bg-purple-400 rounded-full blur-3xl opacity-20 animate-pulse"></div>
              <BookOpen className="w-24 h-24 text-purple-500 animate-bounce relative z-10" />
            </div>
            <h2 className="text-3xl font-bold text-purple-700 mb-4">
              {status === AppStatus.WRITING ? '正在構思奇幻情節...' : '魔法畫筆繪製中...'}
            </h2>
            <p className="text-gray-500 text-lg">Jacky鐘的魔法畫室正在為您服務</p>
            {story && (
              <div className="mt-12 w-full max-w-md bg-white p-2 rounded-full shadow-inner border border-purple-100">
                <div 
                  className="h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-700"
                  style={{ width: `${(story.pages.filter(p => p.imageUrl).length / story.pages.length) * 100}%` }}
                ></div>
              </div>
            )}
          </div>
        )}

        {(status === AppStatus.FINISHED || (status === AppStatus.ILLUSTRATING && story)) && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 px-2">
            <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
              <div className="text-center md:text-left">
                <h2 className="text-4xl font-black text-purple-900 mb-2">
                  📖 {story?.title}
                </h2>
                <div className="flex items-center gap-2 text-purple-500 font-bold">
                   <User className="w-4 h-4" /> 作者：Jacky鐘
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-6 py-2.5 bg-white rounded-full text-purple-600 font-bold border-2 border-purple-100 hover:bg-purple-50 transition-all shadow-sm active:scale-95"
                >
                  <RefreshCw className="w-5 h-5" /> 重新創作
                </button>
                {status === AppStatus.FINISHED && (
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 rounded-full text-white font-bold hover:bg-purple-700 transition-all shadow-lg active:scale-95"
                  >
                    <Download className="w-5 h-5" /> 列印繪本
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-10">
              {story?.pages.map((page, idx) => (
                <StoryCard key={idx} page={page} pageNumber={idx + 1} />
              ))}
            </div>

            {status === AppStatus.FINISHED && (
              <footer className="mt-20 text-center pb-20 border-t border-amber-200 pt-16">
                 <p className="text-2xl font-bold text-purple-800 mb-4">✨ 魔法繪本創作完成 ✨</p>
                 <p className="text-gray-500 mb-8">希望這份由 Jacky鐘 為您準備的故事，能讓孩子們感受到魔法的驚喜！</p>
                 <MagicButton onClick={handleReset}>創作下一個故事</MagicButton>
              </footer>
            )}
          </div>
        )}
      </main>

      <footer className="mt-auto py-8 text-center border-t border-amber-200/50">
        <p className="text-gray-400 text-sm font-medium">
          © 2025 班級專屬繪本魔法師 | 開發者：<span className="text-purple-400">Jacky鐘</span>
        </p>
      </footer>
    </div>
  );
};

export default App;
