import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export default function TestSupabase() {
  const [result, setResult] = useState("Test en cours...");

  useEffect(() => {
    const testConnexion = async () => {
      try {
        console.log("=== TEST CONNEXION SUPABASE ===");

        const { data, error, status } = await supabase
          .from("themes")
          .select("*");

        console.log("Status:", status);
        console.log("Error:", error);
        console.log("Data:", data);

        if (error) {
          setResult(`❌ Erreur: ${error.message}`);
        } else {
          setResult(`✅ ${data?.length || 0} thèmes trouvés`);
        }
      } catch (err) {
        setResult(`❌ Erreur catch: ${err.message}`);
        console.error("Erreur catch:", err);
      }
    };

    testConnexion();
  }, []);

  return (
    <div style={{ padding: "50px", fontSize: "20px", textAlign: "center" }}>
      <h1>Test Supabase</h1>
      <p>{result}</p>
      <p>Regardez la console pour plus de détails</p>
    </div>
  );
}
