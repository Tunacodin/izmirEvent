import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Linking,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Modal,
  Button,
  ActivityIndicator,
  Platform,
} from "react-native";
import * as Calendar from "expo-calendar";
import { FontAwesome } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/MaterialIcons";
import { MaterialIcons } from "@expo/vector-icons";
const EventDetail = ({ route }) => {
  const { event } = route.params;
  const [hasCalendarPermission, setHasCalendarPermission] = useState(false);
  const [defaultCalendarId, setDefaultCalendarId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [sessionDetails, setSessionDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const sessionDetailsURL = `https://openapi.izmir.bel.tr/api/ibb/kultursanat/etkinlikler/${event.Id}`;

  useEffect(() => {
    (async () => {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status === "granted") {
        setHasCalendarPermission(true);
        const calendars = await Calendar.getCalendarsAsync(
          Calendar.EntityTypes.EVENT
        );
        const defaultCalendar =
          calendars.find((cal) => cal.isPrimary) || calendars[0];
        setDefaultCalendarId(defaultCalendar.id);
      }
    })();
  }, []);

  useEffect(() => {
    if (modalVisible) {
      fetchSessionDetails();
    }
  }, [modalVisible]);

  const fetchSessionDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(sessionDetailsURL);
      const data = await response.json();
      setSessionDetails(data);
    } catch (error) {
      Alert.alert("Error fetching session details.");
      console.error("Error fetching session details:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, "0")} ${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")} ${date.getFullYear()}`;
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return `${date.getHours().toString().padStart(2, "0")}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  };

  const isSameDay = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return (
      start.getFullYear() === end.getFullYear() &&
      start.getMonth() === end.getMonth() &&
      start.getDate() === end.getDate()
    );
  };

  const cleanText = (text) => {
    if (!text) return "";
    return text
      .replace(/<\/?[^>]+(>|$)/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&[a-zA-Z0-9#]{2,5};/g, "")
      .replace(/[\r\n]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  const handleOpenEventPage = () => {
    const eventURL = event.EtkinlikUrl;
    const url = `https://kultursanat.izmir.bel.tr/Etkinlikler/${eventURL}`;

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
      if (url.startsWith("http://") || url.startsWith("https://")) {
        Linking.openURL(url).catch((err) =>
          console.error("An error occurred while opening the ticket page", err)
        );
      } else {
        console.error("Invalid URL format", url);
      }
    }
  };

  const handleAddToCalendar = async () => {
    if (!hasCalendarPermission) {
      Alert.alert("Calendar permission is required.");
      return;
    }

    try {
      const eventDetails = {
        title: event.Adi,
        startDate: new Date(event.EtkinlikBaslamaTarihi),
        endDate: new Date(event.EtkinlikBitisTarihi),
        timeZone: "GMT",
        location: event.EtkinlikMerkezi,
      };

      await Calendar.createEventAsync(defaultCalendarId, eventDetails);
      Alert.alert("Event added to calendar successfully.");
    } catch (error) {
      Alert.alert("An error occurred while adding the event to the calendar.");
      console.error("Error adding event to calendar:", error);
    }
  };

  const handleShowOnMap = () => {
    const { KoordinatX, KoordinatY } = sessionDetails?.EtkinlikMerkezi || {};
    if (KoordinatX !== undefined && KoordinatY !== undefined) {
      const formattedKoordinatX = KoordinatX.toString().replace(",", ".");
      const formattedKoordinatY = KoordinatY.toString().replace(",", ".");
      const url = `https://www.google.com/maps/search/?api=1&query=${formattedKoordinatX},${formattedKoordinatY}`;

      Linking.openURL(url).catch((err) =>
        console.error("An error occurred while opening the map", err)
      );
    } else {
      const coordinatesMessage = `Koordinat X: ${
        KoordinatX || "Bilinmiyor"
      }, Koordinat Y: ${KoordinatY || "Bilinmiyor"}`;
      Alert.alert("Koordinatlar bulunamadı.", coordinatesMessage);
    }
  };

const renderMoreInfo = () => {
  

  const eventCenter = sessionDetails?.EtkinlikMerkezi;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(!modalVisible)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <ScrollView>
           
            {sessionDetails && (
              <>
               
                {eventCenter && (
                  <>
                    <Text style={styles.modalSectionTitle}>
                      Etkinlik Merkezi 
                    </Text>
                    <Image
                      source={{ uri: eventCenter.Resim }}
                      style={styles.centerImage}
                    />
                    <Text style={styles.modalText}>{eventCenter.Adi}</Text>
                    <Text style={styles.modalText}>
                      {cleanText(eventCenter.Aciklama)}
                    </Text>
                    <Text style={styles.modalText}>
                      Adres: {cleanText(eventCenter.Adres)}
                    </Text>
                    <Text style={styles.modalText}>
                      Phone: {cleanText(eventCenter.Telefon)}
                    </Text>
                   
                    <Text style={styles.modalText}>
                      İletişim: {cleanText(eventCenter.Hakkinda)}
                    </Text>
                    <TouchableOpacity
                      style={styles.mapButton}
                      onPress={handleOpenEventPage}
                    >
                      <Text style={styles.mapButtonText}>Web Sayfasına Git</Text>
                    </TouchableOpacity>
                  </>
                )}
              </>
            )}
          </ScrollView>
          <Button
            title="Close"
            onPress={() => setModalVisible(!modalVisible)}
          />
        </View>
      </View>
    </Modal>
  );
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
              <View style={styles.dateAndTimeContainer}>
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
          <TouchableOpacity
            style={styles.button}
            onPress={() => setModalVisible(!modalVisible)}
          >
            <Icon name="info" size={24} color="#121212" style={styles.icon} />
            <Text style={styles.buttonText}>Detaylar</Text>
          </TouchableOpacity>

          {event.BiletSatisLinki && (
            <TouchableOpacity style={styles.button} onPress={handleBuyTicket}>
              <Icon
                name="local-offer"
                size={20}
                color="#FFFFFF"
                style={styles.icon}
              />
              <Text style={styles.buttonText}>Bilet Satın Al</Text>
            </TouchableOpacity>
          )}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.calenderButton}
              onPress={handleAddToCalendar}
            >
              <Icon name="calendar-today" size={30} color="#FFF" />
              <Text style={{color:"#FFF",fontWeight:"600"}}>Takvime Ekle</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor: "white",

                borderRadius: 10,
                paddingVertical: 12,
                paddingHorizontal: 16,
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                height: 80,
              }}
              onPress={handleShowOnMap}
            >
              <Text>
                <MaterialIcons name="location-on" size={32} color="blue" />{" "}
              </Text>
              <View>
                <Text
                  style={{
                    color: "blue",
                    fontSize: 14,

                    fontWeight: "600",
                  }}
                >
                  Haritada Aç
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      {renderMoreInfo()}
    </SafeAreaView>
  );
};

const colors = {
  button: "#C147E9",
  buttonBorder: "#2D033B",
  darkBlack: "#121212",
  white: "#1E1E1E",
 
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkBlack, // Siyah arka plan
  },
  scrollContainer: {
    flexGrow: 1,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    resizeMode: "cover",
  },
  detailsContainer: {
    flex: 1,
    padding: 12,

    width: "100%",
    justifyContent: "center", //
  },
  card: {
    backgroundColor: colors.white, // Koyu gri arka plan
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row", // Align items horizontally
    alignItems: "center", // Center items vertically
  },
  icon: {
    marginRight: 12, // Space between icon and text
  },
  title: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "bold",
    flex: 1, // Allow title to take up remaining space
  },
  description: {
    fontSize: 16,
    color: "#FFFFFF",
    flex: 1, // Allow description to take up remaining space
  },
  detailText: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateAndTimeContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  timeContainer: {
    alignItems: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 1)",
    borderRadius: 10,
    padding: 4,
  },
  timeText: {
    fontSize: 16,
    color: "#BB86FC",
  },
  button: {
    backgroundColor:"white",
    borderRadius: 10,
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 8,
    width: "60%",
    alignSelf: "center",
  },
  buttonContainer: {
    backgroundColor: "rgba(0, 0, 0, 1)",
    borderRadius: 10,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 6,
  },
  calenderButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor:"white",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 80,
  },
  mapButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "blue",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    height: 80,
  },
  mapButtonText: {
    color: "blue",
  },
  buttonText: {
    fontSize: 14,
    color: colors.white,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    width: "90%",
    height: "80%",
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 16,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 16,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  sessionCard: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  sessionText: {
    fontSize: 16,
    marginBottom: 4,
  },
  centerImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
    borderRadius: 8,
    marginBottom: 12,
  },
  mapButton: {
    backgroundColor: "#C147E9",
    borderWidth: 1,
    borderColor: "#C147E9",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: "center",
  },
  mapButtonText: {
    color: "white",
    fontSize: 16,
  },
});

export default EventDetail;
