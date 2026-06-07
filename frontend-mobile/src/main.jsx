import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { GoogleOAuthProvider } from "@react-oauth/google";

ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId="14718482310-dg59d9arppr0dbruadki2trugfvbalvm.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>,
);
