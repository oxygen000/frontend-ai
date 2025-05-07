import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";

/**
 * Component to display enhanced API connection status with real API health check
 * Shows version information and response time metrics
 */
const ApiStatus: React.FC = () => {
  const { t } = useTranslation(["footer", "api"]);
  const [status, setStatus] = useState<
    "connected" | "disconnected" | "checking"
  >("checking");
  const [apiVersion, setApiVersion] = useState<string | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [serverInfo, setServerInfo] = useState<string | null>(null);

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        setStatus("checking");
        const startTime = performance.now();

        // Try different possible health endpoints in order
        let response;
        try {
          // Try the /healthz endpoint first (recommended in K8s)
          response = await axios.get(
            "https://backend-fast-api-ai.fly.dev/healthz"
          );
        } catch (error) {
          console.log("Healthz endpoint not available, trying /health");

          try {
            // Try root /health endpoint next
            response = await axios.get(
              "https://backend-fast-api-ai.fly.dev/health"
            );
          } catch (innerError) {
            console.log(
              "Root health endpoint not available, trying API health"
            );

            // Finally try the API health endpoint
            response = await axios.get(
              "https://backend-fast-api-ai.fly.dev/api/health"
            );
          }
        }

        const endTime = performance.now();
        const elapsed = Math.round(endTime - startTime);
        setResponseTime(elapsed);

        if (response.data && response.status === 200) {
          setStatus("connected");
          setApiVersion(
            response.data.version || t("api:status.defaultVersion", "v1.0")
          );

          if (response.data.server) {
            setServerInfo(response.data.server);
          }
        } else {
          setStatus("disconnected");
        }
      } catch (error) {
        console.error(
          t(
            "api:status.allEndpointsFailed",
            "All API health check attempts failed:"
          ),
          error
        );
        setStatus("disconnected");
        setResponseTime(null);
        setApiVersion(null);
        setServerInfo(null);
      }

      setLastChecked(new Date());
    };

    checkApiStatus();

    // Periodic check every 30 seconds
    const interval = setInterval(checkApiStatus, 30000);

    return () => clearInterval(interval);
  }, [t]);

  return (
    <div className="flex justify-center items-center py-4">
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <span className="text-sm text-gray-600 mr-2">
          {t("footer:apiStatus", "API:")}
        </span>

        {/* Checking status */}
        {status === "checking" && (
          <span className="flex items-center">
            <span className="h-2 w-2 bg-yellow-400 rounded-full mr-1"></span>
            <span className="text-sm text-gray-600">
              {t("footer:checking", "Checking...")}
            </span>
          </span>
        )}

        {/* Connected status */}
        {status === "connected" && (
          <span className="flex items-center">
            <span className="h-2 w-2 bg-green-500 rounded-full mr-1"></span>
            <span className="text-sm text-gray-600">
              {t("footer:connected", "Connected")}
              {apiVersion && <span className="ml-1">({apiVersion})</span>}
              {responseTime && (
                <span className="text-xs text-gray-500 ml-1">
                  {responseTime}ms
                </span>
              )}
            </span>
          </span>
        )}

        {/* Disconnected status */}
        {status === "disconnected" && (
          <span className="flex items-center">
            <span className="h-2 w-2 bg-red-500 rounded-full mr-1"></span>
            <span className="text-sm text-gray-600">
              {t("footer:disconnected", "Disconnected")}
            </span>
          </span>
        )}

        {/* Server info */}
        {serverInfo && (
          <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
            {serverInfo}
          </span>
        )}

        {/* Last checked time */}
        {lastChecked && (
          <span className="text-xs text-gray-500 ml-2">
            {t("footer:lastChecked", "Last checked:")}{" "}
            {lastChecked.toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
};

export default ApiStatus;
