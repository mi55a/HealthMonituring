import { useEffect, useState } from "react";

const API = "http://localhost:3001";

const physical = [
  {
    key: "bloodSugar",
    name: "Blood sugar",
    unit: " mg/dL",
    low: 70,
    high: 100,
  },
  {
    key: "oxygenLevel",
    name: "Oxygen level",
    unit: "%",
    low: 95,
    high: 100,
  },
  {
    key: "temperature",
    name: "Body temperature",
    unit: "°C",
    low: 36.1,
    high: 37.2,
  },
  {
    key: "heartRate",
    name: "Heart rate",
    unit: " bpm",
    low: 60,
    high: 100,
  },
];

const mental = [
  {
    key: "anxiety",
    name: "Anxiety Level",
    unit: "/10",
    low: 0,
    high: 5,
  },
  {
    key: "fatigue",
    name: "Fatigue Level",
    unit: "/10",
    low: 0,
    high: 5,
  },
  {
    key: "mood",
    name: "Mood",
    unit: "/5",
    low: 3,
    high: 5,
  },
  {
    key: "stressLevel",
    name: "Stress",
    unit: "/10",
    low: 0,
    high: 5,
  },
];

export const PHYSICAL_METRICS = physical;
export const MENTAL_METRICS = mental;

export function getCurrent(metric) {
  return metric.history?.length
    ? metric.history.at(-1).value
    : null;
}

export function isNormal(metric, value) {
  return (
    value != null &&
    value >= metric.low &&
    value <= metric.high
  );
}

function metricsFromRows(definitions, rows) {
  return definitions.map((metric) => ({
    ...metric,
    history: rows.flatMap((row) => {
      const raw = row[metric.key];

      if (
        raw === null ||
        raw === undefined ||
        raw === "" ||
        !Number.isFinite(Number(raw))
      ) {
        return [];
      }

      return [
        {
          id: row.id,
          label: new Date(
            row.recordedAt.replace(" ", "T") + "Z"
          ).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          }),
          recordedAt: row.recordedAt,
          value: Number(raw),
        },
      ];
    }),
  }));
}

export function useHealthMetrics(kind) {
  const [state, setState] = useState({
    metrics: [],
    loading: true,
    error: "",
  });

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const response = await fetch(
          `${API}/api/dashboard/history`,
          {
            signal: controller.signal,
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Could not load saved health history."
          );
        }

        const rows = await response.json();

        if (!Array.isArray(rows)) {
          throw new Error("Invalid history response.");
        }

        setState({
          metrics: metricsFromRows(
            kind === "mental" ? mental : physical,
            rows
          ),
          loading: false,
          error: "",
        });
      } catch (error) {
        if (error.name !== "AbortError") {
          setState({
            metrics: [],
            loading: false,
            error: error.message,
          });
        }
      }
    }

    load();

    return () => controller.abort();
  }, [kind]);

  return state;
}
