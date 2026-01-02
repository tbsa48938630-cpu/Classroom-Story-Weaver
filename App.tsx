
import React, { useState, useCallback } from 'react';
import { Sparkles, BookOpen, AlertCircle, RefreshCw, ChevronDown, Download } from 'lucide-react';
import { MagicButton } from './components/MagicButton';
import { StoryCard } from './components/StoryCard';
import { generateStoryStructure, generateIllustration } from './services/geminiService';
import { Story, AppStatus, StoryParams } from './types';

const App: React.FC = () => {
  const [params, setParams] = useState<StoryParams>({
    keywords: '',
    moral: '誠實的重要性',
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

      // 1. Generate story text
      const newStory = await generateStoryStructure(params.keywords, params.moral, params.style);
      setStory(newStory);
      setStatus(AppStatus.ILLUSTRATING);

      // 2. Generate illustrations sequentially to show progress
      const updatedPages = [...newStory.pages];
      for (let i = 0; i < updatedPages.length; i++) {
        try {
          const imgUrl = await generateIllustration(updatedPages[i].visualPrompt);
          updatedPages[i] = { ...updatedPages[i], imageUrl: imgUrl };
          setStory(prev => prev ? { ...prev, pages: [...updatedPages] } : null);
        } catch (err) {
          console.error(`Failed to generate image for page ${i+1}`, err);
          // Don't stop the whole process if one image fails
        }
      }

      setStatus(AppStatus.FINISHED);
    } catch (err: any) {
      console.error(err);
      setStatus(AppStatus.ERROR);
      setErrorMessage(err.message || '發生未知錯誤，請稍後再試。');
    }
  };

  const handleReset = () => {
    setStory(null);
    setStatus(AppStatus.IDLE);
    setParams({ ...params, keywords: '' });
  };

  return (
    <div className="min-h-screen bg-amber-50 text-gray-800 pb-20 px-4">
      {/* Header */}
      <header className="max-w-4xl mx-auto pt-12 pb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-2xl shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            班級專屬繪本魔法師
          </h1>
        </div>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          將課堂上的隨機點子，轉化為啟迪心靈的奇幻繪本。讓品格教育、班級凝聚力在魔法中萌芽。
        </p>
      </header>

      <main className="max-w-5xl mx-auto">
        {status === AppStatus.IDLE && (
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border-2 border-amber-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-500" /> 故事關鍵字
                  </label>
                  <textarea
                    className="w-full h-32 p-4 rounded-2xl bg-amber-50 border-2 border-transparent focus:border-purple-400 focus:bg-white outline-none transition-all text-lg"
                    placeholder="例如：營養午餐、外星人、不想寫作業..."
                    value={params.keywords}
                    onChange={(e) => setParams({ ...params, keywords: e.target.value })}
                  />
                  <p className="mt-2 text-sm text-gray-500 italic">💡 試著加入學生的名字或近期班級發生的趣事！</p>
                </div>

                <div>
                  <label className="block text-lg font-bold text-gray-700 mb-2">
                    教育重點 / 寓意
                  </label>
                  <select
                    className="w-full p-4 rounded-2xl bg-amber-50 border-2 border-transparent focus:border-purple-400 focus:bg-white outline-none transition-all text-lg appearance-none cursor-pointer"
                    value={params.moral}
                    onChange={(e) => setParams({ ...params, moral: e.target.value })}
                  >
                    <option value="誠實的重要性">誠實的重要性</option>
                    <option value="團隊合作的力量">團隊合作的力量</option>
                    <option value="尊重每個人的獨特性">尊重每個人的獨特性</option>
                    <option value="面對失敗的勇氣">面對失敗的勇氣</option>
                    <option value="愛護環境與珍惜資源">愛護環境與珍惜資源</option>
                    <option value="幽默感與快樂學習">幽默感與快樂學習</option>
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-bold text-gray-700 mb-2">
                    插畫魔法風格
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { name: '水彩溫馨', prompt: '彩色水彩繪本風格，角色溫柔可愛' },
                      { name: '手繪蠟筆', prompt: '充滿童趣的蠟筆畫風格，色彩鮮豔' },
                      { name: '像素冒險', prompt: '復古像素藝術風格，具有電子遊戲感' },
                      { name: '3D 立體', prompt: '現代 3D 動畫風格，明亮且充滿細節' },
                    ].map((style) => (
                      <button
                        key={style.name}
                        onClick={() => setParams({ ...params, style: style.prompt })}
                        className={`p-4 rounded-2xl border-2 transition-all ${
                          params.style === style.prompt 
                            ? 'border-purple-500 bg-purple-50 text-purple-700 font-bold' 
                            : 'border-amber-100 bg-white hover:border-amber-200'
                        }`}
                      >
                        {style.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center h-full pt-4">
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
          <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in duration-500">
            <div className="relative mb-12">
              <div className="absolute inset-0 bg-purple-400 rounded-full blur-3xl opacity-20 animate-pulse"></div>
              <div className="relative bg-white p-8 rounded-full shadow-2xl border-4 border-purple-100">
                <BookOpen className="w-20 h-20 text-purple-500 animate-bounce" />
              </div>
              <div className="absolute -top-4 -right-4">
                <Sparkles className="w-10 h-10 text-pink-400 animate-pulse" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-purple-600 mb-4">
              {status === AppStatus.WRITING ? '正在撰寫奇幻劇本...' : '魔法畫筆繪製中...'}
            </h2>
            <p className="text-gray-500 text-lg">這可能需要幾十秒的時間，魔法正在匯聚中</p>
            
            {story && (
              <div className="mt-12 w-full max-w-2xl space-y-4">
                <div className="flex justify-between items-center px-4">
                  <span className="text-sm font-bold text-purple-400 uppercase tracking-widest">魔法進度</span>
                  <span className="text-sm font-bold text-purple-600">
                    {Math.round((story.pages.filter(p => p.imageUrl).length / story.pages.length) * 100)}%
                  </span>
                </div>
                <div className="w-full h-4 bg-purple-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000"
                    style={{ width: `${(story.pages.filter(p => p.imageUrl).length / story.pages.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )}

        {(status === AppStatus.FINISHED || (status === AppStatus.ILLUSTRATING && story)) && (
          <div className="animate-in fade-in slide-in-from-bottom-10 duration-700">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
              <h2 className="text-4xl font-black text-purple-800 text-center md:text-left">
                📖 {story?.title}
              </h2>
              <div className="flex gap-4">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-6 py-2 bg-white rounded-full text-purple-600 font-bold border-2 border-purple-100 hover:bg-purple-50 transition-colors shadow-sm"
                >
                  <RefreshCw className="w-5 h-5" /> 重新創作
                </button>
                {status === AppStatus.FINISHED && (
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-6 py-2 bg-purple-600 rounded-full text-white font-bold hover:bg-purple-700 transition-colors shadow-lg"
                  >
                    <Download className="w-5 h-5" /> 列印分享
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-8">
              {story?.pages.map((page, idx) => (
                <StoryCard 
                  key={idx} 
                  page={page} 
                  pageNumber={idx + 1} 
                />
              ))}
            </div>

            {status === AppStatus.ILLUSTRATING && (
              <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-8 py-4 rounded-full shadow-2xl border-2 border-purple-200 flex items-center gap-4 animate-bounce">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                <span className="text-purple-700 font-bold">插畫師正在加緊趕工...</span>
              </div>
            )}

            {status === AppStatus.FINISHED && (
              <div className="mt-16 text-center pb-20">
                <div className="inline-block p-12 bg-white rounded-[3rem] shadow-xl border-4 border-amber-100 relative">
                  <div className="absolute -top-8 -left-8 bg-pink-400 text-white p-4 rounded-full shadow-lg rotate-12">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">故事魔法結語</h3>
                  <p className="text-xl text-gray-600 italic">「每一個故事，都是一顆種子，在孩子的心中開出善良的花。」</p>
                  <div className="mt-8 flex justify-center gap-4">
                    <MagicButton onClick={handleReset}>創作下一個故事</MagicButton>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {status === AppStatus.ERROR && (
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center border-4 border-red-50">
            <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">喔不！魔法好像失效了</h2>
            <p className="text-gray-500 mb-8">{errorMessage}</p>
            <MagicButton onClick={handleReset}>重試一次魔法</MagicButton>
          </div>
        )}
      </main>

      {/* Background elements */}
      <div className="fixed top-20 left-10 opacity-10 pointer-events-none hidden lg:block">
        <Sparkles className="w-24 h-24 text-purple-400 rotate-12" />
      </div>
      <div className="fixed bottom-20 right-10 opacity-10 pointer-events-none hidden lg:block">
        <BookOpen className="w-24 h-24 text-pink-400 -rotate-12" />
      </div>
    </div>
  );
};

export default App;
