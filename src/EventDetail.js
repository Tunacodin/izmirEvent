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
  const [coordinateX, setCoordinateX] = useState(null);
  const [coordinateY, setCoordinateY] = useState(null);
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
      setCoordinateX(data.EtkinlikMerkezi.KoordinatX);
      setCoordinateY(data.EtkinlikMerkezi.KoordinatY);
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
        Alert.error("Etkinliğimiz Ücretsizdir");
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
      Alert.alert("Etkinlik Takvime Eklendi");

      // Takvim uygulamasını açma
      const isIOS = Platform.OS === "ios";
      const calendarAppUrl = isIOS
        ? "calshow://"
        : "content://com.android.calendar/time/";

      Linking.openURL(calendarAppUrl).catch((err) =>
        console.error("Error opening calendar:", err)
      );
    } catch (error) {
      Alert.alert("Etkinlik Takvime Eklenemedi");
      console.error("Error adding event to calendar:", error);
    }
  };

  const handleShowOnMap = async () => {
    setLoading(true);

    try {
      if (!coordinateX || !coordinateY) {
        console.log("koordina3", coordinateX, coordinateY);

        await fetchSessionDetails();
        console.log("koordinat4", coordinateX, coordinateY);
      }
      if (coordinateX != null && coordinateY != null) {
        const formattedCoordinateX = coordinateX.toString().replace(",", ".");
        const formattedCoordinateY = coordinateY.toString().replace(",", ".");
        const url = `https://www.google.com/maps/search/?api=1&query=${formattedCoordinateX},${formattedCoordinateY}`;
        await Linking.openURL(url);
      } else {
      }
    } catch (error) {
      console.error("An error occurred:", error);
      Alert.alert("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
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
            {sessionDetails && (
              <Image
                source={{ uri: eventCenter.Resim }}
                style={styles.centerImage}
              />
            )}
            <ScrollView showsHorizontalScrollIndicator={false}>
              {sessionDetails && (
                <>
                  <View
                    style={{
                      padding: 16,
                    }}
                  >
                    {eventCenter && (
                      <>
                        <Text style={styles.centerName}>{eventCenter.Adi}</Text>
                        <Text style={styles.centerDescription}>
                          {cleanText(eventCenter.Aciklama)}
                        </Text>
                        {eventCenter.Adres && (
                          <View style={styles.addressContainer}>
                            <Text style={styles.addressLabel}>Adres:</Text>
                            <Text style={styles.address}>
                              {cleanText(eventCenter.Adres)}
                            </Text>
                          </View>
                        )}
                        {eventCenter.Telefon && (
                          <Text style={styles.phone}>
                            Telefon: {cleanText(eventCenter.Telefon)}
                          </Text>
                        )}
                        {eventCenter.Iletisim && (
                          <View>
                            <Text style={styles.contactLabel}>İletişim:</Text>
                            <Text style={styles.contact}>
                              {cleanText(eventCenter.Iletisim)}
                            </Text>
                          </View>
                        )}
                      </>
                    )}
                  </View>
                </>
              )}
            </ScrollView>
            <View
              style={{
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 16,
                width: "100%",
              }}
            >
              <TouchableOpacity
                style={styles.webButton}
                onPress={handleOpenEventPage}
              >
                <FontAwesome
                  name="link"
                  size={20}
                  color="white"
                  style={styles.icon}
                />
                <Text style={styles.webButtonText}>Web Sayfasına Git</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.webButton}
                onPress={() => setModalVisible(!modalVisible)}
              >
                <FontAwesome
                  name="close"
                  size={20}
                  color="white"
                  style={styles.icon}
                />
                <Text style={styles.webButtonText}>Kapat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
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

          <TouchableOpacity
            style={[styles.button, event.UcretsizMi && styles.disabledButton]}
            onPress={() => {
              if (event.UcretsizMi) {
                Alert.alert("Bilgilendirme", "Etkinliğimiz Ücretsizdir");
              } else {
                handleBuyTicket();
              }
            }}
          >
            <Icon
              name="local-offer"
              size={20}
              color="#121212"
              style={styles.icon}
            />
            <Text style={styles.buttonText}>Bilet Satın Al</Text>
          </TouchableOpacity>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.calenderButton}
              onPress={handleAddToCalendar}
            >
              <Icon name="calendar-today" size={30} color="#FFF" />
              <Text style={{ color: "#FFF", fontWeight: "600" }}>
                Takvime Ekle
              </Text>
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
    height: 250,
    borderRadius: 10,
    resizeMode: "contain",
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
    backgroundColor: "white",
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 6,
  },
  calenderButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "white",
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
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  modalContent: {
    width: "90%",
    maxHeight: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  centerImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
    borderRadius: 10,
    marginBottom: 20,
  },
  centerName: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  centerDescription: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  addressContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  addressLabel: {
    fontWeight: "bold",
  },
  address: {
    flex: 1,
    marginLeft: 5,
  },
  phone: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
  contactLabel: {
    fontWeight: "bold",
    textAlign: "left",
    marginBottom: 5,
  },
  contact: {
    textAlign: "left",
    marginBottom: 10,
  },
  webButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",

    minHeight: 50,
    width: "70%",
  },
  webButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    textAlign: "center",
  },
  disabledButton: {
    backgroundColor: "#A9A9A9", // Gri tonları
  },
  closeButton: {
    backgroundColor: colors.button,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 10,
    width: "70%",
    alignSelf: "center",
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
    height: 40,
  },
});

export default EventDetail;
