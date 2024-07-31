import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  events: [],
  selectedEvent: null,
  status: "idle",
  error: null,
};

export const fetchEvents = createAsyncThunk("events/fetchEvents", async () => {
  const response = await axios.get(
    "https://openapi.izmir.bel.tr/api/ibb/kultursanat/etkinlikler"
  );
  return response.data;
});

export const fetchEventDetails = createAsyncThunk(
  "events/fetchEventDetails",
  async (eventId) => {
    const response = await axios.get(
      `https://openapi.izmir.bel.tr/api/ibb/kultursanat/etkinlikler/${eventId}`
    );
    return response.data;
  }
);

const eventsSlice = createSlice({
  name: "events",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.events = action.payload;
        state.error = null;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(fetchEventDetails.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchEventDetails.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.selectedEvent = action.payload;
        state.error = null;
      })
      .addCase(fetchEventDetails.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        state.selectedEvent = null;
      });
  },
});

export default eventsSlice.reducer;
