import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload } from "lucide-react";
import type { Section, Question } from "@shared/schema";

function QuestionPreview({ question, answer, onAnswerChange }: {
  question: Question;
  answer: any;
  onAnswerChange: (value: any) => void;
}) {
  const renderInput = () => {
    switch (question.type) {
      case "single-choice":
        return (
          <RadioGroup value={answer || ""} onValueChange={onAnswerChange}>
            <div className="space-y-2">
              {(question.options || []).map((option, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${question.id}-${idx}`} />
                  <Label htmlFor={`${question.id}-${idx}`} className="font-normal cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        );

      case "multi-choice":
        const multiAnswer = answer || [];
        return (
          <div className="space-y-2">
            {(question.options || []).map((option, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.id}-${idx}`}
                  checked={multiAnswer.includes(option)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onAnswerChange([...multiAnswer, option]);
                    } else {
                      onAnswerChange(multiAnswer.filter((a: string) => a !== option));
                    }
                  }}
                />
                <Label htmlFor={`${question.id}-${idx}`} className="font-normal cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );

      case "short-text":
        return (
          <div className="space-y-2">
            <Input
              value={answer || ""}
              onChange={(e) => onAnswerChange(e.target.value)}
              placeholder="Enter your answer..."
              maxLength={question.maxLength}
            />
            {question.maxLength && (
              <p className="text-xs text-muted-foreground text-right">
                {(answer || "").length} / {question.maxLength}
              </p>
            )}
          </div>
        );

      case "long-text":
        return (
          <div className="space-y-2">
            <Textarea
              value={answer || ""}
              onChange={(e) => onAnswerChange(e.target.value)}
              placeholder="Enter your detailed answer..."
              rows={5}
              maxLength={question.maxLength}
            />
            {question.maxLength && (
              <p className="text-xs text-muted-foreground text-right">
                {(answer || "").length} / {question.maxLength}
              </p>
            )}
          </div>
        );

      case "numeric":
        return (
          <div className="space-y-2">
            <Input
              type="number"
              value={answer || ""}
              onChange={(e) => onAnswerChange(e.target.value ? Number(e.target.value) : "")}
              placeholder="Enter a number..."
              min={question.minValue}
              max={question.maxValue}
            />
            {(question.minValue !== undefined || question.maxValue !== undefined) && (
              <p className="text-xs text-muted-foreground">
                {question.minValue !== undefined && question.maxValue !== undefined
                  ? `Range: ${question.minValue} - ${question.maxValue}`
                  : question.minValue !== undefined
                  ? `Min: ${question.minValue}`
                  : `Max: ${question.maxValue}`}
              </p>
            )}
          </div>
        );

      case "file-upload":
        return (
          <div className="border-2 border-dashed rounded-lg p-8 text-center hover-elevate cursor-pointer">
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              File upload functionality (stub)
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2">
        <Label className="text-base">
          {question.text}
          {question.required && <span className="text-destructive ml-1">*</span>}
        </Label>
      </div>
      {question.description && (
        <p className="text-sm text-muted-foreground">{question.description}</p>
      )}
      {renderInput()}
    </div>
  );
}

export function AssessmentPreview({ sections }: { sections: Section[] }) {
  const [answers, setAnswers] = useState<Record<string, any>>({});

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const shouldShowQuestion = (question: Question): boolean => {
    if (!question.conditionalOn) return true;
    const dependentAnswer = answers[question.conditionalOn];
    return dependentAnswer === question.conditionalValue;
  };

  const totalQuestions = sections.reduce((acc, s) => acc + s.questions.length, 0);

  return (
    <Card className="p-6 sticky top-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Live Preview</h3>
          <Badge variant="outline">{totalQuestions} Questions</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          See how candidates will experience this assessment
        </p>
      </div>

      <div className="space-y-8 max-h-[calc(100vh-12rem)] overflow-y-auto pr-2">
        {sections.map((section, sectionIdx) => {
          const visibleQuestions = section.questions.filter(shouldShowQuestion);
          if (visibleQuestions.length === 0 && section.questions.length > 0) return null;

          return (
            <div key={section.id} className="space-y-4">
              <div className="border-b pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary">Section {sectionIdx + 1}</Badge>
                  <h4 className="font-semibold">{section.title}</h4>
                </div>
                {section.description && (
                  <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
                )}
              </div>

              <div className="space-y-6">
                {visibleQuestions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8 border-2 border-dashed rounded-lg">
                    Add questions to see them here
                  </p>
                ) : (
                  visibleQuestions.map((question, qIdx) => (
                    <div key={question.id} className="space-y-3">
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">
                          Q{qIdx + 1}
                        </Badge>
                        <div className="flex-1">
                          <QuestionPreview
                            question={question}
                            answer={answers[question.id]}
                            onAnswerChange={(value) => handleAnswerChange(question.id, value)}
                          />
                        </div>
                      </div>
                      {question.conditionalOn && (
                        <p className="text-xs text-muted-foreground pl-12">
                          ℹ️ Conditional question - only shown when conditions are met
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}

        {sections.length > 0 && (
          <div className="pt-4 border-t">
            <Button className="w-full" disabled>
              Submit Assessment (Preview Mode)
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
