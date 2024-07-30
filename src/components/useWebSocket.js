import { useState, useEffect } from "react";

const useWebSocket = (url) => {
  const [data, setData] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const wsUrl = "https://openapi.izmir.bel.tr/api/ibb/kultursanat/etkinlikler"; // Gerçek WebSocket URL'nizi buraya girin

  useEffect(() => {
    // URL'nin WebSocket URL'si olduğundan emin olun
    if (!url || (!url.startsWith("ws://") && !url.startsWith("wss://"))) {
      console.error("Geçerli bir WebSocket URL'si girin");
      return;
    }

    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log("WebSocket bağlantısı açıldı");
      setIsConnected(true);
      setError(null);
    };

    socket.onmessage = (event) => {
      console.log("Mesaj alındı:", event.data);
      // JSON verisi işleme
      try {
        const parsedData = JSON.parse(event.data);
        setData(parsedData);
      } catch (e) {
        console.error("Mesajın ayrıştırılması başarısız oldu:", e);
        setError("Mesajın ayrıştırılması başarısız oldu");
      }
    };

    socket.onerror = (event) => {
      console.error("WebSocket hatası:", event);
      setIsConnected(false);
      setError("WebSocket hatası oluştu");
    };

    socket.onclose = (event) => {
      console.log("WebSocket bağlantısı kapandı", event.reason);
      setIsConnected(false);
      // Tekrar bağlanma mantığı eklenebilir
    };

    return () => {
      socket.close();
    };
  }, [url]);

  return { data, isConnected, error };
};

export default useWebSocket;
