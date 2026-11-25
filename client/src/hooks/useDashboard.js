import { useEffect, useState } from "react";
import API from "../api/axios";

export default function useDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get("/dashboard")
      .then((r) => setData(r.data))
      .catch((err) => setError(err.response?.data?.message || "Could not load dashboard"));
  }, []);

  return { data, error };
}