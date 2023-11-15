"use client";
import React, { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { NextPage } from "next";

import { Checkbox, MantineProvider } from "@mantine/core";
// import Nav from "./components/nav";
// import "./App.css";
// import "./globals.css";
// import "./Home.module.css";
import HelicopterData1 from "../../flight_chunks/flight_chunk_1.json";
import HelicopterData2 from "../../flight_chunks/flight_chunk_2.json";
import HelicopterData3 from "../../flight_chunks/flight_chunk_3.json";
import HelicopterData4 from "../../flight_chunks/flight_chunk_4.json";
import HelicopterData5 from "../../flight_chunks/flight_chunk_5.json";
import HelicopterData6 from "../../flight_chunks/flight_chunk_6.json";
import HelicopterData7 from "../../flight_chunks/flight_chunk_7.json";
import HelicopterData8 from "../../flight_chunks/flight_chunk_8.json";
import HelicopterData9 from "../../flight_chunks/flight_chunk_9.json";

interface Position {
  altitude: number;
  latitude: number;
  longitude: number; 
}

interface Flight {
  created: string;
  positions: Position[];
  callsign: string;
  altitude: number;
  source: string;
  updated: string;
}

interface HelicopterData {
  flights: Flight[];
}

const HelicopterData: HelicopterData = {
  flights: [
    ...HelicopterData1.flights,
    ...HelicopterData2.flights,
    ...HelicopterData3.flights,
    ...HelicopterData4.flights,
    ...HelicopterData5.flights,
    ...HelicopterData6.flights,
    ...HelicopterData7.flights,
    ...HelicopterData8.flights,
    ...HelicopterData9.flights,
  ],
};

const Home: NextPage = () => {
  const shouldfilteropeninit =
    typeof window != "undefined" ? window.innerWidth >= 640 : false;
  const divRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const indexRef = useRef<number>(0);
  const [filterpanelopened, setfilterpanelopened] =
    useState(shouldfilteropeninit);
  const [randomDate, setRandomDate] = useState<number>(1);
  const [totalCost, setTotalCost] = useState<number | null>(null);

  const [userDate, setUserDate] = useState<string | null>(null);
  const [randomFlightPath, setRandomFlightPath] = useState<Flight | null>(null);
  const [costFigure, setCostFigure] = useState<number | null>(null);
  const [randomFlights, setRandomFlights] = useState<Flight[]>([]); // Initialize as an empty array
  const callSigns = [
    ...new Set(HelicopterData.flights.map((flight) => flight.callsign)),
  ];

  const [pollutionFigure, setPollutionFigure] = useState("");

  let [selectedCallSigns, setSelectedCallSigns] = useState<string[]>(callSigns);

  const [searchedAddressCoordinates, setSearchedAddressCoordinates] = useState<
    [number, number] | null
  >(null);
  const [addressFound, setAddressFound] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("2019-01-01");

  // Handler for changing the date
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    closeWindow();
    setSelectedDate(event.target.value);
    setUserDate(event.target.value);
    // console.log(event.target.value)
  };
  // console.log(userDate);
  const flightPaths: { layerId: string; flight: Flight }[] = [];

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.remove();
    }

    mapboxgl.accessToken =
      "pk.eyJ1Ijoia2VubmV0aG1lamlhIiwiYSI6ImNsZG1oYnpxNDA2aTQzb2tkYXU2ZWc1b3UifQ.PxO_XgMo13klJ3mQw1QxlQ";

    const airportIcon = document.createElement("div");
    airportIcon.innerHTML = `<svg width="20px" height="20px" viewBox="0 0 1024 1024" class="icon"  version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M989.312 194.56c0 18.24-14.72 33.024-33.024 33.024H420.352a33.024 33.024 0 1 1 0-66.048l262.208 31.104 273.728-31.104c18.304 0 33.024 14.784 33.024 33.024z" fill="#4D9BD5" /><path d="M717.376 418.752c0 18.816-12.992 34.048-28.992 34.048-16.064 0-29.056-15.232-29.056-34.048V184c0-18.816 12.992-34.112 29.056-34.112 16 0 28.992 15.296 28.992 34.112v234.752z" fill="#455963" /><path d="M601.088 699.392h43.648v135.936h-43.648zM764.032 699.392h43.776v135.936h-43.776z" fill="#455963" /><path d="M823.04 835.328H423.552v38.848h399.488a130.24 130.24 0 0 0 130.048-130.176h-38.784c0 50.304-40.96 91.328-91.264 91.328z" fill="#455963" /><path d="M118.656 359.104c0-37.312 20.224-69.888 50.432-87.36a100.544 100.544 0 0 0-102.464 0.96 100.864 100.864 0 0 1 0 172.928 100.48 100.48 0 0 0 102.464 0.96 101.056 101.056 0 0 1-50.432-87.488z" fill="#256FB8" /><path d="M219.52 359.104c0-37.312-20.288-69.888-50.432-87.36a100.8 100.8 0 0 0 0 174.72c30.08-17.472 50.432-49.984 50.432-87.36z" fill="#4D9BD5" /><path d="M115.648 359.104c0-36.736-19.712-68.8-49.024-86.464a100.8 100.8 0 0 0 0 172.928c29.312-17.664 49.024-49.728 49.024-86.464z" fill="#4D9BD5" /><path d="M898.112 427.584c-38.656-46.272-97.472-84.16-168.256-103.296-73.984-19.968-146.944-15.68-204.928 7.296-14.656-3.584-38.336 17.728-55.04 17.728H211.392c-71.104 0-95.616-4.16-95.744 17.92 0 9.792 28.608 25.28 95.744 44.16l241.344 47.104c-9.152 90.816 12.096 153.92 128.384 214.528 27.264 17.856 59.776 36.032 94.656 36.032h112.64c95.04 0 172.16-53.76 172.16-148.8a171.584 171.584 0 0 0-62.464-132.672z" fill="#F5BB1D" /><path d="M747.968 483.136l-121.856-19.968-37.12-113.984h104.064zM952.192 613.376a171.904 171.904 0 0 0 7.616-69.12l-25.28-75.008a174.272 174.272 0 0 0-36.416-41.664c-38.656-46.272-97.472-84.16-168.256-103.296-3.264-0.896-6.528-1.6-9.664-2.432l124.928 275.072 107.072 16.448z" fill="#455963" /></svg>`;
    airportIcon.style.width = "24px";
    airportIcon.style.height = "24px";

    const formulaForZoom = () => {
      if (typeof window !== "undefined") {
        return window.innerWidth > 700 ? 10 : 9.1;
      }
      return 9.1;
    };

    const mapparams: mapboxgl.MapboxOptions = {
      container: divRef.current!,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-118.41, 34],
      zoom: formulaForZoom(),
    };

    const map = new mapboxgl.Map(mapparams);
    mapRef.current = map;

    map.on("style.load", () => {
      const selectedFlights = HelicopterData.flights[randomDate];

      const date = selectedFlights.created;
      const dateString = date.split("T")[0];
      // console.log(dateString);

      setSelectedDate(dateString);
      let matchingFlights;
      if (userDate) {
        matchingFlights = HelicopterData.flights.filter((flight) => {
          const flightDate = flight.created.split("T")[0];
          return flightDate === userDate;
        });
      } else {
        matchingFlights = HelicopterData.flights.filter((flight) => {
          const flightDate = flight.created.split("T")[0];
          return flightDate === dateString;
        });
      }
      // setUserDate(null)
      // console.log(matchingFlights)

      setRandomFlights(matchingFlights);

      matchingFlights = matchingFlights.filter((flight) =>
        selectedCallSigns.includes(flight.callsign)
      );
      // Initialize a variable to store the total cost
      let totalCost = 0;

      // Iterate through matchingFlights
      matchingFlights.forEach((selectedFlight) => {
        const positions = selectedFlight.positions;
        const filteredPositions = positions?.filter(
          (position) =>
            position?.latitude !== null && position?.longitude !== null
        );

        // Calculate take-off and landing times for the flight
        const calculateTakeOffAndLanding = (positions: Position[] | undefined) => {
          if (!positions || positions.length === 0) {
            // Handle the case where positions is undefined or empty
            console.error("positions is undefined or empty");
            return {
              calculatedTakeOff: 0,
              calculatedLanding: 0,
            };
          }
        
          let takeOffAltitude = positions[0].altitude;
          let landingAltitude = positions[positions.length - 1].altitude;
          const ALTITUDE_TO_MINUTES_CONVERSION_RATE = 0.02;
        
          for (let i = 1; i < positions.length; i++) {
            if (positions[i]?.altitude !== undefined) {
              if (positions[i].altitude > takeOffAltitude) {
                takeOffAltitude = positions[i].altitude;
              }
              if (positions[i].altitude < landingAltitude) {
                landingAltitude = positions[i].altitude;
              }
            }
          }
        
          const takeOffTime = takeOffAltitude * ALTITUDE_TO_MINUTES_CONVERSION_RATE;
          const landingTime = landingAltitude * ALTITUDE_TO_MINUTES_CONVERSION_RATE;
        
          return {
            calculatedTakeOff: takeOffTime,
            calculatedLanding: landingTime,
          };
        };
        

        const { calculatedTakeOff, calculatedLanding } =
          calculateTakeOffAndLanding(filteredPositions);

        // Calculate the cost for the flight
        const cost = (calculatedTakeOff + calculatedLanding) * 50;

        const sergioisthebest = calculatedTakeOff + calculatedLanding;
        // console.log("COST IS ---", sergioisthebest);

        // Accumulate the costs for each flight to calculate the total cost
        totalCost += cost;
      });

      // Set the total cost to the setTotalCost state
      setTotalCost(totalCost);

      // console.log(matchingFlights)
      matchingFlights.forEach((selectedFlight, index) => {
        const positions = selectedFlight.positions;
        const filteredPositions = positions?.filter(
          (position) =>
            position?.latitude !== null && position?.longitude !== null
        );
        const routeData = filteredPositions?.map((position) => ({
          latitude: position?.latitude,
          longitude: position?.longitude,
        }));

        // const routeData = filteredPositions?.map((position) => ({
        //   latitude: position?.latitude,
        //   longitude: position?.longitude,
        // }));

        const timestamp = new Date().getTime();
        const sourceId = `random-route-${timestamp}-${index}`;
        mapRef.current?.addSource(sourceId, {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: routeData?.map((point) => [
                point?.longitude,
                point?.latitude,
              ]),
            },
            properties: {
              callsign: selectedFlight.callsign,
              altitude: selectedFlight.altitude,
              source: selectedFlight.source,
              created: selectedFlight.created,
              updated: selectedFlight.updated,
            },
          },
        });

        mapRef.current?.addLayer({
          id: `random-route-layer-${sourceId}`,
          type: "line",
          source: sourceId,
          paint: {
            "line-color": [
              "case",
              [">", ["get", "altitude"], 1000],
              "#41ffca", // Altitude greater than 1000, color is #41ffca
              "red", // Altitude less than or equal to 1000, color is red
            ],
            "line-width": 4,
          },
        });

        const layerId = `random-route-layer-${sourceId}`;
        flightPaths.push({ layerId, flight: selectedFlight });

        mapRef.current?.on("click", layerId, (e) => {
          setRandomFlightPath(selectedFlight);
          setIsWindowOpen(true);

          const ALTITUDE_TO_MINUTES_CONVERSION_RATE = 0.02;

          const calculateTakeOffAndLanding = (positions: Position[]) => {
            let takeOffAltitude = positions[0].altitude;
            let landingAltitude = positions[positions.length - 1].altitude;

            for (let i = 1; i < positions.length; i++) {
              if (positions[i].altitude > takeOffAltitude) {
                takeOffAltitude = positions[i].altitude;
              }
              if (positions[i].altitude < landingAltitude) {
                landingAltitude = positions[i].altitude;
              }
            }

            const takeOffTime =
              takeOffAltitude * ALTITUDE_TO_MINUTES_CONVERSION_RATE;
            const landingTime =
              landingAltitude * ALTITUDE_TO_MINUTES_CONVERSION_RATE;

            return {
              calculatedTakeOff: takeOffTime,
              calculatedLanding: landingTime,
            };
          };

          const { calculatedTakeOff, calculatedLanding } =
            calculateTakeOffAndLanding(filteredPositions);

          const cost = (calculatedTakeOff + calculatedLanding) * 50;
          setCostFigure(cost);

          // Assuming you have already parsed the JSON data and calculated the time_in_air as shown in the previous example

          // Calculate pollutionFigure
          // Assuming you have valid date/time strings in selectedFlight.updated and selectedFlight.created
          const updatedTimestamp = Date.parse(selectedFlight.updated);
          const createdTimestamp = Date.parse(selectedFlight.created);

          if (isNaN(updatedTimestamp) || isNaN(createdTimestamp)) {
            console.error(
              "Invalid date/time format in selectedFlight.updated or selectedFlight.created"
            );
          } else {
            const time_in_air = updatedTimestamp - createdTimestamp;
            const pollutionFigure = (time_in_air / (60 * 1000)) * 0.00705; // Calculate as a number
            const formattedPollutionFigure = pollutionFigure.toFixed(3); // Format it with 2 decimal places as a string

            setPollutionFigure(
              formattedPollutionFigure + " metric tons of Carbon Dioxide"
            );
          }
        });

        if (filteredPositions && filteredPositions.length > 0) {
          const helicopterIcon = document.createElement("div");
          helicopterIcon.innerHTML = `<svg fill="white" width="30px" height="30px" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M17.984375 3.9863281 A 1.0001 1.0001 0 0 0 17 5L7 5 A 1.0001 1.0001 0 1 0 7 7L17 7L17 10L2.5996094 10L2.1777344 7.8828125C2.0747344 7.3698125 1.6236094 7 1.0996094 7C0.49260938 7 -1.4802974e-16 7.4926094 0 8.0996094L0 11.611328C0 12.447328 0.51678125 13.193375 1.3007812 13.484375C3.0507812 14.133375 6.065375 15.243406 7.109375 15.566406C8.614375 16.032406 10.644531 19.707031 10.644531 19.707031L10.648438 19.701172C11.637325 21.656206 13.659112 23 16 23L24 23C25.862 23 27.412375 21.722 27.859375 20L25.472656 20C23.957656 20 22.572531 19.144062 21.894531 17.789062L20.722656 15.447266C20.390656 14.782266 20.874188 14 21.617188 14L26.921875 14C25.537875 11.611 22.959 10 20 10L19 10L19 7L29 7 A 1.0001 1.0001 0 1 0 29 5L19 5 A 1.0001 1.0001 0 0 0 17.984375 3.9863281 z M 28.955078 22.988281 A 1.0001 1.0001 0 0 0 28.105469 23.552734C28.105469 23.552734 27.332093 25 25.996094 25L10 25 A 1.0001 1.0001 0 1 0 10 27L25.996094 27C28.664094 27 29.894531 24.447266 29.894531 24.447266 A 1.0001 1.0001 0 0 0 28.955078 22.988281 z"/></svg>`;
          helicopterIcon.style.width = "24px";
          helicopterIcon.style.height = "24px";

          const animatedPoint = new mapboxgl.Marker({
            element: helicopterIcon,
          }).setLngLat([positions[0]?.longitude, positions[0]?.latitude]);
          animatedPoint.addTo(map);

          indexRef.current = 0;

          const animatePoints = () => {
            const nextIndex = indexRef.current + 1;
            if (nextIndex < routeData!.length) {
              setTimeout(() => {
                animatedPoint.setLngLat([
                  routeData![nextIndex].longitude,
                  routeData![nextIndex].latitude,
                ]);

                indexRef.current = nextIndex;
                requestAnimationFrame(animatePoints);
              }, 1000);
            }
          }
          animatePoints();
        }
      });
    });
  }, [randomDate, selectedCallSigns, userDate]);

  // const displayRandomFlight = (numFlights: number) => {
  //   for (let i = 0; i < numFlights; i++) {
  //     generateRandomFlightPath();
  //   }
  // };

  // const generateRandomFlightPath = () => {

  // };

  const handleRandomDateGeneratorClick = () => {
    closeWindow();
    setUserDate(null);
    const randomIndex = Math.floor(
      Math.random() * HelicopterData.flights.length
    );
    setRandomDate(randomIndex);
  };
  const randomDateGeneratorButton = (
    <div className="flex justify-center gap-5">
      <button
        onClick={() => handleRandomDateGeneratorClick()}
        className="random-date-button"
      >
        <div className="circle-icon">Random Date Generator</div>
      </button>
      <div>
        <input
          placeholder="DD-MM-YYYY"
          type="date"
          // onChange={(e)=>setUserDate(e.target.value)}
          className="border border-white text-black px-2 py-1"
          value={selectedDate}
          min="2019-01-01"
          max="2019-12-31"
          onChange={handleDateChange}
        />
      </div>
    </div>
  );
  const formatFlightDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const selectedFlightPathDetails = randomFlightPath && (
    <div>
      <p>
        Callsign: {randomFlightPath.callsign}
        <br />
        Date: {formatFlightDate(randomFlightPath.created.split("T")[0])}
        <br />
        Cost Figure:{" "}
        {costFigure != null
          ? `$${costFigure.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
          : "Calculating..."}
        <br />
        Carbon Dioxide Pollution Figure:{" "}
        {pollutionFigure != null ? `${pollutionFigure}` : "Calculating..."}
      </p>
    </div>
  );

  const [userAddress, setUserAddress] = useState<string>("");
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(
    null
  );

  const handleAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const address = event.target.value;
    setUserAddress(address);
    fetchAddressSuggestions(address);
  };

  const handleAddressSubmit = async () => {
    closeWindow();
    let addressToSearch = userAddress;

    if (selectedSuggestion !== null) {
      addressToSearch = selectedSuggestion;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${addressToSearch}.json?access_token=pk.eyJ1Ijoia2VubmV0aG1lamlhIiwiYSI6ImNsZG1oYnpxNDA2aTQzb2tkYXU2ZWc1b3UifQ.PxO_XgMo13klJ3mQw1QxlQ`
      );

      const data = await response.json();

      if (data.features.length > 0) {
        const coordinates = data.features[0].center;
        setSearchedAddressCoordinates(coordinates);
        setAddressFound(true);
        mapRef.current?.flyTo({
          center: coordinates,
          zoom: 14,
        });

        setAddressSuggestions([]);
        setUserAddress("");
        setSelectedSuggestion(null);
      } else {
        console.error("Address not found");
      }
    } catch (error) {
      console.error("Error geocoding address:", error);
    }
  };

  const fetchAddressSuggestions = async (address: string) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${address}.json?access_token=pk.eyJ1Ijoia2VubmV0aG1lamlhIiwiYSI6ImNsZG1oYnpxNDA2aTQzb2tkYXU2ZWc1b3UifQ.PxO_XgMo13klJ3mQw1QxlQ`
      );

      const data = await response.json();

      if (data.features.length > 0) {
        const suggestions = data.features.map(
          (feature: any) => feature.place_name
        );
        setAddressSuggestions(suggestions);
      } else {
        setAddressSuggestions([]);
      }
    } catch (error) {
      console.error("Error fetching address suggestions:", error);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSelectedSuggestion(suggestion);
    setUserAddress(suggestion);
    handleAddressSubmit();
  };

  const [isWindowOpen, setIsWindowOpen] = useState(true);

  const closeWindow = () => {
    setIsWindowOpen(false);
  };

  const handleCallSignChange = (callSign: string) => {
    setSelectedCallSigns((prevSelected) => {
      if (prevSelected.includes(callSign)) {
        // If the callsign is already selected, remove it
        return prevSelected.filter((cs) => cs !== callSign);
      } else {
        // If the callsign is not selected, add it
        return [...prevSelected, callSign];
      }
    });
  };

  const callSignFilter = (
    <div className="flex flex-wrap items-center gap-4 p-2">
      {callSigns.map((callsign) => (
        <label
          key={callsign}
          className="flex items-center cursor-pointer text-base mr-4"
        >
          <input
            type="checkbox"
            value={callsign}
            checked={selectedCallSigns.includes(callsign)}
            onChange={() => handleCallSignChange(callsign)}
            className="mr-2 cursor-pointer"
          />
          {callsign}
        </label>
      ))}
    </div>
  );

  useEffect(() => {
    if (mapRef.current && searchedAddressCoordinates && addressFound) {
      const marker = new mapboxgl.Marker()
        .setLngLat(searchedAddressCoordinates)
        .addTo(mapRef.current);
    }
  }, [searchedAddressCoordinates, addressFound]);

  const formattedMonetaryCost = totalCost?.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return (
    <div className="flex flex-col h-full w-screen absolute">
      <div className="flex-none">{/* <Nav /> */}</div>
      <MantineProvider
        // theme={{ colorScheme: "dark" }}
        // withGlobalStyles
        // withNormalizeCSS
      >
        <div className="search-bar">
          {/* <input
            type="text"
            placeholder="Enter an address"
            value={userAddress}
            onChange={handleAddressChange}
            className="search-input"
          /> */}
          <div className=" w-[270px] flex flex-row justify-start items-center gap-3 h-10 rounded-3xl border border-[#D0D5DD] px-2 bg-gray-700 text-white">
            <svg viewBox="0 0 17.048 18" height={15} width={16}>
              <path
                d="M380.321,383.992l3.225,3.218c.167.167.341.329.5.506a.894.894,0,1,1-1.286,1.238c-1.087-1.067-2.179-2.131-3.227-3.236a.924.924,0,0,0-1.325-.222,7.509,7.509,0,1,1-3.3-14.207,7.532,7.532,0,0,1,6,11.936C380.736,383.462,380.552,383.685,380.321,383.992Zm-5.537.521a5.707,5.707,0,1,0-5.675-5.72A5.675,5.675,0,0,0,374.784,384.513Z"
                transform="translate(-367.297 -371.285)"
                fill="#757575"
              />
            </svg>
            <input
              className="font-inter text-md text-regular text-left text-white bg-transparent outline-none"
              placeholder="Search"
              value={userAddress}
              onChange={handleAddressChange}
            />
          </div>
          {/* <button onClick={handleAddressSubmit} className="search-button">
            Find Address
          </button> */}
        </div>

        <ul className="address-suggestions">
          {addressSuggestions.map((suggestion, index) => (
            <li key={index} onClick={() => handleSuggestionClick(suggestion)}>
              {suggestion}
            </li>
          ))}
        </ul>

        {randomDateGeneratorButton}
        <div className="relative">
          <button
            onClick={() => {
              setfilterpanelopened(!filterpanelopened);
            }}
            className="inline-block rounded-full px-3 pb-1.5 pt-0.5 text-sm font-bold md:text-base bg-gray-800 bg-opacity-80 text-white border-white border-2 z-20"
          >
            <svg
              style={{
                width: "20px",
                height: "20px",
              }}
              viewBox="0 0 24 24"
              className="inline align-middle mt-0.5"
            >
              <path
                fill="currentColor"
                d="M14,12V19.88C14.04,20.18 13.94,20.5 13.71,20.71C13.32,21.1 12.69,21.1 12.3,20.71L10.29,18.7C10.06,18.47 9.96,18.16 10,17.87V12H9.97L4.21,4.62C3.87,4.19 3.95,3.56 4.38,3.22C4.57,3.08 4.78,3 5,3V3H19V3C19.22,3 19.43,3.08 19.62,3.22C20.05,3.56 20.13,4.19 19.79,4.62L14.03,12H14Z"
              />
            </svg>

            <span>Filter</span>
          </button>
          <div
            className={`top-10  w-[400px] h-[290px] overflow-hidden z-50 p-4 rounded-lg text-white bg-zinc-900 ${
              filterpanelopened ? "absolute" : "hidden"
            }`}
          >
            <div className="flex flex-col">
              <h1 style={{ fontSize: "25px" }}>LAPD Helicopter Map</h1>

              <h4>
                Monetary cost :{" "}
                <span>{totalCost && formattedMonetaryCost}</span>
              </h4>
              <div>
                Carbon Dioxide Pollution Released:{" "}
                <span>{pollutionFigure}</span>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-4">
                <button
                  className="align-middle bg-gray-800 rounded-lg px-3 py-2 text-sm md:text-base border border-gray-400"
                  onClick={() => {
                    setSelectedCallSigns(callSigns);
                  }}
                >
                  Select All
                </button>
                <button
                  className="align-middle bg-gray-800 rounded-lg px-3 py-2 text-sm md:text-base border border-gray-400"
                  onClick={() => {
                    setSelectedCallSigns([]);
                  }}
                >
                  Unselect All
                </button>
              </div>
              {callSignFilter}
            </div>
          </div>
        </div>
        <div className="relative flex-grow">
          <div className="absolute inset-0 flex justify-start items-center">
            {selectedFlightPathDetails && isWindowOpen && (
              <div className="w-[20%] max-w-screen-md z-20 p-4 bg-white shadow-lg rounded-lg text-black relative">
                <div className="flex justify-end">
                  <span
                    className="absolute top-2 right-2 text-gray-500 cursor-pointer"
                    onClick={closeWindow}
                  >
                    X
                  </span>
                </div>
                <h2 className="text-xl font-bold mb-2">
                  Selected Flight Path Details
                </h2>
                {selectedFlightPathDetails}
              </div>
            )}
          </div>

          <div ref={divRef} className="map-container w-full h-full" />
          {(typeof window !== "undefined"
            ? window.innerWidth >= 640
            : false) && (
            <>
              <div
                className={`absolute md:mx-auto z-9 bottom-2 left-1 md:left-1/2 md:transform md:-translate-x-1/2`}
              >
                <a
                  href="https://controller.lacity.gov/"
                  target="_blank"
                  rel="noreferrer"
                >
                  <img
                    src="https://controller.lacity.gov/images/KennethMejia-logo-white-elect.png"
                    className="h-9 md:h-10 z-40"
                    alt="Kenneth Mejia LA City Controller Logo"
                  />
                </a>
              </div>
            </>
          )}
        </div>
      </MantineProvider>
    </div>
  );
};

export default Home;
