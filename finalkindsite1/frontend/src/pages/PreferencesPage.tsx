"use client"

import { useState, useEffect, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { supabase } from "../lib/supabase"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Checkbox } from "../components/ui/checkbox"
import { Label } from "../components/ui/label"
import { Loader2 } from "lucide-react"
import Tilt from "react-parallax-tilt";

// ----------- UI and DB shapes + mappers -----------

type UIPreferences = {
  dyslexia: boolean
  cognitive_impairment: boolean
  visual_impairment: boolean
  adhd: boolean
  esl_simple_english: boolean
}

type DBPreferences = {
  id: string
  has_reading_difficulty: boolean
  has_motion_sensitivity: boolean
  has_color_sensitivity: boolean
  prefers_large_text: boolean
  prefers_reduced_motion: boolean
  prefers_high_contrast: boolean
}

const DEFAULT_UI_PREFS: UIPreferences = {
  dyslexia: false,
  cognitive_impairment: false,
  visual_impairment: false,
  adhd: false,
  esl_simple_english: false,
}

function prefsToUI(db: Partial<DBPreferences> | null | undefined): UIPreferences {
  return {
    dyslexia: !!db?.has_reading_difficulty,
    cognitive_impairment: !!db?.has_motion_sensitivity,
    visual_impairment: !!db?.has_color_sensitivity,
    adhd: !!db?.prefers_large_text,
    esl_simple_english: !!db?.prefers_reduced_motion,
  }
}

function prefsToDB(ui: UIPreferences, id: string): DBPreferences {
  return {
    id,
    has_reading_difficulty: ui.dyslexia,
    has_motion_sensitivity: ui.cognitive_impairment,
    has_color_sensitivity: ui.visual_impairment,
    prefers_large_text: ui.adhd,
    prefers_reduced_motion: ui.esl_simple_english,
    prefers_high_contrast: false,
  }
}

export default function PreferencesPage() {
  const [preferences, setPreferences] = useState<UIPreferences>(DEFAULT_UI_PREFS)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingPrefs, setIsCheckingPrefs] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const loadPreferences = async () => {
      if (!user) return
      try {
        const { data, error } = await supabase
          .from("user_preferences")
          .select(
            "id, has_reading_difficulty, has_motion_sensitivity, has_color_sensitivity, prefers_large_text, prefers_reduced_motion, prefers_high_contrast"
          )
          .eq("id", user.id)
          .maybeSingle()

        if (error && (error as any).code !== "PGRST116") {
          console.error("Error loading preferences:", error)
        }

        const ui = prefsToUI(data as Partial<DBPreferences> | null)
        setPreferences(ui)
      } catch (err) {
        console.error("Error loading preferences:", err)
      } finally {
        setIsCheckingPrefs(false)
      }
    }

    loadPreferences()
  }, [user])

  // Radix Checkbox gives CheckedState (true | false | "indeterminate")
  const handleCheckboxChange =
    (field: keyof UIPreferences) =>
    (checked: boolean | "indeterminate") => {
      const value = checked === true
      setPreferences(prev => ({ ...prev, [field]: value }))
    }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      const payload = prefsToDB(preferences, user.id)
      const { error: upsertErr } = await supabase
        .from("user_preferences")
        .upsert(payload, { onConflict: "id" })

      if (upsertErr) throw upsertErr
      navigate("/chat")
    } catch (err: any) {
      setError(err?.message || "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (isCheckingPrefs) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <div className="w-full max-w-2xl animate-fade-in-up">
        {/* 3D tilt wrapper around the whole editor card */}
        <Tilt
        tiltMaxAngleX={10}
        tiltMaxAngleY={10}
        perspective={1000}
        glareEnable={true}
        glareMaxOpacity={0.5}
        scale={1.02}
        tiltEnable={!preferences.esl_simple_english}
        >
          <Card className="border-0 bg-transparent shadow-none">
            <CardHeader>
              <CardTitle className="text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Set Your Learning Preferences
              </CardTitle>
              <CardDescription className="leading-relaxed">
                Help us understand your needs so we can provide the best learning experience. You can change these
                settings anytime.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="space-y-8">

                  {/* Reading & Text */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Reading & Text</h3>
                    <div className="space-y-4">

                      <div className="flex items-start gap-3 p-3 rounded-lg transition-all hover:bg-primary/5">
                        <Checkbox
                          id="dyslexia"
                          checked={preferences.dyslexia}
                          onCheckedChange={handleCheckboxChange("dyslexia")}
                          aria-describedby="dyslexia-description"
                        />
                        <div className="flex flex-col gap-1">
                          <Label htmlFor="dyslexia" className="cursor-pointer font-medium">
                            I have dyslexia
                          </Label>
                          <p id="dyslexia-description" className="text-sm text-muted-foreground leading-relaxed">
                            We’ll use dyslexia-friendly formatting and simplified language.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 rounded-lg transition-all hover:bg-primary/5">
                        <Checkbox
                          id="adhd"
                          checked={preferences.adhd}
                          onCheckedChange={handleCheckboxChange("adhd")}
                          aria-describedby="large-text-description"
                        />
                        <div className="flex flex-col gap-1">
                          <Label htmlFor="adhd" className="cursor-pointer font-medium">
                            I prefer larger text
                          </Label>
                          <p id="large-text-description" className="text-sm text-muted-foreground leading-relaxed">
                            We’ll increase font sizes and spacing for readability.
                          </p>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Motion & Animation */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Motion & Animation</h3>
                    <div className="space-y-4">

                      <div className="flex items-start gap-3 p-3 rounded-lg transition-all hover:bg-primary/5">
                        <Checkbox
                          id="cognitive_impairment"
                          checked={preferences.cognitive_impairment}
                          onCheckedChange={handleCheckboxChange("cognitive_impairment")}
                          aria-describedby="cognitive-impairment-description"
                        />
                        <div className="flex flex-col gap-1">
                          <Label htmlFor="cognitive_impairment" className="cursor-pointer font-medium">
                            I’m sensitive to complex layouts
                          </Label>
                          <p id="cognitive-impairment-description" className="text-sm text-muted-foreground leading-relaxed">
                            We’ll chunk information and simplify structure.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 rounded-lg transition-all hover:bg-primary/5">
                        <Checkbox
                          id="reduced-motion"
                          checked={preferences.esl_simple_english}
                          onCheckedChange={handleCheckboxChange("esl_simple_english")}
                          aria-describedby="reduced-motion-description"
                        />
                        <div className="flex flex-col gap-1">
                          <Label htmlFor="reduced-motion" className="cursor-pointer font-medium">
                            I prefer reduced motion in interfaces
                          </Label>
                          <p id="reduced-motion-description" className="text-sm text-muted-foreground leading-relaxed">
                            Animations and transitions will be minimized.
                          </p>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Color & Contrast */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Color & Contrast</h3>
                    <div className="space-y-4">

                      <div className="flex items-start gap-3 p-3 rounded-lg transition-all hover:bg-primary/5">
                        <Checkbox
                          id="visual_impairment"
                          checked={preferences.visual_impairment}
                          onCheckedChange={handleCheckboxChange("visual_impairment")}
                          aria-describedby="visual-impairment-description"
                        />
                        <div className="flex flex-col gap-1">
                          <Label htmlFor="visual_impairment" className="cursor-pointer font-medium">
                            I’m sensitive to bright colors
                          </Label>
                          <p id="visual-impairment-description" className="text-sm text-muted-foreground leading-relaxed">
                            We’ll use softer palettes and higher contrast where helpful.
                          </p>
                        </div>
                      </div>

                    </div>
                  </div>

                  {error && (
                    <p className="text-sm text-destructive" role="alert">
                      {error}
                    </p>
                  )}

                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all hover:scale-105"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Continue to Chat"
                      )}
                    </Button>
                  </div>

                </div>
              </form>
            </CardContent>
          </Card>
        </Tilt>
      </div>
    </div>
  )
}
