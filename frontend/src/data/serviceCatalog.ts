export type ServiceDepartment = "OPD" | "IPD" | "BED" | "WARD" | "OT" | "LAB" | "XRAY" | "ULTRASOUND";

export type ServiceCatalogItem = {
  id: string;
  department: ServiceDepartment;
  name: string;
  price: number;
  invoiceType: "OPD" | "IPD" | "PHARMACY" | "LAB" | "GENERAL";
  category: "CONSULTATION" | "LAB" | "PROCEDURE" | "MEDICINE" | "MISC";
  source: string;
  editablePrice?: boolean;
  costBreakup?: string[];
};

export const SERVICE_DEPARTMENTS: ServiceDepartment[] = ["OPD", "IPD", "BED", "WARD", "OT", "LAB", "XRAY", "ULTRASOUND"];

export const SERVICE_CATALOG: ServiceCatalogItem[] = [
  {
    id: "bed-admission-charge",
    department: "BED",
    name: "Admission Charge",
    price: 100.00,
    invoiceType: "IPD",
    category: "PROCEDURE",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "bed-emergency-bed-charges-per-hour",
    department: "BED",
    name: "Emergency Bed Charges Per Hour",
    price: 300.00,
    invoiceType: "IPD",
    category: "PROCEDURE",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "bed-general-ward-ac",
    department: "BED",
    name: "General Ward (AC)",
    price: 1200.00,
    invoiceType: "IPD",
    category: "PROCEDURE",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "bed-icu-ac",
    department: "BED",
    name: "ICU (AC)",
    price: 5000.00,
    invoiceType: "IPD",
    category: "PROCEDURE",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "bed-ip-doctor-s-fees-per-day",
    department: "BED",
    name: "IP Doctor's Fees per Day",
    price: 800.00,
    invoiceType: "IPD",
    category: "PROCEDURE",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "bed-ip-doctor-s-fees-per-day-icu-nicu",
    department: "BED",
    name: "IP Doctor's Fees per Day (ICU & NICU)",
    price: 1000.00,
    invoiceType: "IPD",
    category: "PROCEDURE",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "bed-nicu-ac",
    department: "BED",
    name: "NICU (AC)",
    price: 3000.00,
    invoiceType: "IPD",
    category: "PROCEDURE",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "bed-private-cabin-ac",
    department: "BED",
    name: "Private Cabin (AC)",
    price: 2000.00,
    invoiceType: "IPD",
    category: "PROCEDURE",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-abo-rh-blood-grouping",
    department: "LAB",
    name: "ABO & RH (BLOOD GROUPING)",
    price: 50.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-abseosinophil-count",
    department: "LAB",
    name: "ABSEOSINOPHIL COUNT",
    price: 90.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-afb-stain-sputumfor-afb-1sample",
    department: "LAB",
    name: "AFB STAIN - SPUTUMFOR AFB -1SAMPLE",
    price: 150.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-albumin-serum",
    department: "LAB",
    name: "ALBUMIN, SERUM",
    price: 150.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-alkaline-phosphatase-serum",
    department: "LAB",
    name: "ALKALINE PHOSPHATASE,SERUM",
    price: 150.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-amh-anti-mullerian-hormone",
    department: "LAB",
    name: "AMH-(Anti Mullerian Hormone)",
    price: 1500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-amylase-serum",
    department: "LAB",
    name: "AMYLASE, SERUM",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-aptt-plasma",
    department: "LAB",
    name: "APTT,PLASMA",
    price: 700.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-aso-anti-strephtolysino-quantitative",
    department: "LAB",
    name: "ASO(ANTI STREPHTOLYSINO)-QUANTITATIVE",
    price: 600.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-beta-hcg-historyrequired-ordr-sprescrip",
    department: "LAB",
    name: "BETA HCG-(HistoryRequired orDr'sPrescrip)",
    price: 700.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-bilirubin-total-serum",
    department: "LAB",
    name: "BILIRUBIN (TOTAL), SERUM",
    price: 100.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-bilirubin-total-direct-indirect-serum",
    department: "LAB",
    name: "BILIRUBIN (TOTAL,DIRECT&INDIRECT),SERUM",
    price: 200.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-blood-sugar-fasting",
    department: "LAB",
    name: "BLOOD SUGAR FASTING",
    price: 50.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-blood-sugar-pp",
    department: "LAB",
    name: "BLOOD SUGAR PP",
    price: 50.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-blood-sugar-random",
    department: "LAB",
    name: "BLOOD SUGAR RANDOM",
    price: 50.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-btct",
    department: "LAB",
    name: "BTCT",
    price: 200.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-calcium-serum",
    department: "LAB",
    name: "CALCIUM, SERUM",
    price: 200.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-cbc-esr",
    department: "LAB",
    name: "CBC+ ESR",
    price: 400.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-cbc-complete-blood-counts",
    department: "LAB",
    name: "CBC-COMPLETE BLOOD COUNTS",
    price: 300.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-chikungunya-card-test-rapid",
    department: "LAB",
    name: "CHIKUNGUNYA CARD TEST (RAPID)",
    price: 400.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-chloride-serum",
    department: "LAB",
    name: "CHLORIDE, SERUM",
    price: 200.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-cholesterol-total-serum",
    department: "LAB",
    name: "CHOLESTEROL (TOTAL), SERUM",
    price: 150.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-conjunctival-swab-culture",
    department: "LAB",
    name: "CONJUNCTIVAL SWAB CULTURE",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-creatinine-serum",
    department: "LAB",
    name: "CREATININE,SERUM",
    price: 150.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-crp-c-reactive-protein-quantitative",
    department: "LAB",
    name: "CRP(C-REACTIVE PROTEIN)-QUANTITATIVE",
    price: 400.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-culture-aerobic-susceptibility-pusculture",
    department: "LAB",
    name: "CULTURE AEROBIC&SUSCEPTIBILITY - PUSCULTURE",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-denguetest-ns1-igg-igm",
    department: "LAB",
    name: "DENGUETEST(NS1+IGG+ IGM)",
    price: 300.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-electrolytes-serum",
    department: "LAB",
    name: "ELECTROLYTES, SERUM",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-esr",
    department: "LAB",
    name: "ESR",
    price: 100.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-ferritin-serum",
    department: "LAB",
    name: "FERRITIN,SERUM",
    price: 650.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-fsh-follicular-stinulating-hormone",
    department: "LAB",
    name: "FSH (FOLLICULAR STINULATING HORMONE)",
    price: 400.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-ft3-ft4-u-tsh",
    department: "LAB",
    name: "FT3,FT4,U-TSH",
    price: 600.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-ft3-freet3",
    department: "LAB",
    name: "FT3-FREET3",
    price: 300.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-ft4-tsh",
    department: "LAB",
    name: "FT4,TSH",
    price: 650.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-ft4-freet4",
    department: "LAB",
    name: "FT4-FREET4",
    price: 300.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-gamma-gt-ggt",
    department: "LAB",
    name: "GAMMA GT (GGT)",
    price: 200.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-glomerular-filtrationrate-egfr",
    department: "LAB",
    name: "GLOMERULAR FILTRATIONRATE (EGFR)",
    price: 200.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-grams-stain",
    department: "LAB",
    name: "GRAMS STAIN",
    price: 150.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-hb-tlc-dlc",
    department: "LAB",
    name: "HB TLC DLC",
    price: 170.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-hb-tlc-dlc-esr",
    department: "LAB",
    name: "HB TLC DLC ESR",
    price: 230.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-hba1c-glycosylatedheamoglobin",
    department: "LAB",
    name: "HBA1C (GLYCOSYLATEDHEAMOGLOBIN)",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-hbsag-australia-antigen",
    department: "LAB",
    name: "HBSAG (AUSTRALIA ANTIGEN)",
    price: 200.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-hcv-hepatitis-cantibody",
    department: "LAB",
    name: "HCV(HEPATITIS CANTIBODY)",
    price: 350.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-hdl",
    department: "LAB",
    name: "HDL",
    price: 180.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-hemoglobin-hb",
    department: "LAB",
    name: "HEMOGLOBIN (HB%)",
    price: 50.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-hiivi-ii",
    department: "LAB",
    name: "HIIVI &II",
    price: 300.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-iron-profile",
    department: "LAB",
    name: "IRON PROFILE",
    price: 700.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-iron-serum",
    department: "LAB",
    name: "IRON,SERUM",
    price: 300.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-kft-1-urea-creatinine-egfr-uricacid",
    department: "LAB",
    name: "KFT-1-(UREA,Creatinine,EGFR,Uricacid)",
    price: 400.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-lft-liverfunction-test",
    department: "LAB",
    name: "LFT-(LiverFunction Test)",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-lh-luteinising-hormone",
    department: "LAB",
    name: "LH (LUTEINISING HORMONE)",
    price: 400.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-lh-fsh-prl",
    department: "LAB",
    name: "LH FSH PRL",
    price: 1000.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-lipid-profile",
    department: "LAB",
    name: "LIPID PROFILE",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-malaria-card-antigen-test",
    department: "LAB",
    name: "MALARIA CARD ANTIGEN TEST",
    price: 200.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-malaria-parasite-peripheralsmear-bsmp",
    department: "LAB",
    name: "MALARIA PARASITE (PERIPHERALSMEAR)- BSMP",
    price: 80.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-mantoux-tuberculintest",
    department: "LAB",
    name: "MANTOUX(TUBERCULINTEST)",
    price: 200.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-microfilaria-slide",
    department: "LAB",
    name: "MICROFILARIA(SLIDE)",
    price: 150.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-pbs-peripheralbloodsmear",
    department: "LAB",
    name: "PBS-(PeripheralbloodSmear)",
    price: 100.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-phosphorus-serum",
    department: "LAB",
    name: "PHOSPHORUS, SERUM",
    price: 300.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-platelet-count",
    department: "LAB",
    name: "PLATELET COUNT",
    price: 150.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-potassium-k-serum",
    department: "LAB",
    name: "POTASSIUM (K+), SERUM",
    price: 200.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-prl-prolactine-serum",
    department: "LAB",
    name: "PRL (PROLACTINE),SERUM",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-protein-albumin-a-gratio",
    department: "LAB",
    name: "PROTEIN,ALBUMIN,A-GRATIO",
    price: 400.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-prothrombin-time-with-inr-ptinr",
    department: "LAB",
    name: "PROTHROMBIN TIME WITH INR(PTINR)",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-psa-total-prostatespecificantigen",
    department: "LAB",
    name: "PSA-(TOTAL),PROSTATESPECIFICANTIGEN",
    price: 700.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-pus-swabculture",
    department: "LAB",
    name: "PUS SWABCULTURE",
    price: 400.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-ra-factor-quantitative",
    department: "LAB",
    name: "RA FACTOR -QUANTITATIVE",
    price: 400.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-reticulocyte-count",
    department: "LAB",
    name: "RETICULOCYTE COUNT",
    price: 200.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-semenan-analysis-colletionatlabonly",
    department: "LAB",
    name: "SEMENAN ANALYSIS -ColletionatLabOnly",
    price: 250.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-sgot-ast",
    department: "LAB",
    name: "SGOT/AST",
    price: 150.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-sgpt-alt",
    department: "LAB",
    name: "SGPT/ALT",
    price: 150.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-sickling-test",
    department: "LAB",
    name: "SICKLING TEST",
    price: 300.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-skin-slit-smear-lepra-smear",
    department: "LAB",
    name: "SKIN SLIT SMEAR - LEPRA SMEAR",
    price: 400.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-sodium-na-serum",
    department: "LAB",
    name: "SODIUM (NA+), SERUM",
    price: 200.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-sodium-na-potassium-k-serum",
    department: "LAB",
    name: "SODIUM(NA+) & POTASSIUM (K+), SERUM",
    price: 400.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-sputum-c-s",
    department: "LAB",
    name: "SPUTUM C/S",
    price: 400.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-stool-culture",
    department: "LAB",
    name: "STOOL CULTURE",
    price: 400.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-stool-for-occult-blood",
    department: "LAB",
    name: "STOOL FOR OCCULT BLOOD",
    price: 150.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-stool-routine-examination",
    department: "LAB",
    name: "STOOL ROUTINE EXAMINATION",
    price: 150.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-swab-culture-ot",
    department: "LAB",
    name: "SWAB CULTURE(@ OT)",
    price: 250.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-t3",
    department: "LAB",
    name: "T3",
    price: 200.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-t4",
    department: "LAB",
    name: "T4",
    price: 200.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-throat-swab-culture",
    department: "LAB",
    name: "THROAT SWAB CULTURE",
    price: 400.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-thyroid-profile-t3t4-tsh",
    department: "LAB",
    name: "THYROID PROFILE (T3T4 TSH)",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-tlc-dlc",
    department: "LAB",
    name: "TLC DLC",
    price: 120.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-total-ige-serum",
    department: "LAB",
    name: "TOTAL IGE,SERUM",
    price: 1000.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-total-protein-serum",
    department: "LAB",
    name: "TOTAL PROTEIN, SERUM",
    price: 150.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-triglycerides-serum-tg",
    department: "LAB",
    name: "TRIGLYCERIDES, SERUM (TG)",
    price: 200.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-trop-i-qualitative",
    department: "LAB",
    name: "TROP-I (Qualitative)",
    price: 1000.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-tsh",
    department: "LAB",
    name: "TSH",
    price: 250.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-typhidot-card-test",
    department: "LAB",
    name: "TYPHIDOT CARD TEST",
    price: 300.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-urea",
    department: "LAB",
    name: "UREA",
    price: 150.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-uric-acid-serum-ua",
    department: "LAB",
    name: "URIC ACID,SERUM (UA)",
    price: 150.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-urine-bilesalt-pigment",
    department: "LAB",
    name: "URINE BILESALT/PIGMENT",
    price: 100.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-urine-culture-sensitivity",
    department: "LAB",
    name: "URINE CULTURE & SENSITIVITY",
    price: 400.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-urine-for-ketone-bodies",
    department: "LAB",
    name: "URINE FOR KETONE BODIES",
    price: 100.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-urine-pregnancy-test",
    department: "LAB",
    name: "URINE PREGNANCY TEST",
    price: 100.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-urine-routine-examination",
    department: "LAB",
    name: "URINE ROUTINE EXAMINATION",
    price: 100.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-vaginal-swab-culsture",
    department: "LAB",
    name: "VAGINAL SWAB CULSTURE",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-vdrltest",
    department: "LAB",
    name: "VDRLTEST",
    price: 150.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-vitamin-d-25hydroxy",
    department: "LAB",
    name: "VITAMIN D (25HYDROXY)",
    price: 1000.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-vitamin-b12",
    department: "LAB",
    name: "Vitamin B12",
    price: 1000.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "lab-widal-test",
    department: "LAB",
    name: "WIDAL TEST",
    price: 100.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "opd-emergency-charges",
    department: "OPD",
    name: "Emergency Charges",
    price: 800.00,
    invoiceType: "OPD",
    category: "CONSULTATION",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "opd-sepcialist",
    department: "OPD",
    name: "Sepcialist",
    price: 400.00,
    invoiceType: "OPD",
    category: "CONSULTATION",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "opd-super-specialist",
    department: "OPD",
    name: "Super Specialist",
    price: 500.00,
    invoiceType: "OPD",
    category: "CONSULTATION",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ot-lscs-lower-segment-cesarean-section",
    department: "OT",
    name: "* LSCS (Lower Segment Cesarean Section)",
    price: 35000.00,
    invoiceType: "GENERAL",
    category: "PROCEDURE",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ot-nd-normal-delivery",
    department: "OT",
    name: "* ND (Normal Delivery)",
    price: 20000.00,
    invoiceType: "GENERAL",
    category: "PROCEDURE",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ot-manual-anesthetist-fees",
    department: "OT",
    name: "Anesthetist Fees",
    price: 0.00,
    invoiceType: "GENERAL",
    category: "PROCEDURE",
    source: "Bill Format.pdf",
    editablePrice: true
  },
  {
    id: "ot-appendix",
    department: "OT",
    name: "Appendix",
    price: 30000.00,
    invoiceType: "GENERAL",
    category: "PROCEDURE",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ot-bilateral-hernia",
    department: "OT",
    name: "Bilateral Hernia",
    price: 35000.00,
    invoiceType: "GENERAL",
    category: "PROCEDURE",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ot-gb-gallbladder",
    department: "OT",
    name: "GB (Gallbladder)",
    price: 35000.00,
    invoiceType: "GENERAL",
    category: "PROCEDURE",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ot-hydrocele",
    department: "OT",
    name: "Hydrocele",
    price: 18000.00,
    invoiceType: "GENERAL",
    category: "PROCEDURE",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ot-hysterectomy",
    department: "OT",
    name: "Hysterectomy",
    price: 35000.00,
    invoiceType: "GENERAL",
    category: "PROCEDURE",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ot-ing-hernia",
    department: "OT",
    name: "Ing Hernia",
    price: 28000.00,
    invoiceType: "GENERAL",
    category: "PROCEDURE",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ot-manual-ot-assistant-charges",
    department: "OT",
    name: "OT Assistant Charges",
    price: 0.00,
    invoiceType: "GENERAL",
    category: "PROCEDURE",
    source: "Bill Format.pdf",
    editablePrice: true
  },
  {
    id: "ot-manual-ot-medicine-charges",
    department: "OT",
    name: "OT Medicine Charges",
    price: 0.00,
    invoiceType: "GENERAL",
    category: "PROCEDURE",
    source: "Bill Format.pdf",
    editablePrice: true
  },
  {
    id: "ot-manual-surgeon-fees",
    department: "OT",
    name: "Surgeon Fees",
    price: 0.00,
    invoiceType: "GENERAL",
    category: "PROCEDURE",
    source: "Bill Format.pdf",
    editablePrice: true
  },
  {
    id: "ot-umb-hernia",
    department: "OT",
    name: "Umb Hernia",
    price: 30000.00,
    invoiceType: "GENERAL",
    category: "PROCEDURE",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ot-manual-vaccination-charges",
    department: "OT",
    name: "Vaccination Charges",
    price: 0.00,
    invoiceType: "GENERAL",
    category: "PROCEDURE",
    source: "Bill Format.pdf",
    editablePrice: true
  },
  {
    id: "ultrasound-ultrasound-abdomen",
    department: "ULTRASOUND",
    name: "ULTRASOUND ABDOMEN",
    price: 1500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ultrasound-ultrasound-abdomen-pelvis-tas",
    department: "ULTRASOUND",
    name: "ULTRASOUND ABDOMEN & PELVIS (TAS)",
    price: 1500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ultrasound-ultrasound-anomaly-scan",
    department: "ULTRASOUND",
    name: "ULTRASOUND ANOMALY SCAN",
    price: 2500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ultrasound-ultrasound-breasts-both-breast",
    department: "ULTRASOUND",
    name: "ULTRASOUND BREASTS BOTH BREAST",
    price: 3000.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ultrasound-ultrasound-breasts-one-breast",
    department: "ULTRASOUND",
    name: "ULTRASOUND BREASTS ONE BREAST",
    price: 1600.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ultrasound-ultrasound-chest",
    department: "ULTRASOUND",
    name: "ULTRASOUND CHEST",
    price: 1600.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ultrasound-ultrasound-diagnostic-aspiration",
    department: "ULTRASOUND",
    name: "ULTRASOUND DIAGNOSTIC ASPIRATION",
    price: 1500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ultrasound-ultrasound-doppler-obstetric",
    department: "ULTRASOUND",
    name: "ULTRASOUND DOPPLER OBSTETRIC",
    price: 2200.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ultrasound-ultrasound-doppler-renal",
    department: "ULTRASOUND",
    name: "ULTRASOUND DOPPLER RENAL",
    price: 2200.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ultrasound-ultrasound-doppler-single-limbs-venous-arterial",
    department: "ULTRASOUND",
    name: "ULTRASOUND DOPPLER SINGLE LIMBS -VENOUS & ARTERIAL",
    price: 3000.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ultrasound-ultrasound-early-obs",
    department: "ULTRASOUND",
    name: "ULTRASOUND EARLY OBS",
    price: 1200.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ultrasound-ultrasound-follicular-study",
    department: "ULTRASOUND",
    name: "ULTRASOUND FOLLICULAR STUDY",
    price: 2500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ultrasound-ultrasound-guided-procedure",
    department: "ULTRASOUND",
    name: "ULTRASOUND GUIDED PROCEDURE",
    price: 3000.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ultrasound-ultrasound-kub",
    department: "ULTRASOUND",
    name: "ULTRASOUND KUB",
    price: 1200.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ultrasound-ultrasound-lower-abdomen",
    department: "ULTRASOUND",
    name: "ULTRASOUND LOWER ABDOMEN",
    price: 1200.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ultrasound-ultrasound-neck",
    department: "ULTRASOUND",
    name: "ULTRASOUND NECK",
    price: 1500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ultrasound-ultrasound-obstetric-doppler",
    department: "ULTRASOUND",
    name: "ULTRASOUND OBSTETRIC DOPPLER",
    price: 2500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ultrasound-ultrasound-obstetric-scan",
    department: "ULTRASOUND",
    name: "ULTRASOUND OBSTETRIC SCAN",
    price: 1200.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ultrasound-ultrasound-obstetric-scan-with-biophysical-profile",
    department: "ULTRASOUND",
    name: "ULTRASOUND OBSTETRIC SCAN WITH BIOPHYSICAL PROFILE",
    price: 1500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ultrasound-ultrasound-obstetric-scan-with-doppler",
    department: "ULTRASOUND",
    name: "ULTRASOUND OBSTETRIC SCAN WITH DOPPLER",
    price: 2000.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ultrasound-ultrasound-obstetric-with-nt-nb-scan",
    department: "ULTRASOUND",
    name: "ULTRASOUND OBSTETRIC WITH NT & NB SCAN",
    price: 1500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ultrasound-ultrasound-obstetrics-anomalies-scan",
    department: "ULTRASOUND",
    name: "ULTRASOUND OBSTETRICS ANOMALIES SCAN",
    price: 2500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ultrasound-ultrasound-parotid",
    department: "ULTRASOUND",
    name: "ULTRASOUND PAROTID",
    price: 1500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ultrasound-ultrasound-pelvis",
    department: "ULTRASOUND",
    name: "ULTRASOUND PELVIS",
    price: 1200.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ultrasound-ultrasound-portable-abdomen",
    department: "ULTRASOUND",
    name: "ULTRASOUND PORTABLE ABDOMEN",
    price: 1500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ultrasound-ultrasound-portable-charge",
    department: "ULTRASOUND",
    name: "ULTRASOUND PORTABLE CHARGE",
    price: 1500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ultrasound-ultrasound-renal-doppler",
    department: "ULTRASOUND",
    name: "ULTRASOUND RENAL DOPPLER",
    price: 2000.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ultrasound-ultrasound-routine-obs",
    department: "ULTRASOUND",
    name: "ULTRASOUND ROUTINE OBS",
    price: 1200.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ultrasound-ultrasound-routine-obstetric",
    department: "ULTRASOUND",
    name: "ULTRASOUND ROUTINE OBSTETRIC",
    price: 1200.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ultrasound-ultrasound-scrotum-with-doppler",
    department: "ULTRASOUND",
    name: "ULTRASOUND SCROTUM WITH DOPPLER",
    price: 2000.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ultrasound-ultrasound-small-part",
    department: "ULTRASOUND",
    name: "ULTRASOUND SMALL PART",
    price: 2200.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ultrasound-ultrasound-small-parts",
    department: "ULTRASOUND",
    name: "ULTRASOUND SMALL PARTS",
    price: 1500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ultrasound-ultrasound-thorax",
    department: "ULTRASOUND",
    name: "ULTRASOUND THORAX",
    price: 1500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ultrasound-ultrasound-thyroid",
    department: "ULTRASOUND",
    name: "ULTRASOUND THYROID",
    price: 1500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ultrasound-ultrasound-upper-abdomen",
    department: "ULTRASOUND",
    name: "ULTRASOUND UPPER ABDOMEN",
    price: 1200.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ward-catheterization-charge",
    department: "WARD",
    name: "* Catheterization Charge",
    price: 500.00,
    invoiceType: "IPD",
    category: "PROCEDURE",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ward-enema-charges",
    department: "WARD",
    name: "* Enema Charges",
    price: 500.00,
    invoiceType: "IPD",
    category: "PROCEDURE",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ward-iv-cannulation",
    department: "WARD",
    name: "* IV Cannulation",
    price: 200.00,
    invoiceType: "IPD",
    category: "PROCEDURE",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ward-injection-charges-im",
    department: "WARD",
    name: "* Injection Charges IM",
    price: 50.00,
    invoiceType: "IPD",
    category: "PROCEDURE",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ward-injection-charges-iv",
    department: "WARD",
    name: "* Injection Charges IV",
    price: 70.00,
    invoiceType: "IPD",
    category: "PROCEDURE",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ward-large-dressing",
    department: "WARD",
    name: "* Large Dressing",
    price: 600.00,
    invoiceType: "IPD",
    category: "PROCEDURE",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ward-medium-dressing",
    department: "WARD",
    name: "* Medium Dressing",
    price: 400.00,
    invoiceType: "IPD",
    category: "PROCEDURE",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ward-nebuliser-one-time",
    department: "WARD",
    name: "* Nebuliser (One Time)",
    price: 100.00,
    invoiceType: "IPD",
    category: "PROCEDURE",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ward-nebuliser-with-oxygen-one-time",
    department: "WARD",
    name: "* Nebuliser with Oxygen (One Time)",
    price: 200.00,
    invoiceType: "IPD",
    category: "PROCEDURE",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ward-pop-including-dr-s-fees",
    department: "WARD",
    name: "* POP (Including Dr's Fees)",
    price: 3000.00,
    invoiceType: "IPD",
    category: "PROCEDURE",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ward-slab",
    department: "WARD",
    name: "* SLAB",
    price: 1500.00,
    invoiceType: "IPD",
    category: "PROCEDURE",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ward-small-dressing",
    department: "WARD",
    name: "* Small Dressing",
    price: 300.00,
    invoiceType: "IPD",
    category: "PROCEDURE",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ward-abdonimal-tapping",
    department: "WARD",
    name: "Abdonimal Tapping",
    price: 800.00,
    invoiceType: "IPD",
    category: "PROCEDURE",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ward-arterial-line-insertion",
    department: "WARD",
    name: "Arterial Line Insertion",
    price: 1200.00,
    invoiceType: "IPD",
    category: "PROCEDURE",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ward-bipap-cpap-per-hrs",
    department: "WARD",
    name: "Bipap / Cpap (Per Hrs)",
    price: 200.00,
    invoiceType: "IPD",
    category: "PROCEDURE",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ward-bipap-cpap-per-day",
    department: "WARD",
    name: "Bipap / Cpap Per Day",
    price: 3000.00,
    invoiceType: "IPD",
    category: "PROCEDURE",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ward-bipap-cpap-up-to-12-hours",
    department: "WARD",
    name: "Bipap / Cpap up to 12 Hours",
    price: 1500.00,
    invoiceType: "IPD",
    category: "PROCEDURE",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ward-blood-transfusion-charges-per-unit",
    department: "WARD",
    name: "Blood Transfusion Charges Per Unit",
    price: 500.00,
    invoiceType: "IPD",
    category: "PROCEDURE",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ward-digital-ecg",
    department: "WARD",
    name: "Digital ECG",
    price: 500.00,
    invoiceType: "IPD",
    category: "PROCEDURE",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ward-ecg",
    department: "WARD",
    name: "ECG",
    price: 300.00,
    invoiceType: "IPD",
    category: "PROCEDURE",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ward-infusion-pump",
    department: "WARD",
    name: "Infusion Pump",
    price: 300.00,
    invoiceType: "IPD",
    category: "PROCEDURE",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ward-oxygen-12-hour",
    department: "WARD",
    name: "Oxygen (12 Hour)",
    price: 1500.00,
    invoiceType: "IPD",
    category: "PROCEDURE",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ward-oxygen-24-hour",
    department: "WARD",
    name: "Oxygen (24 Hour)",
    price: 3000.00,
    invoiceType: "IPD",
    category: "PROCEDURE",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ward-oxygen-per-hour",
    department: "WARD",
    name: "Oxygen (Per Hour)",
    price: 200.00,
    invoiceType: "IPD",
    category: "PROCEDURE",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ward-platelet-transfusion-charges-per-unit",
    department: "WARD",
    name: "Platelet Transfusion  Charges Per Unit",
    price: 300.00,
    invoiceType: "IPD",
    category: "PROCEDURE",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "ward-syringe-pump",
    department: "WARD",
    name: "Syringe Pump",
    price: 300.00,
    invoiceType: "IPD",
    category: "PROCEDURE",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-abdomen-ap-erect-view",
    department: "XRAY",
    name: "X-RAY ABDOMEN AP ERECT VIEW",
    price: 300.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-abdomen-ap-supine-view",
    department: "XRAY",
    name: "X-RAY ABDOMEN AP SUPINE VIEW",
    price: 300.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-abdomen-lateral",
    department: "XRAY",
    name: "X-RAY ABDOMEN LATERAL",
    price: 300.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-abdomen-supine",
    department: "XRAY",
    name: "X-RAY ABDOMEN SUPINE",
    price: 300.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-acromioclavicular-joint-left",
    department: "XRAY",
    name: "X-RAY ACROMIOCLAVICULAR JOINT LEFT",
    price: 300.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-acromioclavicular-joint-left-weight-bearing",
    department: "XRAY",
    name: "X-RAY ACROMIOCLAVICULAR JOINT LEFT WEIGHT BEARING",
    price: 300.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-acromioclavicular-joint-right",
    department: "XRAY",
    name: "X-RAY ACROMIOCLAVICULAR JOINT RIGHT",
    price: 300.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-acromioclavicular-joint-right-weight-bearing",
    department: "XRAY",
    name: "X-RAY ACROMIOCLAVICULAR JOINT RIGHT WEIGHT BEARING",
    price: 300.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-ankle-ap",
    department: "XRAY",
    name: "X-RAY ANKLE AP",
    price: 300.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-ankle-ap-lat",
    department: "XRAY",
    name: "X-RAY ANKLE AP & LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-ankle-joint-left-ap-lat",
    department: "XRAY",
    name: "X-RAY ANKLE JOINT LEFT AP & LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-ankle-joint-left-ap-lat-mortise-view",
    department: "XRAY",
    name: "X-RAY ANKLE JOINT LEFT AP & LAT MORTISE VIEW",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-ankle-joint-left-ap-lat-weight-bearing-view",
    department: "XRAY",
    name: "X-RAY ANKLE JOINT LEFT AP & LAT WEIGHT BEARING VIEW",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-ankle-joint-right-ap-lat",
    department: "XRAY",
    name: "X-RAY ANKLE JOINT RIGHT AP & LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-ankle-joint-right-ap-lat-mortise-view",
    department: "XRAY",
    name: "X-RAY ANKLE JOINT RIGHT AP & LAT MORTISE VIEW",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-ankle-joint-right-ap-lat-weight-bearing-view",
    department: "XRAY",
    name: "X-RAY ANKLE JOINT RIGHT AP & LAT WEIGHT BEARING VIEW",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-ankle-lat",
    department: "XRAY",
    name: "X-RAY ANKLE LAT",
    price: 300.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-apicogram",
    department: "XRAY",
    name: "X-RAY APICOGRAM",
    price: 300.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-arm-humerus-ap-and-lat",
    department: "XRAY",
    name: "X-RAY ARM (HUMERUS) AP AND LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-arm-ap-lat",
    department: "XRAY",
    name: "X-RAY ARM AP & LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-arm-both-ap",
    department: "XRAY",
    name: "X-RAY ARM BOTH AP",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-arm-with-elbow-left-ap-lat",
    department: "XRAY",
    name: "X-RAY ARM WITH ELBOW LEFT AP & LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-arm-with-elbow-right-ap-lat",
    department: "XRAY",
    name: "X-RAY ARM WITH ELBOW RIGHT AP & LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-base-skull-axial-view",
    department: "XRAY",
    name: "X-RAY BASE SKULL AXIAL VIEW",
    price: 350.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-bilateral-nasal-bone-lateral",
    department: "XRAY",
    name: "X-RAY BILATERAL NASAL BONE LATERAL",
    price: 350.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-both-hips-ap-view",
    department: "XRAY",
    name: "X-RAY BOTH HIPS AP VIEW",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-both-knee-joint-ap-standing-lateral",
    department: "XRAY",
    name: "X-RAY BOTH KNEE JOINT AP STANDING & LATERAL",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-both-knees-ap-lat",
    department: "XRAY",
    name: "X-RAY BOTH KNEES AP & LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-both-knees-skyline-view",
    department: "XRAY",
    name: "X-RAY BOTH KNEES SKYLINE VIEW",
    price: 300.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-chest-ap",
    department: "XRAY",
    name: "X-RAY CHEST AP",
    price: 300.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-chest-lat",
    department: "XRAY",
    name: "X-RAY CHEST LAT",
    price: 300.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-chest-left-lateral-decub",
    department: "XRAY",
    name: "X-RAY CHEST LEFT LATERAL DECUB",
    price: 300.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-chest-lordotic-view",
    department: "XRAY",
    name: "X-RAY CHEST LORDOTIC VIEW",
    price: 300.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-chest-oblique",
    department: "XRAY",
    name: "X-RAY CHEST OBLIQUE",
    price: 300.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-chest-pa",
    department: "XRAY",
    name: "X-RAY CHEST PA",
    price: 300.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-chest-right-lateral",
    department: "XRAY",
    name: "X-RAY CHEST RIGHT LATERAL",
    price: 300.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-clavicle-ap",
    department: "XRAY",
    name: "X-RAY CLAVICLE AP",
    price: 300.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-clavicle-left-ap",
    department: "XRAY",
    name: "X-RAY CLAVICLE LEFT AP",
    price: 300.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-clavicle-right-ap",
    department: "XRAY",
    name: "X-RAY CLAVICLE RIGHT AP",
    price: 300.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-coccyx-ap-lat",
    department: "XRAY",
    name: "X-RAY COCCYX AP & LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-dorsal-lumbar-spine-ap-lat",
    department: "XRAY",
    name: "X-RAY DORSAL LUMBAR SPINE AP/LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-dorsal-lumbar-thoraco-ap-and-lat",
    department: "XRAY",
    name: "X-RAY DORSAL LUMBAR THORACO AP AND LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-dorsal-spine-ap-lat",
    department: "XRAY",
    name: "X-RAY DORSAL SPINE AP & LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-dorsal-spine-lat-flexion-extension",
    department: "XRAY",
    name: "X-RAY DORSAL SPINE LAT FLEXION / EXTENSION",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-elbow-joint-left-ap-lat",
    department: "XRAY",
    name: "X-RAY ELBOW JOINT LEFT AP & LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-elbow-joint-right-ap-lat",
    department: "XRAY",
    name: "X-RAY ELBOW JOINT RIGHT AP & LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-erect-abdomen",
    department: "XRAY",
    name: "X-RAY ERECT ABDOMEN",
    price: 350.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-femur-ap-lat",
    department: "XRAY",
    name: "X-RAY FEMUR AP & LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-femur-left-ap-lat",
    department: "XRAY",
    name: "X-RAY FEMUR LEFT AP & LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-femur-right-ap-lat",
    department: "XRAY",
    name: "X-RAY FEMUR RIGHT AP & LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-finger-ap-oblique",
    department: "XRAY",
    name: "X-RAY FINGER AP & OBLIQUE",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-foot-ap-lat",
    department: "XRAY",
    name: "X-RAY FOOT AP & LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-foot-ap-oblique",
    department: "XRAY",
    name: "X-RAY FOOT AP & OBLIQUE",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-foot-left-ap-lat",
    department: "XRAY",
    name: "X-RAY FOOT LEFT AP & LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-foot-left-ap-oblique",
    department: "XRAY",
    name: "X-RAY FOOT LEFT AP & OBLIQUE",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-foot-right-ap-lat",
    department: "XRAY",
    name: "X-RAY FOOT RIGHT AP & LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-foot-right-ap-oblique",
    department: "XRAY",
    name: "X-RAY FOOT RIGHT AP & OBLIQUE",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-forearm-ap-lat",
    department: "XRAY",
    name: "X-RAY FOREARM AP & LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-forearm-left-ap-lat",
    department: "XRAY",
    name: "X-RAY FOREARM LEFT AP & LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-forearm-right-ap-lat",
    department: "XRAY",
    name: "X-RAY FOREARM RIGHT AP & LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-forearm-with-wrist-ap-and-lat",
    department: "XRAY",
    name: "X-RAY FOREARM WITH WRIST AP AND LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-forearm-with-wrist-left-ap-lat",
    department: "XRAY",
    name: "X-RAY FOREARM WITH WRIST LEFT AP & LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-forearm-with-wrist-right-ap-lat",
    department: "XRAY",
    name: "X-RAY FOREARM WITH WRIST RIGHT AP & LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-gastrograffin-enema",
    department: "XRAY",
    name: "X-RAY GASTROGRAFFIN ENEMA",
    price: 300.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-hand-wrist-right-ap",
    department: "XRAY",
    name: "X-RAY HAND & WRIST RIGHT AP",
    price: 300.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-hand-ap-lat",
    department: "XRAY",
    name: "X-RAY HAND AP & LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-hand-left-ap-lateral",
    department: "XRAY",
    name: "X-RAY HAND LEFT AP & LATERAL",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-hand-left-pa-oblique-view",
    department: "XRAY",
    name: "X-RAY HAND LEFT PA & OBLIQUE VIEW",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-hand-right-pa-oblique-view",
    department: "XRAY",
    name: "X-RAY HAND RIGHT PA & OBLIQUE VIEW",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-hands-both-ap",
    department: "XRAY",
    name: "X-RAY HANDS BOTH AP",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-hands-both-ball-catcher-s-view",
    department: "XRAY",
    name: "X-RAY HANDS BOTH BALL CATCHER'S VIEW",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-hands-both-pa",
    department: "XRAY",
    name: "X-RAY HANDS BOTH PA",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-hands-with-wrist-both-ap",
    department: "XRAY",
    name: "X-RAY HANDS WITH WRIST BOTH AP",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-hands-with-wrist-both-lateral",
    department: "XRAY",
    name: "X-RAY HANDS WITH WRIST BOTH LATERAL",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-heel-lat",
    department: "XRAY",
    name: "X-RAY HEEL LAT",
    price: 300.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-heel-left-axial-lat-for-calcaneum",
    department: "XRAY",
    name: "X-RAY HEEL LEFT AXIAL & LAT FOR CALCANEUM",
    price: 350.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-heel-right-axial-lat-for-calcaneum",
    department: "XRAY",
    name: "X-RAY HEEL RIGHT AXIAL & LAT FOR CALCANEUM",
    price: 350.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-heels-both-lat-for-calcaneum",
    department: "XRAY",
    name: "X-RAY HEELS BOTH LAT FOR CALCANEUM",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-hip-including-pelvis",
    department: "XRAY",
    name: "X-RAY HIP INCLUDING PELVIS",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-hip-joint-ap-lat",
    department: "XRAY",
    name: "X-RAY HIP JOINT AP & LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-hip-joint-left-ap-and-lat",
    department: "XRAY",
    name: "X-RAY HIP JOINT LEFT AP AND LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-hip-thigh-ap-lat",
    department: "XRAY",
    name: "X-RAY HIP THIGH AP & LAT",
    price: 350.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-humers-ap-lat-arm",
    department: "XRAY",
    name: "X-RAY HUMERS AP/LAT ARM",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-humerus-ap-and-lat",
    department: "XRAY",
    name: "X-RAY HUMERUS AP AND LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-humerus-ap-lat",
    department: "XRAY",
    name: "X-RAY HUMERUS AP LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-humerus-let-ap-lat",
    department: "XRAY",
    name: "X-RAY HUMERUS LET AP & LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-humerus-right-ap-lat",
    department: "XRAY",
    name: "X-RAY HUMERUS RIGHT AP & LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-index-finger-ap-lat",
    department: "XRAY",
    name: "X-RAY INDEX FINGER AP & LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-knee-ap-lat",
    department: "XRAY",
    name: "X-RAY KNEE AP & LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-knee-ap-both",
    department: "XRAY",
    name: "X-RAY KNEE AP BOTH",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-knee-ap-lat-both",
    department: "XRAY",
    name: "X-RAY KNEE AP/LAT BOTH",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-knee-joint-both-ap",
    department: "XRAY",
    name: "X-RAY KNEE JOINT BOTH AP",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-knee-joint-left-ap-lat",
    department: "XRAY",
    name: "X-RAY KNEE JOINT LEFT AP & LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-knee-joint-left-ap-standing-lateral",
    department: "XRAY",
    name: "X-RAY KNEE JOINT LEFT AP STANDING LATERAL",
    price: 350.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-knee-joint-left-ap-standing-lateral-skyline",
    department: "XRAY",
    name: "X-RAY KNEE JOINT LEFT AP STANDING LATERAL & SKYLINE",
    price: 350.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-knee-joint-right-ap-lat",
    department: "XRAY",
    name: "X-RAY KNEE JOINT RIGHT AP & LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-knee-joint-right-ap-standing-lateral",
    department: "XRAY",
    name: "X-RAY KNEE JOINT RIGHT AP STANDING & LATERAL",
    price: 350.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-knee-joint-right-ap-standing-lateral-skyline",
    department: "XRAY",
    name: "X-RAY KNEE JOINT RIGHT AP STANDING LATERAL & SKYLINE",
    price: 350.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-knee-lat-both",
    department: "XRAY",
    name: "X-RAY KNEE LAT BOTH",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-knee-left-ap-lat",
    department: "XRAY",
    name: "X-RAY KNEE LEFT AP & LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-knee-left-ap-lat-with-leg",
    department: "XRAY",
    name: "X-RAY KNEE LEFT AP & LAT WITH LEG",
    price: 350.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-knee-right-ap-and-lat",
    department: "XRAY",
    name: "X-RAY KNEE RIGHT AP AND LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-knee-right-ap-and-lat-with-leg",
    department: "XRAY",
    name: "X-RAY KNEE RIGHT AP AND LAT WITH LEG",
    price: 350.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-kub-abdomen",
    department: "XRAY",
    name: "X-RAY KUB ABDOMEN",
    price: 350.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-kub-abdomen-pelvis",
    department: "XRAY",
    name: "X-RAY KUB ABDOMEN & PELVIS",
    price: 350.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-kub-adult",
    department: "XRAY",
    name: "X-RAY KUB ADULT",
    price: 350.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-kub-child",
    department: "XRAY",
    name: "X-RAY KUB CHILD",
    price: 350.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-left-ankle-ap-lat",
    department: "XRAY",
    name: "X-RAY LEFT ANKLE AP & LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-left-elbow-ap-lateral",
    department: "XRAY",
    name: "X-RAY LEFT ELBOW AP & LATERAL",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-left-foot-ap-lat",
    department: "XRAY",
    name: "X-RAY LEFT FOOT AP & LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-left-foot-ap-oblique",
    department: "XRAY",
    name: "X-RAY LEFT FOOT AP OBLIQUE",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-left-forearm-ap-lat",
    department: "XRAY",
    name: "X-RAY LEFT FOREARM AP & LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-left-hand-ap-lat",
    department: "XRAY",
    name: "X-RAY LEFT HAND AP & LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-left-knee-ap-lat",
    department: "XRAY",
    name: "X-RAY LEFT KNEE AP & LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-left-leg-ap-lat",
    department: "XRAY",
    name: "X-RAY LEFT LEG AP & LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-left-wrist-ap-lat",
    department: "XRAY",
    name: "X-RAY LEFT WRIST AP & LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-leg-ap-lat",
    department: "XRAY",
    name: "X-RAY LEG AP & LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-leg-left-ap-lat",
    department: "XRAY",
    name: "X-RAY LEG LEFT AP & LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-leg-lower-ap-lat",
    department: "XRAY",
    name: "X-RAY LEG LOWER AP & LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-leg-right-ap-lat",
    department: "XRAY",
    name: "X-RAY LEG RIGHT AP & LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-little-finger-ap-lat",
    department: "XRAY",
    name: "X-RAY LITTLE FINGER AP & LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-lumbar-spine-ap-lat",
    department: "XRAY",
    name: "X-RAY LUMBAR SPINE AP & LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-lumbar-spine-right-left-oblique",
    department: "XRAY",
    name: "X-RAY LUMBAR SPINE RIGHT & LEFT OBLIQUE",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-lumbosacral-spine-ap-lat",
    department: "XRAY",
    name: "X-RAY LUMBOSACRAL SPINE AP & LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-lumbosacral-spine-lat-flexion-extension",
    department: "XRAY",
    name: "X-RAY LUMBOSACRAL SPINE LAT FLEXION/EXTENSION",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-mandible-ap-lat",
    department: "XRAY",
    name: "X-RAY MANDIBLE AP / LAT",
    price: 350.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-mandible-oblique-lat",
    department: "XRAY",
    name: "X-RAY MANDIBLE OBLIQUE / LAT",
    price: 350.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-middle-finger-ap-lat",
    department: "XRAY",
    name: "X-RAY MIDDLE FINGER AP & LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-nasal-bone",
    department: "XRAY",
    name: "X-RAY NASAL BONE",
    price: 300.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-nasal-bone-lateral",
    department: "XRAY",
    name: "X-RAY NASAL BONE LATERAL",
    price: 300.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-nasopharynx",
    department: "XRAY",
    name: "X-RAY NASOPHARYNX",
    price: 300.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-neck-ap-lat",
    department: "XRAY",
    name: "X-RAY NECK AP & LAT",
    price: 350.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-pelvis-ap",
    department: "XRAY",
    name: "X-RAY PELVIS AP",
    price: 350.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-pelvis-ap-both",
    department: "XRAY",
    name: "X-RAY PELVIS AP BOTH",
    price: 350.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-pelvis-ap-with-both-hip",
    department: "XRAY",
    name: "X-RAY PELVIS AP WITH BOTH HIP",
    price: 350.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-pelvis-frog-leg-view",
    department: "XRAY",
    name: "X-RAY PELVIS FROG LEG VIEW",
    price: 350.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-pns",
    department: "XRAY",
    name: "X-RAY PNS",
    price: 350.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-pns-waters-view",
    department: "XRAY",
    name: "X-RAY PNS WATERS VIEW",
    price: 350.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-right-foot-ap-oblic",
    department: "XRAY",
    name: "X-RAY RIGHT FOOT AP & OBLIC",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-right-forearm-ap-lat",
    department: "XRAY",
    name: "X-RAY RIGHT FOREARM AP & LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-right-hand-ap-lat",
    department: "XRAY",
    name: "X-RAY RIGHT HAND AP & LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-right-shoulder-ap-view",
    department: "XRAY",
    name: "X-RAY RIGHT SHOULDER AP VIEW",
    price: 300.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-right-wrist-ap-lat",
    department: "XRAY",
    name: "X-RAY RIGHT WRIST AP & LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-ring-finger-ap-lat",
    department: "XRAY",
    name: "X-RAY RING FINGER AP & LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-sacral-ap",
    department: "XRAY",
    name: "X-RAY SACRAL AP",
    price: 300.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-sacroilliac-joint-ap",
    department: "XRAY",
    name: "X-RAY SACROILLIAC JOINT AP",
    price: 300.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-sacrum-coccyx-ap-lat",
    department: "XRAY",
    name: "X-RAY SACRUM / COCCYX AP & LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-scapula-left-ap-lat",
    department: "XRAY",
    name: "X-RAY SCAPULA LEFT AP & LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-scapula-right-ap-lat",
    department: "XRAY",
    name: "X-RAY SCAPULA RIGHT AP & LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-shoulder-ap-and-lat",
    department: "XRAY",
    name: "X-RAY SHOULDER AP AND LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-shoulder-left-ap-lat",
    department: "XRAY",
    name: "X-RAY SHOULDER LEFT AP & LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-shoulder-right-ap-lat",
    department: "XRAY",
    name: "X-RAY SHOULDER RIGHT AP & LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-skull-ap-lat",
    department: "XRAY",
    name: "X-RAY SKULL AP & LAT",
    price: 350.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-spine-cervical-ap-lat",
    department: "XRAY",
    name: "X-RAY SPINE CERVICAL AP & LAT",
    price: 350.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-spine-cervical-both-obliq",
    department: "XRAY",
    name: "X-RAY SPINE CERVICAL BOTH & OBLIQ",
    price: 350.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-spine-ls-ap-lat",
    department: "XRAY",
    name: "X-RAY SPINE LS AP & LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-spine-ls-with-both-hips-ap",
    department: "XRAY",
    name: "X-RAY SPINE LS WITH BOTH HIPS AP",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-spine-thoracic-ap-lat",
    department: "XRAY",
    name: "X-RAY SPINE THORACIC AP & LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-spine-thoraco-lumbar-ap-lat",
    department: "XRAY",
    name: "X-RAY SPINE THORACO LUMBAR AP & LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-sternum-ap-lat",
    department: "XRAY",
    name: "X-RAY STERNUM AP & LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-sternum-oblique-lateral",
    department: "XRAY",
    name: "X-RAY STERNUM OBLIQUE & LATERAL",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-thigh-ap-lateral",
    department: "XRAY",
    name: "X-RAY THIGH AP & LATERAL",
    price: 350.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-thoracic-spine-ap-lat",
    department: "XRAY",
    name: "X-RAY THORACIC SPINE AP & LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-thoraco-lumbar-spine-ap-and-lat",
    department: "XRAY",
    name: "X-RAY THORACO LUMBAR SPINE AP AND LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-thumb-ap-lat",
    department: "XRAY",
    name: "X-RAY THUMB AP & LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-tibia-ap-lateral",
    department: "XRAY",
    name: "X-RAY TIBIA AP & LATERAL",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-tibia-with-ankle",
    department: "XRAY",
    name: "X-RAY TIBIA WITH ANKLE",
    price: 350.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-tm-joint-left-open-closed-mouth",
    department: "XRAY",
    name: "X-RAY TM JOINT LEFT (OPEN/CLOSED MOUTH)",
    price: 350.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-tm-joints",
    department: "XRAY",
    name: "X-RAY TM JOINTS",
    price: 350.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-wrist-hand-lt-ap",
    department: "XRAY",
    name: "X-RAY WRIST & HAND LT AP",
    price: 350.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-wrist-ap-lat",
    department: "XRAY",
    name: "X-RAY WRIST AP & LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
  {
    id: "xray-x-ray-wrist-left-ap-lat",
    department: "XRAY",
    name: "X-RAY WRIST LEFT AP & LAT",
    price: 500.00,
    invoiceType: "LAB",
    category: "LAB",
    source: "6. Price List Sims Hospital.xls",
    editablePrice: false
  },
];

export const findCatalogItem = (id: string) => SERVICE_CATALOG.find((item) => item.id === id) ?? null;
export const filterCatalogByDepartment = (department: ServiceDepartment) => SERVICE_CATALOG.filter((item) => item.department === department);
