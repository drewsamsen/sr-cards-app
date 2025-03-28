"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth, useUserSettings } from "@/lib/hooks"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Save, Moon, Sun } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { LearningSettings } from "@/lib/api/services/user.service"
import { PageLayout } from "@/components/page-layout"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTheme } from "@/components/theme-provider"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function SettingsPage() {
  const router = useRouter()
  const { user, isInitialized } = useAuth()
  const { settings, isLoading, error, updateSettings } = useUserSettings()
  const { theme, setTheme } = useTheme()
  
  // Form state
  const [requestRetention, setRequestRetention] = useState<number>(0.9)
  const [maximumInterval, setMaximumInterval] = useState<number>(365)
  const [weights, setWeights] = useState<string>("")
  const [enableFuzz, setEnableFuzz] = useState<boolean>(false)
  const [enableShortTerm, setEnableShortTerm] = useState<boolean>(true)
  const [newCardsPerDay, setNewCardsPerDay] = useState<number | undefined>(undefined)
  const [maxReviewsPerDay, setMaxReviewsPerDay] = useState<number | undefined>(undefined)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false)

  // Update form state when settings are loaded
  useEffect(() => {
    if (settings && settings.settings) {
      console.log("Settings loaded:", settings.settings);
      
      if (settings.settings.fsrsParams) {
        const { fsrsParams } = settings.settings
        setRequestRetention(fsrsParams.requestRetention)
        setMaximumInterval(fsrsParams.maximumInterval)
        setWeights(fsrsParams.w.join(", "))
        setEnableFuzz(fsrsParams.enableFuzz)
        setEnableShortTerm(fsrsParams.enableShortTerm)
      }
      
      if (settings.settings.learning) {
        const { learning } = settings.settings
        setNewCardsPerDay(learning.newCardsPerDay)
        setMaxReviewsPerDay(learning.maxReviewsPerDay)
      } else {
        // Reset to undefined if not set
        setNewCardsPerDay(undefined)
        setMaxReviewsPerDay(undefined)
      }
    }
  }, [settings])

  // Redirect to login page if not logged in
  useEffect(() => {
    if (isInitialized && !user) {
      router.push('/login')
    }
  }, [user, router, isInitialized])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveError(null)
    setSaveSuccess(false)
    
    try {
      setIsSaving(true)
      
      // Parse weights string to array of numbers
      const weightsArray = weights.split(",").map(w => parseFloat(w.trim()))
      
      // Validate weights
      if (weightsArray.some(isNaN)) {
        setSaveError("Invalid weights format. Please enter comma-separated numbers.")
        return
      }
      
      // Prepare learning settings only if values are defined
      const learningSettings: LearningSettings = {};
      if (newCardsPerDay !== undefined) {
        learningSettings.newCardsPerDay = newCardsPerDay;
      }
      if (maxReviewsPerDay !== undefined) {
        learningSettings.maxReviewsPerDay = maxReviewsPerDay;
      }
      
      interface UpdateSettingsData {
        theme?: string;
        fsrsParams: {
          requestRetention: number;
          maximumInterval: number;
          w: number[];
          enableFuzz: boolean;
          enableShortTerm: boolean;
        };
        learning?: {
          newCardsPerDay?: number;
          maxReviewsPerDay?: number;
        };
      }
      
      const updateData: UpdateSettingsData = {
        theme,
        fsrsParams: {
          requestRetention,
          maximumInterval,
          w: weightsArray,
          enableFuzz,
          enableShortTerm
        }
      };
      
      // Only include learning settings if at least one value is defined
      if (Object.keys(learningSettings).length > 0) {
        updateData.learning = learningSettings;
      }
      
      // Save theme to localStorage before API call to ensure immediate persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', theme);
      }
      
      await updateSettings(updateData);
      
      setSaveSuccess(true)
    } catch (err) {
      setSaveError("Failed to save settings")
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  // If not logged in or still initializing, show loading state
  if (!isInitialized || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <PageLayout>
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {saveError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{saveError}</AlertDescription>
        </Alert>
      )}
      
      {saveSuccess && (
        <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Settings saved successfully!</AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardContent className="px-6 pb-6">
          {isLoading ? (
            <p>Loading settings...</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Accordion type="single" collapsible className="w-full">
                {/* Appearance Section */}
                <AccordionItem value="appearance">
                  <AccordionTrigger className="text-xl font-semibold">
                    Appearance
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid gap-4 pt-4">
                      <div className="grid gap-2">
                        <Label htmlFor="theme">Theme</Label>
                        <Select
                          value={theme}
                          onValueChange={(value) => {
                            console.log("Theme selected:", value);
                            setTheme(value as "light" | "dark" | "system");
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue>
                              {theme === "light" && (
                                <div className="flex items-center gap-2">
                                  <Sun className="h-4 w-4" />
                                  <span>Light</span>
                                </div>
                              )}
                              {theme === "dark" && (
                                <div className="flex items-center gap-2">
                                  <Moon className="h-4 w-4" />
                                  <span>Dark</span>
                                </div>
                              )}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light" className="flex items-center">
                              <div className="flex items-center gap-2">
                                <Sun className="h-4 w-4" />
                                <span>Light</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="dark" className="flex items-center">
                              <div className="flex items-center gap-2">
                                <Moon className="h-4 w-4" />
                                <span>Dark</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-sm text-muted-foreground">
                          Choose between light and dark mode for the application.
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                {/* Daily Limits Section */}
                <AccordionItem value="daily-limits">
                  <AccordionTrigger className="text-xl font-semibold">
                    Daily Limits
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid gap-4 pt-4">
                      <div className="grid gap-2">
                        <Label htmlFor="newCardsPerDay">New Cards Per Day</Label>
                        <Input
                          id="newCardsPerDay"
                          type="number"
                          min="0"
                          value={newCardsPerDay === undefined ? "" : newCardsPerDay}
                          onChange={(e) => {
                            const value = e.target.value === "" ? undefined : parseInt(e.target.value);
                            setNewCardsPerDay(value);
                          }}
                        />
                        <p className="text-sm text-muted-foreground">
                          Maximum number of new cards to show per day.
                        </p>
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="maxReviewsPerDay">Maximum Reviews Per Day</Label>
                        <Input
                          id="maxReviewsPerDay"
                          type="number"
                          min="0"
                          value={maxReviewsPerDay === undefined ? "" : maxReviewsPerDay}
                          onChange={(e) => {
                            const value = e.target.value === "" ? undefined : parseInt(e.target.value);
                            setMaxReviewsPerDay(value);
                          }}
                        />
                        <p className="text-sm text-muted-foreground">
                          Maximum number of review cards to show per day.
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                {/* FSRS Parameters Section */}
                <AccordionItem value="fsrs-parameters">
                  <AccordionTrigger className="text-xl font-semibold">
                    FSRS Parameters
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid gap-4 pt-4">
                      <div className="grid gap-2">
                        <Label htmlFor="requestRetention">Request Retention</Label>
                        <Input
                          id="requestRetention"
                          type="number"
                          step="0.01"
                          min="0"
                          max="1"
                          value={requestRetention}
                          onChange={(e) => setRequestRetention(parseFloat(e.target.value))}
                          required
                        />
                        <p className="text-sm text-muted-foreground">
                          Target retention rate (0-1). Higher values create longer intervals.
                        </p>
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="maximumInterval">Maximum Interval (days)</Label>
                        <Input
                          id="maximumInterval"
                          type="number"
                          min="1"
                          value={maximumInterval}
                          onChange={(e) => setMaximumInterval(parseInt(e.target.value))}
                          required
                        />
                        <p className="text-sm text-muted-foreground">
                          Maximum interval between reviews in days.
                        </p>
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="weights">Weights</Label>
                        <Input
                          id="weights"
                          value={weights}
                          onChange={(e) => setWeights(e.target.value)}
                          required
                        />
                        <p className="text-sm text-muted-foreground">
                          FSRS algorithm weights as comma-separated values.
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="enableFuzz" 
                          checked={enableFuzz}
                          onCheckedChange={(checked: boolean | "indeterminate") => setEnableFuzz(checked === true)}
                        />
                        <Label htmlFor="enableFuzz" className="cursor-pointer">Enable Fuzz</Label>
                      </div>
                      <p className="text-sm text-muted-foreground ml-6 -mt-1">
                        When enabled, this adds a small random delay to the new interval time to prevent cards from sticking together and always being reviewed on the same day.
                      </p>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="enableShortTerm" 
                          checked={enableShortTerm}
                          onCheckedChange={(checked: boolean | "indeterminate") => setEnableShortTerm(checked === true)}
                        />
                        <Label htmlFor="enableShortTerm" className="cursor-pointer">Enable Short Term</Label>
                      </div>
                      <p className="text-sm text-muted-foreground ml-6 -mt-1">
                        When disabled, this allows user to skip the short-term schedule.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              <Button 
                type="submit" 
                className="flex items-center gap-2 mt-6"
                disabled={isSaving}
              >
                <Save className="h-4 w-4" />
                {isSaving ? "Saving..." : "Save Settings"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </PageLayout>
  )
} 