// @ts-ignore
import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { MapPin } from "lucide-react"

type GardenCardProps = {
    garden: {
        name: string
        address: string
        type: string
    }
}

const GardenCard: React.FC<GardenCardProps> = ({ garden }) => {
    return (
        // Add both "garden-card" for focus styling and "garden-card-hover" for the hover effect.
        <Card className="garden-card garden-card-hover">
            <CardHeader>
                <CardTitle>{garden.name}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-start mb-2">
                    <MapPin className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
                    <p className="text-sm text-gray-600">{garden.address}</p>
                </div>
                {/* Add the custom badge class */}
                <Badge className="garden-type-badge" variant="secondary">
                    {garden.type}
                </Badge>
            </CardContent>
        </Card>
    )
}

export default GardenCard
