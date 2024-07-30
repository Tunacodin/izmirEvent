import React from "react";
import { render, screen } from "@testing-library/react-native";
import EventDetail from "./EventDetail";

const mockEvent = {
  Adi: "Test Event",
  KisaAciklama: "This is a test event.",
  Resim: "https://example.com/test.jpg",
  EtkinlikMerkezi: "Test Venue",
  EtkinlikBaslamaTarihi: "2024-07-30T20:00:00",
  EtkinlikBitisTarihi: "2024-07-30T22:00:00",
  EtkinlikUrl: "test-event",
};

test("renders event details correctly", () => {
  render(<EventDetail route={{ params: { event: mockEvent } }} />);

  expect(screen.getByText("Test Event")).toBeTruthy();
  expect(screen.getByText("This is a test event.")).toBeTruthy();
  expect(screen.getByText("Test Venue")).toBeTruthy();
});
