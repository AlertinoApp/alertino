"use client";

import { useState, useMemo } from "react";
import { AlertCard } from "./alert-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Bell,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Calendar,
  DollarSign,
  MapPin,
  Home,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Alert } from "@/types/alerts";

interface AlertsSectionProps {
  alerts: Alert[];
}

type SortField = "created_at" | "price" | "rooms" | "city" | "title";
type SortDirection = "asc" | "desc";
type FilterStatus = "all" | "active" | "not_interested";

const ITEMS_PER_PAGE = 12;

export function AlertsSection({ alerts }: AlertsSectionProps) {
  // State for filters and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [roomsFilter, setRoomsFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Get unique cities for filter dropdown
  const uniqueCities = useMemo(() => {
    const cities = [...new Set(alerts.map((alert) => alert.city))].sort();
    return cities;
  }, [alerts]);

  // Filter and sort alerts
  const filteredAndSortedAlerts = useMemo(() => {
    const filtered = alerts.filter((alert) => {
      // Search term filter
      if (
        searchTerm &&
        !alert.title.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      // City filter
      if (selectedCity !== "all" && alert.city !== selectedCity) {
        return false;
      }

      // Price range filter
      if (priceRange.min && alert.price < parseInt(priceRange.min)) {
        return false;
      }
      if (priceRange.max && alert.price > parseInt(priceRange.max)) {
        return false;
      }

      // Rooms filter
      if (roomsFilter !== "all" && alert.rooms !== parseInt(roomsFilter)) {
        return false;
      }

      // Status filter
      if (statusFilter === "active" && alert.status === "not_interested") {
        return false;
      }
      if (
        statusFilter === "not_interested" &&
        alert.status !== "not_interested"
      ) {
        return false;
      }

      return true;
    });

    // Sort alerts
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "created_at":
          comparison =
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case "price":
          comparison = a.price - b.price;
          break;
        case "rooms":
          comparison = a.rooms - b.rooms;
          break;
        case "city":
          comparison = a.city.localeCompare(b.city);
          break;
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [
    alerts,
    searchTerm,
    selectedCity,
    priceRange,
    roomsFilter,
    statusFilter,
    sortField,
    sortDirection,
  ]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedAlerts.length / ITEMS_PER_PAGE);
  const paginatedAlerts = filteredAndSortedAlerts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCity("all");
    setPriceRange({ min: "", max: "" });
    setRoomsFilter("all");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  // Quick stats
  const activeAlerts = filteredAndSortedAlerts.filter(
    (alert) => alert.status !== "not_interested"
  );
  const archivedAlerts = filteredAndSortedAlerts.filter(
    (alert) => alert.status === "not_interested"
  );
  const newToday = filteredAndSortedAlerts.filter(
    (alert) =>
      new Date(alert.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  );

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Apartment Alerts
            </h2>
            <p className="text-sm text-gray-600">
              Latest listings matching your filters
            </p>
          </div>

          {/* Quick Stats */}
          <div className="hidden md:flex items-center gap-2">
            <Badge
              variant="secondary"
              className="bg-blue-50 text-blue-700 border-blue-200"
            >
              {activeAlerts.length} Active
            </Badge>
            <Badge
              variant="secondary"
              className="bg-green-50 text-green-700 border-green-200"
            >
              {newToday.length} New Today
            </Badge>
            {archivedAlerts.length > 0 && (
              <Badge
                variant="secondary"
                className="bg-gray-100 text-gray-600 border-gray-200"
              >
                {archivedAlerts.length} Archived
              </Badge>
            )}
          </div>
        </div>

        {/* Mobile Stats */}
        <div className="md:hidden grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 bg-blue-50 rounded border border-blue-200">
            <div className="font-semibold text-blue-700">
              {activeAlerts.length}
            </div>
            <div className="text-xs text-blue-600">Active</div>
          </div>
          <div className="text-center p-2 bg-green-50 rounded border border-green-200">
            <div className="font-semibold text-green-700">
              {newToday.length}
            </div>
            <div className="text-xs text-green-600">New Today</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded border border-gray-200">
            <div className="font-semibold text-gray-700">
              {archivedAlerts.length}
            </div>
            <div className="text-xs text-gray-600">Archived</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6 bg-gray-50 border-gray-200">
        <CardContent className="p-4">
          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search apartments..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  handleFilterChange();
                }}
                className="pl-10 bg-white"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="whitespace-nowrap"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>

              {(searchTerm ||
                selectedCity !== "all" ||
                priceRange.min ||
                priceRange.max ||
                roomsFilter !== "all" ||
                statusFilter !== "all") && (
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              {/* Status Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Status
                </label>
                <Select
                  value={statusFilter}
                  onValueChange={(value: FilterStatus) => {
                    setStatusFilter(value);
                    handleFilterChange();
                  }}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Alerts</SelectItem>
                    <SelectItem value="active">Active Only</SelectItem>
                    <SelectItem value="not_interested">
                      Archived Only
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* City Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  City
                </label>
                <Select
                  value={selectedCity}
                  onValueChange={(value) => {
                    setSelectedCity(value);
                    handleFilterChange();
                  }}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cities</SelectItem>
                    {uniqueCities.map((city) => (
                      <SelectItem
                        key={city}
                        value={city}
                        className="capitalize"
                      >
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Rooms Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  <Home className="w-4 h-4 inline mr-1" />
                  Rooms
                </label>
                <Select
                  value={roomsFilter}
                  onValueChange={(value) => {
                    setRoomsFilter(value);
                    handleFilterChange();
                  }}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any</SelectItem>
                    <SelectItem value="1">1 Room</SelectItem>
                    <SelectItem value="2">2 Rooms</SelectItem>
                    <SelectItem value="3">3 Rooms</SelectItem>
                    <SelectItem value="4">4 Rooms</SelectItem>
                    <SelectItem value="5">5+ Rooms</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Sort By
                </label>
                <div className="flex gap-1">
                  <Select
                    value={sortField}
                    onValueChange={(value: SortField) => setSortField(value)}
                  >
                    <SelectTrigger className="bg-white flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="created_at">
                        <Calendar className="w-4 h-4 inline mr-2" />
                        Date
                      </SelectItem>
                      <SelectItem value="price">
                        <DollarSign className="w-4 h-4 inline mr-2" />
                        Price
                      </SelectItem>
                      <SelectItem value="rooms">
                        <Home className="w-4 h-4 inline mr-2" />
                        Rooms
                      </SelectItem>
                      <SelectItem value="city">
                        <MapPin className="w-4 h-4 inline mr-2" />
                        City
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
                    }
                    className="px-2 bg-white"
                  >
                    {sortDirection === "asc" ? (
                      <SortAsc className="w-4 h-4" />
                    ) : (
                      <SortDesc className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Price Range */}
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Price Range (PLN)
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => {
                      setPriceRange((prev) => ({
                        ...prev,
                        min: e.target.value,
                      }));
                      handleFilterChange();
                    }}
                    className="bg-white"
                  />
                  <span className="self-center text-gray-400">-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => {
                      setPriceRange((prev) => ({
                        ...prev,
                        max: e.target.value,
                      }));
                      handleFilterChange();
                    }}
                    className="bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200 text-sm text-gray-600">
            <span>
              Showing {paginatedAlerts.length} of{" "}
              {filteredAndSortedAlerts.length} alerts
            </span>
            {filteredAndSortedAlerts.length !== alerts.length && (
              <span className="text-blue-600">
                (filtered from {alerts.length} total)
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alerts Grid */}
      {paginatedAlerts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {paginatedAlerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 pt-6">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>

                {/* Page Numbers */}
                <div className="hidden md:flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={
                          currentPage === pageNum ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Bell className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filteredAndSortedAlerts.length === 0 && alerts.length > 0
              ? "No alerts match your filters"
              : "No alerts yet"}
          </h3>
          <p className="text-gray-600 mb-4">
            {filteredAndSortedAlerts.length === 0 && alerts.length > 0
              ? "Try adjusting your search criteria or clearing filters"
              : "Run your alerts to find new apartment listings"}
          </p>
          {filteredAndSortedAlerts.length === 0 && alerts.length > 0 && (
            <Button onClick={clearFilters} variant="outline">
              Clear All Filters
            </Button>
          )}
        </div>
      )}
    </section>
  );
}
