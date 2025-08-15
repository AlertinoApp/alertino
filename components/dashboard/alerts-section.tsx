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

type SortField = "created_at" | "price" | "rooms" | "city" | "title" | "filter";
type SortDirection = "asc" | "desc";
type FilterStatus =
  | "all"
  | "active"
  | "not_interested"
  | "favorites"
  | "expired";

const ITEMS_PER_PAGE = 6;

export function AlertsSection({ alerts }: AlertsSectionProps) {
  // State for filters and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [roomsFilter, setRoomsFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Get unique cities and filters for filter dropdown
  const uniqueCities = useMemo(() => {
    const cities = [...new Set(alerts.map((alert) => alert.city))].sort();
    return cities;
  }, [alerts]);

  const uniqueFilters = useMemo(() => {
    const filters = alerts
      .map((alert) => alert.filters)
      .filter((filter): filter is NonNullable<typeof filter> => filter !== null)
      .filter(
        (filter, index, self) =>
          self.findIndex((f) => f.id === filter.id) === index
      )
      .sort((a, b) => a.name.localeCompare(b.name));
    return filters;
  }, [alerts]);

  // Compute stats for badges
  const activeAlerts = useMemo(
    () => alerts.filter((alert) => alert.status !== "expired"),
    [alerts]
  );

  const newToday = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return alerts.filter((alert) => {
      const alertDate = new Date(alert.created_at);
      alertDate.setHours(0, 0, 0, 0);
      return alertDate.getTime() === today.getTime();
    });
  }, [alerts]);

  const archivedAlerts = useMemo(
    () => alerts.filter((alert) => alert.status === "expired"),
    [alerts]
  );

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

      // Filter filter
      if (selectedFilter !== "all" && alert.filter_id !== selectedFilter) {
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
      if (
        statusFilter === "active" &&
        (alert.status === "not_interested" || alert.status === "expired")
      ) {
        return false;
      }
      if (
        statusFilter === "not_interested" &&
        alert.status !== "not_interested"
      ) {
        return false;
      }
      if (statusFilter === "favorites" && !alert.is_favorite) {
        return false;
      }
      if (statusFilter === "expired" && alert.status !== "expired") {
        return false;
      }

      return true;
    });

    // Sort alerts
    filtered.sort((a, b) => {
      // Priority sorting: favorites first, expired last
      const aFavorite = a.is_favorite || false;
      const bFavorite = b.is_favorite || false;
      const aExpired = a.status === "expired";
      const bExpired = b.status === "expired";

      // Favorites always come first
      if (aFavorite && !bFavorite) return -1; // a is favorite, b is not - put a before b
      if (!aFavorite && bFavorite) return 1; // a is not favorite, b is - put a after b

      // If both are favorites or both are not favorites, check status priority
      if (aFavorite === bFavorite) {
        // Status priority: active > not_interested > expired
        const getStatusPriority = (
          status: string | undefined,
          isExpired: boolean
        ) => {
          if (isExpired) return 3; // expired = lowest priority
          if (status === "not_interested") return 2; // not_interested = medium priority
          return 1; // active = highest priority
        };

        const aPriority = getStatusPriority(a.status, aExpired);
        const bPriority = getStatusPriority(b.status, bExpired);

        if (aPriority !== bPriority) {
          return aPriority - bPriority; // Lower number = higher priority
        }
      }

      // If both have same favorite and status priority, apply normal sorting
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
        case "filter":
          const aFilterName = a.filters?.name || "Unknown";
          const bFilterName = b.filters?.name || "Unknown";
          comparison = aFilterName.localeCompare(bFilterName);
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [
    alerts,
    searchTerm,
    selectedCity,
    selectedFilter,
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
    setSelectedFilter("all");
    setPriceRange({ min: "", max: "" });
    setRoomsFilter("all");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  return (
    <section className="bg-card rounded-xl shadow-sm border border-border p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
            <Bell className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Apartment Alerts
            </h2>
            <p className="text-sm text-muted-foreground">
              Latest listings matching your filters
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-2 mb-4">
          <Badge
            variant="secondary"
            className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-600"
          >
            {activeAlerts.length} Active
          </Badge>
          <Badge
            variant="secondary"
            className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-600"
          >
            {newToday.length} New Today
          </Badge>
          {archivedAlerts.length > 0 && (
            <Badge
              variant="secondary"
              className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600"
            >
              {archivedAlerts.length} Archived
            </Badge>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        {/* Main Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
            <Input
              placeholder="Search apartments by title..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                handleFilterChange();
              }}
              className="pl-10 h-10 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant={showAdvancedFilters ? "default" : "outline"}
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="h-10 px-4 whitespace-nowrap"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>

            {(searchTerm ||
              selectedCity !== "all" ||
              selectedFilter !== "all" ||
              priceRange.min ||
              priceRange.max ||
              roomsFilter !== "all" ||
              statusFilter !== "all") && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="h-10 px-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <Card className="py-0! border-gray-200 dark:border-gray-600 shadow-sm">
            <CardContent className="p-4">
              <div className="space-y-4">
                {/* Filter Controls - All in same grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                  {/* Status Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      <Bell className="w-3 h-3" />
                      Status
                    </label>
                    <Select
                      value={statusFilter}
                      onValueChange={(value: FilterStatus) => {
                        setStatusFilter(value);
                        handleFilterChange();
                      }}
                    >
                      <SelectTrigger className="w-full h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Alerts</SelectItem>
                        <SelectItem value="active">
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            Active Only
                          </div>
                        </SelectItem>
                        <SelectItem value="not_interested">
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                            Archived Only
                          </div>
                        </SelectItem>
                        <SelectItem value="favorites">
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                            Favorites Only
                          </div>
                        </SelectItem>
                        <SelectItem value="expired">
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                            Expired Only
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* City Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      City
                    </label>
                    <Select
                      value={selectedCity}
                      onValueChange={(value) => {
                        setSelectedCity(value);
                        handleFilterChange();
                      }}
                    >
                      <SelectTrigger className="w-full h-9">
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

                  {/* Filter Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      <Filter className="w-3 h-3" />
                      Filter
                    </label>
                    <Select
                      value={selectedFilter}
                      onValueChange={(value) => {
                        setSelectedFilter(value);
                        handleFilterChange();
                      }}
                    >
                      <SelectTrigger className="w-full h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Filters</SelectItem>
                        {uniqueFilters.map((filter) => (
                          <SelectItem key={filter.id} value={filter.id}>
                            {filter.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Rooms Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      <Home className="w-3 h-3" />
                      Rooms
                    </label>
                    <Select
                      value={roomsFilter}
                      onValueChange={(value) => {
                        setRoomsFilter(value);
                        handleFilterChange();
                      }}
                    >
                      <SelectTrigger className="w-full h-9">
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

                  {/* Min Price */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      Min Price (PLN)
                    </label>
                    <Input
                      min={0}
                      type="number"
                      placeholder="Min price"
                      value={priceRange.min}
                      onChange={(e) => {
                        setPriceRange((prev) => ({
                          ...prev,
                          min: e.target.value,
                        }));
                        handleFilterChange();
                      }}
                      className="h-9"
                    />
                  </div>

                  {/* Max Price */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      Max Price (PLN)
                    </label>
                    <Input
                      type="number"
                      placeholder="Max price"
                      value={priceRange.max}
                      onChange={(e) => {
                        setPriceRange((prev) => ({
                          ...prev,
                          max: e.target.value,
                        }));
                        handleFilterChange();
                      }}
                      className="h-9"
                    />
                  </div>

                  {/* Sort */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      <SortAsc className="w-3 h-3" />
                      Sort By
                    </label>
                    <div className="flex gap-1">
                      <Select
                        value={sortField}
                        onValueChange={(value: SortField) =>
                          setSortField(value)
                        }
                      >
                        <SelectTrigger className="h-9 flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="created_at">
                            <div className="flex items-center">
                              <Calendar className="w-3 h-3 mr-2" />
                              Date
                            </div>
                          </SelectItem>
                          <SelectItem value="price">
                            <div className="flex items-center">
                              <DollarSign className="w-3 h-3 mr-2" />
                              Price
                            </div>
                          </SelectItem>
                          <SelectItem value="rooms">
                            <div className="flex items-center">
                              <Home className="w-3 h-3 mr-2" />
                              Rooms
                            </div>
                          </SelectItem>
                          <SelectItem value="city">
                            <div className="flex items-center">
                              <MapPin className="w-3 h-3 mr-2" />
                              City
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setSortDirection(
                            sortDirection === "asc" ? "desc" : "asc"
                          )
                        }
                        className="h-9 w-9 p-0"
                        title={`Sort ${sortDirection === "asc" ? "Descending" : "Ascending"}`}
                      >
                        {sortDirection === "asc" ? (
                          <SortAsc className="w-3 h-3" />
                        ) : (
                          <SortDesc className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-4 text-sm">
          <div className="text-gray-600 dark:text-gray-400">
            Showing{" "}
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {paginatedAlerts.length}
            </span>{" "}
            of{" "}
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {filteredAndSortedAlerts.length}
            </span>{" "}
            alerts
            {filteredAndSortedAlerts.length !== alerts.length && (
              <span className="text-blue-600 dark:text-blue-400 ml-1">
                (filtered from {alerts.length} total)
              </span>
            )}
          </div>

          {/* Active Filters Summary */}
          {(searchTerm ||
            selectedCity !== "all" ||
            priceRange.min ||
            priceRange.max ||
            roomsFilter !== "all" ||
            statusFilter !== "all") && (
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-gray-500 dark:text-gray-400 text-xs">
                Active filters:
              </span>
              {searchTerm && (
                <Badge variant="secondary" className="text-xs">
                  Search: &ldquo;{searchTerm}&ldquo;
                </Badge>
              )}
              {selectedCity !== "all" && (
                <Badge variant="secondary" className="text-xs capitalize">
                  City: {selectedCity}
                </Badge>
              )}
              {statusFilter !== "all" && (
                <Badge variant="secondary" className="text-xs">
                  Status:{" "}
                  {statusFilter === "not_interested" ? "Archived" : "Active"}
                </Badge>
              )}
              {roomsFilter !== "all" && (
                <Badge variant="secondary" className="text-xs">
                  Rooms: {roomsFilter}
                </Badge>
              )}
              {(priceRange.min || priceRange.max) && (
                <Badge variant="secondary" className="text-xs">
                  Price: {priceRange.min || "0"} - {priceRange.max || "∞"} PLN
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

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
            <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="text-sm text-gray-600 dark:text-gray-400">
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
          <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
            <Bell className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            {filteredAndSortedAlerts.length === 0 && alerts.length > 0
              ? "No alerts match your filters"
              : "No alerts yet"}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
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
