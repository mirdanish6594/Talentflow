import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function TagChip({
  tag,
  onRemove,
  readonly = false,
}: {
  tag: string;
  onRemove?: () => void;
  readonly?: boolean;
}) {
  return (
    <Badge variant="outline" className="gap-1 pr-1" data-testid={`tag-${tag}`}>
      <span>{tag}</span>
      {!readonly && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="hover-elevate rounded-sm p-0.5"
          data-testid={`button-remove-tag-${tag}`}
          aria-label={`Remove ${tag}`}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </Badge>
  );
}
