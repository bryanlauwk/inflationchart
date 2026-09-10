import { atlasStyle, ITEM_BY_ID, type ItemId } from "@/lib/catalogue";
import { cn } from "@/lib/utils";

/**
 * One cell of the hand-drawn grocery atlas. Purely decorative — the readable
 * label always lives in real HTML next to it.
 */
export function GroceryThumb({
  id,
  className,
}: {
  id: ItemId;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      role="presentation"
      className={cn(
        "block shrink-0 rounded-md border border-border/60 bg-card",
        className,
      )}
      style={atlasStyle(ITEM_BY_ID[id].atlas)}
    />
  );
}
