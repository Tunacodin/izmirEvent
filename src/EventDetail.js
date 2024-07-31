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
} from "react-native";
import * as Calendar from "expo-calendar";
import { FontAwesome } from "@expo/vector-icons";

const EventDetail = ({ route }) => {
  const { event } = route.params;
  const [hasCalendarPermission, setHasCalendarPermission] = useState(false);
  const [defaultCalendarId, setDefaultCalendarId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [sessionDetails, setSessionDetails] = useState(null);
  const [loading, setLoading] = useState(false);
const [KoordinatX, setKoordinatX] = useState(null);
  const [KoordinatY, setKoordinatY] = useState(null);
  
  const sessionDetailsURL = `https://openapi.izmir.bel.tr/api/ibb/kultursanat/etkinlikler/${event.Id}`; // Use provided API URL

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
      console.log(data);
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
      .replace(/<\/?[^>]+(>|$)/g, "") // HTML etiketlerini temizle
      .replace(/&nbsp;/g, " ") // HTML boşluk karakterlerini temizle
      .replace(/&[a-zA-Z0-9#]{2,5};/g, "") // HTML karakter referanslarını temizle
      .replace(/[\r\n]+/g, " ") // Satır sonlarını temizle
      .replace(/\s+/g, " ") // Fazla boşlukları tek bir boşlukla değiştir
      .trim(); // Baş ve sondaki boşlukları temizle
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

      const eventId = await Calendar.createEventAsync(
        defaultCalendarId,
        eventDetails
      );
      Alert.alert("Event added to calendar successfully.");
    } catch (error) {
      Alert.alert("An error occurred while adding the event to the calendar.");
      console.error("Error adding event to calendar:", error);
    }
  };

const handleShowOnMap = () => {
  const { KoordinatX, KoordinatY } = event.Id;
  if (KoordinatX !== undefined && KoordinatY !== undefined) {
    // Replace commas with dots
    const formattedKoordinatX = KoordinatX.toString().replace(",", ".");
    const formattedKoordinatY = KoordinatY.toString().replace(",", ".");

    // Log the formatted coordinates
    console.log(
      "Formatted Coordinates:",
      formattedKoordinatX,
      formattedKoordinatY
    );

    // Construct the URL
    const url = `https://www.google.com/maps/search/?api=1&query=${formattedKoordinatX},${formattedKoordinatY}`;

    // Log the URL
    console.log("Generated URL:", url);

    // Open the URL
    Linking.openURL(url).catch((err) =>
      console.error("An error occurred while opening the map", err)
    );
  } else {
    Alert.alert("Koordinatlar bulunamadı.");
    Alert.alert("Koordinatlar:", KoordinatX, KoordinatY); 
  }
};


  const renderMoreInfo = () => {
    if (loading) {
      
      return (
        
        <View style={styles.modalView}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Loading session details...</Text>
        </View>
      );
    }

    const eventCenter = sessionDetails?.EtkinlikMerkezi;

    return (
      <Modal
        renderItem={({ item }) => <ListItem item={item} />}
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>More Information</Text>
              <Text style={styles.modalText}>
                {cleanText(event.KisaAciklama)}
              </Text>
              {sessionDetails && (
                <>
                  <Text style={styles.modalSectionTitle}>Session Details</Text>
                  {sessionDetails.SeansListesi.map((session, index) => (
                    <View key={index} style={styles.sessionCard}>
                      <Text style={styles.sessionText}>
                        Start: {formatDate(session.SeansBaslangicTarihi)}{" "}
                        {formatTime(session.SeansBaslangicTarihi)}
                      </Text>
                      <Text style={styles.sessionText}>
                        End: {formatDate(session.SeansBitisTarihi)}{" "}
                        {formatTime(session.SeansBitisTarihi)}
                      </Text>
                      <Text style={styles.sessionText}>
                        Occupancy: {session.DolulukOranı * 100}%
                      </Text>
                      <Text style={styles.sessionText}>
                        {cleanText(session.BiletSatisAciklama)}
                      </Text>
                    </View>
                  ))}
                  {eventCenter && (
                    <>
                      <Text style={styles.modalSectionTitle}>
                        Event Center Details
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
                        Address: {cleanText(eventCenter.Adres)}
                      </Text>
                      <Text style={styles.modalText}>
                        Phone: {cleanText(eventCenter.Telefon)}
                      </Text>
                      <Text style={styles.modalText}>
                        Coordinates: {eventCenter.KoordinatX},{" "}
                        {eventCenter.KoordinatY}
                      </Text>
                      <Text style={styles.modalText}>
                        Contact Info: {cleanText(eventCenter.Hakkinda)}
                      </Text>
                    </>
                  )}
                </>
              )}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(!modalVisible)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.headerContainer}>
          <Text style={styles.eventTitle}>{event.Adi}</Text>
          {event.Gorsel && (
            <Image source={{ uri: event.Gorsel }} style={styles.eventImage} />
          )}
          <Text style={styles.eventDate}>
            {formatDate(event.EtkinlikBaslamaTarihi)} -{" "}
            {formatDate(event.EtkinlikBitisTarihi)}
          </Text>
          <Text style={styles.eventTime}>
            {formatTime(event.EtkinlikBaslamaTarihi)} -{" "}
            {formatTime(event.EtkinlikBitisTarihi)}
          </Text>
          <Text style={styles.eventLocation}>
            Location: {event.EtkinlikMerkezi}
          </Text>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleOpenEventPage}>
            <Text style={styles.buttonText}>Open Event Page</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleBuyTicket}>
            <Text style={styles.buttonText}>Buy Ticket</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleAddToCalendar}>
            <Text style={styles.buttonText}>Add to Calendar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.buttonText}>More Info</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleShowOnMap}>
            <Text style={styles.buttonText}>Show on Map</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {renderMoreInfo()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerContainer: {
    padding: 16,
    alignItems: "center",
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  eventImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
    marginVertical: 8,
  },
  eventDate: {
    fontSize: 16,
    color: "#555",
  },
  eventTime: {
    fontSize: 16,
    color: "#555",
  },
  eventLocation: {
    fontSize: 16,
    color: "#555",
  },
  buttonContainer: {
    padding: 16,
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
  },
  sessionCard: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ddd",
    marginVertical: 5,
  },
  sessionText: {
    fontSize: 14,
  },
  centerImage: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
    marginVertical: 10,
  },
  closeButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#fff",
    marginTop: 10,
  },
});

export default EventDetail;
