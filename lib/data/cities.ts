export interface City {
  name: string;
  region: string;
  population: number;
}

export const POLISH_CITIES: City[] = [
  // Major cities
  { name: "Warszawa", region: "Mazowieckie", population: 1783321 },
  { name: "Kraków", region: "Małopolskie", population: 779115 },
  { name: "Łódź", region: "Łódzkie", population: 677286 },
  { name: "Wrocław", region: "Dolnośląskie", population: 642869 },
  { name: "Poznań", region: "Wielkopolskie", population: 534813 },
  { name: "Gdańsk", region: "Pomorskie", population: 470907 },
  { name: "Szczecin", region: "Zachodniopomorskie", population: 400990 },
  { name: "Bydgoszcz", region: "Kujawsko-Pomorskie", population: 346739 },
  { name: "Lublin", region: "Lubelskie", population: 339547 },
  { name: "Katowice", region: "Śląskie", population: 291774 },

  // Other significant cities
  { name: "Białystok", region: "Podlaskie", population: 297554 },
  { name: "Gdynia", region: "Pomorskie", population: 244104 },
  { name: "Częstochowa", region: "Śląskie", population: 220433 },
  { name: "Radom", region: "Mazowieckie", population: 210532 },
  { name: "Sosnowiec", region: "Śląskie", population: 198996 },
  { name: "Toruń", region: "Kujawsko-Pomorskie", population: 198273 },
  { name: "Kielce", region: "Świętokrzyskie", population: 194218 },
  { name: "Gliwice", region: "Śląskie", population: 178186 },
  { name: "Zabrze", region: "Śląskie", population: 172360 },
  { name: "Bytom", region: "Śląskie", population: 165263 },
  { name: "Bielsko-Biała", region: "Śląskie", population: 170303 },
  { name: "Olsztyn", region: "Warmińsko-Mazurskie", population: 171853 },
  { name: "Rzeszów", region: "Podkarpackie", population: 196208 },
  { name: "Ruda Śląska", region: "Śląskie", population: 137360 },
  { name: "Rybnik", region: "Śląskie", population: 138222 },
  { name: "Tychy", region: "Śląskie", population: 128211 },
  { name: "Dąbrowa Górnicza", region: "Śląskie", population: 118285 },
  { name: "Opole", region: "Opolskie", population: 128034 },
  { name: "Elbląg", region: "Warmińsko-Mazurskie", population: 119317 },
  { name: "Płock", region: "Mazowieckie", population: 119425 },
  { name: "Wałbrzych", region: "Dolnośląskie", population: 110603 },
  { name: "Gorzów Wielkopolski", region: "Lubuskie", population: 123341 },
  { name: "Włocławek", region: "Kujawsko-Pomorskie", population: 110287 },
  { name: "Tarnów", region: "Małopolskie", population: 108470 },
  { name: "Chorzów", region: "Śląskie", population: 107443 },
  { name: "Kalisz", region: "Wielkopolskie", population: 100106 },
  { name: "Koszalin", region: "Zachodniopomorskie", population: 107048 },
  { name: "Legnica", region: "Dolnośląskie", population: 99449 },
  { name: "Grudziądz", region: "Kujawsko-Pomorskie", population: 94276 },
  { name: "Jaworzno", region: "Śląskie", population: 89143 },
  { name: "Jastrzębie-Zdrój", region: "Śląskie", population: 88306 },
  { name: "Nowy Sącz", region: "Małopolskie", population: 83464 },
  { name: "Jelenia Góra", region: "Dolnośląskie", population: 79886 },
  { name: "Siedlce", region: "Mazowieckie", population: 78051 },
  { name: "Mysłowice", region: "Śląskie", population: 74588 },
  { name: "Konin", region: "Wielkopolskie", population: 74151 },
  { name: "Piotrków Trybunalski", region: "Łódzkie", population: 72816 },
  { name: "Lubin", region: "Dolnośląskie", population: 72032 },
  { name: "Ostrów Wielkopolski", region: "Wielkopolskie", population: 71847 },
  { name: "Suwałki", region: "Podlaskie", population: 69229 },
  { name: "Stargard", region: "Zachodniopomorskie", population: 67293 },
  { name: "Gniezno", region: "Wielkopolskie", population: 68043 },
  {
    name: "Ostrowiec Świętokrzyski",
    region: "Świętokrzyskie",
    population: 68043,
  },
  { name: "Siemianowice Śląskie", region: "Śląskie", population: 66453 },
  { name: "Głogów", region: "Dolnośląskie", population: 66165 },
  { name: "Pabianice", region: "Łódzkie", population: 64445 },
  { name: "Żory", region: "Śląskie", population: 62038 },
  { name: "Tomaszów Mazowiecki", region: "Łódzkie", population: 61972 },
  { name: "Pruszków", region: "Mazowieckie", population: 61496 },
  { name: "Mielec", region: "Podkarpackie", population: 60523 },
  { name: "Stalowa Wola", region: "Podkarpackie", population: 59988 },
  { name: "Biała Podlaska", region: "Lubelskie", population: 57147 },
  { name: "Bełchatów", region: "Łódzkie", population: 56546 },
  { name: "Zduńska Wola", region: "Łódzkie", population: 55449 },
  { name: "Ciechanów", region: "Mazowieckie", population: 44110 },
  { name: "Przemyśl", region: "Podkarpackie", population: 59807 },
  { name: "Tarnobrzeg", region: "Podkarpackie", population: 46447 },
  { name: "Sieradz", region: "Łódzkie", population: 42082 },
  { name: "Koło", region: "Wielkopolskie", population: 22032 },
  { name: "Kutno", region: "Łódzkie", population: 44254 },
  { name: "Skierniewice", region: "Łódzkie", population: 47825 },
  { name: "Ostrołęka", region: "Mazowieckie", population: 52092 },
  { name: "Zamość", region: "Lubelskie", population: 63111 },
  { name: "Leszno", region: "Wielkopolskie", population: 63620 },
  { name: "Zielona Góra", region: "Lubuskie", population: 140403 },
  { name: "Świnoujście", region: "Zachodniopomorskie", population: 40196 },
  { name: "Szczecinek", region: "Zachodniopomorskie", population: 40483 },

  { name: "Kołobrzeg", region: "Zachodniopomorskie", population: 46259 },
  { name: "Goleniów", region: "Zachodniopomorskie", population: 22448 },
  { name: "Gryfino", region: "Zachodniopomorskie", population: 21356 },
  { name: "Police", region: "Zachodniopomorskie", population: 32275 },
  { name: "Wałcz", region: "Zachodniopomorskie", population: 25498 },
  { name: "Białogard", region: "Zachodniopomorskie", population: 24168 },
  { name: "Choszczno", region: "Zachodniopomorskie", population: 15168 },
  {
    name: "Drawsko Pomorskie",
    region: "Zachodniopomorskie",
    population: 11882,
  },
  { name: "Gryfice", region: "Zachodniopomorskie", population: 16578 },
  { name: "Kamień Pomorski", region: "Zachodniopomorskie", population: 8844 },
  { name: "Myślibórz", region: "Zachodniopomorskie", population: 11667 },
  { name: "Pyrzyce", region: "Zachodniopomorskie", population: 12708 },
  { name: "Sławno", region: "Zachodniopomorskie", population: 12893 },
  { name: "Starogard Gdański", region: "Pomorskie", population: 48136 },
  { name: "Chojnice", region: "Pomorskie", population: 40266 },
  { name: "Kartuzy", region: "Pomorskie", population: 14463 },
  { name: "Kościerzyna", region: "Pomorskie", population: 23888 },
  { name: "Kwidzyn", region: "Pomorskie", population: 38478 },
  { name: "Lębork", region: "Pomorskie", population: 35244 },
  { name: "Malbork", region: "Pomorskie", population: 38478 },
  { name: "Nowy Dwór Gdański", region: "Pomorskie", population: 10011 },
  { name: "Puck", region: "Pomorskie", population: 11329 },
  { name: "Reda", region: "Pomorskie", population: 23888 },
  { name: "Rumia", region: "Pomorskie", population: 49262 },
  { name: "Sopot", region: "Pomorskie", population: 35826 },
  { name: "Tczew", region: "Pomorskie", population: 60490 },
  { name: "Ustka", region: "Pomorskie", population: 15830 },
  { name: "Wejherowo", region: "Pomorskie", population: 50204 },
  { name: "Władysławowo", region: "Pomorskie", population: 10217 },
  { name: "Żukowo", region: "Pomorskie", population: 6628 },
];

export const getCitiesByRegion = () => {
  const citiesByRegion: Record<string, City[]> = {};
  POLISH_CITIES.forEach((city) => {
    if (!citiesByRegion[city.region]) {
      citiesByRegion[city.region] = [];
    }
    citiesByRegion[city.region].push(city);
  });

  // Sort cities within each region by population
  Object.keys(citiesByRegion).forEach((region) => {
    citiesByRegion[region].sort((a, b) => b.population - a.population);
  });

  return citiesByRegion;
};

export const getMajorCities = () => {
  return POLISH_CITIES.filter((city) => city.population > 100000);
};

export const getAllCityNames = () => {
  return POLISH_CITIES.map((city) => city.name).sort();
};
