// Sample numbers for the screens. Later these can come from the backend
// (for example /api/readings). low and high are the normal range.
// The last item in history is the current reading.

export const PHYSICAL_METRICS = [
  {
    key: 'bloodSugar',
    name: 'Blood sugar',
    unit: ' mg/dL',
    low: 70,
    high: 100,
    history: [
      { label: 'Nov 11', value: 88 },
      { label: 'Nov 12', value: 92 },
      { label: 'Nov 13', value: 85 },
      { label: 'Nov 14', value: 90 },
    ],
  },
  {
    key: 'oxygen',
    name: 'Oxygen level',
    unit: '%',
    low: 95,
    high: 100,
    history: [
      { label: 'Nov 11', value: 97 },
      { label: 'Nov 12', value: 96 },
      { label: 'Nov 13', value: 94 },
      { label: 'Nov 14', value: 95 },
    ],
  },
  {
    key: 'temperature',
    name: 'Body temperature',
    unit: '°F',
    low: 97,
    high: 99,
    history: [
      { label: 'Nov 11', value: 98.1 },
      { label: 'Nov 12', value: 98.4 },
      { label: 'Nov 13', value: 98.0 },
      { label: 'Nov 14', value: 98.2 },
    ],
  },
  {
    key: 'heartRate',
    name: 'Heart rate',
    unit: ' bpm',
    low: 60,
    high: 100,
    history: [
      { label: 'Nov 11', value: 70 },
      { label: 'Nov 12', value: 75 },
      { label: 'Nov 13', value: 68 },
      { label: 'Nov 14', value: 72 },
    ],
  },
]

export const MENTAL_METRICS = [
  {
    key: 'anxiety',
    name: 'Anxiety Level',
    unit: '/10',
    low: 0,
    high: 5,
    history: [
      { label: 'Mar 25', value: 2 },
      { label: 'Jun 25', value: 3 },
      { label: 'Sep 25', value: 2 },
      { label: 'Dec 25', value: 4 },
      { label: 'Mar 26', value: 3 },
      { label: 'May 26', value: 5 },
      { label: 'Aug 26', value: 4 },
      { label: 'Nov 26', value: 6.5 },
    ],
  },
  {
    key: 'fatigue',
    name: 'Fatigue Level',
    unit: '/10',
    low: 0,
    high: 5,
    history: [
      { label: 'Mar 25', value: 3 },
      { label: 'Jun 25', value: 2 },
      { label: 'Sep 25', value: 4 },
      { label: 'Dec 25', value: 3 },
      { label: 'Mar 26', value: 2 },
      { label: 'May 26', value: 3 },
      { label: 'Aug 26', value: 2 },
      { label: 'Nov 26', value: 2 },
    ],
  },
  {
    key: 'mood',
    name: 'Mood',
    unit: '/5',
    low: 3,
    high: 5,
    history: [
      { label: 'Mar 25', value: 3 },
      { label: 'Jun 25', value: 4 },
      { label: 'Sep 25', value: 3 },
      { label: 'Dec 25', value: 4 },
      { label: 'Mar 26', value: 4 },
      { label: 'May 26', value: 2 },
      { label: 'Aug 26', value: 4 },
      { label: 'Nov 26', value: 4 },
    ],
  },
  {
    key: 'stress',
    name: 'Stress',
    unit: '/10',
    low: 0,
    high: 5,
    history: [
      { label: 'Mar 25', value: 5 },
      { label: 'Jun 25', value: 4 },
      { label: 'Sep 25', value: 6 },
      { label: 'Dec 25', value: 4 },
      { label: 'Mar 26', value: 3 },
      { label: 'May 26', value: 5 },
      { label: 'Aug 26', value: 4 },
      { label: 'Nov 26', value: 4 },
    ],
  },
]

export function getCurrent(metric) {
  return metric.history[metric.history.length - 1].value
}

export function isNormal(metric, value) {
  return value >= metric.low && value <= metric.high
}