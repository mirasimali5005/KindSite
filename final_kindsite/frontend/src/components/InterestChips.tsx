import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import ScrollReveal from "ScrollReveal"

const DEFAULT_CHIPS = [
  "Education", "Working with Children", "Working with Elderly", "Event Planning",
  "Advocacy", "Non-profits", "Social Media", "Public Speaking", "Networking",
  "Creativity", "Managing People", "Working with Animals",
]

export default function InterestChips({
  title = "Pick your interests",
  subtitle = "Select from the interests below, or add your own.",
  chips = DEFAULT_CHIPS,
  onAdd,
}: {
  title?: string
  subtitle?: string
  chips?: string[]
  onAdd?: () => void
}) {
  return (
    <section className="container mx-auto max-w-3xl px-4 py-12">
      <ScrollReveal className="mx-auto rounded-3xl border border-border bg-card/80 p-6 shadow-sm md:p-8">
        <div className="mb-4 text-center">
          <h2 className="text-2xl font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {chips.map((c) => (
            <span
              key={c}
              className="rounded-full border border-border bg-secondary px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-secondary/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              role="button"
              tabIndex={0}
              aria-pressed="false"
            >
              {c}
            </span>
          ))}
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Don’t see what you want?{" "}
          <Button variant="outline" size="sm" className="ml-2" onClick={onAdd}>
            <Plus className="h-4 w-4" /> Add it here
          </Button>
        </div>
      </ScrollReveal>
    </section>
  )
}
