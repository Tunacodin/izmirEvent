import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchEvents } from "./eventsSlice";
import {
  FlatList,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  TextInput,
  Platform,
  Modal,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const EventList = ({ navigation }) => {
  const dispatch = useDispatch();
  const events = useSelector((state) => state.events.events);
  const eventStatus = useSelector((state) => state.events.status);
  const error = useSelector((state) => state.events.error);

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState([]);

  useEffect(() => {
    if (eventStatus === "idle") {
      dispatch(fetchEvents());
    }
  }, [eventStatus, dispatch]);

  useEffect(() => {
    if (events.length) {
      filterEvents();
    }
  }, [events, selectedTypes]);

  const filterEvents = () => {
    let filtered = events;

    if (selectedTypes.length > 0) {
      filtered = filtered.filter((event) => selectedTypes.includes(event.Tur));
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((item) =>
        item.Adi.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  };

  const handleSearch = (text) => {
    setSearchTerm(text);
  };

  const handleTypeSelect = (type) => {
    setSelectedTypes((prevTypes) => {
      const updatedTypes = prevTypes.includes(type)
        ? prevTypes.filter((item) => item !== type)
        : [...prevTypes, type];
      return updatedTypes;
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("EventDetail", { event: item })}
      style={styles.itemContainer}
    >
      <View style={styles.labelContainer}>
        <Text style={styles.labelFree}>
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

  if (eventStatus === "loading") {
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
          <Ionicons
            name="search"
            size={24}
            color="gray"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search events..."
            value={searchTerm}
            onChangeText={handleSearch}
            onEndEditing={filterEvents}
          />
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setFilterModalVisible(true)}
          >
            <Ionicons name="filter" size={24} color="gray" />
            <Text style={styles.filterText}>Filtrele</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={filteredEvents}
          renderItem={renderItem}
          keyExtractor={(item) => item.Id.toString()}
          contentContainerStyle={styles.listContent}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
        />
        <Modal
          transparent={true}
          visible={filterModalVisible}
          animationType="slide"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Filtrele</Text>

              {/* Type Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>
                  Türe Göre Filtrele
                </Text>
                <View style={styles.filterOptions}>
                  {["Sinema", "Tiyatro", "Konser", "Sergi"].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.filterOption,
                        selectedTypes.includes(type) && styles.selectedOption,
                      ]}
                      onPress={() => handleTypeSelect(type)}
                    >
                      <Text>{type}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <Pressable
                style={styles.modalCloseButton}
                onPress={() => {
                  filterEvents();
                  setFilterModalVisible(false);
                }}
              >
                <Text style={styles.modalCloseText}>Kapat</Text>
              </Pressable>
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
    padding: 5,
    backgroundColor: "#ccc",
    paddingTop: Platform.OS === "ios" ? 60 : 40,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingLeft: 10,
    backgroundColor: "#fff",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    position: "relative",
  },
  searchIcon: {
    position: "absolute",
    left: 10,
    top: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingLeft: 35,
    paddingRight: 10,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 15,
  },
  filterText: {
    marginLeft: 5,
  },
  listContent: {
    paddingBottom: 100,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  itemContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 8,
    margin: 5,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    
  },
  labelContainer: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 10,
    borderRadius: 5,
  },
  labelFree: {
    color: "#fff",
    fontSize: 12,
  },
  labelType: {
    color: "#fff",
    fontSize: 12,
    marginTop: 5,
  },
  itemImage: {
    width: "100%",
    height: 130,
    borderRadius: 8,
    marginBottom: 10,
    resizeMode: "cover",
  },
  itemTextContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#eee",
    marginBottom: 5,
    textAlign: "center",
    width: "90%",
    marginBottom: 10,
  },
  itemDescription: {
    fontSize: 14,
    color: "#bbb",
    textAlign: "center",
    width: "90%",
    height: 60,
  },
  loadingText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
  },
  errorText: {
    fontSize: 18,
    textAlign: "center",
    color: "red",
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  filterSection: {
    width: "100%",
    marginBottom: 20,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  filterOption: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    backgroundColor: "#f1f1f1",
    margin: 5,
    alignItems: "center",
  },
  selectedOption: {
    backgroundColor: "#007bff",
    color: "#fff",
  },
  modalCloseButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#f1f1f1",
    borderRadius: 5,
  },
  modalCloseText: {
    color: "#007bff",
  },
});

export default EventList;
