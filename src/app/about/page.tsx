"use client"

import { PageLayout } from "@/components/page-layout"
import { Card, CardContent } from "@/components/ui/card"

export default function AboutPage() {
  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent>
            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-semibold mb-4">What is EchoCards?</h2>
                <p className="text-muted-foreground leading-relaxed">
                  EchoCards is a modern flashcard application designed to help you learn and retain information more effectively. 
                  Using spaced repetition and active recall principles, it optimizes your study sessions to maximize long-term retention.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">How It Works</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  EchoCards uses the Free Spaced Repetition Scheduler (FSRS) algorithm, which adapts to your learning patterns. 
                  When you review a card, you rate how well you remembered it, and the system adjusts the next review time accordingly:
                </p>
                <ul className="space-y-1 list-disc pl-6 text-muted-foreground">
                  <li>"Again" - You didn't remember. The card will be shown again soon.</li>
                  <li>"Hard" - You remembered with difficulty. The interval will increase slightly.</li>
                  <li>"Good" - You remembered well. The interval will increase normally.</li>
                  <li>"Easy" - You remembered easily. The interval will increase significantly.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">How it Was Made</h2>
                <p className="text-muted-foreground leading-relaxed">
                  EchoCards was developed in March 2025 using Cursor AI with Claude 3.7 Sonnet thinking. The project's goal was to 
                  recreate the popular Anki spaced repetition application but with a robust RESTful API architecture, making it easy to 
                  integrate with automation services like n8n. This approach enables users to build custom workflows and integrations,
                  extending the application's functionality beyond what traditional flashcard apps offer.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">Technology Stack</h2>
                <div className="space-y-4 text-muted-foreground">
                  <div>
                    <h3 className="text-foreground font-medium mb-2">
                      Frontend Application{" "}
                      <a 
                        href="https://github.com/drewsamsen/sr-cards-app" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm font-normal"
                      >
                        (GitHub)
                      </a>
                    </h3>
                    <ul className="space-y-1 list-disc pl-6">
                      <li>Next.js 14 with React Server Components</li>
                      <li>TypeScript for type safety</li>
                      <li>Tailwind CSS with shadcn/ui components</li>
                      <li>Dark mode support with theme customization</li>
                      <li>Mobile-first responsive design</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-foreground font-medium mb-2">
                      Backend API{" "}
                      <a 
                        href="https://github.com/drewsamsen/sr-cards-api" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm font-normal"
                      >
                        (GitHub)
                      </a>
                    </h3>
                    <ul className="space-y-1 list-disc pl-6">
                      <li>Node.js with TypeScript</li>
                      <li>Supabase for database and authentication</li>
                      <li>PostgreSQL with advanced querying</li>
                      <li>FSRS algorithm implementation</li>
                      <li>RESTful API design</li>
                    </ul>
                  </div>
                  <p className="text-sm italic">
                    EchoCards is open source and available on GitHub.
                  </p>
                </div>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
} 