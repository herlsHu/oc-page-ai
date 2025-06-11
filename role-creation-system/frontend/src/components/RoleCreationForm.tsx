import { useState, useEffect, ChangeEvent, useCallback, useRef } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Dice6 } from 'lucide-react'
import { generateField } from '@/services/api'
import React from 'react'

// 防抖函数
const debounce = <T extends (...args: any[]) => any>(fn: T, delay: number) => {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

/**
 * RoleCreationFormMobile (重排版) — 水蜜桃粉主题 · 窄屏优化
 * 更新：2025‑07‑02
 * 说明：按"角色基本设定 / 角色补充设定 / 角色语言习惯"三大分区重新排布原有输入项，其余交互与样式保持一致。
 */
export function RoleCreationForm() {
  type Steps = 'basic' | 'supplement' | 'language'
  const [step, setStep] = useState<Steps>('basic')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [form, setForm] = useState({
    /* 基本 */
    avatar: null as File | null,
    voice: null as File | null,
    language: '',
    name: '',
    gender: '男',
    otherGender: '',
    age: '',
    birthday: '',
    mbti: '',
    otherMbti: '',
    bloodType: '',
    stance: '',
    otherStance: '',
    /* 核心必填 */
    personality: '',
    appearance: '',
    /* 高级 */
    world: '',
    identity: '',
    supplemental: '',
    userRelation: '',
    /* 语言习惯 */
    addressUser: '',
    greeting: '',
    catchphrase: '',
    examples: [''] as string[],
  })
  const MBTI = ['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP']
  const STANCES = ['守序善良', '中立善良', '混乱善良', '守序中立', '绝对中立', '混乱中立', '守序邪恶', '中立邪恶', '混乱邪恶']
  const update = (k: keyof typeof form, v: any) => {
    setForm(prevForm => {
      const newForm = { ...prevForm }
      newForm[k] = v
      return newForm
    })
  }
  const updateExample = (i: number, v: string) => {
    const a = [...form.examples]
    a[i] = v
    update('examples', a)
  }
  const addExample = () => form.examples.length < 3 && update('examples', [...form.examples, ''])

  const [loadingFields, setLoadingFields] = useState<Record<string, boolean>>({})

  const handleGenerateField = async (field: keyof typeof form) => {
    if (loadingFields[field]) return

    try {
      setLoadingFields(prev => ({ ...prev, [field]: true }))
      const response = await generateField(field, form)
      if (response.success) {
        update(field, response.content)
      }
    } catch (error) {
      console.error(`Error generating ${field}:`, error)
      alert('生成失败，请重试')
    } finally {
      setLoadingFields(prev => ({ ...prev, [field]: false }))
    }
  }

  const handleGenerateExample = async (index: number) => {
    if (loadingFields[`example_${index}`]) return

    try {
      setLoadingFields(prev => ({ ...prev, [`example_${index}`]: true }))
      const response = await generateField('examples', form)
      if (response.success) {
        updateExample(index, response.content)
      }
    } catch (error) {
      console.error(`Error generating example ${index}:`, error)
      alert('生成失败，请重试')
    } finally {
      setLoadingFields(prev => ({ ...prev, [`example_${index}`]: false }))
    }
  }

  const DiceButton = ({ field }: { field: keyof typeof form }) => (
    <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7 p-0 flex items-center justify-center text-pink-400 hover:bg-pink-50 rounded-full"
      onClick={() => handleGenerateField(field)}
      disabled={loadingFields[field]}
    >
      {loadingFields[field] ? (
        <div className="animate-spin rounded-full h-3 w-3 border-2 border-pink-300 border-t-transparent" />
      ) : (
        <Dice6 className="h-4 w-4" />
      )}
    </Button>
  )

  const ExampleDiceButton = ({ index }: { index: number }) => (
    <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7 p-0 flex items-center justify-center text-pink-400 hover:bg-pink-50 rounded-full"
      onClick={() => handleGenerateExample(index)}
      disabled={loadingFields[`example_${index}`]}
    >
      {loadingFields[`example_${index}`] ? (
        <div className="animate-spin rounded-full h-3 w-3 border-2 border-pink-300 border-t-transparent" />
      ) : (
        <Dice6 className="h-4 w-4" />
      )}
    </Button>
  )

  useEffect(() => {
    if (!form.avatar) {
      setAvatarUrl(null)
      return
    }
    const u = URL.createObjectURL(form.avatar)
    setAvatarUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [form.avatar])

  /* 必填字段检查 */
  const requiredFilled = Boolean(
    form.avatar &&
    form.language &&
    form.name &&
    form.personality
  )

  /* 通用样式封装 */
  const inputCls = 'w-full border border-pink-200 rounded-lg focus:ring-pink-400 focus:border-pink-400 placeholder:text-pink-300 text-sm transition-all duration-200 ease-in-out hover:border-pink-200 outline-none py-2 px-3 bg-white'
  const textareaCls = 'w-full border border-pink-200 rounded-lg focus:ring-pink-400 focus:border-pink-400 placeholder:text-pink-300 text-sm transition-all duration-200 ease-in-out hover:border-pink-200 outline-none min-h-[100px] max-h-[300px] overflow-y-auto py-2 px-3 bg-white'
  const selectCls = 'w-full p-2 rounded-lg border border-pink-200 bg-white focus:ring-pink-400 focus:border-pink-400 text-sm py-2 px-3'
  const fieldLabelCls = 'block mb-1 text-sm sm:text-base'

  // 更新容器样式，使用更合理的宽度控制
  const formContainerCls = 'w-full max-w-[800px] mx-auto px-3 sm:px-4'
  const fieldGroupCls = 'w-full space-y-3 sm:space-y-4'
  const inputGroupCls = 'w-full flex flex-col sm:flex-row items-start gap-2'
  const inputWrapperCls = 'flex-1 min-w-0 w-full'

  const FullInput = ({ diceField, ...p }: React.InputHTMLAttributes<HTMLInputElement> & { diceField?: keyof typeof form }) => {
    const [localValue, setLocalValue] = React.useState(p.value || '')
    const [isComposing, setIsComposing] = React.useState(false)
    const [isFocused, setIsFocused] = React.useState(false)
    const inputRef = React.useRef<HTMLInputElement>(null)

    React.useEffect(() => {
      setLocalValue(p.value || '')
    }, [p.value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setLocalValue(newValue)
      if (!isComposing) {
        p.onChange?.(e)
      }
    }

    const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
      setIsComposing(false)
      const newValue = e.currentTarget.value
      setLocalValue(newValue)
      p.onChange?.(e as any)
    }

    return (
      <div className="relative w-full">
        <Input
          {...p}
          ref={inputRef}
          value={localValue}
          className={`${inputCls} ${isFocused ? 'ring-2 ring-pink-400' : ''} ${diceField ? 'pr-10' : ''}`}
          onChange={handleChange}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={handleCompositionEnd}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {isFocused && typeof localValue === 'string' && localValue && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-pink-300">
            {localValue.length} 字
          </div>
        )}
        {diceField && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <DiceButton field={diceField} />
          </div>
        )}
      </div>
    )
  }

  const FullTextarea = ({ diceField, ...p }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { diceField?: keyof typeof form }) => {
    const [localValue, setLocalValue] = React.useState(p.value || '')
    const [isComposing, setIsComposing] = React.useState(false)
    const [isFocused, setIsFocused] = React.useState(false)
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)

    React.useEffect(() => {
      setLocalValue(p.value || '')
    }, [p.value])

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value
      setLocalValue(newValue)
      if (!isComposing) {
        p.onChange?.(e)
      }
    }

    const handleCompositionEnd = (e: React.CompositionEvent<HTMLTextAreaElement>) => {
      setIsComposing(false)
      const newValue = e.currentTarget.value
      setLocalValue(newValue)
      p.onChange?.(e as any)
    }

    return (
      <div className="relative w-full">
        <Textarea
          {...p}
          ref={textareaRef}
          value={localValue}
          className={`${textareaCls} ${isFocused ? 'ring-2 ring-pink-400' : ''} ${diceField ? 'pr-10' : ''}`}
          onChange={handleChange}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={handleCompositionEnd}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {isFocused && typeof localValue === 'string' && localValue && (
          <div className="absolute right-2 top-2 text-xs text-pink-300">
            {localValue.length} 字
          </div>
        )}
        {diceField && (
          <div className="absolute right-2 top-2">
            <DiceButton field={diceField} />
          </div>
        )}
      </div>
    )
  }

  const PinkBtn = (p: React.ComponentProps<typeof Button>) => (
    <Button
      {...p}
      className={`bg-pink-400 hover:bg-pink-500 active:bg-pink-600 text-white text-sm sm:text-base rounded-xl ${p.className || ''}`}
    />
  )

  const BasicSetting = () => (
    <div className={fieldGroupCls}>
      {/* Avatar */}
      <div className={fieldGroupCls}>
        <Label className={fieldLabelCls}>角色头像 <span className="text-pink-400">*</span></Label>
        <Input
          type="file"
          accept="image/*"
          onChange={e => update('avatar', e.target.files?.[0] || null)}
          className={inputCls}
        />
        {avatarUrl && (
          <img
            src={avatarUrl}
            className="mt-3 rounded-full border border-pink-200 object-cover"
            style={{ width: '50vw', maxWidth: 140, height: '50vw', maxHeight: 140 }}
          />
        )}
      </div>

      {/* Language */}
      <div className={fieldGroupCls}>
        <Label className={fieldLabelCls}>角色常用语言 <span className="text-pink-400">*</span></Label>
        <select
          value={form.language}
          onChange={e => update('language', e.target.value)}
          className={selectCls}
        >
              <option value="">请选择语言</option>
              {['中文', '英文', '日语', '其他'].map(l => (
                <option key={l}>{l}</option>
              ))}
            </select>
      </div>

      {/* Voice */}
      <div className={fieldGroupCls}>
        <Label className={fieldLabelCls}>角色语音 (≤15s)</Label>
        <Input
          type="file"
          accept="audio/mp3,audio/wav"
          onChange={e => update('voice', e.target.files?.[0] || null)}
          className={inputCls}
        />
        <span className="text-xs text-gray-400 mt-1">支持 MP3/WAV，时长 ≤15 秒</span>
      </div>

      {/* Name */}
      <div className={fieldGroupCls}>
        <Label className={fieldLabelCls}>角色名称 <span className="text-pink-400">*</span></Label>
        <FullInput
          value={form.name}
          onChange={e => update('name', e.target.value)}
          placeholder="角色名称"
          diceField="name"
        />
      </div>

      {/* Gender */}
      <div className={fieldGroupCls}>
        <Label className={fieldLabelCls}>性别 <span className="text-pink-400">*</span></Label>
        <div className="flex gap-2 mt-1 flex-wrap">
          {['男', '女', '其他'].map(g => (
            <PinkBtn
              key={g}
              size="sm"
              variant={form.gender === g ? 'default' : 'outline'}
              className={form.gender === g ? '' : 'bg-white text-pink-400 border-pink-400'}
              onClick={() => update('gender', g)}
            >
              {g}
            </PinkBtn>
          ))}
        </div>
        {form.gender === '其他' && (
          <FullInput
            className="mt-2"
            value={form.otherGender}
            onChange={e => update('otherGender', e.target.value)}
            placeholder="自定义性别"
            diceField="otherGender"
          />
        )}
      </div>

      {/* Age & Birthday */}
      <div className={fieldGroupCls}>
        <div className={fieldGroupCls}>
          <Label className={fieldLabelCls}>年龄</Label>
          <FullInput
            value={form.age}
            onChange={e => update('age', e.target.value)}
            type="number"
            min="0"
            max="100"
            diceField="age"
          />
        </div>
        <div className={fieldGroupCls}>
          <Label className={fieldLabelCls}>生日</Label>
          <FullInput
            type="date"
            value={form.birthday}
            onChange={e => update('birthday', e.target.value)}
          />
        </div>
      </div>

      {/* MBTI & BloodType */}
      <div className={fieldGroupCls}>
        <div className={fieldGroupCls}>
          <Label className={fieldLabelCls}>MBTI</Label>
          <select
            value={form.mbti}
            onChange={e => update('mbti', e.target.value)}
            className={selectCls}
          >
                <option value="">选择 MBTI</option>
                {MBTI.map(t => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
        {form.mbti === '其他' && (
                  <FullInput 
            className="mt-2"
                    value={form.otherMbti} 
                    onChange={e => update('otherMbti', e.target.value)} 
            placeholder="自定义 MBTI"
            diceField="otherMbti"
                  />
        )}
        <div className={fieldGroupCls}>
          <Label className={fieldLabelCls}>血型</Label>
          <select
            value={form.bloodType}
            onChange={e => update('bloodType', e.target.value)}
            className={selectCls}
          >
            <option value="">选择</option>
            {['A', 'B', 'AB', 'O', '其他'].map(b => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stance */}
        <div className={fieldGroupCls}>
          <Label className={fieldLabelCls}>立场</Label>
        <select
          value={form.stance}
          onChange={e => update('stance', e.target.value)}
          className={selectCls}
        >
                <option value="">选择立场</option>
                {STANCES.map(s => (
                  <option key={s}>{s}</option>
                ))}
              </select>
        {form.stance === '其他' && (
                  <FullInput 
            className="mt-2"
                    value={form.otherStance} 
                    onChange={e => update('otherStance', e.target.value)} 
            placeholder="自定义立场"
            diceField="otherStance"
                  />
          )}
      </div>

      {/* === 核心必填：性格 / 外貌 === */}
      <div className="space-y-4 pt-4 border-t border-dashed border-pink-200">
      <div className={fieldGroupCls}>
          <Label className={fieldLabelCls}>性格 <span className="text-pink-400">*</span></Label>
          <FullTextarea
            value={form.personality}
            onChange={e => update('personality', e.target.value)}
            placeholder="性格、优缺点、兴趣爱好…"
            diceField="personality"
          />
        </div>
        <div className={fieldGroupCls}>
          <Label className={fieldLabelCls}>外貌 <span className="text-pink-400">*</span></Label>
          <FullTextarea
            value={form.appearance}
            onChange={e => update('appearance', e.target.value)}
            placeholder="身高体型、发型发色、瞳色…"
            diceField="appearance"
          />
        </div>
      </div>
    </div>
  )

  const SupplementSetting = () => (
    <div className={fieldGroupCls}>
      <div className={fieldGroupCls}>
        <Label className={fieldLabelCls}>世界观</Label>
        <FullTextarea
          value={form.world}
          onChange={e => update('world', e.target.value)}
          placeholder="时代背景、文化冲突…"
          diceField="world"
        />
      </div>
      <div className={fieldGroupCls}>
        <Label className={fieldLabelCls}>身份</Label>
        <FullTextarea
          value={form.identity}
          onChange={e => update('identity', e.target.value)}
          placeholder="种族、职业、阶层…"
          diceField="identity"
        />
      </div>
      <div className={fieldGroupCls}>
        <Label className={fieldLabelCls}>补充设定</Label>
        <FullTextarea
          value={form.supplemental}
          onChange={e => update('supplemental', e.target.value)}
          placeholder="角色经历、生活习惯…"
          diceField="supplemental"
        />
      </div>
      <div className={fieldGroupCls}>
        <Label className={fieldLabelCls}>与用户的关系</Label>
        <FullInput
          value={form.userRelation}
          onChange={e => update('userRelation', e.target.value)}
          placeholder="如：挚友 / 上下级 / 主仆…"
          diceField="userRelation"
        />
      </div>
    </div>
  )

  const LanguageHabit = () => (
    <div className={fieldGroupCls}>
      <div className={fieldGroupCls}>
        <Label className={fieldLabelCls}>如何称呼用户</Label>
        <FullInput
          value={form.addressUser}
          onChange={e => update('addressUser', e.target.value)}
          placeholder="如：主人 / 挚友 / 阁下…"
          diceField="addressUser"
        />
      </div>
      <div className={fieldGroupCls}>
        <Label className={fieldLabelCls}>开场白</Label>
        <FullInput
          value={form.greeting}
          onChange={e => update('greeting', e.target.value)}
          placeholder="角色见面时的第一句问候"
          diceField="greeting"
        />
      </div>
      <div className={fieldGroupCls}>
        <Label className={fieldLabelCls}>口癖</Label>
        <FullInput
          value={form.catchphrase}
          onChange={e => update('catchphrase', e.target.value)}
          placeholder="角色常挂在嘴边的话"
          diceField="catchphrase"
        />
      </div>
      <div className={fieldGroupCls}>
        <Label className={fieldLabelCls}>【示例对话】</Label>
        <p className="text-xs text-gray-400">可用作角色说话风格参考的代表性话语或台词摘录，不超过三条</p>
        {form.examples.map((ex, i) => (
          <div key={i} className="relative w-full flex items-center gap-2">
            <FullInput
                value={ex}
                onChange={e => updateExample(i, e.target.value)}
              placeholder={`示例 ${i + 1}`}
              className="flex-1"
              />
            <ExampleDiceButton index={i} />
          </div>
        ))}
        {form.examples.length < 3 && (
          <PinkBtn
            variant="outline"
            size="sm"
            className="bg-white text-pink-400 border-pink-400 rounded-xl"
            onClick={addExample}
          >
            + 添加
          </PinkBtn>
        )}
      </div>
    </div>
  )

  const handleSave = () => {
    if (!requiredFilled) {
      alert('请补全必填项')
      return
    }
    localStorage.setItem('roleData', JSON.stringify(form))
    alert('保存成功')
  }

  const stepIdx = { basic: 1, supplement: 2, language: 3 }[step]

  return (
    <div className="flex flex-col h-screen bg-pink-50 p-4 sm:p-6 lg:p-8 rounded-2xl shadow-lg">
      <div className="flex-none text-center pb-6">
        <h1 className="text-2xl font-bold text-pink-600">桃桃子</h1>
        <p className="text-pink-300 text-sm">我想了解你的oc!</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Tabs value={step} onValueChange={s => setStep(s as Steps)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-pink-100 rounded-lg p-1 mb-6">
            <TabsTrigger
              value="basic"
              className="text-pink-400 data-[state=active]:bg-pink-400 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg"
            >
              基本设定
            </TabsTrigger>
            <TabsTrigger
              value="supplement"
              className="text-pink-400 data-[state=active]:bg-pink-400 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg"
            >
              补充设定
            </TabsTrigger>
            <TabsTrigger
              value="language"
              className="text-pink-400 data-[state=active]:bg-pink-400 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg"
            >
              语言习惯
            </TabsTrigger>
        </TabsList>
        <TabsContent value="basic">
            <div className={formContainerCls}>
            <BasicSetting />
          </div>
        </TabsContent>
        <TabsContent value="supplement">
            <div className={formContainerCls}>
            <SupplementSetting />
          </div>
        </TabsContent>
        <TabsContent value="language">
            <div className={formContainerCls}>
            <LanguageHabit />
          </div>
        </TabsContent>
      </Tabs>
      </div>

      {/* Save button */}
      <div className="flex-none pt-6 text-center">
        <PinkBtn onClick={handleSave} className="w-full sm:w-auto px-8 py-3">保存</PinkBtn>
      </div>
    </div>
  )
} 