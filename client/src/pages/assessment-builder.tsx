// client/src/pages/assessment-builder.tsx

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link, useLocation } from "wouter";
import { useSaveAssessment } from "@/lib/mutations";
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AssessmentPreview } from "@/components/assessment-preview";
import type { Assessment, Section, Question, QuestionType } from "@shared/schema";
import { nanoid } from "nanoid";

const questionTypes: { value: QuestionType; label: string }[] = [
  { value: "single-choice", label: "Single Choice" },
  { value: "multi-choice", label: "Multiple Choice" },
  { value: "short-text", label: "Short Text" },
  { value: "long-text", label: "Long Text" },
  { value: "numeric", label: "Numeric" },
  { value: "file-upload", label: "File Upload" },
];

function QuestionEditor({
  question,
  allQuestions,
  onUpdate,
  onDelete,
}: {
  question: Question;
  allQuestions: Question[];
  onUpdate: (q: Question) => void;
  onDelete: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...(question.options || [])];
    newOptions[index] = value;
    onUpdate({ ...question, options: newOptions });
  };

  const addOption = () => {
    onUpdate({ ...question, options: [...(question.options || []), ""] });
  };

  const removeOption = (index: number) => {
    const newOptions = (question.options || []).filter((_, i) => i !== index);
    onUpdate({ ...question, options: newOptions });
  };

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <button className="cursor-grab mt-3 text-muted-foreground hover:text-foreground">
          <GripVertical className="h-5 w-5" />
        </button>
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 text-sm font-medium hover:text-primary"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <span>{question.text || "New Question"}</span>
            </button>
            <div className="flex items-center gap-2">
              <Select
                value={question.type}
                onValueChange={(v: QuestionType) =>
                  onUpdate({ ...question, type: v })
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {questionTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon"
                onClick={onDelete}
                data-testid={`button-delete-question-${question.id}`}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>

          {isExpanded && (
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Question Text *</Label>
                <Input
                  value={question.text}
                  onChange={(e) => onUpdate({ ...question, text: e.target.value })}
                  placeholder="Enter your question..."
                  data-testid={`input-question-text-${question.id}`}
                />
              </div>

              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Textarea
                  value={question.description || ""}
                  onChange={(e) =>
                    onUpdate({ ...question, description: e.target.value })
                  }
                  placeholder="Additional context or instructions..."
                  rows={2}
                />
              </div>

              {(question.type === "single-choice" || question.type === "multi-choice") && (
                <div className="space-y-2">
                  <Label>Options</Label>
                  {(question.options || []).map((option, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        value={option}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        placeholder={`Option ${idx + 1}`}
                        data-testid={`input-option-${idx}`}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeOption(idx)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addOption}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Option
                  </Button>
                </div>
              )}

              {question.type === "numeric" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Min Value</Label>
                    <Input
                      type="number"
                      value={question.minValue || ""}
                      onChange={(e) =>
                        onUpdate({
                          ...question,
                          minValue: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Value</Label>
                    <Input
                      type="number"
                      value={question.maxValue || ""}
                      onChange={(e) =>
                        onUpdate({
                          ...question,
                          maxValue: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                    />
                  </div>
                </div>
              )}

              {(question.type === "short-text" || question.type === "long-text") && (
                <div className="space-y-2">
                  <Label>Max Length</Label>
                  <Input
                    type="number"
                    value={question.maxLength || ""}
                    onChange={(e) =>
                      onUpdate({
                        ...question,
                        maxLength: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    placeholder="e.g., 500"
                  />
                </div>
              )}

              <div className="flex items-center justify-between border-t pt-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={question.required}
                    onCheckedChange={(checked) =>
                      onUpdate({ ...question, required: checked })
                    }
                    data-testid={`switch-required-${question.id}`}
                  />
                  <Label>Required</Label>
                </div>
              </div>

              <div className="space-y-2 border-t pt-4">
                <Label>Conditional Display (optional)</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    value={question.conditionalOn || "none"}
                    onValueChange={(v) =>
                      onUpdate({
                        ...question,
                        conditionalOn: v === "none" ? undefined : v,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No condition</SelectItem>
                      {allQuestions
                        .filter((q) => q.id !== question.id)
                        .map((q) => (
                          <SelectItem key={q.id} value={q.id}>
                            {q.text || `Question ${q.id.slice(0, 6)}`}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {question.conditionalOn && (
                    <Input
                      value={question.conditionalValue || ""}
                      onChange={(e) =>
                        onUpdate({ ...question, conditionalValue: e.target.value })
                      }
                      placeholder="Value to trigger display"
                    />
                  )}
                </div>
                {question.conditionalOn && (
                  <p className="text-xs text-muted-foreground">
                    This question will only show if the selected question's answer matches the
                    specified value
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function AssessmentBuilder() {
  const [isEdit, editParams] = useRoute("/assessments/:jobId/edit");
  const [isPreview, previewParams] = useRoute("/assessments/:jobId/preview");
  
  const mode = isEdit ? "edit" : (isPreview ? "preview" : null);
  const jobId = isEdit ? editParams?.jobId : (isPreview ? previewParams?.jobId : null);

  const [, navigate] = useLocation();
  const saveAssessment = useSaveAssessment();

  const { data: existingAssessment, isLoading } = useQuery<Assessment>({
    queryKey: ["/api/assessments", jobId],
    enabled: !!jobId,
  });

  const [sections, setSections] = useState<Section[]>([]);

  useEffect(() => {
    if (existingAssessment && existingAssessment.sections) {
      setSections(existingAssessment.sections);
    } else if (!isLoading && !existingAssessment) {
      setSections([
        {
          id: nanoid(),
          title: "General Information",
          description: "",
          questions: [],
        },
      ]);
    }
  }, [existingAssessment, isLoading]);

  // --- UPDATED HANDLESAVE FUNCTION ---
  const handleSave = () => {
    // Add this guard clause to check for jobId
    if (!jobId) {
      console.error("Cannot save: No Job ID found.");
      return; // Stop execution if jobId is null
    }

    saveAssessment.mutate(
      {
        jobId, // This is now guaranteed to be a string
        data: {
          jobId, // This is now guaranteed to be a string
          title: `Assessment for Job ${jobId}`, // This is now guaranteed to be a string
          description: "Job-specific assessment",
          sections,
        },
      },
      {
        onSuccess: () => {
          navigate("/assessments");
        },
      }
    );
  };
  // --- END OF UPDATE ---

  const allQuestions = sections.flatMap((s) => s.questions);

  const addSection = () => {
    setSections([
      ...sections,
      {
        id: nanoid(),
        title: `Section ${sections.length + 1}`,
        description: "",
        questions: [],
      },
    ]);
  };

  const updateSection = (sectionId: string, updates: Partial<Section>) => {
    setSections(
      sections.map((s) => (s.id === sectionId ? { ...s, ...updates } : s))
    );
  };

  const deleteSection = (sectionId: string) => {
    setSections(sections.filter((s) => s.id !== sectionId));
  };

  const addQuestion = (sectionId: string) => {
    setSections(
      sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              questions: [
                ...s.questions,
                {
                  id: nanoid(),
                  type: "short-text",
                  text: "",
                  required: false,
                },
              ],
            }
          : s
      )
    );
  };

  const updateQuestion = (sectionId: string, questionId: string, updates: Question) => {
    setSections(
      sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              questions: s.questions.map((q) => (q.id === questionId ? updates : q)),
            }
          : s
      )
    );
  };

  const deleteQuestion = (sectionId: string, questionId: string) => {
    setSections(
      sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              questions: s.questions.filter((q) => q.id !== questionId),
            }
          : s
      )
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" asChild className="mb-4" data-testid="button-back-assessments">
          <Link href="/assessments">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assessments
          </Link>
        </Button>
        <h1 className="text-3xl font-semibold mb-2" data-testid="text-builder-title">
          {mode === "preview" ? "Assessment Preview" : "Assessment Builder"}
        </h1>
        <p className="text-muted-foreground">
          {mode === "preview"
            ? "See how candidates will experience this assessment."
            : "Create custom assessments with multiple sections and question types"}
        </p>
      </div>

      <div className={`grid grid-cols-1 ${mode === 'edit' ? 'lg:grid-cols-[1fr_600px]' : ''} gap-6`}>
        
        {mode === 'edit' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Sections</h2>
              <Button onClick={addSection} data-testid="button-add-section">
                <Plus className="h-4 w-4 mr-2" />
                Add Section
              </Button>
            </div>

            {sections.map((section) => (
              <Card key={section.id} className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-4">
                      <div className="space-y-2">
                        <Label>Section Title</Label>
                        <Input
                          value={section.title}
                          onChange={(e) =>
                            updateSection(section.id, { title: e.target.value })
                          }
                          data-testid={`input-section-title-${section.id}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Section Description (optional)</Label>
                        <Textarea
                          value={section.description}
                          onChange={(e) =>
                            updateSection(section.id, { description: e.target.value })
                          }
                          rows={2}
                        />
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteSection(section.id)}
                      data-testid={`button-delete-section-${section.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Questions</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addQuestion(section.id)}
                        data-testid={`button-add-question-${section.id}`}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Question
                      </Button>
                    </div>

                    {section.questions.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          No questions yet. Click "Add Question" to get started.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {section.questions.map((question) => (
                          <QuestionEditor
                            key={question.id}
                            question={question}
                            allQuestions={allQuestions}
                            onUpdate={(q) => updateQuestion(section.id, question.id, q)}
                            onDelete={() => deleteQuestion(section.id, question.id)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className={mode === 'edit' ? "lg:sticky lg:top-6 h-fit" : "max-w-3xl mx-auto w-full"}>
          <AssessmentPreview sections={sections} />
        </div>
      </div>

      {mode === 'edit' && (
        <div className="flex justify-end gap-4 border-t pt-6">
          <Button variant="outline" asChild>
            <Link href="/assessments">Cancel</Link>
          </Button>
          <Button onClick={handleSave} disabled={saveAssessment.isPending} data-testid="button-save-assessment">
            {saveAssessment.isPending ? "Saving..." : "Save Assessment"}
          </Button>
        </div>
      )}
    </div>
  );
}