import React, { useState, useEffect } from "react";

import type { ExtensionSettings } from "../types/chrome";
import { ExtensionStorage } from "../utils/storage";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

const OptionsApp: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<ExtensionSettings>({
    enabled: true,
    theme: "light",
    fontSize: 14,
    highlightColor: "#ffff00",
    position: { x: 0, y: 100 },
    adsorption: "left",
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const currentSettings = await ExtensionStorage.getSettings();
      setSettings(currentSettings);
      // form.setFieldsValue(currentSettings);
    } catch (error) {
      toast.error("加载设置失败");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values: ExtensionSettings) => {
    setLoading(true);
    try {
      await ExtensionStorage.saveSettings(values);
      setSettings(values);
      toast.success("设置保存成功");
    } catch (error) {
      toast.error("保存设置失败");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      const defaultSettings: ExtensionSettings = {
        enabled: true,
        theme: "light",
        fontSize: 14,
        highlightColor: "#ffff00",
        position: { x: 0, y: 100 },
        adsorption: "left",
      };

      await ExtensionStorage.saveSettings(defaultSettings);
      await ExtensionStorage.clearUserInfo();
      setSettings(defaultSettings);
      // form.setFieldsValue(defaultSettings);
      toast.success("设置已重置为默认值");
    } catch (error) {
      console.error("重置设置失败", error);
      toast.error("重置设置失败");
    }
  };

  return (
    <>
      <h1>选项</h1>
      <Button onClick={() => handleReset()}>退出登录并重置</Button>
      <Button onClick={() => handleSave(settings)}>保存</Button>
      <Toaster />
    </>
  );
};

export default OptionsApp;
