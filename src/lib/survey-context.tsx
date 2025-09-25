'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type JSX
} from 'react'
import type { DeviceInfo, SurveyAnswers } from './types'
import { toast } from "sonner"

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error'

interface SubmitState {
  status: SubmitStatus
  message?: string
}

interface SurveyContextValue {
  surveyId: string
  answers: SurveyAnswers
  deviceInfo: DeviceInfo | null
  submitState: SubmitState
  isSubmitting: boolean
  setAnswer: (questionId: string, value: SurveyAnswers[string]) => void
  clearAnswer: (questionId: string) => void
  resetAnswers: () => void
  submitSurvey: () => Promise<void>
  saveToLocal: () => void
  loadFromLocal: () => void
  hasSavedData: boolean
}

interface SurveyProviderProps {
  surveyId: string
  endpoint?: string
  initialAnswers?: SurveyAnswers
  resetOnSuccess?: boolean
  children: ReactNode
}

const DEFAULT_ENDPOINT = '/api/surveys/submit'

export const SurveyContext = createContext<SurveyContextValue | null>(null)

function readDeviceInfo(): DeviceInfo | null {
  if (typeof window === 'undefined') {
    return null
  }

  return {
    userAgent: navigator.userAgent ?? '',
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? '',
    language: navigator.language ?? ''
  }
}

export function SurveyProvider({
  surveyId,
  endpoint = DEFAULT_ENDPOINT,
  initialAnswers,
  resetOnSuccess = true,
  children
}: SurveyProviderProps): JSX.Element {
  const [answers, setAnswers] = useState<SurveyAnswers>(initialAnswers ?? {})
  const initialAnswersRef = useRef<SurveyAnswers>(initialAnswers ?? {})
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null)
  const [submitState, setSubmitState] = useState<SubmitState>({ status: 'idle' })
  const [hasSavedData, setHasSavedData] = useState(false)

  const getLocalStorageKey = useCallback(() => `survey_${surveyId}`, [surveyId])

  // 检查本地存储中是否有数据
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const key = getLocalStorageKey()
      const saved = localStorage.getItem(key)
      if (saved) {
        // 检查是否有初始答案且不为空对象
        const hasInitialAnswers = initialAnswers && Object.keys(initialAnswers).length > 0
        if (!hasInitialAnswers) {
          // 如果没有有效的初始答案，自动加载保存的数据
          try {
            const parsedAnswers = JSON.parse(saved) as SurveyAnswers
            setAnswers(parsedAnswers)
          } catch (error) {
            console.warn('Failed to parse saved survey data:', error)
          }
        }
      }
      setHasSavedData(!!saved)
    }
  }, [getLocalStorageKey, initialAnswers])

  useEffect(() => {
    const info = readDeviceInfo()
    if (info) {
      setDeviceInfo(info)
    }
  }, [])

  useEffect(() => {
    if (initialAnswers === undefined) {
      initialAnswersRef.current = {}
      return
    }

    initialAnswersRef.current = initialAnswers
    setAnswers(initialAnswers)
  }, [initialAnswers])

  const setAnswer = useCallback((questionId: string, value: SurveyAnswers[string]) => {
    setAnswers((prev: SurveyAnswers) => ({
      ...prev,
      [questionId]: value
    }))
  }, [])

  const clearAnswer = useCallback((questionId: string) => {
    setAnswers((prev: SurveyAnswers) => {
      const next = { ...prev }
      delete next[questionId]
      return next
    })
  }, [])

  const resetAnswers = useCallback(() => {
    setAnswers(initialAnswersRef.current)
  }, [])

  const saveToLocal = useCallback(() => {
    if (typeof window !== 'undefined') {
      const key = getLocalStorageKey()
      localStorage.setItem(key, JSON.stringify(answers))
      setHasSavedData(true)
    }
  }, [answers, getLocalStorageKey])

  const loadFromLocal = useCallback(() => {
    if (typeof window !== 'undefined') {
      const key = getLocalStorageKey()
      const saved = localStorage.getItem(key)
      if (saved) {
        try {
          const parsedAnswers = JSON.parse(saved) as SurveyAnswers
          setAnswers(parsedAnswers)
        } catch (error) {
          console.warn('Failed to parse saved survey data:', error)
        }
      }
    }
  }, [getLocalStorageKey])

  const submitSurvey = useCallback(async () => {
    const info = deviceInfo ?? readDeviceInfo()
    if (!info) {
      const errorMsg = '无法获取设备信息，请检查浏览器权限后重试'
      setSubmitState({ status: 'error', message: errorMsg })
      toast(errorMsg)
      return
    }

    setSubmitState({ status: 'submitting' })

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          surveyId,
          deviceInfo: info,
          answers
        })
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || '提交失败，请稍后重试')
      }

      const successMsg = result.message || '提交成功，感谢您的参与！'
      setSubmitState({
        status: 'success',
        message: successMsg
      })
      toast(successMsg)

      if (resetOnSuccess) {
        resetAnswers()
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '提交失败，请稍后重试'
      setSubmitState({ status: 'error', message })
      toast(message)
    }
  }, [answers, deviceInfo, endpoint, resetAnswers, resetOnSuccess, surveyId])

  const value = useMemo<SurveyContextValue>(() => ({
    surveyId,
    answers,
    deviceInfo,
    submitState,
    isSubmitting: submitState.status === 'submitting',
    setAnswer,
    clearAnswer,
    resetAnswers,
    submitSurvey,
    saveToLocal,
    loadFromLocal,
    hasSavedData
  }), [answers, deviceInfo, submitState, surveyId, setAnswer, clearAnswer, resetAnswers, submitSurvey, saveToLocal, loadFromLocal, hasSavedData])

  return (
    <SurveyContext.Provider value={value}>
      {children}
    </SurveyContext.Provider>
  )
}

export function useSurvey(): SurveyContextValue {
  const context = useContext(SurveyContext)

  if (!context) {
    throw new Error('useSurvey 必须在 SurveyProvider 内部使用')
  }

  return context
}