export interface CityOption {
  name: string;
  state: string;
  lat: number;
  lon: number;
  radiusKm: number;
  bairrosPrincipais: string[];
}

export const BRAZIL_CITIES: CityOption[] = [
  {
    name: "São Paulo",
    state: "SP",
    lat: -23.55052,
    lon: -46.633308,
    radiusKm: 18,
    bairrosPrincipais: [
      "Pinheiros", "Itaim Bibi", "Vila Olímpia", "Moema", "Jardins",
      "Brooklin", "Santana", "Tatuapé", "Bela Vista", "Perdizes",
      "Santo Amaro", "Lapa", "Morumbi", "Vila Mariana", "Barra Funda"
    ]
  },
  {
    name: "Rio de Janeiro",
    state: "RJ",
    lat: -22.906847,
    lon: -43.172896,
    radiusKm: 16,
    bairrosPrincipais: [
      "Barra da Tijuca", "Centro", "Copacabana", "Ipanema", "Botafogo",
      "Leblon", "Tijuca", "Flamengo", "Recreio dos Bandeirantes"
    ]
  },
  {
    name: "Curitiba",
    state: "PR",
    lat: -25.4284,
    lon: -49.2733,
    radiusKm: 12,
    bairrosPrincipais: [
      "Batel", "Centro", "Água Verde", "Cabral", "Bigorrilho",
      "Ecoville", "Juvevê", "Portão", "Santa Felicidade"
    ]
  },
  {
    name: "Belo Horizonte",
    state: "MG",
    lat: -19.916681,
    lon: -43.934493,
    radiusKm: 14,
    bairrosPrincipais: [
      "Savassi", "Lourdes", "Funcionários", "Buritis", "Belvedere",
      "Centro", "Santa Efigênia", "Pampulha", "Castelo"
    ]
  },
  {
    name: "Campinas",
    state: "SP",
    lat: -22.9099,
    lon: -47.0626,
    radiusKm: 10,
    bairrosPrincipais: [
      "Cambuí", "Taquaral", "Barão Geraldo", "Centro", "Nova Campinas",
      "Guanabara", "Alphaville Campinas"
    ]
  },
  {
    name: "Porto Alegre",
    state: "RS",
    lat: -30.0346,
    lon: -51.2177,
    radiusKm: 12,
    bairrosPrincipais: [
      "Moinhos de Vento", "Bela Vista", "Menino Deus", "Petrópolis",
      "Centro Histórico", "Mont'Serrat"
    ]
  },
  {
    name: "Florianópolis",
    state: "SC",
    lat: -27.5954,
    lon: -48.548,
    radiusKm: 10,
    bairrosPrincipais: [
      "Centro", "Trindade", "Itacorubi", "Agronômica", "Lagoa da Conceição",
      "Jurerê Internacional", "Santa Mônica"
    ]
  },
  {
    name: "Brasília",
    state: "DF",
    lat: -15.7975,
    lon: -47.8919,
    radiusKm: 15,
    bairrosPrincipais: [
      "Asa Sul", "Asa Norte", "Sudoeste", "Águas Claras", "Lago Sul",
      "Lago Norte", "Taguatinga"
    ]
  },
  {
    name: "Salvador",
    state: "BA",
    lat: -12.9777,
    lon: -38.5016,
    radiusKm: 14,
    bairrosPrincipais: [
      "Pituba", "Caminho das Árvores", "Itaigara", "Barra", "Rio Vermelho",
      "Graça", "Costa Azul"
    ]
  },
  {
    name: "Fortaleza",
    state: "CE",
    lat: -3.71722,
    lon: -38.5433,
    radiusKm: 14,
    bairrosPrincipais: [
      "Aldeota", "Meireles", "Cocó", "Papicu", "Dionísio Torres",
      "Centro", "Varjota"
    ]
  }
];
