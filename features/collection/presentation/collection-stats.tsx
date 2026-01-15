"use client"

import type {Specimen} from "@/types/specimen"
import {Card} from "@/features/shared/presentation/card"
import {
    TrendingUp,
    Calendar,
    MapPin,
    Sparkles
} from "lucide-react"
import {useEffect, useMemo} from "react"
import {CollectionMap} from "./collection-map"
import z from "zod"

interface CollectionStatsProps {
    specimens: Specimen[]
}

const CollectionStatsSchema = z.object({
    total: z.number(),
    mineralCount: z.array(z.object({
        name: z.string(),
        count: z.number()
    })),
    totalMinerals: z.number(),
    mostCommon: z.object({name: z.string(), count: z.number()}).nullable(),
    uniqueLocations: z.number(),
    recentAdditions: z.array(z.any()), //todo: this needs to be the Specimen type but I don't want to handle that rn
})
type CollectionStats = z.infer<typeof CollectionStatsSchema>


export function CollectionStats({specimens}: CollectionStatsProps) {
    const stats_v2: CollectionStats = useMemo(() => {
        if (specimens.length === 0) {
            return {
                total: specimens.length,
                mineralCount: [],
                totalMinerals: 0,
                mostCommon: null,
                uniqueLocations: 0,
                recentAdditions: []
            }
        }
        const mineralKv: { [key: string]: number } = {}
        let totalMineralCount = 0
        specimens.forEach((specimen) => {
            specimen.minerals?.map((mineral) => {
                totalMineralCount = totalMineralCount +1
                if (mineralKv[mineral.name])
                    mineralKv[mineral.name] = mineralKv[mineral.name] + 1
                else
                    mineralKv[mineral.name] = 1
            })
        })
        const minCountSorted = Object.keys(mineralKv).map((key) => {
            return {
                name: key,
                count: mineralKv[key]
            }
        }).sort((a, b) => b.count - a.count)
        const uniqueLocations = new Set(specimens.map((specimen) => specimen.localityId)).size

        const sortedByDate = [...specimens].sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

        const recentAdditions = sortedByDate.slice(0, 5)

        return {
            total: specimens.length,
            mineralCount: minCountSorted,
            totalMinerals: totalMineralCount,
            mostCommon: minCountSorted[0],
            uniqueLocations: uniqueLocations,
            recentAdditions: recentAdditions
        }
    }, [specimens])

    const formatRelativeTime = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffInMs = now.getTime() - date.getTime()
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

        if (diffInDays === 0) return "Today"
        if (diffInDays === 1) return "Yesterday"
        if (diffInDays < 7) return `${diffInDays} days ago`
        if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) > 1 ? "s" : ""} ago`
        return date.toLocaleDateString()
    }

    return (
        <div className="space-y-4 lg:sticky lg:top-20">
            <h2 className="text-2xl font-bold">Collection
                Stats</h2>

            {/* Total Collection Card */}
            <Card
                className="border-0 bg-gradient-to-br from-primary/10 to-primary/5 p-6">
                <div className="flex items-center gap-3">
                    <div
                        className="rounded-full bg-primary/10 p-3">
                        <Sparkles
                            className="h-6 w-6 text-primary"/>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Total
                            Collection</p>
                        <p className="text-3xl font-bold">{stats_v2.total}</p>
                    </div>
                </div>
            </Card>

            <div className="relative z-0">
                <CollectionMap specimens={specimens}/>
            </div>

            {/* Type Breakdown v2 */}
            <Card className="border-0 bg-card p-6">
                <h3 className="mb-4 font-semibold">By Mineral Type</h3>
                <div className="space-y-3">
                    {stats_v2.mineralCount.map((val, index) => {
                        return (<div key={`${val.name}-${index}`}
                                className="flex items-center justify-between">
                        <span
                            className="text-sm text-muted-foreground">{val.name}</span>
                                <div
                                    className="flex items-center gap-2">
                                    <div
                                        className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="h-full bg-primary transition-all"
                                            style={{width: `${stats_v2.totalMinerals > 0 ? (val.count / stats_v2.totalMinerals) * 100 : 0}%`}}
                                        />
                                    </div>
                                    <span
                                        className="w-8 text-right text-sm font-medium">{val.count}</span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </Card>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                <Card className="border-0 bg-card p-4">
                    <div
                        className="flex items-center gap-2 text-muted-foreground mb-2">
                        <TrendingUp className="h-4 w-4"/>
                        <p className="text-xs">Most
                            Common</p>
                    </div>
                    {stats_v2.mostCommon ? (
                        <p className="text-lg font-bold">{stats_v2.mostCommon.name}</p>
                    ) : (
                        <p className="text-lg font-bold">Add a specimen!</p>
                        )}
                </Card>

                <Card className="border-0 bg-card p-4">
                    <div
                        className="flex items-center gap-2 text-muted-foreground mb-2">
                        <MapPin className="h-4 w-4"/>
                        <p className="text-xs">Locations</p>
                    </div>
                    <p className="text-lg font-bold">{stats_v2.uniqueLocations}</p>
                </Card>
            </div>

            <Card className="border-0 bg-card p-6">
                <div
                    className="flex items-center gap-2 mb-4">
                    <Calendar
                        className="h-5 w-5 text-primary"/>
                    <h3 className="font-semibold">Recent
                        Activity</h3>
                </div>
                <div className="space-y-3">
                    {stats_v2.recentAdditions.length > 0 ? (
                        stats_v2.recentAdditions.map((specimen) => (
                            <div key={specimen.id}
                                 className="flex items-center justify-between py-1">
                                <div
                                    className="flex items-center gap-2 min-w-0">
                                    <span
                                        className="text-sm font-medium truncate">{specimen.minerals[0].name}</span>
                                </div>
                                <span
                                    className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                  {formatRelativeTime(specimen.createdAt)}
                </span>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground">No
                            specimens yet</p>
                    )}
                </div>
            </Card>
        </div>
    )
}
