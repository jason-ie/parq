import { useState, useEffect, useRef } from "react";
import { Search, MapPin, SlidersHorizontal } from "lucide-react";
import PropTypes from "prop-types";

const SearchBar = ({ onSearch }) => {
	const [searchQuery, setSearchQuery] = useState("");
	const [showFilters, setShowFilters] = useState(false);
	const [selectedPlace, setSelectedPlace] = useState(null);
	const [filters, setFilters] = useState({
		maxPrice: Infinity,
		parkingType: "all",
		radius: 5,
	});

	const autocompleteRef = useRef(null);
	const inputRef = useRef(null);

	useEffect(() => {
		if (!window.google || !inputRef.current) return;

		autocompleteRef.current = new window.google.maps.places.Autocomplete(
			inputRef.current,
			{ types: ["establishment", "geocode"], componentRestrictions: { country: "us" } }
		);

		autocompleteRef.current.addListener("place_changed", handlePlaceSelect);
	}, []);

	const handlePlaceSelect = () => {
		const place = autocompleteRef.current.getPlace();
		if (!place.geometry) return;

		setSelectedPlace({
			name: place.name,
			address: place.formatted_address,
			coordinates: {
				lat: place.geometry.location.lat(),
				lng: place.geometry.location.lng(),
			},
		});
		setSearchQuery(place.formatted_address);
	};

	const handleFilterChange = (newFilters) => {
		setFilters((prev) => ({ ...prev, ...newFilters }));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!selectedPlace) {
			alert("Please select a location from the autocomplete suggestions");
			return;
		}
		onSearch({ query: searchQuery, place: selectedPlace, filters });
	};

	return (
		<div className="relative">
			<form onSubmit={handleSubmit}>
				<div className="flex items-center gap-2">
					{/* Input */}
					<div className="flex-1 flex items-center bg-white border border-gray-200 rounded-xl px-4 h-12 gap-3 focus-within:border-gray-400 focus-within:ring-1 focus-within:ring-gray-200 transition-all duration-150">
						<MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
						<input
							ref={inputRef}
							type="text"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Search venues or addresses..."
							className="flex-1 text-sm text-gray-900 placeholder-gray-400 bg-transparent focus:outline-none"
						/>
					</div>

					{/* Filter toggle */}
					<button
						type="button"
						onClick={() => setShowFilters(!showFilters)}
						className={`h-12 w-12 flex items-center justify-center rounded-xl border transition-all duration-150 cursor-pointer flex-shrink-0 ${
							showFilters
								? "bg-gray-900 border-gray-900 text-white"
								: "bg-white border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-800"
						}`}
					>
						<SlidersHorizontal className="h-4 w-4" />
					</button>

					{/* Search button */}
					<button
						type="submit"
						className="h-12 flex items-center gap-2 px-5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition-colors duration-150 cursor-pointer flex-shrink-0"
					>
						<Search className="h-4 w-4" />
						<span className="hidden sm:block">Search</span>
					</button>
				</div>

				{/* Filter panel */}
				{showFilters && (
					<div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-lg border border-gray-200 p-5 z-50">
						<p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Filters</p>
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
							<div>
								<label className="block text-xs font-medium text-gray-700 mb-1.5">
									Search Radius <span className="text-red-400">*</span>
								</label>
								<select
									value={filters.radius}
									onChange={(e) => handleFilterChange({ radius: Number(e.target.value) })}
									required
									className="w-full text-sm rounded-lg border border-gray-200 py-2.5 px-3 bg-white focus:outline-none focus:border-gray-400"
								>
									<option value="1">Within 1 mile</option>
									<option value="5">Within 5 miles</option>
									<option value="10">Within 10 miles</option>
								</select>
							</div>

							<div>
								<label className="block text-xs font-medium text-gray-700 mb-1.5">Max Price</label>
								<select
									value={filters.maxPrice}
									onChange={(e) =>
										handleFilterChange({
											maxPrice: e.target.value === "any" ? Infinity : Number(e.target.value),
										})
									}
									className="w-full text-sm rounded-lg border border-gray-200 py-2.5 px-3 bg-white focus:outline-none focus:border-gray-400"
								>
									<option value="any">Any price</option>
									<option value="10">Up to $10/hr</option>
									<option value="25">Up to $25/hr</option>
									<option value="50">Up to $50/hr</option>
								</select>
							</div>

							<div>
								<label className="block text-xs font-medium text-gray-700 mb-1.5">Parking Type</label>
								<select
									value={filters.parkingType}
									onChange={(e) => handleFilterChange({ parkingType: e.target.value })}
									className="w-full text-sm rounded-lg border border-gray-200 py-2.5 px-3 bg-white focus:outline-none focus:border-gray-400"
								>
									<option value="all">All types</option>
									<option value="Driveway">Driveway</option>
									<option value="Garage">Garage</option>
									<option value="Street">Street</option>
								</select>
							</div>
						</div>
					</div>
				)}
			</form>
		</div>
	);
};

SearchBar.propTypes = {
	onSearch: PropTypes.func.isRequired,
};

export default SearchBar;
