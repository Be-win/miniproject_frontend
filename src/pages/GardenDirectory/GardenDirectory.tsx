"use client"

// @ts-ignore
import React, { useState, useEffect } from "react"
import Navbar from "../../components/Navbar"
import SearchAndFilter from "./components/SearchAndFilter"
import GardenCard from "./components/GardenCard"
import InfiniteScroll from "./components/InfiniteScroll"

type Garden = {
    id: number
    name: string
    address: string
    type: string
}

export default function GardenDirectoryPage({user}) {
    const [gardens, setGardens] = useState<Garden[]>([])
    const [filteredGardens, setFilteredGardens] = useState<Garden[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedType, setSelectedType] = useState("")

    // @ts-ignore
    const fetchGardens = async (page = 1, limit = 10) => {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/gardens?page=${page}&limit=${limit}`);
        if (!response.ok) throw new Error("Failed to fetch gardens");
        return response.json();
    };

    useEffect(() => {
        // Simulating API call to fetch initial gardens
        fetchGardens()
    }, [])

    useEffect(() => {
        filterGardens()
    }, [gardens]) //Corrected dependency array


    const filterGardens = () => {
        const filtered = gardens.filter(
            (garden) =>
                garden.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                (selectedType === "" || garden.type === selectedType),
        )
        setFilteredGardens(filtered)
    }

    const handleSearch = (term: string) => {
        setSearchTerm(term)
    }

    const handleTypeFilter = (type: string) => {
        setSelectedType(type)
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar isLoggedIn={!!user} user={user} />
            <main className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Garden Directory</h1>
                <SearchAndFilter onSearch={handleSearch} onTypeFilter={handleTypeFilter} />
                <InfiniteScroll loadMore={fetchGardens} hasMore={true}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                        {filteredGardens.map((garden) => (
                            <GardenCard key={garden.id} garden={garden} />
                        ))}
                    </div>
                </InfiniteScroll>
            </main>
        </div>
    )
}

