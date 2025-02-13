// @ts-ignore
import type React from "react"
import { useState, useEffect } from "react"
import Navbar from "../../components/Navbar"
import SearchAndFilter from "./components/SearchAndFilter"
import GardenCard from "./components/GardenCard"
import InfiniteScroll from "./components/InfiniteScroll"
import Footer from "../../components/Footer"
import { Spinner } from "../../components/ui/spinner"
import "./styles/GardenDirectory.css"

type Garden = {
    id: number
    name: string
    address: string
    type: string
}

type User = {
    id: number
    name: string
    email: string
}

const GardenDirectoryPage: React.FC<{ user: User | null }> = ({ user }) => {
    const [gardens, setGardens] = useState<Garden[]>([])
    const [filteredGardens, setFilteredGardens] = useState<Garden[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedType, setSelectedType] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)

    const fetchGardens = async (pageNum: number, limit = 10) => {
        try {
            setIsLoading(true)
            // @ts-ignore
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/gardens?page=${pageNum}&limit=${limit}`)
            if (!response.ok) throw new Error("Failed to fetch gardens")
            const data = await response.json()
            return data.gardens
        } catch (err) {
            setError("Failed to fetch gardens. Please try again later.")
            return []
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchGardens(page).then((newGardens) => {
            setGardens((prevGardens) => [...prevGardens, ...newGardens])
            setHasMore(newGardens.length === 10)
        })
    }, [page])

    useEffect(() => {
        const filtered = gardens.filter(
            (garden) =>
                garden.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                (selectedType === "" || garden.type === selectedType),
        )
        setFilteredGardens(filtered)
    }, [gardens, searchTerm, selectedType])

    const handleSearch = (term: string) => {
        setSearchTerm(term)
    }

    const handleTypeFilter = (type: string) => {
        setSelectedType(type)
    }

    const loadMore = () => {
        setPage((prevPage) => prevPage + 1)
    }

    return (
        <div className="garden-directory-container flex flex-col">
            <Navbar isLoggedIn={!!user} user={user} setUser={undefined} onLogout={undefined} />
            <main className="flex-grow container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8 text-center">Garden Directory</h1>
                <SearchAndFilter onSearch={handleSearch} onTypeFilter={handleTypeFilter} />
                {error && (
                    <div className="error-message" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <InfiniteScroll loadMore={loadMore} hasMore={hasMore}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                        {filteredGardens.map((garden) => (
                            <GardenCard key={garden.id} garden={garden} />
                        ))}
                    </div>
                </InfiniteScroll>
                {isLoading && (
                    <div className="flex justify-center items-center mt-8">
                        <Spinner className="w-8 h-8 text-primary" />
                    </div>
                )}
            </main>
            <Footer />
        </div>
    )
}

export default GardenDirectoryPage

