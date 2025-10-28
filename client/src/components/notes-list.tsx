import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Send } from "lucide-react";
import type { Note } from "@shared/schema";
import { useAddNote } from "@/lib/mutations";

const TEAM_MEMBERS = [
  { id: "1", name: "Sarah Johnson", email: "sarah@talentflow.com" },
  { id: "2", name: "Michael Chen", email: "michael@talentflow.com" },
  { id: "3", name: "Emily Rodriguez", email: "emily@talentflow.com" },
  { id: "4", name: "David Kim", email: "david@talentflow.com" },
];

export function NotesList({ candidateId, notes }: { candidateId: string; notes: Note[] }) {
  const [content, setContent] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const addNote = useAddNote();

  const handleAddNote = () => {
    if (!content.trim()) return;
    
    const mentions = content.match(/@(\w+\s?\w+)/g)?.map(m => m.slice(1)) || [];
    
    addNote.mutate({
      candidateId,
      data: {
        content,
        author: "HR Manager",
        authorId: "current-user",
        mentions,
      },
    }, {
      onSuccess: () => {
        setContent("");
      },
    });
  };

  const handleContentChange = (value: string) => {
    setContent(value);
    const lastAtIndex = value.lastIndexOf("@");
    if (lastAtIndex !== -1) {
      const textAfterAt = value.slice(lastAtIndex + 1);
      if (!textAfterAt.includes(" ")) {
        setShowMentions(true);
        setMentionQuery(textAfterAt.toLowerCase());
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const handleMentionSelect = (member: typeof TEAM_MEMBERS[0]) => {
    const lastAtIndex = content.lastIndexOf("@");
    const newContent = content.slice(0, lastAtIndex) + `@${member.name} `;
    setContent(newContent);
    setShowMentions(false);
  };

  const filteredMembers = showMentions
    ? TEAM_MEMBERS.filter(
        (m) =>
          m.name.toLowerCase().includes(mentionQuery) ||
          m.email.toLowerCase().includes(mentionQuery)
      )
    : [];

  const renderNoteContent = (note: Note) => {
    let content = note.content;
    note.mentions.forEach((mention) => {
      content = content.replace(
        new RegExp(`@${mention}`, "g"),
        `<span class="bg-primary/10 text-primary px-1 rounded font-medium">@${mention}</span>`
      );
    });
    return { __html: content };
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Add Note</h3>
        <div className="space-y-4">
          <div className="relative">
            <Textarea
              placeholder="Add a note... Use @ to mention team members"
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              rows={4}
              data-testid="textarea-note"
            />
            {showMentions && filteredMembers.length > 0 && (
              <Card className="absolute z-10 mt-2 w-full max-w-sm border shadow-lg">
                <div className="p-2">
                  {filteredMembers.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => handleMentionSelect(member)}
                      className="w-full flex items-center gap-3 p-2 rounded hover-elevate text-left"
                      data-testid={`mention-option-${member.id}`}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{member.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </Card>
            )}
          </div>
          <Button onClick={handleAddNote} disabled={!content.trim() || addNote.isPending} data-testid="button-add-note">
            <Send className="h-4 w-4 mr-2" />
            {addNote.isPending ? "Adding..." : "Add Note"}
          </Button>
        </div>
      </Card>

      <div>
        <h3 className="font-semibold mb-4">Notes History</h3>
        {notes.length === 0 ? (
          <Card className="p-12">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                  <MessageSquare className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">No notes yet</h3>
                <p className="text-sm text-muted-foreground">
                  Add notes to keep track of conversations and observations
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <Card key={note.id} className="p-4" data-testid={`note-${note.id}`}>
                <div className="flex gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="text-xs">
                      {getInitials(note.author)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <p className="font-medium text-sm">{note.author}</p>
                      <time className="text-xs text-muted-foreground">
                        {new Date(note.timestamp).toLocaleString()}
                      </time>
                    </div>
                    <div
                      className="text-sm text-foreground"
                      dangerouslySetInnerHTML={renderNoteContent(note)}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
