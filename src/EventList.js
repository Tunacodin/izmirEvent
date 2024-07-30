import React, { useEffect, useState, useCallback } from "react";
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

// Memoized EventCard component
const EventCard = React.memo(({ item, onPress }) => (
  <TouchableOpacity onPress={() => onPress(item)} style={styles.itemContainer}>
    <View style={styles.labelContainer}>
      <View
        style={[
          styles.labelFree,
          { backgroundColor: item.UcretsizMi ? "#4CAF50" : "#f44336" },
        ]}
      >
        <Text style={styles.labelText}>
          {item.UcretsizMi ? "Ücretsiz" : "Ücretli"}
        </Text>
      </View>
      <View style={[styles.labelType]}>
        <Text style={styles.labelText}>{item.Tur}</Text>
      </View>
    </View>
    <Image
      source={{ uri: item.KucukAfis }}
      style={styles.itemImage}
      onError={(e) => console.warn("Image loading error:", e.nativeEvent.error)}
    />
    <View style={styles.itemTextContainer}>
      <Text style={styles.itemTitle}>{item.Adi}</Text>
      <Text style={styles.itemDescription} numberOfLines={2}>
        {item.KisaAciklama}
      </Text>
    </View>
  </TouchableOpacity>
));

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
    filterEvents();
  }, [events, selectedTypes, searchTerm]);

  const filterEvents = () => {
    let filtered = events;

    if (selectedTypes.length > 0) {
      filtered = filtered.filter((event) => {
        const eventType = event.Tur ? event.Tur.trim().toLowerCase() : "";
        const typeMatch = selectedTypes
          .map((type) => type.trim().toLowerCase())
          .includes(eventType);
        return typeMatch;
      });
    }

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

  const renderItem = useCallback(
    ({ item }) => (
      <EventCard
        item={item}
        onPress={(event) => navigation.navigate("EventDetail", { event })}
      />
    ),
    [navigation]
  );

  const keyExtractor = useCallback((item) => item.Id.toString(), []);

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
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          getItemLayout={(data, index) => ({
            length: 200,
            offset: 200 * index,
            index,
          })}
          initialNumToRender={10}
        />
        <Modal
          transparent={true}
          visible={filterModalVisible}
          animationType="slide"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Filtrele</Text>

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
                      <Text
                        style={
                          selectedTypes.includes(type)
                            ? styles.selectedText
                            : null
                        }
                      >
                        {type}
                      </Text>
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
    position: "relative",
  },
  labelContainer: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  labelFree: {
    backgroundColor: "#4CAF50",
    color: "#fff",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
    fontSize: 12,
  },
  labelType: {
    backgroundColor: "#FF5722",
    color: "#fff",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
    fontSize: 12,
  },
  labelText: {
    color: "#fff",
    fontSize: 12,
  },
  itemImage: {
    width: "100%",
    height: 150,
    borderRadius: 8,
  },
  itemTextContainer: {
    padding: 10,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  itemDescription: {
    fontSize: 14,
    color: "#fff",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  filterSection: {
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
  },
  filterOption: {
    padding: 10,
    borderRadius: 5,
    margin: 5,
    backgroundColor: "#eee",
  },
  selectedOption: {
    backgroundColor: "#4CAF50",
  },
  selectedText: {
    color: "#fff",
  },
  modalCloseButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#4CAF50",
    alignItems: "center",
  },
  modalCloseText: {
    color: "#fff",
    fontSize: 16,
  },
  errorText: {
    color: "red",
  },
});

export default EventList;
