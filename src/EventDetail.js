import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Linking,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons"; // İkonlar için

const EventDetail = ({ route }) => {
  const { event } = route.params;

  const baseURL = "https://kultursanat.izmir.bel.tr/Etkinlikler/";

  const handleOpenEventPage = () => {
    // Etkinlik URL'sini ana URL ile birleştir
    const eventURL = event.EtkinlikUrl;
    const url = `${baseURL}/${eventURL}`;

    if (url.startsWith("http://") || url.startsWith("https://")) {
      Linking.openURL(url).catch((err) =>
        console.error("An error occurred while opening the event page", err)
      );
    } else {
      console.error("Invalid URL format", url);
    }
  };

  const handleBuyTicket = () => {
    if (event.BiletSatisLinki) {
      const url = event.BiletSatisLinki;
      if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
        Linking.openURL(url).catch((err) =>
          console.error("An error occurred while opening the ticket page", err)
        );
      } else {
        console.error("Invalid URL format", url);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Image source={{ uri: event.KucukAfis }} style={styles.image} />
        <View style={styles.detailsContainer}>
          <View style={styles.card}>
            <FontAwesome
              name="tag"
              size={24}
              color="white"
              style={styles.icon}
            />
            <Text style={styles.title}>{event.Adi}</Text>
          </View>
          <View style={styles.card}>
            <FontAwesome
              name="info-circle"
              size={24}
              color="white"
              style={styles.icon}
            />
            <Text style={styles.description}>{event.KisaAciklama}</Text>
          </View>
          <View style={styles.card}>
            <FontAwesome
              name="map-marker"
              size={24}
              color="white"
              style={styles.icon}
            />
            <Text style={styles.detailText}>{event.EtkinlikMerkezi}</Text>
          </View>
          <View style={styles.card}>
            <FontAwesome
              name="calendar"
              size={24}
              color="white"
              style={styles.icon}
            />
            <View style={styles.dateContainer}>
              <Text style={styles.detailText}>
                Başlangıç: {event.EtkinlikBaslamaTarihi}
              </Text>
              <Text style={styles.detailText}>
                Bitiş: {event.EtkinlikBitisTarihi}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.button} onPress={handleOpenEventPage}>
            <Text style={styles.buttonText}>Etkinlik Sayfası</Text>
          </TouchableOpacity>
          {event.BiletSatisLinki && ( // BiletSatisLinki varsa butonu göster
            <TouchableOpacity style={styles.button} onPress={handleBuyTicket}>
              <Text style={styles.buttonText}>Bilet Satın Al</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212", // Siyah arka plan
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 16,
    resizeMode: "cover",
  },
  detailsContainer: {
    flex: 1,
    width: "100%",
  },
  card: {
    backgroundColor: "#1E1E1E", // Koyu gri arka plan
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  icon: {
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    flexShrink: 1, // Title alanının taşmasını engeller
  },
  description: {
    fontSize: 16,
    color: "#CCCCCC",
    flexShrink: 1, // Description alanının taşmasını engeller
  },
  detailText: {
    fontSize: 14,
    color: "#CCCCCC",
  },
  dateContainer: {
    flexDirection: "column",
  },
  button: {
    backgroundColor: "#007BFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default EventDetail;
