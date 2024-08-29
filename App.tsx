import React, {useEffect, useRef, useState} from "react";
import {StatusBar} from 'expo-status-bar';
import {ActivityIndicator, Dimensions, StyleSheet, View} from 'react-native';
import MapView, {Marker} from "react-native-maps";
import * as Location from 'expo-location';
import {GooglePlacesAutocomplete} from "react-native-google-places-autocomplete";
import MapViewDirections from "react-native-maps-directions";


const {width, height} = Dimensions.get('window');

const App: React.FC = () => {
	const [locationLoading, setLocationLoading] = useState<boolean>(true);
	const [location, setLocation] = useState(null);
	const [destination, setDestination] = useState(null);
	const [showRoute, setShowRoute] = useState<boolean>(false);
	const [errorMsg, setErrorMsg] = useState(null);

	const mapRef = useRef<MapView>();

	useEffect(() => {
		(async () => {
			setLocationLoading(true);
			let {status} = await Location.requestForegroundPermissionsAsync();
			if (status !== 'granted') {
				setErrorMsg('Permission to access location was denied');
				return;
			}

			let location = await Location.getCurrentPositionAsync({
				accuracy: Location.Accuracy.BestForNavigation,
				timeInterval: 5
			});
			setLocation(location);
			setDestination({
				latitude: location.coords.latitude,
				longitude: location.coords.longitude,
				latitudeDelta: 0.0922,
				longitudeDelta: 0.0421,
			});
			setLocationLoading(false);
		})();
	}, []);

	if (locationLoading && !location && !destination) {
		return (
			<View style={styles.container}>
				<StatusBar
					style="auto"
					backgroundColor={"transparent"}
					translucent={true}
				/>
				<ActivityIndicator size="large" color="#0000ff"/>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<StatusBar
				style="auto"
				backgroundColor={"transparent"}
				translucent={true}
			/>
			<GooglePlacesAutocomplete
				placeholder='Search'
				enablePoweredByContainer={false}
				fetchDetails={true}
				GooglePlacesSearchQuery={{
					rankby: 'distance',
				}}
				onPress={(data, details = null) => {
					console.log(`This is the GooglePlaceData --> ${JSON.stringify(data)}`);
					console.log(`This is the GooglePlaceDetail --> ${JSON.stringify(details)}`);
					setDestination({
						latitude: details.geometry.location.lat,
						longitude: details.geometry.location.lng,
						latitudeDelta: 0.0922,
						longitudeDelta: 0.0421,
					});
					setShowRoute(true);
				}}
				query={{
					key: `${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}`,
					language: 'en',
					types: 'establishment',
					radius: 50000,
					location: `${location.coords?.latitude},${location.coords?.longitude}`,
				}}
				styles={{
					container: {
						position: 'absolute',
						top: 48,
						width: width - 48,
						zIndex: 1,
					},
					textInput: {
						borderRadius: 100,
						borderWidth: 0,
						height: 48,
						fontSize: 16,
						paddingHorizontal: 16,
						shadowColor: "#063ab2",
						shadowOffset: {
							width: 0,
							height: 48,
						},
						shadowOpacity: 0,
						shadowRadius: 48,
						elevation: 10,
					},
				}}
			/>
			<MapView
				ref={mapRef}
				style={{
					width: "100%",
					height: "100%",
				}}
				mapPadding={{
					top: height - 36,
					right: 16,
					bottom: 0,
					left: 0,
				}}
				initialRegion={{
					latitude: location.coords?.latitude,
					longitude: location.coords?.longitude,
					latitudeDelta: 0.0922,
					longitudeDelta: 0.0421,
				}}
				minZoomLevel={10}
				showsUserLocation={true}
			>
				{
					destination &&
                    <Marker
                        coordinate={{
							latitude: destination.latitude,
							longitude: destination.longitude,
						}}
                        title={"Destination"}
                    />
				}
				{
					showRoute &&
                    <MapViewDirections
                        origin={{
							latitude: location.coords?.latitude,
							longitude: location.coords?.longitude,
						}}
                        destination={{
							latitude: destination.latitude,
							longitude: destination.longitude,
						}}
                        apikey={process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}
                        strokeWidth={5}
                        strokeColor="red"
                        optimizeWaypoints={true}
                        onReady={(result) => {
							console.log(`This is the result --> `);
							if (mapRef) {
								console.log(`This is the result --> ${JSON.stringify(result)}`);
								mapRef.current.fitToCoordinates(result.coordinates, {
									edgePadding: {
										top: 48,
										right: 16,
										bottom: 0,
										left: 0,
									},
									animated: true,
								});
							}
						}
						}
                    />
				}
			</MapView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center',
	},
});

export default App;
