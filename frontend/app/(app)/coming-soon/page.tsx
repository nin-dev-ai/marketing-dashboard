import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ComingSoonPage() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-5 px-6 py-20 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 text-primary">
          <Sparkles className="h-7 w-7" />
        </span>
        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Coming soon
          </h1>
          <p className="max-w-md text-sm text-muted-foreground">
            This part of Emitly is still being built. The Dashboard is live —
            head back to keep exploring while we wire this up.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
