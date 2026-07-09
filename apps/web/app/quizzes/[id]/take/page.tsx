"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  GripVertical,
  X,
  Lightbulb,
  Loader2,
  RotateCcw,
  ListChecks,
  Trophy,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/learning-progress"
import { graphqlFetch } from "@/lib/graphql/client"
import { quizDetailQuery, submitQuizAttemptMutation } from "@/lib/graphql/quizzes"
import { studentByUserIdQuery } from "@/lib/graphql/courses"
import { authClient } from "@/lib/auth-client"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
  pointerWithin,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

// ─── Types ────────────────────────────────────────────────────────────────

type QuizQuestion = {
  id: string
  question: string
  type: "MCQ" | "TF" | "REORDER" | "CATEGORIZE"
  points: number
  options: Record<string, unknown> | unknown[]
  correctAnswer: unknown
  categories: Record<string, unknown>
  hint: string
}

type QuizData = {
  id: string
  title: string
  description: string
  duration: string
  numQuestions: number
  passingScore: number
  questions: QuizQuestion[]
}

type AttemptAnswer = {
  isCorrect: boolean
  points: number
  response: unknown
  question: {
    id: string
    question: string
    type: string
    options: Record<string, unknown> | unknown[]
    correctAnswer: unknown
  }
}

type AttemptResult = {
  id: string
  score: number
  maxPoints: number
  earnedPoints: number
  passed: boolean
  attemptDate: string
  answers: AttemptAnswer[]
}

type Phase = "loading" | "taking" | "submitting" | "results"

// ─── Helpers ──────────────────────────────────────────────────────────────

const formatDuration = (value?: string): string => {
  if (!value) return ""
  const match = value.match(/^(?:(\d+):)?(\d+):(\d+)$/)
  if (match) {
    const hours = parseInt(match[1] ?? "0", 10)
    const minutes = parseInt(match[2] ?? "0", 10)
    if (hours) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }
  return value
}

const QUESTION_TYPE_LABELS: Record<string, string> = {
  MCQ: "Multiple Choice",
  TF: "True / False",
  REORDER: "Reorder",
  CATEGORIZE: "Categorize",
}

const QUESTION_TYPE_COLORS: Record<string, string> = {
  MCQ: "text-blue-600 bg-blue-500/8 dark:text-blue-400 dark:bg-blue-500/10",
  TF: "text-emerald-600 bg-emerald-500/8 dark:text-emerald-400 dark:bg-emerald-500/10",
  REORDER: "text-violet-600 bg-violet-500/8 dark:text-violet-400 dark:bg-violet-500/10",
  CATEGORIZE: "text-amber-600 bg-amber-500/8 dark:text-amber-400 dark:bg-amber-500/10",
}

// ─── Question Renderers ───────────────────────────────────────────────────

function MCQQuestion({
  question,
  answer,
  onAnswer,
  disabled,
}: {
  question: QuizQuestion
  answer: unknown
  onAnswer: (response: string) => void
  disabled?: boolean
}) {
  // Options can be an array of strings or an object with keys
  const optionEntries: Array<[string, string]> = React.useMemo(() => {
    if (Array.isArray(question.options)) {
      return question.options.map((opt, i) => [String(i), String(opt)])
    }
    if (typeof question.options === "object" && question.options !== null) {
      // Check for {choices: [...]} pattern
      const opts = question.options as Record<string, unknown>
      if (Array.isArray(opts.choices)) {
        return opts.choices.map((opt: unknown, i: number) => [String(i), String(opt)])
      }
      // Flat object like {"A": "Option A", ...}
      return Object.entries(opts).map(([key, val]) => [key, String(val)])
    }
    return []
  }, [question.options])

  const selectedKey = typeof answer === "string" ? answer : undefined

  return (
    <div className="space-y-2.5">
      {optionEntries.map(([key, label], index) => {
        const isSelected = selectedKey === key
        const letter = String.fromCharCode(65 + index)

        return (
          <button
            key={key}
            onClick={() => !disabled && onAnswer(key)}
            disabled={disabled}
            className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-all ${
              isSelected
                ? "border-primary bg-primary/5 text-foreground"
                : "border-transparent bg-secondary/30 hover:bg-secondary/60 text-foreground"
            } ${disabled ? "cursor-default" : "cursor-pointer"}`}
          >
            <span
              className={`flex size-7 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold ${
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground border"
              }`}
            >
              {letter}
            </span>
            <span className="text-[14px] font-medium">{label || `Option ${index + 1}`}</span>
          </button>
        )
      })}
    </div>
  )
}

function TFQuestion({
  answer,
  onAnswer,
  disabled,
}: {
  question: QuizQuestion
  answer: unknown
  onAnswer: (response: string) => void
  disabled?: boolean
}) {
  const selected = typeof answer === "string" ? answer : undefined

  return (
    <div className="grid grid-cols-2 gap-4">
      <button
        onClick={() => !disabled && onAnswer("true")}
        disabled={disabled}
        className={`flex items-center justify-center gap-2 rounded-xl border px-6 py-4 text-[15px] font-semibold transition-all ${
          selected === "true"
            ? "border-primary bg-primary/5 text-foreground"
            : "border-transparent bg-secondary/30 hover:bg-secondary/60 text-foreground"
        } ${disabled ? "cursor-default" : "cursor-pointer"}`}
      >
        <CheckCircle2 className="size-5 text-emerald-500" />
        True
      </button>
      <button
        onClick={() => !disabled && onAnswer("false")}
        disabled={disabled}
        className={`flex items-center justify-center gap-2 rounded-xl border px-6 py-4 text-[15px] font-semibold transition-all ${
          selected === "false"
            ? "border-primary bg-primary/5 text-foreground"
            : "border-transparent bg-secondary/30 hover:bg-secondary/60 text-foreground"
        } ${disabled ? "cursor-default" : "cursor-pointer"}`}
      >
        <X className="size-5 text-red-500" />
        False
      </button>
    </div>
  )
}

function SortableItem({
  id,
  text,
  index,
  disabled,
}: {
  id: string
  text: string
  index: number
  disabled?: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.8 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-shadow ${
        isDragging
          ? "border-primary/40 shadow-lg bg-card"
          : "border-transparent bg-secondary/30"
      }`}
    >
      <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-background text-[12px] font-bold text-muted-foreground border">
        {index + 1}
      </span>
      <span className="flex-1 text-[14px] font-medium">{text}</span>
      {!disabled && (
        <button
          className="flex shrink-0 cursor-grab items-center justify-center rounded p-1 text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-5" />
        </button>
      )}
    </div>
  )
}

function ReorderQuestion({
  question,
  answer,
  onAnswer,
  disabled,
}: {
  question: QuizQuestion
  answer: unknown
  onAnswer: (response: unknown[]) => void
  disabled?: boolean
}) {
  // Extract items from options
  const items: string[] = React.useMemo(() => {
    if (Array.isArray(question.options)) {
      return question.options.map(String)
    }
    if (typeof question.options === "object" && question.options !== null) {
      const opts = question.options as Record<string, unknown>
      if (Array.isArray(opts.items)) return opts.items.map(String)
      if (Array.isArray(opts.choices)) return opts.choices.map(String)
    }
    return []
  }, [question.options])

  const [order, setOrder] = React.useState<string[]>(() => {
    if (Array.isArray(answer)) return answer.map(String)
    // Shuffle on first render
    const shuffled = [...items]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const temp = shuffled[i]!
      shuffled[i] = shuffled[j]!
      shuffled[j] = temp
    }
    return shuffled
  })

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    if (disabled) return
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = order.indexOf(String(active.id))
    const newIndex = order.indexOf(String(over.id))
    if (oldIndex === -1 || newIndex === -1) return

    const newOrder = arrayMove(order, oldIndex, newIndex)
    setOrder(newOrder)
    onAnswer(newOrder)
  }

  return (
    <div className="space-y-2.5">
      <p className="text-[13px] text-muted-foreground mb-3">
        Drag the items into the correct order:
      </p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          {order.map((item, index) => (
            <SortableItem
              key={item}
              id={item}
              text={item}
              index={index}
              disabled={disabled}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  )
}

function DraggableCategorizeItem({
  id,
  text,
  disabled,
}: {
  id: string
  text: string
  disabled?: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    disabled,
  })

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.8 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-[13px] font-medium transition-shadow ${
        isDragging
          ? "border-primary/40 shadow-lg bg-card cursor-grabbing"
          : "border-transparent bg-secondary/40 hover:bg-secondary/70"
      } ${!disabled ? "cursor-grab" : ""}`}
      {...attributes}
      {...listeners}
    >
      <GripVertical className="size-4 shrink-0 text-muted-foreground" />
      <span>{text}</span>
    </div>
  )
}

function CategoryBucket({
  category,
  items,
  isOver,
}: {
  category: string
  items: string[]
  isOver: boolean
}) {
  const { setNodeRef } = useDroppable({ id: `bucket-${category}` })

  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl border-2 border-dashed p-3 transition-colors min-h-[80px] ${
        isOver
          ? "border-primary/60 bg-primary/5"
          : "border-border/40 bg-secondary/20"
      }`}
    >
      <div className="mb-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
        {category}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.length > 0 ? (
          items.map((item) => (
            <DraggableCategorizeItem key={item} id={`item-${item}`} text={item} />
          ))
        ) : (
          <p className="text-[11px] text-muted-foreground/50 py-2">
            Drop items here
          </p>
        )}
      </div>
    </div>
  )
}

function CategorizeQuestion({
  question,
  answer,
  onAnswer,
  disabled,
}: {
  question: QuizQuestion
  answer: unknown
  onAnswer: (response: Record<string, string>) => void
  disabled?: boolean
}) {
  // Extract items and category names from options/categories/correctAnswer
  // Two backend formats exist:
  //   Format 1: options = { "Center": [], "Spread": [] } — keys are categories, items come from correctAnswer keys
  //   Format 2: options = { "items": [...], "buckets": { "Number": [], ... } } — explicit items + buckets
  const { items, categoryNames } = React.useMemo(() => {
    const opts = question.options as Record<string, unknown> | null
    const cats = question.categories as Record<string, unknown> | null
    const correct = question.correctAnswer

    let itemList: string[] = []
    let catNames: string[] = []

    // Items from options (Format 2: items array, or plain array)
    if (Array.isArray(question.options)) {
      itemList = question.options.map(String)
    } else if (opts && typeof opts === "object") {
      if (Array.isArray(opts.items)) {
        // Format 2: explicit items list
        itemList = opts.items.map(String)
      } else if (opts.buckets && typeof opts.buckets === "object") {
        // Format 2 but items might be missing — fall back to correctAnswer
        const buckets = opts.buckets as Record<string, unknown>
        if (Array.isArray(correct) || (correct && typeof correct === "object")) {
          const correctObj = correct as Record<string, unknown>
          // correctAnswer can be { item: category } or { category: [items] }
          for (const [key, val] of Object.entries(correctObj)) {
            if (Array.isArray(val)) {
              // { category: [items] } — items are the array values
              itemList.push(...val.map(String))
            } else {
              // { item: category } — items are the keys
              itemList.push(key)
            }
          }
        }
      } else {
        // Format 1: keys are categories, items come from correctAnswer
        // Extract items from correctAnswer keys (Format 1: { item: category })
        if (correct && typeof correct === "object" && !Array.isArray(correct)) {
          const correctObj = correct as Record<string, unknown>
          for (const [key, val] of Object.entries(correctObj)) {
            if (typeof val === "string") {
              // { item: category } — key is an item
              itemList.push(key)
            }
          }
        }
      }
    }

    // Deduplicate items
    itemList = [...new Set(itemList)]

    // Categories from categories field, buckets, or options keys
    if (cats && typeof cats === "object" && Object.keys(cats).length > 0) {
      catNames = Object.keys(cats)
    } else if (opts && typeof opts === "object" && !Array.isArray(opts)) {
      const buckets = opts.buckets as Record<string, unknown> | undefined
      if (buckets && typeof buckets === "object") {
        // Format 2: bucket keys are categories
        catNames = Object.keys(buckets)
      } else if (Array.isArray(opts.items)) {
        // Format 2 but no buckets — fallback
        catNames = []
      } else {
        // Format 1: options keys are category names (values are empty arrays)
        catNames = Object.keys(opts).filter(k => {
          const val = opts[k]
          return Array.isArray(val) // { "Center": [], "Spread": [] }
        })
      }
    }

    return { items: itemList, categoryNames: catNames }
  }, [question.options, question.categories, question.correctAnswer])

  const [mapping, setMapping] = React.useState<Record<string, string>>(() => {
    if (answer && typeof answer === "object" && !Array.isArray(answer)) {
      return answer as Record<string, string>
    }
    return {}
  })

  const [overBucket, setOverBucket] = React.useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  // Derive which items are unassigned vs assigned to each bucket
  const unassignedItems = items.filter((item) => !mapping[item])
  const bucketItems: Record<string, string[]> = {}
  for (const cat of categoryNames) {
    bucketItems[cat] = items.filter((item) => mapping[item] === cat)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    if (disabled) return
    setOverBucket(null)

    const { active, over } = event
    if (!over) return

    const itemId = String(active.id).replace(/^item-/, "")
    const overId = String(over.id)

    // Determine target category
    let targetCategory: string | null = null
    if (overId.startsWith("bucket-")) {
      targetCategory = overId.replace(/^bucket-/, "")
    } else if (overId.startsWith("item-")) {
      // Dropped on another item — find which bucket that item is in
      const otherItemId = overId.replace(/^item-/, "")
      targetCategory = mapping[otherItemId] ?? null
    }

    if (targetCategory) {
      const updated = { ...mapping, [itemId]: targetCategory }
      setMapping(updated)
      onAnswer(updated)
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event
    if (!over) {
      setOverBucket(null)
      return
    }
    const overId = String(over.id)
    if (overId.startsWith("bucket-")) {
      setOverBucket(overId.replace(/^bucket-/, ""))
    } else if (overId.startsWith("item-")) {
      const otherItemId = overId.replace(/^item-/, "")
      const cat = mapping[otherItemId]
      setOverBucket(cat ?? null)
    } else {
      setOverBucket(null)
    }
  }

  const handleDragStart = () => {
    // Clear any previous over state
    setOverBucket(null)
  }

  return (
    <div className="space-y-4">
      <p className="text-[13px] text-muted-foreground">
        Drag each item into the correct category bucket:
      </p>

      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragStart={handleDragStart}
      >
        {/* Unassigned items pool */}
        {unassignedItems.length > 0 && (
          <div className="rounded-xl border border-dashed border-border/40 bg-secondary/10 p-3">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              Items
            </div>
            <div className="flex flex-wrap gap-1.5">
              {unassignedItems.map((item) => (
                <DraggableCategorizeItem key={item} id={`item-${item}`} text={item} disabled={disabled} />
              ))}
            </div>
          </div>
        )}

        {/* Category buckets */}
        <div className="grid gap-3 sm:grid-cols-2">
          {categoryNames.map((cat) => (
            <CategoryBucket
              key={cat}
              category={cat}
              items={bucketItems[cat] ?? []}
              isOver={overBucket === cat}
            />
          ))}
        </div>
      </DndContext>
    </div>
  )
}

// ─── Question Renderer Switch ─────────────────────────────────────────────

function QuestionRenderer({
  question,
  answer,
  onAnswer,
  disabled,
}: {
  question: QuizQuestion
  answer: unknown
  onAnswer: (response: unknown) => void
  disabled?: boolean
}) {
  switch (question.type) {
    case "MCQ":
      return (
        <MCQQuestion
          question={question}
          answer={answer}
          onAnswer={(r) => onAnswer(r)}
          disabled={disabled}
        />
      )
    case "TF":
      return (
        <TFQuestion
          question={question}
          answer={answer}
          onAnswer={(r) => onAnswer(r)}
          disabled={disabled}
        />
      )
    case "REORDER":
      return (
        <ReorderQuestion
          question={question}
          answer={answer}
          onAnswer={(r) => onAnswer(r)}
          disabled={disabled}
        />
      )
    case "CATEGORIZE":
      return (
        <CategorizeQuestion
          question={question}
          answer={answer}
          onAnswer={(r) => onAnswer(r)}
          disabled={disabled}
        />
      )
    default:
      return (
        <p className="text-sm text-muted-foreground">
          Unsupported question type: {question.type}
        </p>
      )
  }
}

// ─── Results View ─────────────────────────────────────────────────────────

function QuizResults({
  result,
  questions,
  onRetake,
  onBack,
}: {
  result: AttemptResult
  questions: QuizQuestion[]
  onRetake: () => void
  onBack: () => void
}) {
  const scorePercent = Math.round(result.score)
  const isPassed = result.passed

  // Build a map from question ID to attempt answer for lookup
  const answerByQuestionId = new Map(result.answers.map((a) => [a.question.id, a]))

  return (
    <div className="space-y-8">
      {/* Score Summary */}
      <div className="flex flex-col items-center gap-6 rounded-2xl border bg-card p-8 text-center">
        <div
          className={`flex size-24 items-center justify-center rounded-full ${
            isPassed
              ? "bg-emerald-500/10 text-emerald-500"
              : "bg-red-500/10 text-red-500"
          }`}
        >
          <Trophy className="size-10" />
        </div>
        <div>
          <p className="text-5xl font-black tracking-tight">{scorePercent}%</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {result.earnedPoints} / {result.maxPoints} points
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[12px] font-bold uppercase tracking-wider ${
            isPassed
              ? "bg-emerald-500/10 text-emerald-600"
              : "bg-red-500/10 text-red-600"
          }`}
        >
          {isPassed ? <CheckCircle2 className="size-3.5" /> : <X className="size-3.5" />}
          {isPassed ? "Passed" : "Not Passed"}
        </span>
      </div>

      {/* Per-Question Review */}
      <div className="space-y-4">
        <h3 className="text-[14px] font-semibold text-muted-foreground uppercase tracking-wider">
          Question Review
        </h3>
        {questions.map((q, index) => {
          const attemptAnswer = answerByQuestionId.get(q.id)
          const isCorrect = attemptAnswer?.isCorrect ?? false

          return (
            <div
              key={q.id}
              className={`rounded-xl border bg-card p-5 transition-all ${
                isCorrect
                  ? "border-emerald-500/30 bg-emerald-500/[0.02]"
                  : "border-red-500/30 bg-red-500/[0.02]"
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="flex size-6 items-center justify-center rounded-md bg-secondary text-[11px] font-bold text-muted-foreground">
                  {index + 1}
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {QUESTION_TYPE_LABELS[q.type] ?? q.type}
                </span>
                <span className="ml-auto">
                  {isCorrect ? (
                    <CheckCircle2 className="size-5 text-emerald-500" />
                  ) : (
                    <X className="size-5 text-red-500" />
                  )}
                </span>
              </div>
              <h4 className="text-[14px] font-semibold leading-snug mb-2">
                {q.question}
              </h4>
              <div className="text-[13px] text-muted-foreground">
                {attemptAnswer && (
                  <p>
                    Your answer:{" "}
                    <span className={isCorrect ? "text-emerald-600 font-medium" : "text-red-600 font-medium"}>
                      {formatAnswer(attemptAnswer.response, q.type)}
                    </span>
                    {!isCorrect && attemptAnswer.question.correctAnswer != null && (
                      <>
                        {" · "}Correct:{" "}
                        <span className="text-emerald-600 font-medium">
                          {formatAnswer(attemptAnswer.question.correctAnswer, q.type)}
                        </span>
                      </>
                    )}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={onRetake}
          className="flex-1 h-11 rounded-xl gap-2"
        >
          <RotateCcw className="size-4" />
          Retake Quiz
        </Button>
        <Button
          onClick={onBack}
          className="flex-1 h-11 rounded-xl gap-2"
        >
          <ArrowLeft className="size-4" />
          Back to Quizzes
        </Button>
      </div>
    </div>
  )
}

function formatAnswer(value: unknown, type: string): string {
  if (value == null) return "—"
  if (type === "TF") return String(value).toLowerCase() === "true" ? "True" : "False"
  if (Array.isArray(value)) return (value as unknown[]).map(String).join(" → ")
  if (typeof value === "object")
    return Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ")
  return String(value)
}

// ─── Main Page ────────────────────────────────────────────────────────────

export default function QuizTakePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()

  const { data: session, isPending: isSessionLoading } = authClient.useSession()
  const user = session?.user

  const [quiz, setQuiz] = React.useState<QuizData | null>(null)
  const [studentId, setStudentId] = React.useState<string | null>(null)
  const [phase, setPhase] = React.useState<Phase>("loading")
  const [error, setError] = React.useState<string | null>(null)

  // Answer state
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0)
  const [answers, setAnswers] = React.useState<Record<string, unknown>>({})
  const [revealedHints, setRevealedHints] = React.useState<Set<string>>(new Set())
  const [attemptResult, setAttemptResult] = React.useState<AttemptResult | null>(null)

  // Resolve student ID
  React.useEffect(() => {
    if (isSessionLoading) return
    let mounted = true

    async function resolve() {
      if (!user) {
        if (mounted) setStudentId(null)
        return
      }
      try {
        const result = await graphqlFetch<{ studentByUserId: { id: string } | null }>({
          query: studentByUserIdQuery,
          operationName: "StudentByUserId",
          variables: { userId: user.id },
        })
        if (mounted) setStudentId(result.studentByUserId?.id ?? null)
      } catch {
        if (mounted) setStudentId(null)
      }
    }
    resolve()
    return () => { mounted = false }
  }, [user, isSessionLoading])

  // Fetch quiz data
  React.useEffect(() => {
    let mounted = true

    async function loadQuiz() {
      try {
        const result = await graphqlFetch<{ quiz: QuizData | null }>({
          query: quizDetailQuery,
          operationName: "QuizDetail",
          variables: { id: params.id },
        })
        if (mounted) {
          setQuiz(result.quiz)
          setPhase("taking")
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to load quiz")
          setPhase("taking") // Will show error state
        }
      }
    }

    if (params.id) loadQuiz()
    return () => { mounted = false }
  }, [params.id])

  const handleAnswer = (questionId: string, response: unknown) => {
    setAnswers((prev) => ({ ...prev, [questionId]: response }))
  }

  const handleSubmit = async () => {
    if (!studentId || !quiz) return

    setPhase("submitting")

    const submissionAnswers = quiz.questions.map((q) => ({
      question_id: q.id,
      response: answers[q.id] ?? null,
    }))

    try {
      const result = await graphqlFetch<{ submitQuizAttempt: AttemptResult }>({
        query: submitQuizAttemptMutation,
        operationName: "SubmitQuizAttempt",
        variables: {
          studentId,
          quizId: quiz.id,
          answers: submissionAnswers,
        },
      })
      setAttemptResult(result.submitQuizAttempt)
      setPhase("results")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit quiz")
      setPhase("taking") // Go back to taking so they can retry
    }
  }

  const handleRetake = () => {
    setAnswers({})
    setRevealedHints(new Set())
    setCurrentQuestionIndex(0)
    setAttemptResult(null)
    setError(null)
    setPhase("taking")
  }

  // Loading state
  if (phase === "loading") {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading quiz…</p>
        </div>
      </div>
    )
  }

  // Not found / error
  if (!quiz) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary">
            <BookOpen className="size-6 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              {error ?? "Quiz not found"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              This quiz may have been removed or is unavailable.
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push("/quizzes")} className="gap-2 rounded-xl">
            <ArrowLeft className="size-4" />
            Back to Quizzes
          </Button>
        </div>
      </div>
    )
  }

  const questions = quiz.questions
  const currentQuestion = questions[currentQuestionIndex]
  const answeredCount = Object.keys(answers).length
  const totalQuestions = questions.length
  const allAnswered = answeredCount >= totalQuestions

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden bg-background">
      {/* Top bar */}
      <div className="flex h-12 shrink-0 items-center gap-3 border-b px-4 bg-background">
        <Button
          variant="ghost"
          onClick={() => router.push("/quizzes")}
          size="sm"
          className="gap-1.5 text-[13px] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          <span className="hidden sm:inline">Back</span>
        </Button>

        <div className="h-4 w-px bg-border" />

        <div className="flex-1 min-w-0 flex items-center gap-2">
          <ListChecks className="size-3.5 text-primary shrink-0" />
          <h2 className="truncate text-[13px] font-medium text-muted-foreground">
            {quiz.title}
          </h2>
        </div>

        {phase === "taking" && (
          <>
            <div className="hidden md:flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
              <Clock className="size-3" />
              {formatDuration(quiz.duration)}
            </div>
            <div className="h-4 w-px bg-border" />
          </>
        )}

        <Button
          variant="ghost"
          onClick={() => router.push("/quizzes")}
          size="sm"
          className="gap-1 text-[13px] text-muted-foreground hover:text-foreground"
        >
          <X className="size-3.5" />
          <span className="hidden sm:inline">Exit</span>
        </Button>
      </div>

      {/* Main content */}
      <main className="min-h-0 flex-1 overflow-y-auto scrollbar-warm">
        <div className="mx-auto w-full max-w-2xl px-6 py-8 md:px-10">
          {phase === "results" && attemptResult ? (
            <QuizResults
              result={attemptResult}
              questions={questions}
              onRetake={handleRetake}
              onBack={() => router.push("/quizzes")}
            />
          ) : (
            <>
              {/* Error banner */}
              {error && (
                <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-[13px] text-red-600">
                  {error}
                </div>
              )}

              {/* Progress */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1">
                  <ProgressBar
                    progress={
                      totalQuestions > 0
                        ? Math.round((answeredCount / totalQuestions) * 100)
                        : 0
                    }
                    showPercentage={false}
                  />
                </div>
                <span className="text-[12px] font-medium text-muted-foreground shrink-0">
                  {answeredCount} of {totalQuestions}
                </span>
              </div>

              {/* Step indicators */}
              <div className="flex flex-wrap gap-1.5 mb-8">
                {questions.map((q, i) => {
                  const isAnswered = answers[q.id] !== undefined
                  const isCurrent = i === currentQuestionIndex
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(i)}
                      className={`flex size-8 items-center justify-center rounded-lg text-[11px] font-bold transition-all ${
                        isCurrent
                          ? "bg-primary text-primary-foreground"
                          : isAnswered
                          ? "bg-primary/10 text-primary"
                          : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {i + 1}
                    </button>
                  )
                })}
              </div>

              {/* Current Question */}
              {currentQuestion && (
                <div className="space-y-5">
                  <div className="rounded-xl border bg-card p-6">
                    {/* Question header */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="flex size-7 items-center justify-center rounded-md bg-secondary text-[12px] font-bold text-muted-foreground">
                        {currentQuestionIndex + 1}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold tracking-wide ${QUESTION_TYPE_COLORS[currentQuestion.type] ?? ""}`}
                      >
                        {QUESTION_TYPE_LABELS[currentQuestion.type] ?? currentQuestion.type}
                      </span>
                      <span className="ml-auto text-[12px] text-muted-foreground">
                        {currentQuestion.points} {currentQuestion.points === 1 ? "point" : "points"}
                      </span>
                    </div>

                    {/* Question text */}
                    <h3 className="text-[16px] font-semibold leading-snug tracking-tight mb-6">
                      {currentQuestion.question}
                    </h3>

                    {/* Answer area */}
                    <QuestionRenderer
                      question={currentQuestion}
                      answer={answers[currentQuestion.id]}
                      onAnswer={(response) => handleAnswer(currentQuestion.id, response)}
                      disabled={phase === "submitting"}
                    />
                  </div>

                  {/* Hint */}
                  {currentQuestion.hint && (
                    <div>
                      {revealedHints.has(currentQuestion.id) ? (
                        <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 px-4 py-3 text-[13px] text-amber-700 dark:text-amber-400">
                          <span className="font-semibold">Hint:</span> {currentQuestion.hint}
                        </div>
                      ) : (
                        <button
                          onClick={() =>
                            setRevealedHints((prev) => new Set([...prev, currentQuestion.id]))
                          }
                          className="flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Lightbulb className="size-3.5" />
                          Show hint
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Navigation */}
              <div className="mt-8 flex items-center justify-between border-t pt-6">
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestionIndex((i) => Math.max(0, i - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="gap-1.5 rounded-xl"
                >
                  <ChevronLeft className="size-4" />
                  Previous
                </Button>

                {currentQuestionIndex < totalQuestions - 1 ? (
                  <Button
                    onClick={() =>
                      setCurrentQuestionIndex((i) => Math.min(totalQuestions - 1, i + 1))
                    }
                    className="gap-1.5 rounded-xl"
                  >
                    Next
                    <ChevronRight className="size-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={!allAnswered || phase === "submitting" || !studentId}
                    className="gap-2 rounded-xl"
                  >
                    {phase === "submitting" ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Submitting…
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="size-4" />
                        Submit Quiz
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Submit button for mobile (always visible when all answered) */}
              {allAnswered && currentQuestionIndex < totalQuestions - 1 && phase === "taking" && (
                <div className="mt-4">
                  <Button
                    onClick={handleSubmit}
                    disabled={!studentId}
                    className="w-full gap-2 rounded-xl h-11"
                  >
                    <CheckCircle2 className="size-4" />
                    Submit Quiz
                  </Button>
                </div>
              )}

              {/* Auth prompt for unauthenticated users */}
              {!studentId && !isSessionLoading && (
                <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-[13px] text-amber-700 dark:text-amber-400">
                  You must be logged in to submit your quiz.{" "}
                  <a href={`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`} className="font-semibold underline">
                    Log in
                  </a>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
