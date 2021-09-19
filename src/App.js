import React from "react";
import "./App.css";
import "./index.css";
//import Text from "react-text";
import logo from "./imgs/logo.webp";

import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import mapStyles from "./mapstyles";
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
  width: "80vw",
  height: "90vh",
  alignSelf: "center",
  marginLeft: "10%",
};

const center = {
  lat: 51.2538,
  lng: -85.3232,
};

const options = {
  styles: mapStyles,
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

  console.log(logo);
  const panTo = React.useCallback(({ lat, lng }) => {
    mapRef.current.panTo({ lat, lng });
    mapRef.current.setZoom(14);
  }, []);
  if (loadError) return "Error loading maps";
  if (!isLoaded) return "Loading Maps";
  return (
    <div>
      <div
        className="imgDiv"
        style={{
          width: "50%",
          height: "100%",
        }}
      >
        <img src={logo} alt="logo" className="logo"></img>
      </div>

      <div style={{ textAlign: "center", marginTop: "3rem" }}>
        <strong
          style={{
            fontFamily:
              "Trebuchet MS, Lucida Sans, Lucida Sans Unicode, Lucida Grande, Arial,sans-serif",
            fontSize: "x-large",
          }}
        >
          {" "}
          This map will help you find the nearst children mental health facility
          to you.
        </strong>
        <br />
        <br />
        <p className="initP">
          • To find the nearest facility to you, enter your zipcode with the
          following format: <strong style={{ color: "blue" }}>"XXX XXX"</strong>
          .
          <hr
            style={{
              borderBottomColor: "skyblue",
              borderBottomWidth: 0.2,
              width: "20%",
            }}
          />
          <br /> • Or, you can enter an address (could be your home address or
          an address of your choice).
          <hr
            style={{
              borderBottomColor: "skyblue",
              borderBottomWidth: 0.2,
              width: "20%",
            }}
          />
          <br />• You can also search by City or/and Province (For example:
          <strong style={{ color: "blue" }}> London, ON </strong> or{" "}
          <strong style={{ color: "blue" }}> Ontario</strong>).
          <hr
            style={{
              borderBottomColor: "skyblue",
              borderBottomWidth: 0.2,
              width: "20%",
            }}
          />
          <br />• Click the{" "}
          <strong style={{ color: "red" }}>red markers</strong> on the map to
          view each facility's information.
        </p>
        <hr
          style={{
            borderBottomColor: "black",
            borderBottomWidth: 1,
          }}
        />
      </div>
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
              console.log(branch);
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
              <hr
                style={{
                  borderBottomColor: "black",
                  borderBottomWidth: 1,
                }}
              />
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
                  {selected.phoneNumber}
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
            const { lat, lng } = await getLatLng(results[0]);
            panTo({ lat, lng });
          } catch (err) {
            console.log(err);
          }
        }}
      >
        <ComboboxInput
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
          }}
          disabled={!ready}
          placeholder="Enter an address"
        />
        <ComboboxPopover>
          <ComboboxList>
            {status === "OK" &&
              data.map(({ description }) => (
                <ComboboxOption
                  key={Math.random().toString(36).substr(2, 9)}
                  value={description}
                />
              ))}
          </ComboboxList>
        </ComboboxPopover>
      </Combobox>
    </div>
  );
}
