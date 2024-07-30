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

  const baseURL = "https://kultursanat.izmir.bel.tr/Etkinlikler";

  // Tarih formatlama
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, "0")} ${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")} ${date.getFullYear()}`;
  };

  // Saat formatlama
  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return `${date.getHours().toString().padStart(2, "0")}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  };

  // Tarih karşılaştırma
  const isSameDay = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return (
      start.getFullYear() === end.getFullYear() &&
      start.getMonth() === end.getMonth() &&
      start.getDate() === end.getDate()
    );
  };

  // HTML etiketlerini temizleme
  const cleanText = (text) => {
    if (!text) return "";
    return text
      .replace(/<\/?br>/g, "") // <br> etiketlerini kaldır
      .replace(/[\r\n]+/g, " ") // Satır başlarını tek boşlukla değiştir
      .replace(/&nbsp;/g, " "); // &nbsp; karakterlerini boşlukla değiştir
  };

  const handleOpenEventPage = () => {
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

  const eventStartDate = new Date(event.EtkinlikBaslamaTarihi);
  const eventEndDate = new Date(event.EtkinlikBitisTarihi);

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
            <Text style={styles.description}>
              {cleanText(event.KisaAciklama)}
            </Text>
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


            <View style={styles.dateContainer}>

              <View
                style={{
                  display: "flex",
                  justifyContent: "space-evenly",
                  flexDirection: "row",
                  alignItems: "center",

                }}
              >
              
                <FontAwesome
                  name="calendar"
                  size={24}
                  color="white"
                  style={styles.icon}
                />
                {isSameDay(
                  event.EtkinlikBaslamaTarihi,
                  event.EtkinlikBitisTarihi
                ) ? (
                  <Text style={styles.detailText}>
                    Tarih: {formatDate(event.EtkinlikBaslamaTarihi)}
                  </Text>
                ) : (
                  <>
                    <View>
                      <Text style={styles.detailText}>
                        Başlangıç: {formatDate(event.EtkinlikBaslamaTarihi)}
                      </Text>
                      <Text style={styles.detailText}>
                        Bitiş: {formatDate(event.EtkinlikBitisTarihi)}
                      </Text>
                    </View>
                  </>
                )}
              </View>

              <View style={styles.timeContainer}>
                <Text style={styles.timeText}>
                  {formatTime(event.EtkinlikBaslamaTarihi)}
                </Text>
                <Text style={styles.timeText}>
                  {formatTime(event.EtkinlikBitisTarihi)}
                </Text>
              </View>

            </View>
          </View>
          <TouchableOpacity style={styles.button} onPress={handleOpenEventPage}>
            <Text style={styles.buttonText}>Etkinlik Sayfası</Text>
          </TouchableOpacity>
          {event.BiletSatisLinki && (
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
    flexShrink: 1,
  },
  description: {
    fontSize: 16,
    color: "#CCCCCC",
    flexShrink: 1,
  },
  detailText: {
    fontSize: 14,
    color: "#CCCCCC",
  },
  dateContainer: {
    flexDirection: "row",
 justifyContent: "space-between",
    width: "100%",
    alignItems: "center",
  },
  timeContainer: {
    backgroundColor: "#2D2D2D", // Saat bilgileri için arka plan rengi
    borderRadius: 8,
 justifyContent:"space-between",
    alignItems: "center",
  },
  timeText: {
    fontSize: 14,
    color: "#FFaaFF",
    width: 50,
    textAlign: "center",
    padding: 2,
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
