import {useEffect, useState} from "react";
import type {Specimen} from "@/types/specimen";
import {useRouter} from "next/navigation";
import {
    useMutation,
    useQuery,
    useQueryClient
} from "@tanstack/react-query";
import {createClient} from "@/lib/supabase/client";

export async function fetchSpecimens(): Promise<Specimen[]> {
    const response = await fetch("/api/specimens")
    if (response.status === 401) {
        throw new Error("Unauthorized")
    }
    const data = await response.json()
    return data.specimens
}

export async function addSpecimen(specimen: Omit<Specimen, "id" | "dateAdded">): Promise<Specimen> {
    const response = await fetch("/api/specimens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(specimen),
    })
    const data = await response.json()
    return data.specimen
}

export async function updateSpecimen(specimen: Specimen): Promise<Specimen> {
    const response = await fetch("/api/specimens", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(specimen),
    })
    const data = await response.json()
    return data.specimen
}

export async function deleteSpecimen(id: string): Promise<void> {
    await fetch(`/api/specimens?id=${id}`, {
        method: "DELETE",
    })
}