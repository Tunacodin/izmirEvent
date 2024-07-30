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

const EventList = ({ navigation }) => {
  const dispatch = useDispatch();
  const events = useSelector((state) => state.events.events);
  const eventStatus = useSelector((state) => state.events.status);
  const error = useSelector((state) => state.events.error);

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEvents, setFilteredEvents] = useState(events);
  const [selectedTypes, setSelectedTypes] = useState(new Set());
  const [selectedPrice, setSelectedPrice] = useState(""); // Yeni eklenen durum
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false); // Yenileme durumu

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
    let filteredData = events;

    if (searchTerm) {
      filteredData = filteredData.filter((item) =>
        item.Adi.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedTypes.size > 0) {
      filteredData = filteredData.filter((item) => {
        const eventType = item.Tur.toLowerCase();
        const selectedTypesArray = Array.from(selectedTypes).map((type) =>
          type.toLowerCase()
        );
        return selectedTypesArray.includes(eventType);
      });
    }

    if (selectedPrice) {
      filteredData = filteredData.filter((item) =>
        selectedPrice === "free" ? item.UcretsizMi : !item.UcretsizMi
      );
    }

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
          {item.UcretsizMi ? "Ücretsiz" : "Ücretli"}
        </Text>
        <Text style={styles.labelType}>{item.Tur}</Text>
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
        <Text style={styles.itemDescription} numberOfLines={2}>
          {item.KisaAciklama}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (eventStatus === "loading" && !isLoadingMore) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  } else if (eventStatus === "failed") {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Bağlantı hatası. Lütfen tekrar deneyin.
        </Text>
        <TouchableOpacity onPress={refreshEvents} style={styles.retryButton}>
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
            placeholder="Etkinlikleri Ara..."
            value={searchTerm}
            onChangeText={handleSearch}
          />
          <TouchableOpacity onPress={openModal} style={styles.filterButton}>
            <Ionicons name="filter" size={24} color="gray" />
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
              <ActivityIndicator size="large" color="#0000ff" />
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
                onPress={closeModal}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseButtonText}>Kapat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#121212", // Siyah arka plan
    paddingTop: Platform.OS === "ios" ? 60 : 40,
  
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#ddd",
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
  },
  filterButton: {
    padding: 10,
  },
  listContent: {
    flexGrow: 1,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  itemContainer: {
    flex: 1,
    backgroundColor: "#fff",
    margin: 8,
    borderRadius: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  labelContainer: {
    padding: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  labelFree: {
    color: "green",
  },
  labelPaid: {
    color: "red",
  },
  labelType: {
    color: "gray",
    //tür etiketi sinema ise background mavi olacak
    
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  itemImage: {
    width: "100%",
    height: 100,
  },
  itemTextContainer: {
    padding: 8,
  },
  itemTitle: {
    fontWeight: "bold",
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
    marginBottom: 16,
  },
  retryButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#2196F3",
    alignItems: "center",
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default EventList;
