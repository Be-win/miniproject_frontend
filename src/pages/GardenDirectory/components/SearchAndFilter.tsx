"use client"

import { useState } from "react"

type SearchAndFilterProps = {
    onSearch: (term: string) => void
    onTypeFilter: (type: string) => void
}

export default function SearchAndFilter({ onSearch, onTypeFilter }: SearchAndFilterProps) {
    const [searchTerm, setSearchTerm] = useState("")

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
        onSearch(e.target.value)
    }

    return (
        <div className="flex flex-col md:flex-row gap-4 mb-8">
            <input
                type="text"
                placeholder="Search gardens..."
                className="flex-grow p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={handleSearchChange}
            />
            <select
                onChange={(e) => onTypeFilter(e.target.value)}
                className="p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="">All Types</option>
                <option value="Rent">Rent</option>
                <option value="Charity">Charity</option>
                <option value="Community">Community</option>
            </select>
        </div>
    )
}

