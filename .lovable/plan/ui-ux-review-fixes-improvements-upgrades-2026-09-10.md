# UI/UX review: fixes, improvements, upgrades

I went through the live page on desktop (1280px) and phone (390px) and read the hero, basket panel and page layout. The game works, but a few things weaken the first impression and the flow. Below is what I found and what I'd change, grouped by priority.

## Priority 1 — visible defects

1. **Broken basket icon.** The empty basket shows a missing-character box instead of an image, because it uses an emoji the browser can't render. Replace it with a drawn basket mark using the app's own illustration style (no emojis anywhere).
2. **Half the page is empty.** The right basket panel stretches the full screen height, so an empty basket leaves a large blank column. Let the panel size to its content, keep the action buttons pinned at the bottom, and make the empty state a compact, inviting card instead of a tall dashed box.
3. **Untranslated text.** Several labels stay in English when Chinese is selected: "Malaysian grocery time machine", "Your scene", "Tap a grocery in the scene…", "in your basket / tap to add", "Sound on / Sound off", "The full receipt" and the two hand-lettered notes. Move all of them into the shared bilingual copy file.
4. **Headline sits on a busy part of the illustration.** "RM100?" in red overlaps the red shop roof and the shop sign, hurting readability. Strengthen the dark wash behind the text block and shift the headline column so it rests over calmer parts of the picture.

## Priority 2 — flow and clarity

5. **The hero eats the whole first screen.** Nothing hints there's more below. Reduce the scene to roughly 78% of screen height on desktop so the month controls peek above the fold, and add a quiet scroll cue.
6. **No sense of progress.** The journey is pick → choose years → reveal, but nothing shows that. Add a slim three-step marker above the basket panel that lights up as the player advances.
7. **Reveal button is reachable too early.** It's visible but disabled with no explanation. When the basket is empty, show "Pick at least one grocery first" under it.
8. **Item labels vanish on phones.** On mobile the picture tiles show no names, so tapping is guesswork. Show short names under each tile on all sizes.
9. **Only five groceries in the picture.** The other twenty are hidden behind "Build my basket". Add a compact horizontal strip of the remaining popular items under the scene so more of the catalogue is discoverable without opening the editor.

## Priority 3 — polish

10. **Sticky mobile summary.** On phones, once items are in the basket, keep a slim bar at the bottom with the item count, current total and "Reveal" so the player never scrolls to find it.
11. **Quantity controls need a value.** The plus/minus buttons in the tray don't show the number next to them clearly; put the quantity between them and add a remove control per row.
12. **Reduce animation noise.** Several elements bounce, float and rotate at once on load. Keep the entrance for the headline and tiles, drop the perpetual floating loops.
13. **Warning in the browser console.** Animated wrappers around plain components produce repeated React ref warnings. Fix by animating the elements directly.
14. **Print layout.** The printed receipt currently carries the whole page. Add print rules so only the receipt prints.

## Technical notes

- Files touched: `src/components/game/HeroScene.tsx`, `BasketTray.tsx`, `Welcome.tsx`, `MonthPicker.tsx`, `src/pages/Index.tsx`, `src/lib/gameTranslations.ts`, `src/index.css` (print + scroll-cue utilities). No data, pipeline or edge-function changes.
- New small components: `StepProgress.tsx` (three-step marker), `MobileBasketBar.tsx` (sticky summary), `EmptyBasketMark.tsx` (inline SVG basket).
- Bilingual keys added to `gameTranslations.ts` for every string listed in item 3; no hardcoded user-facing English left in the game components.
- Animation cleanup: replace `motion.div` wrappers around `Button` with `motion.button`/`asChild` patterns to clear the ref warnings; keep all `prefers-reduced-motion` behaviour.
- Layout: change the grid to `lg:items-start`, drop `min-h-[calc(100svh-5rem)]` from the tray, cap the hero at `min-h-[78svh]`.

## Out of scope

No colour palette or typography change, no new illustration generation, no publishing.
