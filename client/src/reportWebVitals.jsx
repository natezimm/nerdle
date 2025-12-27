export const __invokeWebVitals = async (onPerfEntry) => {
  const { getCLS, getFID, getFCP, getLCP, getTTFB } = await import('web-vitals');
  getCLS(onPerfEntry);
  getFID(onPerfEntry);
  getFCP(onPerfEntry);
  getLCP(onPerfEntry);
  getTTFB(onPerfEntry);
};

const reportWebVitals = onPerfEntry => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    __invokeWebVitals(onPerfEntry);
  }
};

export default reportWebVitals;
