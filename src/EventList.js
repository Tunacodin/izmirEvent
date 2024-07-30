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
        source={{ uri: item.Resim }}
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
        <Text style={styles.errorText}>Error: {error}</Text>
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
    backgroundColor: "#f4f4f4",
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
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  searchInput: {
    height: 40,
    flex: 1,
    paddingHorizontal: 10,
  },
  filterButton: {
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  filterButtonText: {
    fontSize: 16,
    color: "#000",
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  filterButton: {
    backgroundColor: "#ddd",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: "center",
  },
  filterButtonText: {
    fontSize: 16,
    color: "#000",
  },
  itemContainer: {
    flex: 1,
    backgroundColor: "#fff",
    margin: 8,
    borderRadius: 8,
    overflow: "hidden",
    elevation: 2,
  },
  labelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 8,
  },
  labelFree: {
    backgroundColor: "#4CAF50",
    color: "#fff",
    padding: 4,
    borderRadius: 5,
    fontSize: 12,
  },
  labelPaid: {
    backgroundColor: "#F44336",
    color: "#fff",
  },
  labelType: {
    backgroundColor: "#E0E0E0",
    padding: 4,
    borderRadius: 5,
    fontSize: 12,
  },
  itemImage: {
    width: "100%",
    height: 120,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  itemTextContainer: {
    padding: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  itemDescription: {
    fontSize: 14,
    color: "#757575",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  filterOptionContainer: {
    marginBottom: 16,
  },
  filterOptionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  filterOptionButton: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ddd",
    marginVertical: 4,
    alignItems: "center",
  },
  filterOptionButtonSelected: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  filterOptionButtonText: {
    fontSize: 16,
    color: "#000",
  },
  modalCloseButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#2196F3",
    alignItems: "center",
  },
  modalCloseButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: "#F44336",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default EventList;
