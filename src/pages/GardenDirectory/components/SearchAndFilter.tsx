// @ts-ignore
import type React from "react"
import { useState } from "react"
import { Input } from "../../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"

type SearchAndFilterProps = {
    onSearch: (term: string) => void
    onTypeFilter: (type: string) => void
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({ onSearch, onTypeFilter }) => {
    const [searchTerm, setSearchTerm] = useState("")

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
        onSearch(e.target.value)
    }

    const handleTypeFilter = (value: string) => {
        onTypeFilter(value === "all" ? "" : value)
    }

    return (
        // Add the "search-filter-container" class to benefit from the custom gap on mobile.
        <div className="search-filter-container flex flex-col md:flex-row gap-4 mb-8">
            <Input
                type="text"
                placeholder="Search gardens..."
                className="flex-grow"
                value={searchTerm}
                onChange={handleSearchChange}
                aria-label="Search gardens"
            />
            <Select onValueChange={handleTypeFilter} defaultValue="all">
                <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Rent">Rent</SelectItem>
                    <SelectItem value="Charity">Charity</SelectItem>
                    <SelectItem value="Community">Community</SelectItem>
                </SelectContent>
            </Select>
        </div>
    )
}

export default SearchAndFilter
