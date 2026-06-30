import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GearIcon, LightningBoltIcon, MagicWandIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Tab {
  value: string;
  label: string;
  icon?: React.ReactNode;
  content?: React.ReactNode;
}

type SummaryLength = "short" | "medium" | "long";
type SummaryFormat = "markdown" | "plain-text";
type SummaryType = "key-points" | "tldr" | "teaser" | "headline";
type ModelAvailability = "available" | "unavailable" | "downloadable" | "downloading" | null;

const TABS: Tab[] = [
  {
    value: "summarizer",
    label: "生成摘要",
    icon: <MagicWandIcon />,
  },
  {
    value: "translator",
    label: "翻译",
    icon: <LightningBoltIcon />,
  },
  {
    value: "setting",
    label: "设置",
    icon: <GearIcon />,
  },
];

const LANGUAGES = [
  { value: "en", label: "英语" },
  { value: "zh", label: "中文" },
  { value: "ja", label: "日语" },
  { value: "ko", label: "韩语" },
  { value: "fr", label: "法语" },
  { value: "de", label: "德语" },
  { value: "es", label: "西班牙语" },
  { value: "ru", label: "俄语" },
  { value: "pt", label: "葡萄牙语" },
  { value: "it", label: "意大利语" },
  { value: "ar", label: "阿拉伯语" },
  { value: "hi", label: "印地语" },
  { value: "th", label: "泰语" },
  { value: "vi", label: "越南语" },
  { value: "id", label: "印度尼西亚语" },
  { value: "tr", label: "土耳其语" },
  { value: "nl", label: "荷兰语" },
  { value: "sv", label: "瑞典语" },
  { value: "da", label: "丹麦语" },
  { value: "fi", label: "芬兰语" },
  { value: "no", label: "挪威语" },
  { value: "pl", label: "波兰语" },
  { value: "cs", label: "捷克语" },
  { value: "ro", label: "罗马尼亚语" },
  { value: "hu", label: "匈牙利语" },
  { value: "bg", label: "保加利亚语" },
  { value: "hr", label: "克罗地亚语" },
  { value: "sk", label: "斯洛伐克语" },
  { value: "sl", label: "斯洛文尼亚语" },
  { value: "lt", label: "立陶宛语" },
  { value: "uk", label: "乌克兰语" },
  { value: "el", label: "希腊语" },
  { value: "he", label: "希伯来语" },
  { value: "bn", label: "孟加拉语" },
  { value: "ta", label: "泰米尔语" },
  { value: "te", label: "泰卢固语" },
  { value: "kn", label: "卡纳达语" },
  { value: "mr", label: "马拉地语" },
  { value: "zh-Hant", label: "繁体中文" },
];

const LANGUAGES_MAP = new Map(
  [
    ...[
      { value: "zh-Hans", label: "简体中文" },
      { value: "lzh", label: "文言文" },
    ],
    ...LANGUAGES,
  ].map((item) => [item.value, item.label]),
);

interface UserInfo {
  islogin: boolean;
  username: string;
  avatar: string;
}

export default function SidePannel() {
  const [tabValue, setTabValue] = useState("summarizer");
  const [userInfo, setUserInfo] = useState<UserInfo>({
    islogin: false,
    username: "",
    avatar: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [hasTranslatorAbility, setHasTranslatorAbility] = useState(false);
  const [hasSummaryAbility, setHasSummaryAbility] = useState(false);
  const [hasLanguageDetectAbility, setHasLanguageDetectAbility] = useState(false);

  const init = async () => {
    if ("Summarizer" in self) {
      // The Summarizer API is supported.
      setHasSummaryAbility(true);
    }
    if ("Translator" in self) {
      // The Translator API is supported.
      setHasTranslatorAbility(true);
    }
    if ("LanguageDetect" in self) {
      // The LanguageDetect API is supported.
      setHasLanguageDetectAbility(true);
    }
    // 检查用户是否登录
    const response = await chrome.runtime.sendMessage({
      action: "checkLoginStatus",
    });
    if (!response.success) {
      toast.error(response.message || "检查登录状态失败");
      return;
    }
    setUserInfo({
      ...userInfo,
      islogin: response.success,
      username: response.data?.username || "",
      avatar: response.data?.avatar || "",
    });
    setIsLoading(false);
  };

  useEffect(() => {
    init();
  }, []);

  const renderTabContent = () => {
    switch (tabValue) {
      case "summarizer":
        return <SummarizerContent hasSummaryAbility={hasSummaryAbility} />;
      case "translator":
        return (
          <TranslatorContent
            hasTranslatorAbility={hasTranslatorAbility}
            hasLanguageDetectAbility={hasLanguageDetectAbility}
          />
        );
      case "setting":
        return <SettingContent />;
      default:
        return null;
    }
  };

  const TranslatorContent = ({
    hasTranslatorAbility,
    hasLanguageDetectAbility,
  }: {
    hasTranslatorAbility: boolean;
    hasLanguageDetectAbility: boolean;
  }) => {
    const [inputText, setInputText] = useState("");
    const [translation, setTranslation] = useState("");
    const [isTranslating, setIsTranslating] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [modelAvailable, setModelAvailable] = useState<ModelAvailability>(null);
    const [detectModelAvailable, setDetectModelAvailable] = useState<ModelAvailability>(null);
    const [translator, setTranslator] = useState<any>(null);
    const [detector, setDetector] = useState<any>(null);
    const [sourceLanguage, setSourceLanguage] = useState("auto");
    const [targetLanguage, setTargetLanguage] = useState("zh");
    const [detectLanguage, setDetectLanguage] = useState(null);

    const checkAvailability = async () => {
      try {
        if (sourceLanguage === "auto" && !detectLanguage) {
          console.log("请先检测语言");
          return;
        }
        if (detectLanguage === targetLanguage) {
          toast.warning("源语言和目标语言相同！");
          return;
        }
        const availability = await window.Translator!.availability({
          sourceLanguage: detectLanguage || sourceLanguage,
          targetLanguage,
        });
        setModelAvailable(availability);
        if (navigator.userActivation.isActive) {
          console.log("用户激活", detectLanguage || sourceLanguage, targetLanguage);
          const translator = await window.Translator!.create({
            sourceLanguage: detectLanguage || sourceLanguage,
            targetLanguage,
          });
          setTranslator(translator);
        }
      } catch (error) {
        console.error("检查翻译模型可用性失败:", error);
        setModelAvailable("unavailable");
        return "unavailable";
      } finally {
        setIsLoading(false);
      }
    };

    const initLangaugeDetector = async () => {
      try {
        const result = await window.LanguageDetector!.availability();
        setDetectModelAvailable(result);
        console.log("initLangaugeDetector", result);
        const detector = await window.LanguageDetector!.create({
          monitor(m: any) {
            m.addEventListener("downloadprogress", (e: any) => {
              setDownloadProgress(Math.round(e.loaded * 100));
            });
          },
        });
        setDetector(detector);
      } catch (error) {
        console.error("初始化语言检测器失败:", error);
        toast.error("初始化语言检测器失败: " + (error as Error).message);
      }
    };

    useEffect(() => {
      if (sourceLanguage !== "auto") {
        setDetectLanguage(null);
      }
      if (sourceLanguage === targetLanguage) {
        toast.warning("源语言和目标语言不能相同");
        return;
      }
      console.log("检查翻译模型可用性:", sourceLanguage, targetLanguage);
      checkAvailability();
    }, [sourceLanguage, targetLanguage, detectLanguage]);

    const handleDetectLanguage = async (text: string) => {
      if (!detector || !text.trim()) {
        setDetectLanguage(null);
        return;
      }
      const result = await detector.detect(text);
      setDetectLanguage(result[0].detectedLanguage);
      //   console.log("检测到的语言:", result[0].detectedLanguage);
    };

    useEffect(() => {
      if (sourceLanguage === "auto") {
        if (detector) {
          handleDetectLanguage(inputText);
        }
      }
    }, [sourceLanguage, inputText, detector]);

    useEffect(() => {
      initLangaugeDetector();
    }, []);

    const handleTranslate = async () => {
      if (!inputText.trim()) {
        toast.warning("请输入要翻译的文本");
        return;
      }

      if (!translator) {
        console.log("请先初始化翻译模型");
        return;
      }

      try {
        setIsTranslating(true);
        setTranslation("");

        const result = await translator.translate(inputText);
        setTranslation(result);
      } catch (error) {
        console.error("翻译失败:", error);
        toast.error("翻译失败: " + (error as Error).message);
      } finally {
        setIsTranslating(false);
      }
    };

    const handleTranslateStreaming = async () => {
      if (!inputText.trim()) {
        toast.warning("请输入要翻译的文本");
        return;
      }

      if (!translator) {
        toast.warning("初始化翻译模型出错");
        return;
      }

      try {
        setIsTranslating(true);
        setTranslation("");

        const stream = translator.translateStreaming(inputText);
        for await (const chunk of stream) {
          setTranslation((prev) => prev + chunk);
        }
      } catch (error) {
        console.error("翻译失败:", error);
        toast.error("翻译失败: " + (error as Error).message);
      } finally {
        setIsTranslating(false);
      }
    };

    const handleGetPageContent = async () => {
      try {
        const response = await chrome.runtime.sendMessage({
          action: "getPageContent",
        });
        if (response.success && response.data) {
          setInputText(response.data);
        } else {
          toast.error("获取页面内容失败");
        }
      } catch (error) {
        console.error("获取页面内容失败:", error);
        toast.error("获取页面内容失败");
      }
    };

    const handleGetSelection = async () => {
      try {
        const response = await chrome.runtime.sendMessage({
          action: "getSelection",
        });
        if (response.success && response.data) {
          setInputText(response.data);
        } else {
          toast.warning("未选中任何内容");
        }
      } catch (error) {
        console.error("获取选中内容失败:", error);
        toast.error("获取选中内容失败");
      }
    };

    return (
      <div className="flex flex-col p-4 h-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">翻译</h2>
        </div>

        {modelAvailable === "unavailable" && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p>当前浏览器不支持翻译功能</p>
              <p className="text-sm mt-2">需要 Chrome 138 或更高版本</p>
            </div>
          </div>
        )}

        {modelAvailable === "downloading" && (
          <div className="flex-1 flex flex-col gap-4">
            {downloadProgress > 0 && downloadProgress < 100 && (
              <div className="p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>模型下载进度</span>
                  <span>{downloadProgress}%</span>
                </div>
                <Progress value={downloadProgress} className="h-2" />
              </div>
            )}
          </div>
        )}

        {
          <>
            <div className="flex gap-2 mb-2">
              <Select value={sourceLanguage} onValueChange={(value) => setSourceLanguage(value)}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="源语言" />
                </SelectTrigger>
                <SelectContent>
                  {
                    <SelectItem key="auto" value="auto">
                      {detectLanguage && LANGUAGES_MAP.get(detectLanguage)
                        ? "自动检测(" + LANGUAGES_MAP.get(detectLanguage) + ")"
                        : "自动检测"}
                    </SelectItem>
                  }
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={targetLanguage} onValueChange={(value) => setTargetLanguage(value)}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="目标语言" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.filter((lang) => lang.value !== "auto" && lang.value !== sourceLanguage).map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 mb-2">
              <Button variant="outline" size="sm" onClick={handleGetPageContent} className="flex-1">
                获取页面内容
              </Button>
              <Button variant="outline" size="sm" onClick={handleGetSelection} className="flex-1">
                获取选中内容
              </Button>
            </div>

            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={"请输入要翻译的文本..."}
              disabled={isTranslating}
              className="flex-1 min-h-[120px] resize-none text-sm"
            />

            <div className="flex gap-2 mt-2">
              <Button onClick={handleTranslate} disabled={isTranslating} className="flex-1">
                {isTranslating ? "翻译中..." : "翻译"}
              </Button>
              <Button variant="outline" disabled={isTranslating} onClick={handleTranslateStreaming} className="flex-1">
                流式翻译
              </Button>
            </div>

            {translation && (
              <div className="flex-1 border rounded-lg p-3 mt-2">
                <h3 className="text-sm font-semibold mb-2">翻译结果</h3>
                <p className="text-sm whitespace-pre-wrap">{translation}</p>
              </div>
            )}
          </>
        }
      </div>
    );
  };

  const SummarizerContent = ({ hasSummaryAbility }: { hasSummaryAbility: boolean }) => {
    const [inputText, setInputText] = useState("");
    const [summary, setSummary] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [modelAvailable, setModelAvailable] = useState<ModelAvailability>(null);
    const [summarizer, setSummarizer] = useState<any>(null);
    const [summaryType, setSummaryType] = useState<SummaryType>("key-points");
    const [summaryLength, setSummaryLength] = useState<SummaryLength>("medium");
    const [summaryFormat, setSummaryFormat] = useState<SummaryFormat>("markdown");

    const SUMMARY_TYPES = [
      { value: "key-points", label: "要点", description: "提取最重要的要点" },
      { value: "tldr", label: "TL;DR", description: "简短明了的快速概览" },
      {
        value: "teaser",
        label: "预告片",
        description: "最有趣或引人入胜的部分",
      },
      { value: "headline", label: "标题", description: "一句话概括主旨" },
    ];

    const SUMMARY_LENGTHS = [
      { value: "short", label: "短" },
      { value: "medium", label: "中" },
      { value: "long", label: "长" },
    ];

    const SUMMARY_FORMATS = [
      { value: "markdown", label: "Markdown" },
      { value: "plain-text", label: "纯文本" },
    ];

    const checkAvailability = async () => {
      try {
        const availability = await window.Summarizer!.availability();
        setModelAvailable(availability);
        return availability;
      } catch (error) {
        console.error("检查模型可用性失败:", error);
        setModelAvailable("unavailable");
        return "unavailable";
      }
    };

    const handleInitModel = async () => {
      if (!navigator.userActivation?.isActive) {
        // toast.warning("需要用户交互才能初始化模型");
        return;
      }

      try {
        setIsLoading(true);
        setDownloadProgress(0);

        const availability = await checkAvailability();
        if (availability === "unavailable") {
          toast.error("当前设备不支持Summarizer API");
          setIsLoading(false);
          return;
        }

        const options = {
          type: summaryType,
          expectedInputLanguages: ["en", "ja", "es", "de", "fr"],
          expectedContextLanguages: ["en"],
          format: summaryFormat,
          length: summaryLength,
          monitor(m: any) {
            m.addEventListener("downloadprogress", (e: any) => {
              setDownloadProgress(Math.round(e.loaded * 100));
            });
          },
        };

        const s = await window.Summarizer!.create(options);
        setSummarizer(s);
        toast.success("AI大模型初始化成功");
      } catch (error) {
        console.error("初始化AI大模型失败:", error);
        toast.error("初始化AI大模型失败: " + (error as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    const autoInitModel = async () => {
      try {
        const options = {
          type: summaryType,
          expectedInputLanguages: ["en", "ja", "es", "de", "fr"],
          expectedContextLanguages: ["en"],
          format: summaryFormat,
          length: summaryLength,
          monitor(m: any) {
            m.addEventListener("downloadprogress", (e: any) => {
              setDownloadProgress(Math.round(e.loaded * 100));
            });
          },
        };
        const s = await window.Summarizer!.create(options);
        setSummarizer(s);
      } catch (error) {
        console.error("初始化AI大模型失败:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const handleSummarize = async () => {
      if (!inputText.trim()) {
        toast.warning("请输入要摘要的文本");
        return;
      }

      if (!summarizer) {
        toast.warning("请先初始化AI大模型");
        return;
      }

      try {
        setIsGenerating(true);
        setSummary("");

        const result = await summarizer.summarize(inputText, {
          context: "网页内容摘要",
        });
        setSummary(result);
      } catch (error) {
        console.error("生成摘要失败:", error);
        toast.error("生成摘要失败: " + (error as Error).message);
      } finally {
        setIsGenerating(false);
      }
    };

    const handleSummarizeStreaming = async () => {
      if (!inputText.trim()) {
        toast.warning("请输入要摘要的文本");
        return;
      }

      if (!summarizer) {
        toast.warning("请先初始化AI大模型");
        return;
      }

      try {
        setIsGenerating(true);
        setSummary("");

        const stream = summarizer.summarizeStreaming(inputText, {
          context: "网页内容摘要",
        });

        for await (const chunk of stream) {
          setSummary((prev) => prev + chunk);
        }
      } catch (error) {
        console.error("生成摘要失败:", error);
        toast.error("生成摘要失败: " + (error as Error).message);
      } finally {
        setIsGenerating(false);
      }
    };

    const handleGetPageContent = async () => {
      try {
        const response = await chrome.runtime.sendMessage({
          action: "getPageContent",
        });
        if (response.success && response.data) {
          setInputText(response.data);
        } else {
          toast.error("获取页面内容失败");
        }
      } catch (error) {
        console.error("获取页面内容失败:", error);
        toast.error("获取页面内容失败");
      }
    };

    const handleGetSelection = async () => {
      try {
        const response = await chrome.runtime.sendMessage({
          action: "getSelection",
        });
        if (response.success && response.data) {
          setInputText(response.data);
        } else {
          toast.warning("未选中任何内容");
        }
      } catch (error) {
        console.error("获取选中内容失败:", error);
        toast.error("获取选中内容失败");
      }
    };

    useEffect(() => {
      checkAvailability();
    }, []);

    useEffect(() => {
      if (modelAvailable === "available") {
        autoInitModel();
      }
    }, [modelAvailable]);

    return (
      <div className="flex flex-col p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex justify-start items-center gap-2">
            <Avatar>
              <AvatarImage src={userInfo.avatar} alt={userInfo.username} />
              <AvatarFallback>WN</AvatarFallback>
            </Avatar>
            <div className="text-[14px]">{userInfo.username}</div>
          </div>
          <div className="text-[14px]">生成摘要</div>
        </div>

        {!hasSummaryAbility && !isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p>当前浏览器不支持摘要生成功能</p>
              <p className="text-sm mt-2">需要 Chrome 138 或更高版本</p>
            </div>
          </div>
        )}

        {hasSummaryAbility && !isLoading && (
          <div className="flex-1 flex flex-col gap-4">
            {modelAvailable === "unavailable" && (
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-red-600">当前设备不满足运行要求</p>
                <p className="text-sm text-red-500 mt-1">
                  需要 Windows 10/11、macOS 13+ 或 Linux，且至少有 22GB 可用空间
                </p>
              </div>
            )}

            {modelAvailable === "downloadable" && !isLoading && (
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-yellow-600">模型可下载，请点击下方按钮初始化</p>
              </div>
            )}

            {downloadProgress > 0 && downloadProgress < 100 && !isLoading && (
              <div className="p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>模型下载进度</span>
                  <span>{downloadProgress}%</span>
                </div>
                <Progress value={downloadProgress} className="h-2" />
              </div>
            )}

            {!summarizer && modelAvailable !== "unavailable" && !isLoading && (
              <Button onClick={handleInitModel} disabled={isLoading} className="w-full">
                {isLoading ? <Spinner /> : "初始化AI大模型"}
              </Button>
            )}

            {summarizer && !isLoading && (
              <>
                <header className="flex items-center gap-2">
                  <Select value={summaryType} onValueChange={(value) => setSummaryType(value as SummaryType)}>
                    <SelectTrigger>
                      <SelectValue placeholder="类型" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {SUMMARY_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={summaryLength} onValueChange={(value) => setSummaryLength(value as SummaryLength)}>
                    <SelectTrigger>
                      <SelectValue placeholder="长度" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {SUMMARY_LENGTHS.map((length) => (
                        <SelectItem key={length.value} value={length.value}>
                          {length.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={summaryFormat} onValueChange={(value) => setSummaryFormat(value as SummaryFormat)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {SUMMARY_FORMATS.map((format) => (
                        <SelectItem key={format.value} value={format.value}>
                          {format.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </header>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleGetPageContent} className="flex-1">
                    获取页面内容
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleGetSelection} className="flex-1">
                    获取选中内容
                  </Button>
                </div>

                <Textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="请输入要摘要的文本，或点击上方按钮获取页面内容..."
                  className="flex-1 p-3 border rounded-lg resize-none text-sm grow-0 "
                />

                <div className="flex gap-2">
                  <Button onClick={handleSummarize} disabled={isLoading || !inputText.trim()} className="flex-1">
                    {isLoading ? "生成中..." : "生成摘要"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleSummarizeStreaming}
                    disabled={isLoading || !inputText.trim()}
                    className="flex-1">
                    流式摘要
                  </Button>
                </div>

                {summary && (
                  <div className="flex-1 border rounded-lg p-3 overflow-auto">
                    <h3 className="text-sm font-semibold mb-2">摘要结果</h3>
                    <div
                      className="text-sm whitespace-pre-wrap"
                      dangerouslySetInnerHTML={
                        summaryFormat === "markdown"
                          ? { __html: summary.replace(/\n/g, "<br/>") }
                          : { __html: summary.replace(/\n/g, "<br/>") }
                      }
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  const SettingContent = () => {
    return (
      <div className="flex flex-col p-4">
        <div className="text-[14px] font-semibold">设置</div>
      </div>
    );
  };

  return (
    <>
      <div className="flex max-w-screen h-screen">
        <div className="grow">
          {isLoading && <Spinner />}
          {!isLoading && userInfo.islogin && <ScrollArea className="h-full">{renderTabContent()}</ScrollArea>}
          {!isLoading && !userInfo.islogin && <div className="text-center text-red-500">请先登录</div>}
        </div>
        <div className="flex h-full align-start justify-center grow shrink max-w-fit basis-[30px] border-l">
          <Tabs
            className="h-screen"
            value={tabValue}
            onValueChange={(value) => setTabValue(value)}
            defaultValue="account"
            orientation="vertical">
            <TabsList className="rounded-none gap-5 pb-6 bg-transparent">
              {TABS.map((tab) => (
                <TabsTrigger
                  className="flex flex-col items-center justify-center gap-0 py-2"
                  key={tab.value}
                  value={tab.value}>
                  {tab.icon}
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>
      <Toaster />
    </>
  );
}
