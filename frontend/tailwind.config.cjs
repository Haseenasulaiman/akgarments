module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#0b1120",
        charcoal: "#111827",
        offwhite: "#f9fafb",
        amber: "#f59e0b"
      },
      fontFamily: {
        display: ["system-ui", "sans-serif"],
        body: ["system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

