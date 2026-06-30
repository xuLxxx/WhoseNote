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

  const [hasSummaryAbility, setHasSummaryAbility] = useState(false);

  const init = async () => {
    if ("Summarizer" in self) {
      // The Summarizer API is supported.
      setHasSummaryAbility(true);
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
      islogin: response.data.success,
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
      //   case "translator":
      //     return <TranslatorContent />;
      case "setting":
        return <SettingContent />;
      default:
        return null;
    }
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
        console.log("模型可用性:", availability);
        // await LanguageModel.availability({ languages: ["en", "ja"] });
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
          {isLoading ? null : <ScrollArea className="h-full">{renderTabContent()}</ScrollArea>}
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
