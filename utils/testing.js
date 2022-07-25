const text = `1. Dhauladhar Range, 32.1695° N, 76.5266° E
2. Pir Panjal Range, 32.0853° N, 77.1742° E
3. Zanskar Range, 32.8564° N, 77.2733° E
4. Himalayan National Park, 32.2396° N, 77.1887° E
5. Pin Parvati Pass, 32.2708° N, 77.4803° E
6. Spiti Valley, 32.1069° N, 77.2733° E
7. Lahaul and Spiti District, 32.5333° N, 77.1667° E
8. Kinnaur District, 31.8333° N, 78.7500° E
9. Shimla, 31.1048° N, 77.1742° E
10. Manali, 32.2396° N, 77.1887° E`;

console.log(text.replaceAll("\n", "").split(" "));
