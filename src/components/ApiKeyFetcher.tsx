"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Check, Loader2, Key } from "lucide-react"

export default function ApiKeyFetcher() {
  const [studentId, setStudentId] = React.useState("")
  const [name, setName] = React.useState("")
  const [apiKey, setApiKey] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [copied, setCopied] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setApiKey("")
    setLoading(true)

    try {
      const response = await fetch("/api/api-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student_id: studentId.trim(),
          name: name.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "获取 API Key 失败")
      }

      if (data.success && data.data.api_key) {
        setApiKey(data.data.api_key)
        // 自动复制到剪贴板
        await navigator.clipboard.writeText(data.data.api_key)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "发生未知错误")
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (apiKey) {
      await navigator.clipboard.writeText(apiKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto my-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="w-5 h-5" />
          获取你的 API Key
        </CardTitle>
        <CardDescription>
          输入你的学号和姓名来获取专属的 API Key，获取后将自动复制到剪贴板
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="student-id">学号</Label>
            <Input
              id="student-id"
              type="text"
              placeholder="例如：2500011220"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
              disabled={loading}
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">姓名</Label>
            <Input
              id="name"
              type="text"
              placeholder="例如：张三"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/20 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-md">
              {error}
            </div>
          )}

          {apiKey && (
            <div className="space-y-2">
              <Label htmlFor="api-key">你的 API Key</Label>
              <div className="flex gap-2">
                <Input
                  id="api-key"
                  type="text"
                  value={apiKey}
                  readOnly
                  className="font-mono text-sm bg-muted"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {copied && (
                <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  已复制到剪贴板！
                </p>
              )}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                获取中...
              </>
            ) : (
              <>
                <Key className="w-4 h-4 mr-2" />
                获取 API Key
              </>
            )}
          </Button>
        </form>

        <div className="mt-4 p-3 text-sm text-muted-foreground bg-muted/50 rounded-md">
          <p className="font-semibold mb-1">💡 温馨提示：</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>请确保输入的学号和姓名与课程注册信息一致</li>
            <li>API Key 获取后会自动复制到剪贴板</li>
            <li>请妥善保管你的 API Key，不要与他人分享</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
