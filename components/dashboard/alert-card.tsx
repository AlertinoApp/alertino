import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, MapPin, DollarSign, Home } from "lucide-react";
import { Alert } from "@/types/alerts";

interface AlertCardProps {
  alert: Alert;
}

export function AlertCard({ alert }: AlertCardProps) {
  const isNew =
    new Date(alert.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000);

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 line-clamp-2 mb-2">
              {alert.title}
            </h3>
            {isNew && (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                NEW
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center text-gray-700">
            <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
            <span className="font-semibold">
              {alert.price.toLocaleString()} PLN
            </span>
          </div>

          <div className="flex items-center text-gray-700">
            <Home className="w-4 h-4 mr-2 text-gray-400" />
            <span>
              {alert.rooms} room{alert.rooms !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="flex items-center text-gray-700">
            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
            <span className="capitalize">{alert.city}</span>
          </div>
        </div>

        <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
          <a
            href={alert.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center"
          >
            View Listing
            <ExternalLink className="w-4 h-4 ml-2" />
          </a>
        </Button>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Found {new Date(alert.created_at).toLocaleDateString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
