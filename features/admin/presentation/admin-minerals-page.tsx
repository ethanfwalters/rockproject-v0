"use client"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/features/shared/presentation/tabs"
import { MineralsDatabaseTab } from "@/features/admin/presentation/minerals-database-tab"
import { SubmittedMineralsTab } from "@/features/admin/presentation/submitted-minerals-tab"

export function AdminMineralsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Minerals</h1>
        <p className="text-muted-foreground mt-2">
          Manage the minerals database and review user submissions.
        </p>
      </div>

      <Tabs defaultValue="database">
        <TabsList>
          <TabsTrigger value="database">Minerals Database</TabsTrigger>
          <TabsTrigger value="submissions">Submitted Minerals</TabsTrigger>
        </TabsList>
        <TabsContent value="database">
          <MineralsDatabaseTab />
        </TabsContent>
        <TabsContent value="submissions">
          <SubmittedMineralsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
