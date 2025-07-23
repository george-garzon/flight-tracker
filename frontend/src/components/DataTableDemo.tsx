"use client";

import React, { useEffect, useState } from "react";
import { useQueryState, parseAsArrayOf, parseAsString } from "nuqs";
import { useDataTable } from "@/hooks/use-data-table";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
    Plane,
    Clock,
    MoreHorizontal,
    Text,
    XCircle,
    CheckCircle,
    CheckCircle2,
} from "lucide-react";

import type { Column, ColumnDef } from "@tanstack/react-table";


interface Flight {
    id: string;
    flight_number: string;
    airline: string;
    status: string;
    departure_airport: string;
    arrival_airport: string;
    departure_time: string;
    arrival_time: string;
}

export default function DataTableDemo() {
    const [flights, setFlights] = useState<Flight[]>([]);

    const [title] = useQueryState("title", parseAsString.withDefault(""));
    const [status] = useQueryState("status", parseAsArrayOf(parseAsString).withDefault([]));
    const [sort] = useQueryState("sort", parseAsString.withDefault("[]"));
    const [page] = useQueryState("page", parseAsString.withDefault("1"));

    const pageSize = 10;


    // Fetch flight data from API
    useEffect(() => {
        const fetchFlights = async () => {
            try {
                const res = await fetch("http://127.0.0.1:5000/api/flights");
                const json = await res.json();
                const mapped: Flight[] = json.data.map((f: any, i: number) => ({
                    id: `${f.flight.iata}-${i}`,
                    flight_number: f.flight.iata,
                    airline: f.airline?.name || "N/A",
                    status: f.flight_status,
                    departure_airport: f.departure.airport,
                    arrival_airport: f.arrival.airport,
                    departure_time: f.departure.scheduled,
                    arrival_time: f.arrival.scheduled,
                }));
                setFlights(mapped);
            } catch (err) {
                console.error("Failed to fetch flights", err);
            }
        };

        fetchFlights();
    }, []);

    // Filter + sort + paginate
    const filteredData = React.useMemo(() => {
        let result = flights.filter((flight) => {
            const matchesTitle =
                title === "" || flight.flight_number.toLowerCase().includes(title.toLowerCase());
            const matchesStatus = status.length === 0 || status.includes(flight.status);
            return matchesTitle && matchesStatus;
        });

        // Sort based on URL query param
        try {
            const sortArr = JSON.parse(sort); // expects: [{ id: "arrival_airport", desc: true }]
            if (Array.isArray(sortArr) && sortArr.length > 0) {
                const { id, desc } = sortArr[0];
                result = [...result].sort((a, b) => {
                    const valA = a[id as keyof Flight];
                    const valB = b[id as keyof Flight];

                    // Handle strings and numbers
                    if (valA == null || valB == null) return 0;
                    if (valA < valB) return desc ? 1 : -1;
                    if (valA > valB) return desc ? -1 : 1;
                    return 0;
                });
            }
        } catch (e) {
            console.warn("Invalid sort param", e);
        }

        // Pagination
        const pageNum = parseInt(page, 10) || 1;
        const startIndex = (pageNum - 1) * pageSize;
        result = result.slice(startIndex, startIndex + pageSize);

        return result;
    }, [flights, title, status, sort, page]);

    // @ts-ignore
    // @ts-ignore
    // @ts-ignore
    // @ts-ignore
    const columns = React.useMemo<ColumnDef<Flight>[]>(() => [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            size: 32,
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "airline",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Airline" />
            ),
            cell: ({ cell }) => <div>{cell.getValue()}</div>,
        },
        {
            accessorKey: "departure_airport",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="From" />
            ),
            cell: ({ cell }) => <div>{cell.getValue()}</div>,
        },
        {
            accessorKey: "arrival_airport",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="To" />
            ),
            cell: ({ cell }) => <div>{cell.getValue()}</div>,
        },
        {
            accessorKey: "departure_time",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Departs" />
            ),
            cell: ({ cell }) => {
                const raw = cell.getValue<string>();
                return (
                    <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {new Date(raw).toLocaleString()}
                    </div>
                );
            },
        },
        {
            accessorKey: "arrival_time",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Arrives" />
            ),
            cell: ({ cell }) => {
                const raw = cell.getValue<string>();
                return (
                    <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {new Date(raw).toLocaleString()}
                    </div>
                );
            },
        },
        {
            id: "actions",
            cell: () => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>Details</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Remove</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
            size: 32,
        },
    ], []);

    const [sortParam, setSortParam] = useQueryState(
        "sort",
        parseAsString.withDefault("[]")
    );
    const { table } = useDataTable({
        data: filteredData,
        columns,
        pageCount: Math.ceil(flights.length / pageSize),
        initialState: {
            sorting: JSON.parse(sortParam),
            columnPinning: { right: ["actions"] },
        },
        onSortingChange: (updater) => {
            const newSort = typeof updater === "function" ? updater(JSON.parse(sortParam)) : updater;
            setSortParam(JSON.stringify(newSort));
        },
        getRowId: (row) => row.id,
    });




    return (
        <div className="data-table-container">
            <DataTable table={table}>
                <DataTableToolbar table={table} />
            </DataTable>
        </div>
    );
}
