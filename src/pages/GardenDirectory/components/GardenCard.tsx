type GardenCardProps = {
    garden: {
        name: string
        address: string
        type: string
    }
}

export default function GardenCard({ garden }: GardenCardProps) {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105">
            <div className="p-6">
                <h2 className="text-xl font-semibold mb-2">{garden.name}</h2>
                <p className="text-gray-600 mb-2">{garden.address}</p>
                <span className="inline-block bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm font-semibold">
          {garden.type}
        </span>
            </div>
        </div>
    )
}

