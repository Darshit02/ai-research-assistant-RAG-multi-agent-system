import api from "./axios";

export const sendMessage = async (message: string) => {
  const res = await api.post("/chat", {
    message,
  });

  return res.data;
};