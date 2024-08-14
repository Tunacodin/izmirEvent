import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Platform,
  StyleSheet,
  Modal,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useSelector, useDispatch } from "react-redux";
import { fetchEvents } from "./eventsSlice";
import { FontAwesome } from "@expo/vector-icons";

const EventList = ({ navigation }) => {
  const dispatch = useDispatch();
  const events = useSelector((state) => state.events.events);
  const eventStatus = useSelector((state) => state.events.status);
  const error = useSelector((state) => state.events.error);
  const type = useSelector((state) => state.events.type);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEvents, setFilteredEvents] = useState(events);
  const [selectedTypes, setSelectedTypes] = useState(new Set());
  const [selectedPrice, setSelectedPrice] = useState(""); // Yeni eklenen durum
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false); // Yenileme durumu

const getLabelStyle = (type) => {
  let backgroundColor;
  let color;

  switch (type) {
    case "SİNEMA":
      backgroundColor = "#FF5733";

      color = "#fff"; // Beyaz metin
      break;
    case "TİYATRO":
      backgroundColor = "#C70039";
      color = "#fff"; // Beyaz metin
      break;
    case "SERGİ":
      backgroundColor = "#900C3F";
      color = "#fff"; // Beyaz metin
      break;
    case "KONSER":
      backgroundColor = "#581845";
      color = "#fff"; // Beyaz metin
      break;
    case "DİĞER":
      backgroundColor = "#DAF7A6";
      color = "#000"; // Siyah metin
      break;
    default:
      backgroundColor = "#ddd";
      color = "#000"; // Varsayılan siyah metin
      break;
  }

  return {
    backgroundColor,
    color,
  };
};

  useEffect(() => {
    if (eventStatus === "idle") {
      dispatch(fetchEvents());
    }
  }, [eventStatus, dispatch]);
  useEffect(() => {
    filterEvents();
  }, [events, searchTerm, selectedTypes, selectedPrice]); // selectedPrice eklenmiş
  const handleSearch = (text) => {
    setSearchTerm(text);
  };

  const handleTypeSelect = (type) => {
    setSelectedTypes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  };

  const handlePriceSelect = (price) => {
    setSelectedPrice(price === selectedPrice ? "" : price); // Toggle the selected price
  };

const filterEvents = () => {
  const filters = [
    (item) =>
      !searchTerm ||
      item.Adi.toLocaleLowerCase("tr-TR").includes(
        searchTerm.toLocaleLowerCase("tr-TR")
      ),
    (item) =>
      selectedTypes.size === 0 ||
      Array.from(selectedTypes).some(
        (type) =>
          item.Tur.toLocaleLowerCase("tr-TR") ===
          type.toLocaleLowerCase("tr-TR")
      ),
    (item) =>
      !selectedPrice ||
      (selectedPrice === "free" ? item.UcretsizMi : !item.UcretsizMi),
  ];

  const filteredData = events.filter((item) =>
    filters.every((filter) => filter(item))
  );

  setFilteredEvents(filteredData);
  
};

  const handleLoadMore = () => {
    if (eventStatus === "succeeded") {
      setIsLoadingMore(true);
      setTimeout(() => {
        setIsLoadingMore(false);
      }, 1000);
    }
  };

  const openModal = () => {
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  const refreshEvents = async () => {
    setIsRefreshing(true);
    try {
      await dispatch(fetchEvents());
    } catch (error) {
      console.warn("Error refreshing events:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("EventDetail", { event: item })}
      style={styles.itemContainer}
    >
      <View style={styles.labelContainer}>
        <Text style={[styles.labelFree, item.UcretsizMi && styles.labelPaid]}>
          {item.UcretsizMi ? "ÜCRETSİZ" : "ÜCRETLİ"}
        </Text>
        <Text
          style={[
            styles.labelType,
            
             
    getLabelStyle(item.Tur) // Arka plan ve metin rengi dinamik olarak ayarlanıyor
            
          ]}
        >
          {item.Tur}
        </Text>
      </View>
      <Image
        source={{ uri: item.KucukAfis }}
        style={styles.itemImage}
        onError={(e) =>
          console.warn("Image loading error:", e.nativeEvent.error)
        }
      />
      <View style={styles.itemTextContainer}>
        <Text style={styles.itemTitle}>{item.Adi}</Text>
      </View>
    </TouchableOpacity>
  );

  if (eventStatus === "loading" && !isLoadingMore) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  } else if (eventStatus === "failed") {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Bağlantı hatası. Lütfen tekrar deneyin.
        </Text>
        <TouchableOpacity onPress={refreshEvents} style={styles.retryButton}>
          <Ionicons name="reload" size={24} color="white" />
          <Text style={styles.retryButtonText}>Yeniden Dene</Text>
        </TouchableOpacity>
      </View>
    );
  } else {
    return (
      <View style={styles.container}>
        <View style={styles.searchContainer}>
        
          <TextInput
            style={styles.searchInput}
            placeholder="Etkinlikleri Ara"
            value={searchTerm}
            onChangeText={handleSearch}
          />
          <TouchableOpacity onPress={openModal} style={styles.filterButton}>
            <FontAwesome
              name="filter"
              size={26}
              color="gray"
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>
        <FlatList
          data={filteredEvents}
          renderItem={renderItem}
          keyExtractor={(item) => item.Id.toString()}
          contentContainerStyle={styles.listContent}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          onRefresh={refreshEvents} // Yenileme fonksiyonu
          refreshing={isRefreshing} // Yenileme durumu
          ListFooterComponent={() =>
            isLoadingMore ? (
              <ActivityIndicator size="large" color="#fff" />
            ) : null
          }
        />
        <Modal
          visible={isModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={closeModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Filtrele</Text>
              <View style={styles.filterOptionContainer}>
                <Text style={styles.filterOptionTitle}>Türe Göre Filtrele</Text>
                {["Sinema", "Tiyatro", "Sergi", "Konser", "Diğer"].map(
                  (type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.filterOptionButton,
                        selectedTypes.has(type) &&
                          styles.filterOptionButtonSelected,
                      ]}
                      onPress={() => handleTypeSelect(type)}
                    >
                      <Text style={styles.filterOptionButtonText}>{type}</Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
              <View style={styles.filterOptionContainer}>
                <Text style={styles.filterOptionTitle}>
                  Ücretli / Ücretsiz Filtrele
                </Text>
                <TouchableOpacity
                  style={[
                    styles.filterOptionButton,
                    selectedPrice === "free" &&
                      styles.filterOptionButtonSelected,
                  ]}
                  onPress={() => handlePriceSelect("free")}
                >
                  <Text style={styles.filterOptionButtonText}>Ücretsiz</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterOptionButton,
                    selectedPrice === "paid" &&
                      styles.filterOptionButtonSelected,
                  ]}
                  onPress={() => handlePriceSelect("paid")}
                >
                  <Text style={styles.filterOptionButtonText}>Ücretli</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.webButton}
                onPress={closeModal}
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
        </Modal>
      </View>
    );
  }
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
    padding: 10,
    backgroundColor: "#121212", // Siyah arka plan
    justifyContent: "center",
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#fff",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: "#fff",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    width: "96%",
    alignSelf: "center",
  },
  searchInput: {
    flex: 1,
    padding: 8,
    fontSize: 16,
    color: "#000",
  },
  filterButton: {
    padding: 10,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 20,
    
  },
  columnWrapper: {
    justifyContent: "space-between",
    elevation: 6,
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  itemContainer: {
    flex: 1,
    margin: 10,
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 5,
    overflow: "hidden",
    backgroundColor: "#1e1e1e",
  },
  labelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 5,
  },
  labelFree: {
    color: "#fff",
    backgroundColor: "#00ff00", // Yeşil arka plan
    padding: 3,
    borderRadius: 5,
    fontSize: 10,
  },
  labelPaid: {
    backgroundColor: "#ff0000", // Kırmızı arka plan
  },
  labelType: {
    color: "#fff",
    padding: 3,
    borderRadius: 5,
    fontSize: 10,
  },
  itemImage: {
    width: "100%",
    height: 150,
  },
  itemTextContainer: {
    padding: 10,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    color: "#fff",
  },
  itemDescription: {
    color: "gray",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  filterOptionContainer: {
    marginBottom: 16,
    width: "100%",
  },
  filterOptionTitle: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  filterOptionButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#ddd",
    marginBottom: 8,
    alignItems: "center",
  },
  filterOptionButtonSelected: {
    backgroundColor: "#2196F3",
  },
  filterOptionButtonText: {
    color: "#000",
  },
  modalCloseButton: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#2196F3",
  },
  modalCloseButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    width: "50%",
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#121212",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fff",
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "bold",
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
    color: "#000",
    backgroundColor: "rgba(0, 0, 0, 1)",
    borderRadius: 10,
    padding: 4,
  },
  timeText: {
    fontSize: 16,
    color: "#BB86FC",
  },
  button: {
    backgroundColor: "#BB86FC",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  buttonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "bold",
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
});

export default EventList;
