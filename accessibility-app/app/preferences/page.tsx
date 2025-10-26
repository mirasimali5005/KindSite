"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

interface PreferencesForm {
  dyslexia: boolean
  cognitive_impairment: boolean
  visual_impairment: boolean
  adhd: boolean
  esl_simple_english: boolean
}

export default function PreferencesPage() {
  const [preferences, setPreferences] = useState<PreferencesForm>({
    dyslexia: false,
    cognitive_impairment: false,
    visual_impairment: false,
    adhd: false,
    esl_simple_english: false,
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      setUserId(user.id)

      // Check if user already has preferences
      const { data: existingPrefs } = await supabase.from("user_preferences").select("*").eq("id", user.id).single()

      if (existingPrefs) {
        setPreferences({
          dyslexia: existingPrefs.dyslexia,
          cognitive_impairment: existingPrefs.cognitive_impairment,
          visual_impairment: existingPrefs.visual_impairment,
          adhd: existingPrefs.adhd,
          esl_simple_english: existingPrefs.esl_simple_english,
        })
      }

      setIsCheckingAuth(false)
    }

    checkAuth()
  }, [router])

  const handleCheckboxChange = (field: keyof PreferencesForm) => {
    setPreferences((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.from("user_preferences").upsert(
        {
          id: userId,
          ...preferences,
        },
        {
          onConflict: "id",
        },
      )

      if (error) throw error

      router.push("/chat")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Set Your Accessibility Preferences</CardTitle>
            <CardDescription className="leading-relaxed">
              Help us understand your needs so we can provide the best experience. You can change these settings
              anytime.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="space-y-8">
                {/* dyslexia Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Reading & Text</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="dyslexia"
                        checked={preferences.dyslexia}
                        onCheckedChange={() => handleCheckboxChange("dyslexia")}
                        aria-describedby="dyslexia-description"
                      />
                      <div className="flex flex-col gap-1">
                        <Label htmlFor="dyslexia" className="cursor-pointer font-medium">
                          I have dyslexia (e.g., dyslexia)
                        </Label>
                        <p
                          id="dyslexia-description"
                          className="text-sm text-muted-foreground leading-relaxed"
                        >
                          We'll use dyslexia-friendly fonts and optimized text formatting
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="large-text"
                        checked={preferences.adhd}
                        onCheckedChange={() => handleCheckboxChange("adhd")}
                        aria-describedby="large-text-description"
                      />
                      <div className="flex flex-col gap-1">
                        <Label htmlFor="large-text" className="cursor-pointer font-medium">
                          I prefer larger text
                        </Label>
                        <p id="large-text-description" className="text-sm text-muted-foreground leading-relaxed">
                          Text will be displayed in larger sizes for easier reading
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* cognitive_impairment Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Motion & Animation</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="cognitive_impairment"
                        checked={preferences.cognitive_impairment}
                        onCheckedChange={() => handleCheckboxChange("cognitive_impairment")}
                        aria-describedby="cognitive_impairment-description"
                      />
                      <div className="flex flex-col gap-1">
                        <Label htmlFor="cognitive_impairment" className="cursor-pointer font-medium">
                          I'm sensitive to motion and animations
                        </Label>
                        <p
                          id="cognitive_impairment-description"
                          className="text-sm text-muted-foreground leading-relaxed"
                        >
                          We'll avoid content with excessive movement or animations
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="reduced-motion"
                        checked={preferences.esl_simple_english}
                        onCheckedChange={() => handleCheckboxChange("esl_simple_english")}
                        aria-describedby="reduced-motion-description"
                      />
                      <div className="flex flex-col gap-1">
                        <Label htmlFor="reduced-motion" className="cursor-pointer font-medium">
                          I prefer reduced motion in interfaces
                        </Label>
                        <p id="reduced-motion-description" className="text-sm text-muted-foreground leading-relaxed">
                          Animations and transitions will be minimized
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Color & Contrast Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Color & Contrast</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="visual_impairment"
                        checked={preferences.visual_impairment}
                        onCheckedChange={() => handleCheckboxChange("visual_impairment")}
                        aria-describedby="visual_impairment-description"
                      />
                      <div className="flex flex-col gap-1">
                        <Label htmlFor="visual_impairment" className="cursor-pointer font-medium">
                          I'm sensitive to bright colors
                        </Label>
                        <p id="visual_impairment-description" className="text-sm text-muted-foreground leading-relaxed">
                          We'll use softer, more comfortable color palettes
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
                  <Button type="submit" className="flex-1" disabled={isLoading}>
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
      </div>
    </div>
  )
}
