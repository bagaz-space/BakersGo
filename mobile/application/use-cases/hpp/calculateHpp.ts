export interface HppInputs {
  baseRecipeCost: number;
  batchSize: number;
  listrik: number;
  gas: number;
  tenagaKerja: number;
  overhead: number;
  kotak: number;
  stiker: number;
  kemasanLain: number;
  marginReseller: number;
  marginEndUser: number;
}

export interface HppResult {
  baseRecipeCost: number;
  totalZonaDapur: number;
  totalZonaFinal: number;
  hppTotal: number;
  hppPerUnit: number;
  hargaReseller: number;
  hargaEndUser: number;
  profitReseller: number;
  profitEndUser: number;
}

export function calculateHpp(inputs: HppInputs): HppResult {
  const {
    baseRecipeCost,
    batchSize,
    listrik,
    gas,
    tenagaKerja,
    overhead,
    kotak,
    stiker,
    kemasanLain,
    marginReseller,
    marginEndUser,
  } = inputs;

  const totalZonaDapur = listrik + gas + tenagaKerja + overhead;
  const totalZonaFinal = kotak + stiker + kemasanLain;
  const hppTotal = baseRecipeCost + totalZonaDapur + totalZonaFinal;
  const hppPerUnit = batchSize > 0 ? hppTotal / batchSize : 0;
  const hargaReseller = hppPerUnit * (1 + marginReseller / 100);
  const hargaEndUser = hppPerUnit * (1 + marginEndUser / 100);

  return {
    baseRecipeCost,
    totalZonaDapur,
    totalZonaFinal,
    hppTotal,
    hppPerUnit,
    hargaReseller,
    hargaEndUser,
    profitReseller: hargaReseller - hppPerUnit,
    profitEndUser: hargaEndUser - hppPerUnit,
  };
}
