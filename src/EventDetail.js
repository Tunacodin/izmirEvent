import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Linking,
  TouchableOpacity,
} from "react-native";

const EventDetail = ({ route }) => {
  const { event } = route.params;

  const handleOpenEventPage = () => {
    Linking.openURL(event.EtkinlikUrl).catch((err) =>
      console.error("An error occurred", err)
    );
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: event.Resim }} style={styles.image} />
      <View style={styles.detailsContainer}>
        <Text style={styles.title}>{event.Adi}</Text>
        <Text>{event.KisaAciklama}</Text>
        <Text>Yer: {event.EtkinlikMerkezi}</Text>
        <Text>Başlangıç: {event.EtkinlikBaslamaTarihi}</Text>
        <Text>Bitiş: {event.EtkinlikBitisTarihi}</Text>
        <TouchableOpacity style={styles.button} onPress={handleOpenEventPage}>
          <Text style={styles.buttonText}>Etkinlik Sayfası</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  image: {
    width: "100%",
    height: 200,
    marginBottom: 16,
  },
  detailsContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  button: {
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 5,
    marginTop: 16,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
  },
});

export default EventDetail;
