import { PlayCircle, FileText, CheckCircle2, Lock } from "lucide-react";
import { cn } from "./ui/utils";

export interface Lesson {
  id: string;
  title: string;
  type: "video" | "reading" | "quiz";
  duration: string;
  completed: boolean;
  locked: boolean;
}

interface LessonListProps {
  lessons: Lesson[];
  currentLessonId?: string;
  onLessonClick?: (lessonId: string) => void;
}

export function LessonList({
  lessons,
  currentLessonId,
  onLessonClick,
}: LessonListProps) {
  const getIcon = (type: Lesson["type"], completed: boolean, locked: boolean) => {
    if (locked) return <Lock className="h-4 w-4 text-[#64748B]" />;
    if (completed) return <CheckCircle2 className="h-4 w-4 text-[#22C55E]" />;
    
    switch (type) {
      case "video":
        return <PlayCircle className="h-4 w-4 text-[#1e467c]" />;
      case "reading":
        return <FileText className="h-4 w-4 text-[#1e467c]" />;
      case "quiz":
        return <FileText className="h-4 w-4 text-[#F59E0B]" />;
      default:
        return <FileText className="h-4 w-4 text-[#1e467c]" />;
    }
  };

  return (
    <div className="space-y-2">
      {lessons.map((lesson, index) => {
        // Las lecciones completadas SIEMPRE son clickeables para poder revisarlas
        const isClickable = !lesson.locked;
        
        return (
          <button
            key={lesson.id}
            onClick={() => isClickable && onLessonClick?.(lesson.id)}
            disabled={lesson.locked}
            className={cn(
              "w-full rounded-lg border p-3 text-left transition-colors",
              currentLessonId === lesson.id
                ? "border-[#1e467c] bg-[#1e467c]/5"
                : lesson.completed
                  ? "border-[#22C55E]/30 bg-[#22C55E]/5 hover:border-[#22C55E]/50"
                  : "border-[#E2E8F0] bg-white hover:border-[#1e467c]/50",
              lesson.locked && "cursor-not-allowed opacity-60"
            )}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {getIcon(lesson.type, lesson.completed, lesson.locked)}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <h4 className={cn(
                    "text-sm",
                    lesson.completed ? "text-[#22C55E] font-medium" : "text-[#0F172A]"
                  )}>
                    {index + 1}. {lesson.title}
                  </h4>
                  {lesson.completed && !lesson.locked && (
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#22C55E]" />
                  )}
                </div>
                <p className="text-xs text-[#64748B]">{lesson.duration}</p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
