import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  FlatList,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const SearchEvents = ({ navigation }) => {
  const events = useSelector((state) => state.events.events);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEvents, setFilteredEvents] = useState(events);

  const handleSearch = (text) => {
    setSearchTerm(text);
    if (text) {
      const filteredData = events.filter((item) =>
        item.Adi.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredEvents(filteredData);
    } else {
      setFilteredEvents(events);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("EventDetail", { event: item })}
      style={styles.itemContainer}
    >
      <Image
        source={{ uri: item.Resim }}
        style={styles.itemImage}
        onError={(e) =>
          console.warn("Image loading error:", e.nativeEvent.error)
        } // Resim yükleme hatası kontrolü
      />
      <View style={styles.itemTextContainer}>
        <Text style={styles.itemTitle}>{item.Adi}</Text>
        <Text style={styles.itemDescription} numberOfLines={2}>
          {item.KisaAciklama}
        </Text>
      </View>
    </TouchableOpacity>
  );

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
        />
      </View>
      <FlatList
        data={filteredEvents}
        renderItem={renderItem}
        keyExtractor={(item) => item.Id.toString()}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingLeft: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    height: 40,
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  itemDescription: {
    fontSize: 14,
    color: "#555",
  },
});

export default SearchEvents;
