import React from "react";
import "./App.css";
import "./index.css";

import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from "@reach/combobox";
import "@reach/combobox/styles.css";
import branches from "./branches.json";
require("dotenv").config();

const libraries = ["places"];

const mapContainerStyle = {
  width: "100vw",
  height: "100vh",
  alignSelf: "center",
  //marginLeft: "30%",
};

const center = {
  lat: 51.2538,
  lng: -85.3232,
};

const options = {
  disableDefaultUI: true,
  zoomControl: true,
};
const API_KEY = process.env.REACT_APP_GOOGLE_KEY;
export default function App() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: API_KEY,
    libraries,
  });

  const [selected, setSelected] = React.useState(null);

  const mapRef = React.useRef();

  const onMapLoad = React.useCallback((map) => {
    mapRef.current = map;
  }, []);

  const panTo = React.useCallback(({ lat, lng }) => {
    mapRef.current.panTo({ lat, lng });
    mapRef.current.setZoom(14);
  }, []);
  if (loadError) return "Error loading maps";
  if (!isLoaded) return "Loading Maps";
  return (
    <div className="mapDiv">
      <Search panTo={panTo} />

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={7}
        center={center}
        options={options}
        onLoad={onMapLoad}
      >
        {" "}
        {branches.map((branch) => (
          <Marker
            key={Math.random().toString(36).substr(2, 9)}
            position={{ lat: branch.lat, lng: branch.lng }}
            onClick={() => {
              setSelected(branch);
            }}
          />
        ))}
        {selected && (
          <InfoWindow
            position={{ lat: selected.lat, lng: selected.lng }}
            onCloseClick={() => {
              setSelected(null);
            }}
          >
            <div>
              <p>
                <strong>You have clicked on the </strong>
                <strong
                  style={{
                    fontStyle: "italic",
                    color: "blue",
                    fontWeight: "bold",
                  }}
                >
                  {selected.name}
                </strong>{" "}
                <strong>agency location.</strong>
              </p>
              <div>
                <hr
                  style={{
                    borderBottomColor: "black",
                    borderBottomWidth: 1,
                  }}
                />
              </div>
              <p>
                <strong>Contact Information:</strong>
              </p>
              <p>
                <strong>
                  Website:
                  <a href={selected.url} target="_blank" rel="noreferrer">
                    {selected.url}
                  </a>
                </strong>
              </p>
              <p>
                <strong>Phone number: </strong>
                <strong style={{ fontWeight: "bold", color: "blue" }}>
                  <a href={`tel:${selected.phoneNumber}`}>
                    {selected.phoneNumber}
                  </a>
                </strong>
              </p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}

function Search({ panTo }) {
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      location: { lat: () => 51.2538, lng: () => -85.3232 },
      radius: 200 * 1000,
    },
  });
  return (
    <div className="search">
      <Combobox
        className="Combobox"
        onSelect={async (address) => {
          setValue(address, false);
          clearSuggestions();
          try {
            const results = await getGeocode({ address });
            console.log(results);
            const { lat, lng } = await getLatLng(results[0]);
            panTo({ lat, lng });
          } catch (err) {
            console.log(err);
          }
        }}
      >
        <ComboboxInput
          value={value}
          className="comboBoxInput"
          onChange={(e) => {
            setValue(e.target.value);
          }}
          onKeyDown={async (ev) => {
            if (ev.key === "Enter") {
              setValue(ev.target.value, false);
              const address = ev.target.value;
              clearSuggestions();
              try {
                const results = await getGeocode({ address });
                const { lat, lng } = await getLatLng(results[0]);
                panTo({ lat, lng });
              } catch (err) {
                console.log(err);
              }
            }
          }}
          disabled={!ready}
          placeholder="Enter an address"
          style={{ fontSize: "small" }}
        />
        <ComboboxPopover>
          <ComboboxList>
            {status === "OK" &&
              data.map(({ description }) => (
                <ComboboxOption
                  key={Math.random().toString(36).substr(2, 9)}
                  value={description}
                  style={{ fontSize: "small" }}
                />
              ))}
          </ComboboxList>
        </ComboboxPopover>
      </Combobox>
    </div>
  );
}
