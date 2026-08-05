export interface LocationDirectoryItem {
  district: string;
  city: string;
  province: string;
  postal_code: string;
  area_id: string;
  subdistrict?: string;
  keywords?: string[];
}

export const INDONESIA_LOCATION_DIRECTORY: LocationDirectoryItem[] = [
  // KABUPATEN KARAWANG
  { district: "Tempuran", city: "Karawang", province: "Jawa Barat", postal_code: "41385", area_id: "IDNPJ_TEMP", subdistrict: "Sumberjaya", keywords: ["sumberjaya", "sumber jaya", "tempuran"] },
  { district: "Rengasdengklok", city: "Karawang", province: "Jawa Barat", postal_code: "41352", area_id: "IDNPJ_RENG", keywords: ["rengasdengklok", "dengklok"] },
  { district: "Klari", city: "Karawang", province: "Jawa Barat", postal_code: "41371", area_id: "IDNPJ_KLARI", subdistrict: "Kosambi", keywords: ["klari", "kosambi"] },
  { district: "Telukjambe Timur", city: "Karawang", province: "Jawa Barat", postal_code: "41361", area_id: "IDNPJ_TELUK", subdistrict: "Wadas", keywords: ["wadas", "galuh mas", "telukjambe timur"] },
  { district: "Telukjambe Barat", city: "Karawang", province: "Jawa Barat", postal_code: "41361", area_id: "IDNPJ_TELUK2", keywords: ["telukjambe barat", "badami"] },
  { district: "Cikampek", city: "Karawang", province: "Jawa Barat", postal_code: "41373", area_id: "IDNPJ_CKM", keywords: ["cikampek", "dawuan"] },
  { district: "Kotabaru", city: "Karawang", province: "Jawa Barat", postal_code: "41374", area_id: "IDNPJ_KOTAB", subdistrict: "Sarimulya", keywords: ["kotabaru", "sarimulya"] },
  { district: "Jatisari", city: "Karawang", province: "Jawa Barat", postal_code: "41374", area_id: "IDNPJ_KOTAB2", subdistrict: "Balonggandu", keywords: ["jatisari", "balonggandu"] },
  { district: "Cilamaya Wetan", city: "Karawang", province: "Jawa Barat", postal_code: "41384", area_id: "IDNPJ_CILAM", keywords: ["cilamaya wetan", "cilamaya"] },
  { district: "Cilamaya Kulon", city: "Karawang", province: "Jawa Barat", postal_code: "41384", area_id: "IDNPJ_CILAM2", keywords: ["cilamaya kulon", "pasirjaya"] },
  { district: "Karawang Barat", city: "Karawang", province: "Jawa Barat", postal_code: "41311", area_id: "IDNPJ_KRWB", subdistrict: "Tanjungpura", keywords: ["karawang barat", "tanjungpura"] },
  { district: "Karawang Timur", city: "Karawang", province: "Jawa Barat", postal_code: "41314", area_id: "IDNPJ_KRWT", subdistrict: "Kondangjaya", keywords: ["karawang timur", "kondangjaya"] },
  { district: "Cibuaya", city: "Karawang", province: "Jawa Barat", postal_code: "41354", area_id: "IDNPJ_CIBU", keywords: ["cibuaya"] },
  { district: "Batujaya", city: "Karawang", province: "Jawa Barat", postal_code: "41354", area_id: "IDNPJ_BATU", subdistrict: "Segaran", keywords: ["batujaya", "segaran"] },

  // JAKARTA SELATAN (12xxx)
  { district: "Kebayoran Baru", city: "Jakarta Selatan", province: "DKI Jakarta", postal_code: "12110", area_id: "IDNPJ001", subdistrict: "Senopati", keywords: ["senopati", "kebayoran baru", "gandaria utara", "melawai"] },
  { district: "Cilandak", city: "Jakarta Selatan", province: "DKI Jakarta", postal_code: "12430", area_id: "IDNPJ002", subdistrict: "Cilandak Barat", keywords: ["cilandak barat", "fatmawati", "lebak bulus", "cilandak"] },
  { district: "Kebayoran Lama", city: "Jakarta Selatan", province: "DKI Jakarta", postal_code: "12240", area_id: "IDNPJ002", subdistrict: "Pondok Indah", keywords: ["pondok indah", "kebayoran lama", "cipulir"] },
  { district: "Pasar Minggu", city: "Jakarta Selatan", province: "DKI Jakarta", postal_code: "12520", area_id: "IDNPJ002", subdistrict: "Ragunan", keywords: ["ragunan", "pejaten", "pasar minggu"] },
  { district: "Mampang Prapatan", city: "Jakarta Selatan", province: "DKI Jakarta", postal_code: "12710", area_id: "IDNPJ002", subdistrict: "Kemang / Bangka", keywords: ["kemang", "bangka", "mampang", "mampang prapatan"] },
  { district: "Pancoran", city: "Jakarta Selatan", province: "DKI Jakarta", postal_code: "12780", area_id: "IDNPJ002", keywords: ["pancoran", "kalibata"] },
  { district: "Tebet", city: "Jakarta Selatan", province: "DKI Jakarta", postal_code: "12810", area_id: "IDNPJ002", subdistrict: "Tebet Barat", keywords: ["tebet", "tebet barat", "menteng dalam"] },
  { district: "Setiabudi", city: "Jakarta Selatan", province: "DKI Jakarta", postal_code: "12910", area_id: "IDNPJ002", subdistrict: "Mega Kuningan", keywords: ["setiabudi", "mega kuningan", "karet kuningan", "kuningan"] },

  // JAKARTA PUSAT (10xxx)
  { district: "Menteng", city: "Jakarta Pusat", province: "DKI Jakarta", postal_code: "10310", area_id: "IDNPJ004", subdistrict: "Cikini / Gondangdia", keywords: ["menteng", "cikini", "gondangdia", "sudirman"] },
  { district: "Tanah Abang", city: "Jakarta Pusat", province: "DKI Jakarta", postal_code: "10250", area_id: "IDNPJ005", subdistrict: "Senayan / Gelora", keywords: ["tanah abang", "senayan", "gelora", "bung karno", "benhil", "bendungan hilir"] },
  { district: "Senen", city: "Jakarta Pusat", province: "DKI Jakarta", postal_code: "10410", area_id: "IDNPJ003", subdistrict: "Kramat", keywords: ["senen", "kramat raya", "kramat"] },
  { district: "Kemayoran", city: "Jakarta Pusat", province: "DKI Jakarta", postal_code: "10610", area_id: "IDNPJ003", keywords: ["kemayoran", "serdang"] },
  { district: "Cempaka Putih", city: "Jakarta Pusat", province: "DKI Jakarta", postal_code: "10510", area_id: "IDNPJ003", keywords: ["cempaka putih"] },
  { district: "Johar Baru", city: "Jakarta Pusat", province: "DKI Jakarta", postal_code: "10560", area_id: "IDNPJ003", keywords: ["johar baru"] },
  { district: "Gambir", city: "Jakarta Pusat", province: "DKI Jakarta", postal_code: "10110", area_id: "IDNPJ003", subdistrict: "Monas / Petojo", keywords: ["gambir", "monas", "petojo"] },
  { district: "Sawah Besar", city: "Jakarta Pusat", province: "DKI Jakarta", postal_code: "10710", area_id: "IDNPJ003", subdistrict: "Mangga Dua", keywords: ["sawah besar", "mangga dua"] },

  // JAKARTA BARAT (11xxx)
  { district: "Kembangan", city: "Jakarta Barat", province: "DKI Jakarta", postal_code: "11610", area_id: "IDNPJ010", subdistrict: "Puri Indah", keywords: ["kembangan", "puri indah", "meruya", "joglo"] },
  { district: "Kebon Jeruk", city: "Jakarta Barat", province: "DKI Jakarta", postal_code: "11530", area_id: "IDNPJ010", subdistrict: "Kedoya", keywords: ["kebon jeruk", "kedoya", "duri kepa"] },
  { district: "Grogol Petamburan", city: "Jakarta Barat", province: "DKI Jakarta", postal_code: "11450", area_id: "IDNPJ011", subdistrict: "Tanjung Duren", keywords: ["grogol", "grogol petamburan", "tanjung duren", "central park", "tomang"] },
  { district: "Palmerah", city: "Jakarta Barat", province: "DKI Jakarta", postal_code: "11480", area_id: "IDNPJ011", subdistrict: "Slipi / Kemanggisan", keywords: ["palmerah", "slipi", "kemanggisan"] },
  { district: "Tamansari", city: "Jakarta Barat", province: "DKI Jakarta", postal_code: "11110", area_id: "IDNPJ011", subdistrict: "Kota Tua / Glodok", keywords: ["tamansari", "kota tua", "glodok"] },
  { district: "Tambora", city: "Jakarta Barat", province: "DKI Jakarta", postal_code: "11210", area_id: "IDNPJ011", keywords: ["tambora"] },
  { district: "Cengkareng", city: "Jakarta Barat", province: "DKI Jakarta", postal_code: "11730", area_id: "IDNPJ011", keywords: ["cengkareng"] },
  { district: "Kalideres", city: "Jakarta Barat", province: "DKI Jakarta", postal_code: "11840", area_id: "IDNPJ011", keywords: ["kalideres"] },

  // JAKARTA UTARA (14xxx)
  { district: "Kelapa Gading", city: "Jakarta Utara", province: "DKI Jakarta", postal_code: "14240", area_id: "IDNPJ006", subdistrict: "Boulevard", keywords: ["kelapa gading", "pegangsaan dua", "boulevard"] },
  { district: "Penjaringan", city: "Jakarta Utara", province: "DKI Jakarta", postal_code: "14440", area_id: "IDNPJ007", subdistrict: "PIK / Pluit", keywords: ["penjaringan", "pik", "pantai indah kapuk", "pluit", "baywalk", "muara karang"] },
  { district: "Pademangan", city: "Jakarta Utara", province: "DKI Jakarta", postal_code: "14420", area_id: "IDNPJ007", subdistrict: "Ancol", keywords: ["pademangan", "ancol"] },
  { district: "Tanjung Priok", city: "Jakarta Utara", province: "DKI Jakarta", postal_code: "14310", area_id: "IDNPJ007", subdistrict: "Sunter", keywords: ["tanjung priok", "sunter", "sunter agung", "sunter jaya"] },
  { district: "Koja", city: "Jakarta Utara", province: "DKI Jakarta", postal_code: "14210", area_id: "IDNPJ007", keywords: ["koja"] },
  { district: "Cilincing", city: "Jakarta Utara", province: "DKI Jakarta", postal_code: "14120", area_id: "IDNPJ007", keywords: ["cilincing"] },

  // JAKARTA TIMUR (13xxx)
  { district: "Cakung", city: "Jakarta Timur", province: "DKI Jakarta", postal_code: "13910", area_id: "IDNPJ008", subdistrict: "Pulogebang", keywords: ["cakung", "pulogebang"] },
  { district: "Jatinegara", city: "Jakarta Timur", province: "DKI Jakarta", postal_code: "13310", area_id: "IDNPJ009", subdistrict: "Bidara Cina / Cipinang", keywords: ["jatinegara", "bidara cina", "cipinang"] },
  { district: "Matraman", city: "Jakarta Timur", province: "DKI Jakarta", postal_code: "13140", area_id: "IDNPJ009", keywords: ["matraman"] },
  { district: "Pulogadung", city: "Jakarta Timur", province: "DKI Jakarta", postal_code: "13210", area_id: "IDNPJ009", subdistrict: "Rawamangun", keywords: ["pulogadung", "rawamangun"] },
  { district: "Duren Sawit", city: "Jakarta Timur", province: "DKI Jakarta", postal_code: "13440", area_id: "IDNPJ009", subdistrict: "Pondok Bambu / Klender", keywords: ["duren sawit", "pondok bambu", "klender"] },
  { district: "Kramat Jati", city: "Jakarta Timur", province: "DKI Jakarta", postal_code: "13510", area_id: "IDNPJ009", subdistrict: "Cawang", keywords: ["kramat jati", "cawang"] },
  { district: "Makasar", city: "Jakarta Timur", province: "DKI Jakarta", postal_code: "13570", area_id: "IDNPJ009", subdistrict: "Halim Perdanakusuma", keywords: ["makasar", "halim", "halim pk"] },
  { district: "Pasar Rebo", city: "Jakarta Timur", province: "DKI Jakarta", postal_code: "13760", area_id: "IDNPJ009", keywords: ["pasar rebo"] },
  { district: "Ciracas", city: "Jakarta Timur", province: "DKI Jakarta", postal_code: "13740", area_id: "IDNPJ009", subdistrict: "Cibubur", keywords: ["ciracas", "kampung rambutan", "cibubur"] },
  { district: "Cipayung", city: "Jakarta Timur", province: "DKI Jakarta", postal_code: "13840", area_id: "IDNPJ009", keywords: ["cipayung"] },

  // TANGERANG & TANGERANG SELATAN (15xxx)
  { district: "Serpong", city: "Tangerang Selatan", province: "Banten", postal_code: "15310", area_id: "IDNPT001", subdistrict: "BSD City", keywords: ["serpong", "bsd", "bsd city"] },
  { district: "Serpong Utara", city: "Tangerang Selatan", province: "Banten", postal_code: "15326", area_id: "IDNPT001", subdistrict: "Alam Sutera", keywords: ["serpong utara", "alam sutera"] },
  { district: "Pondok Aren", city: "Tangerang Selatan", province: "Banten", postal_code: "15220", area_id: "IDNPT002", subdistrict: "Bintaro Jaya", keywords: ["pondok aren", "bintaro", "bintaro jaya"] },
  { district: "Ciputat", city: "Tangerang Selatan", province: "Banten", postal_code: "15411", area_id: "IDNPT002", keywords: ["ciputat"] },
  { district: "Ciputat Timur", city: "Tangerang Selatan", province: "Banten", postal_code: "15419", area_id: "IDNPT002", subdistrict: "Cirendeu / Pisangan", keywords: ["ciputat timur", "cirendeu", "pisangan"] },
  { district: "Pamulang", city: "Tangerang Selatan", province: "Banten", postal_code: "15417", area_id: "IDNPT002", keywords: ["pamulang"] },
  { district: "Setu", city: "Tangerang Selatan", province: "Banten", postal_code: "15314", area_id: "IDNPT002", subdistrict: "Babakan", keywords: ["setu", "babakan"] },
  { district: "Karawaci", city: "Tangerang", province: "Banten", postal_code: "15115", area_id: "IDNPT003", subdistrict: "Lippo Village", keywords: ["karawaci", "lippo village"] },
  { district: "Kelapa Dua", city: "Tangerang", province: "Banten", postal_code: "15810", area_id: "IDNPT003", subdistrict: "Gading Serpong", keywords: ["kelapa dua", "gading serpong"] },
  { district: "Ciledug", city: "Tangerang", province: "Banten", postal_code: "15151", area_id: "IDNPT003", keywords: ["ciledug"] },
  { district: "Cipondoh", city: "Tangerang", province: "Banten", postal_code: "15148", area_id: "IDNPT003", keywords: ["cipondoh"] },
  { district: "Cikupa", city: "Tangerang", province: "Banten", postal_code: "15710", area_id: "IDNPT003", keywords: ["cikupa"] },
  { district: "Balaraja", city: "Tangerang", province: "Banten", postal_code: "15610", area_id: "IDNPT003", keywords: ["balaraja"] },
  { district: "Benda", city: "Tangerang", province: "Banten", postal_code: "15126", area_id: "IDNPT003", subdistrict: "Bandara Soekarno-Hatta", keywords: ["benda", "bandara", "soekarno-hatta"] },

  // DEPOK & BOGOR (16xxx)
  { district: "Beji", city: "Depok", province: "Jawa Barat", postal_code: "16421", area_id: "IDNPB006", subdistrict: "Margonda", keywords: ["beji", "margonda", "margonda raya"] },
  { district: "Pancoran Mas", city: "Depok", province: "Jawa Barat", postal_code: "16431", area_id: "IDNPB007", keywords: ["pancoran mas"] },
  { district: "Sukmajaya", city: "Depok", province: "Jawa Barat", postal_code: "16411", area_id: "IDNPB007", keywords: ["sukmajaya"] },
  { district: "Cimanggis", city: "Depok", province: "Jawa Barat", postal_code: "16451", area_id: "IDNPB007", subdistrict: "Kelapa Dua Depok", keywords: ["cimanggis", "kelapa dua depok"] },
  { district: "Tapos", city: "Depok", province: "Jawa Barat", postal_code: "16454", area_id: "IDNPB007", keywords: ["tapos"] },
  { district: "Sawangan", city: "Depok", province: "Jawa Barat", postal_code: "16511", area_id: "IDNPB007", keywords: ["sawangan"] },
  { district: "Cinere", city: "Depok", province: "Jawa Barat", postal_code: "16514", area_id: "IDNPB007", keywords: ["cinere"] },
  { district: "Limo", city: "Depok", province: "Jawa Barat", postal_code: "16515", area_id: "IDNPB007", keywords: ["limo"] },
  { district: "Bogor Tengah", city: "Bogor", province: "Jawa Barat", postal_code: "16121", area_id: "IDNPB004", subdistrict: "Pajajaran / Botani", keywords: ["bogor tengah", "pajajaran", "botani"] },
  { district: "Bogor Utara", city: "Bogor", province: "Jawa Barat", postal_code: "16151", area_id: "IDNPB005", subdistrict: "Bantarjati", keywords: ["bogor utara", "bantarjati"] },
  { district: "Bogor Selatan", city: "Bogor", province: "Jawa Barat", postal_code: "16131", area_id: "IDNPB005", subdistrict: "Tajur / Ciawi", keywords: ["bogor selatan", "tajur", "ciawi"] },
  { district: "Bogor Barat", city: "Bogor", province: "Jawa Barat", postal_code: "16111", area_id: "IDNPB005", subdistrict: "Yasmin / Bubulak", keywords: ["bogor barat", "yasmin", "bubulak"] },
  { district: "Babakan Madang", city: "Kab. Bogor", province: "Jawa Barat", postal_code: "16810", area_id: "IDNPB005", subdistrict: "Sentul City", keywords: ["babakan madang", "sentul", "sentul city"] },
  { district: "Cibinong", city: "Kab. Bogor", province: "Jawa Barat", postal_code: "16911", area_id: "IDNPB005", keywords: ["cibinong"] },
  { district: "Cisarua", city: "Kab. Bogor", province: "Jawa Barat", postal_code: "16750", area_id: "IDNPB005", subdistrict: "Puncak / Megamendung", keywords: ["cisarua", "puncak", "megamendung"] },

  // BEKASI & CIKARANG (17xxx)
  { district: "Bekasi Barat", city: "Bekasi", province: "Jawa Barat", postal_code: "17131", area_id: "IDNPB008", subdistrict: "Summarecon Bekasi", keywords: ["bekasi barat", "summarecon", "summarecon bekasi"] },
  { district: "Bekasi Selatan", city: "Bekasi", province: "Jawa Barat", postal_code: "17141", area_id: "IDNPB008", subdistrict: "Grand Galaxy", keywords: ["bekasi selatan", "grand galaxy", "pekayon"] },
  { district: "Bekasi Timur", city: "Bekasi", province: "Jawa Barat", postal_code: "17111", area_id: "IDNPB008", keywords: ["bekasi timur"] },
  { district: "Bekasi Utara", city: "Bekasi", province: "Jawa Barat", postal_code: "17121", area_id: "IDNPB008", keywords: ["bekasi utara"] },
  { district: "Jatiasih", city: "Bekasi", province: "Jawa Barat", postal_code: "17421", area_id: "IDNPB009", keywords: ["jatiasih"] },
  { district: "Pondok Gede", city: "Bekasi", province: "Jawa Barat", postal_code: "17411", area_id: "IDNPB009", keywords: ["pondok gede"] },
  { district: "Jatisampurna", city: "Bekasi", province: "Jawa Barat", postal_code: "17433", area_id: "IDNPB009", subdistrict: "CitraGrand", keywords: ["jatisampurna", "citragrand"] },
  { district: "Cikarang Selatan", city: "Kab. Bekasi", province: "Jawa Barat", postal_code: "17550", area_id: "IDNPB009", subdistrict: "Lippo Cikarang", keywords: ["cikarang selatan", "lippo cikarang"] },
  { district: "Cikarang Pusat", city: "Kab. Bekasi", province: "Jawa Barat", postal_code: "17530", area_id: "IDNPB009", subdistrict: "Kota Deltamas", keywords: ["cikarang pusat", "deltamas", "kota deltamas"] },
  { district: "Cibarusah", city: "Kab. Bekasi", province: "Jawa Barat", postal_code: "17340", area_id: "IDNPJ_CBRS", keywords: ["cibarusah", "serang baru"] },

  // BANDUNG & SEKITARNYA (40xxx)
  { district: "Coblong", city: "Bandung", province: "Jawa Barat", postal_code: "40132", area_id: "IDNPB001", subdistrict: "Dago / Cihampelas", keywords: ["coblong", "dago", "cihampelas"] },
  { district: "Sumur Bandung", city: "Bandung", province: "Jawa Barat", postal_code: "40111", area_id: "IDNPB002", subdistrict: "Braga", keywords: ["sumur bandung", "braga", "merdeka"] },
  { district: "Cicendo", city: "Bandung", province: "Jawa Barat", postal_code: "40171", area_id: "IDNPB003", subdistrict: "Pasirkaliki", keywords: ["cicendo", "pasirkaliki"] },
  { district: "Bandung Wetan", city: "Bandung", province: "Jawa Barat", postal_code: "40115", area_id: "IDNPB003", subdistrict: "Riau / Gedung Sate", keywords: ["bandung wetan", "riau", "gedung sate"] },
  { district: "Lengkong", city: "Bandung", province: "Jawa Barat", postal_code: "40264", area_id: "IDNPB003", subdistrict: "Buah Batu", keywords: ["lengkong", "buah batu", "burangrang"] },
  { district: "Batununggal", city: "Bandung", province: "Jawa Barat", postal_code: "40273", area_id: "IDNPB003", subdistrict: "Turangga", keywords: ["batununggal", "turangga"] },
  { district: "Sukajadi", city: "Bandung", province: "Jawa Barat", postal_code: "40161", area_id: "IDNPB003", subdistrict: "Pasteur / PVJ", keywords: ["sukajadi", "pasteur", "pvj", "paris van java"] },
  { district: "Sukasari", city: "Bandung", province: "Jawa Barat", postal_code: "40151", area_id: "IDNPB003", subdistrict: "Setiabudi", keywords: ["sukasari", "setiabudi", "gegerkalong"] },
  { district: "Cidadap", city: "Bandung", province: "Jawa Barat", postal_code: "40142", area_id: "IDNPB003", subdistrict: "Ciumbuleuit", keywords: ["cidadap", "ciumbuleuit"] },
  { district: "Arcamanik", city: "Bandung", province: "Jawa Barat", postal_code: "40293", area_id: "IDNPB003", keywords: ["arcamanik"] },
  { district: "Antapani", city: "Bandung", province: "Jawa Barat", postal_code: "40291", area_id: "IDNPB003", keywords: ["antapani"] },
  { district: "Cileunyi", city: "Kab. Bandung", province: "Jawa Barat", postal_code: "40622", area_id: "IDNPB003", keywords: ["cileunyi"] },
  { district: "Bojongsoang", city: "Kab. Bandung", province: "Jawa Barat", postal_code: "40288", area_id: "IDNPB003", subdistrict: "Telkom University", keywords: ["bojongsoang", "telkom university"] },
  { district: "Cimahi Selatan", city: "Cimahi", province: "Jawa Barat", postal_code: "40533", area_id: "IDNPB003", keywords: ["cimahi selatan", "cimahi"] },
  { district: "Lembang", city: "Kab. Bandung Barat", province: "Jawa Barat", postal_code: "40391", area_id: "IDNPB003", keywords: ["lembang"] },

  // JAWA TENGAH & JOGJA (50xxx - 55xxx)
  { district: "Galur", city: "Kulon Progo", province: "D.I. Yogyakarta", postal_code: "55662", area_id: "IDNPY002", keywords: ["galur"] },
  { district: "Aluh-Aluh", city: "Banjar", province: "Kalimantan Selatan", postal_code: "70652", area_id: "IDNPS008", keywords: ["aluh-aluh"] },
  { district: "Semarang Tengah", city: "Semarang", province: "Jawa Tengah", postal_code: "50131", area_id: "IDNPM001", subdistrict: "Simpang Lima", keywords: ["semarang tengah", "simpang lima"] },
  { district: "Gajahmungkur", city: "Semarang", province: "Jawa Tengah", postal_code: "50231", area_id: "IDNPM002", subdistrict: "Candi", keywords: ["gajahmungkur", "candi"] },
  { district: "Tembalang", city: "Semarang", province: "Jawa Tengah", postal_code: "50275", area_id: "IDNPM002", subdistrict: "Undip", keywords: ["tembalang", "undip"] },
  { district: "Banyumanik", city: "Semarang", province: "Jawa Tengah", postal_code: "50263", area_id: "IDNPM002", keywords: ["banyumanik"] },
  { district: "Pedurungan", city: "Semarang", province: "Jawa Tengah", postal_code: "50192", area_id: "IDNPM002", keywords: ["pedurungan"] },
  { district: "Banjarsari", city: "Surakarta (Solo)", province: "Jawa Tengah", postal_code: "57131", area_id: "IDNPM002", keywords: ["banjarsari", "solo"] },
  { district: "Laweyan", city: "Surakarta (Solo)", province: "Jawa Tengah", postal_code: "57141", area_id: "IDNPM002", subdistrict: "Manahan / Solo Baru", keywords: ["laweyan", "manahan", "solo baru"] },
  { district: "Kudus Kota", city: "Kudus", province: "Jawa Tengah", postal_code: "59311", area_id: "IDNPM002", keywords: ["kudus"] },
  { district: "Pekalongan Barat", city: "Pekalongan", province: "Jawa Tengah", postal_code: "51111", area_id: "IDNPM002", keywords: ["pekalongan barat"] },
  { district: "Magelang Selatan", city: "Magelang", province: "Jawa Tengah", postal_code: "56111", area_id: "IDNPM002", keywords: ["magelang selatan"] },
  { district: "Gondokusuman", city: "Yogyakarta", province: "D.I. Yogyakarta", postal_code: "55221", area_id: "IDNPY001", subdistrict: "Malioboro / Tugu", keywords: ["gondokusuman", "malioboro", "tugu"] },
  { district: "Depok", city: "Sleman", province: "D.I. Yogyakarta", postal_code: "55281", area_id: "IDNPY002", subdistrict: "Gejayan / Seturan / UGM", keywords: ["depok sleman", "gejayan", "seturan", "ugm"] },
  { district: "Mlati", city: "Sleman", province: "D.I. Yogyakarta", postal_code: "55285", area_id: "IDNPY002", subdistrict: "Jombor", keywords: ["mlati", "jombor", "sinduadi"] },
  { district: "Kasihan", city: "Bantul", province: "D.I. Yogyakarta", postal_code: "55183", area_id: "IDNPY002", subdistrict: "Tamantirto", keywords: ["kasihan", "tamantirto"] },
  { district: "Sewon", city: "Bantul", province: "D.I. Yogyakarta", postal_code: "55188", area_id: "IDNPY002", subdistrict: "Bangunharjo", keywords: ["sewon", "bangunharjo"] },
  { district: "Umbulharjo", city: "Yogyakarta", province: "D.I. Yogyakarta", postal_code: "55161", area_id: "IDNPY001", keywords: ["umbulharjo"] },

  // JAWA TIMUR (60xxx - 65xxx)
  { district: "Tegalsari", city: "Surabaya", province: "Jawa Timur", postal_code: "60261", area_id: "IDNPS001", subdistrict: "Basuki Rahmat / Tunjungan", keywords: ["tegalsari", "tunjungan"] },
  { district: "Gubeng", city: "Surabaya", province: "Jawa Timur", postal_code: "60281", area_id: "IDNPS002", subdistrict: "Kertajaya", keywords: ["gubeng", "kertajaya"] },
  { district: "Sukolilo", city: "Surabaya", province: "Jawa Timur", postal_code: "60111", area_id: "IDNPS003", subdistrict: "ITS / Klampis", keywords: ["sukolilo", "its", "klampis"] },
  { district: "Wonokromo", city: "Surabaya", province: "Jawa Timur", postal_code: "60241", area_id: "IDNPS003", subdistrict: "Darmo", keywords: ["wonokromo", "darmo"] },
  { district: "Mulyorejo", city: "Surabaya", province: "Jawa Timur", postal_code: "60115", area_id: "IDNPS003", subdistrict: "Pakuwon City", keywords: ["mulyorejo", "pakuwon city"] },
  { district: "Dukuh Pakis", city: "Surabaya", province: "Jawa Timur", postal_code: "60225", area_id: "IDNPS003", subdistrict: "Graha Famili", keywords: ["dukuh pakis", "graha famili"] },
  { district: "Sambikerep", city: "Surabaya", province: "Jawa Timur", postal_code: "60217", area_id: "IDNPS003", subdistrict: "Citraland", keywords: ["sambikerep", "citraland"] },
  { district: "Rungkut", city: "Surabaya", province: "Jawa Timur", postal_code: "60293", area_id: "IDNPS003", subdistrict: "Brebek", keywords: ["rungkut", "brebek"] },
  { district: "Klojen", city: "Malang", province: "Jawa Timur", postal_code: "65111", area_id: "IDNPS004", subdistrict: "Ijen Raya", keywords: ["klojen", "ijen"] },
  { district: "Lowokwaru", city: "Malang", province: "Jawa Timur", postal_code: "65141", area_id: "IDNPS005", subdistrict: "Suhat / Soekarno Hatta", keywords: ["lowokwaru", "suhat", "soekarno hatta"] },
  { district: "Blimbing", city: "Malang", province: "Jawa Timur", postal_code: "65125", area_id: "IDNPS005", keywords: ["blimbing"] },
  { district: "Batu", city: "Batu", province: "Jawa Timur", postal_code: "65311", area_id: "IDNPS005", keywords: ["batu"] },
  { district: "Sidoarjo", city: "Sidoarjo", province: "Jawa Timur", postal_code: "61212", area_id: "IDNPS003", keywords: ["sidoarjo"] },
  { district: "Waru", city: "Sidoarjo", province: "Jawa Timur", postal_code: "61256", area_id: "IDNPS003", subdistrict: "Juanda", keywords: ["waru", "juanda"] },
  { district: "Kebomas", city: "Gresik", province: "Jawa Timur", postal_code: "61121", area_id: "IDNPS003", keywords: ["kebomas", "gresik"] },

  // BALI & OTHER PROVINCES
  { district: "Kuta", city: "Badung", province: "Bali", postal_code: "80361", area_id: "IDNPL001", subdistrict: "Seminyak / Sunset Road", keywords: ["kuta", "seminyak"] },
  { district: "Kuta Utara", city: "Badung", province: "Bali", postal_code: "80361", area_id: "IDNPL001", subdistrict: "Canggu / Kerobokan", keywords: ["kuta utara", "canggu", "kerobokan"] },
  { district: "Kuta Selatan", city: "Badung", province: "Bali", postal_code: "80361", area_id: "IDNPL001", subdistrict: "Jimbaran / Nusa Dua", keywords: ["kuta selatan", "jimbaran", "nusa dua", "uluwatu"] },
  { district: "Denpasar Selatan", city: "Denpasar", province: "Bali", postal_code: "80221", area_id: "IDNPL002", subdistrict: "Sanur", keywords: ["denpasar selatan", "sanur"] },
  { district: "Denpasar Barat", city: "Denpasar", province: "Bali", postal_code: "80231", area_id: "IDNPL002", subdistrict: "Teuku Umar", keywords: ["denpasar barat", "teuku umar"] },
  { district: "Ubud", city: "Gianyar", province: "Bali", postal_code: "80571", area_id: "IDNPL003", keywords: ["ubud"] },
  { district: "Medan Barat", city: "Medan", province: "Sumatera Utara", postal_code: "20111", area_id: "IDNPD001", keywords: ["medan barat", "kesawan"] },
  { district: "Medan Polonia", city: "Medan", province: "Sumatera Utara", postal_code: "20152", area_id: "IDNPD002", keywords: ["medan polonia"] },
  { district: "Ilir Timur I", city: "Palembang", province: "Sumatera Selatan", postal_code: "30111", area_id: "IDNPP001", keywords: ["ilir timur i", "palembang"] },
  { district: "Batam Kota", city: "Batam", province: "Kepulauan Riau", postal_code: "29432", area_id: "IDNPP003", keywords: ["batam kota"] },
  { district: "Ujung Pandang", city: "Makassar", province: "Sulawesi Selatan", postal_code: "90111", area_id: "IDNPK001", subdistrict: "Losari", keywords: ["ujung pandang", "losari"] },
  { district: "Panakukkang", city: "Makassar", province: "Sulawesi Selatan", postal_code: "90231", area_id: "IDNPK002", keywords: ["panakukkang"] },
  { district: "Samarinda Kota", city: "Samarinda", province: "Kalimantan Timur", postal_code: "75111", area_id: "IDNPS006", keywords: ["samarinda"] },
  { district: "Balikpapan Kota", city: "Balikpapan", province: "Kalimantan Timur", postal_code: "76111", area_id: "IDNPS007", keywords: ["balikpapan"] },
  { district: "Banjarmasin Tengah", city: "Banjarmasin", province: "Kalimantan Selatan", postal_code: "70111", area_id: "IDNPS008", keywords: ["banjarmasin"] },
  { district: "Wenang", city: "Manado", province: "Sulawesi Utara", postal_code: "95111", area_id: "IDNPS009", keywords: ["wenang", "manado"] },
];

export const normalizeLocationText = (text: string) => {
  if (!text) return "";
  return text
    .trim()
    .toLowerCase()
    .replace(/[\s\p{P}]+/gu, " ")
    .trim();
};

export function getRealtimePostalCode(district: string = "", city: string = "", province: string = "", rawZip?: any): string {
  if (rawZip && String(rawZip).trim().length === 5 && !isNaN(Number(rawZip))) {
    return String(rawZip).trim();
  }

  if (!district.trim() || !city.trim()) {
    return "";
  }

  const normDistrict = normalizeLocationText(district);
  const normCity = normalizeLocationText(city);
  const normProv = normalizeLocationText(province);

  const exactDist = INDONESIA_LOCATION_DIRECTORY.find((item) => {
    const iProv = normalizeLocationText(item.province);
    const iCity = normalizeLocationText(item.city);
    
    const cleanICity = iCity.replace(/^kab\. /g, "").replace(/^kota /g, "");
    const cleanNormCity = normCity.replace(/^kab\. /g, "").replace(/^kota /g, "");

    const provMatch = !normProv || iProv.includes(normProv) || normProv.includes(iProv);
    const cityMatch = cleanICity === cleanNormCity || cleanICity.includes(cleanNormCity) || cleanNormCity.includes(cleanICity);
    
    if (!provMatch || !cityMatch) return false;

    const aliases = [
      item.district,
      ...(item.subdistrict ? [item.subdistrict] : []),
      ...(item.keywords || []),
    ].map(s => normalizeLocationText(s));
    
    return aliases.some(alias => {
      return alias === normDistrict || (alias.length >= 3 && (alias.includes(normDistrict) || normDistrict.includes(alias)));
    });
  });

  if (exactDist && exactDist.postal_code) {
    return exactDist.postal_code;
  }

  return "";
}

export function getRealtimeProvince(district: string = "", city: string = "", province: string = ""): string {
  if (province && province !== "Indonesia") return province;

  const combined = `${district} ${city}`.toLowerCase().trim();
  if (!combined) return "Indonesia";

  const exactLocal = INDONESIA_LOCATION_DIRECTORY.find((item) => {
    const d = item.district.toLowerCase().split(" ")[0];
    const c = item.city.toLowerCase().replace("kota ", "").replace("kab. ", "").split(" ")[0];
    const sub = item.subdistrict ? item.subdistrict.toLowerCase().split(" ")[0] : "";
    const kwMatch = item.keywords ? item.keywords.some(k => combined.includes(k.toLowerCase())) : false;
    return (d && d.length >= 3 && combined.includes(d)) || (c && c.length >= 3 && combined.includes(c)) || (sub && sub.length >= 3 && combined.includes(sub)) || kwMatch;
  });
  if (exactLocal && exactLocal.province) {
    return exactLocal.province;
  }

  if (
    combined.includes("karawang") || combined.includes("tempuran") || combined.includes("sumberjaya") || combined.includes("sumber jaya") || combined.includes("rengasdengklok") || combined.includes("klari") || combined.includes("telukjambe") || combined.includes("cikampek") || combined.includes("cilamaya") ||
    combined.includes("bekasi") || combined.includes("cikarang") || combined.includes("cibaru") || combined.includes("tambun") || combined.includes("cibitung") ||
    combined.includes("bogor") || combined.includes("cibinong") || combined.includes("sentul") || combined.includes("ciawi") || combined.includes("puncak") || combined.includes("dramaga") ||
    combined.includes("depok") || combined.includes("margonda") || combined.includes("cinere") || combined.includes("sawangan") || combined.includes("cimanggis") ||
    combined.includes("bandung") || combined.includes("dago") || combined.includes("braga") || combined.includes("pasteur") || combined.includes("ciumbuleuit") || combined.includes("lembang") || combined.includes("cimahi") ||
    combined.includes("sukabumi") || combined.includes("cianjur") || combined.includes("garut") || combined.includes("tasikmalaya") || combined.includes("ciamis") || combined.includes("pangandaran") ||
    combined.includes("kuningan") || combined.includes("cirebon") || combined.includes("indramayu") || combined.includes("majalengka") || combined.includes("subang") || combined.includes("purwakarta") || combined.includes("jabar") || combined.includes("jawa barat")
  ) {
    return "Jawa Barat";
  }

  if (
    combined.includes("jakarta") || combined.includes("kewayoran") || combined.includes("kebayoran") || combined.includes("senopati") || combined.includes("kemang") || combined.includes("menteng") ||
    combined.includes("sudirman") || combined.includes("cilandak") || combined.includes("tebet") || combined.includes("pik") || combined.includes("kelapa gading") || combined.includes("pluit") ||
    combined.includes("cakung") || combined.includes("rawamangun") || combined.includes("cawang") || combined.includes("grogol") || combined.includes("cengkareng") || combined.includes("slipi") || combined.includes("dki")
  ) {
    return "DKI Jakarta";
  }

  if (
    combined.includes("tangerang") || combined.includes("tangsel") || combined.includes("bsd") || combined.includes("bintaro") || combined.includes("serpong") || combined.includes("alam sutera") ||
    combined.includes("pamulang") || combined.includes("ciputat") || combined.includes("karawaci") || combined.includes("ciledug") || combined.includes("cipondoh") || combined.includes("cikupa") ||
    combined.includes("serang") || combined.includes("cilegon") || combined.includes("pandeglang") || combined.includes("lebak") || combined.includes("banten")
  ) {
    return "Banten";
  }

  if (
    combined.includes("yogyakarta") || combined.includes("jogja") || combined.includes("sleman") || combined.includes("bantul") || combined.includes("gunungkidul") || combined.includes("kulon progo") ||
    combined.includes("galur") || combined.includes("gejayan") || combined.includes("kasihan") || combined.includes("malioboro") || combined.includes("diy") || combined.includes("d.i. yogyakarta")
  ) {
    return "D.I. Yogyakarta";
  }

  if (
    combined.includes("semarang") || combined.includes("surakarta") || combined.includes("solo") || combined.includes("magelang") || combined.includes("pekalongan") || combined.includes("salatiga") ||
    combined.includes("tegal") || combined.includes("banyumas") || combined.includes("purwokerto") || combined.includes("klaten") || combined.includes("boyolali") || combined.includes("sukoharjo") ||
    combined.includes("wonogiri") || combined.includes("karanganyar") || combined.includes("sragen") || combined.includes("grobogan") || combined.includes("blora") || combined.includes("rembang") ||
    combined.includes("pati") || combined.includes("kudus") || combined.includes("jepara") || combined.includes("demak") || combined.includes("temanggung") || combined.includes("wonosobo") ||
    combined.includes("purworejo") || combined.includes("kebumen") || combined.includes("cilacap") || combined.includes("banjarnegara") || combined.includes("purbalingga") || combined.includes("brebes") ||
    combined.includes("pemalang") || combined.includes("batang") || combined.includes("kendal") || combined.includes("jateng") || combined.includes("jawa tengah")
  ) {
    return "Jawa Tengah";
  }

  if (
    combined.includes("surabaya") || combined.includes("malang") || combined.includes("batu") || combined.includes("sidoarjo") || combined.includes("gresik") || combined.includes("mojokerto") ||
    combined.includes("jombang") || combined.includes("kediri") || combined.includes("madiun") || combined.includes("blitar") || combined.includes("probolinggo") || combined.includes("pasuruan") ||
    combined.includes("banyuwangi") || combined.includes("jember") || combined.includes("lumajang") || combined.includes("bondowoso") || combined.includes("situbondo") || combined.includes("kraksaan") ||
    combined.includes("tuban") || combined.includes("lamongan") || combined.includes("bojonegoro") || combined.includes("nganjuk") || combined.includes("ngawi") || combined.includes("magetan") ||
    combined.includes("ponorogo") || combined.includes("pacitan") || combined.includes("trenggalek") || combined.includes("tulungagung") || combined.includes("madura") || combined.includes("bangkalan") ||
    combined.includes("sampang") || combined.includes("pamekasan") || combined.includes("sumenep") || combined.includes("jatim") || combined.includes("jawa timur")
  ) {
    return "Jawa Timur";
  }

  if (
    combined.includes("denpasar") || combined.includes("badung") || combined.includes("seminyak") || combined.includes("canggu") || combined.includes("kuta") || combined.includes("ubud") ||
    combined.includes("sanur") || combined.includes("nusa dua") || combined.includes("jimbaran") || combined.includes("uluwatu") || combined.includes("legian") || combined.includes("gianyar") ||
    combined.includes("tabanan") || combined.includes("buleleng") || combined.includes("singaraja") || combined.includes("karangasem") || combined.includes("klungkung") || combined.includes("bangli") || combined.includes("jembrana") || combined.includes("bali")
  ) {
    return "Bali";
  }

  if (combined.includes("banjarmasin") || combined.includes("banjar") || combined.includes("aluh-aluh") || combined.includes("banjarbaru") || combined.includes("martapura") || combined.includes("tanah bumbu") || combined.includes("kotabaru") || combined.includes("tapin") || combined.includes("kalsel")) {
    return "Kalimantan Selatan";
  }
  if (combined.includes("samarinda") || combined.includes("balikpapan") || combined.includes("bontang") || combined.includes("kutai") || combined.includes("tenggarong") || combined.includes("ikn") || combined.includes("kaltim")) {
    return "Kalimantan Timur";
  }
  if (combined.includes("pontianak") || combined.includes("singkawang") || combined.includes("kubu raya") || combined.includes("kalbar")) {
    return "Kalimantan Barat";
  }
  if (combined.includes("palangka raya") || combined.includes("sampit") || combined.includes("kotawaringin") || combined.includes("kalteng")) {
    return "Kalimantan Tengah";
  }
  if (combined.includes("makassar") || combined.includes("parepare") || combined.includes("palopo") || combined.includes("gowa") || combined.includes("maros") || combined.includes("toraja") || combined.includes("sulsel")) {
    return "Sulawesi Selatan";
  }
  if (combined.includes("manado") || combined.includes("bitung") || combined.includes("tomohon") || combined.includes("minahasa") || combined.includes("sulut")) {
    return "Sulawesi Utara";
  }
  if (combined.includes("medan") || combined.includes("binjai") || combined.includes("deli serdang") || combined.includes("siantar") || combined.includes("toba") || combined.includes("sumut") || combined.includes("sumatra utara") || combined.includes("sumatera utara")) {
    return "Sumatera Utara";
  }
  if (combined.includes("padang") || combined.includes("bukittinggi") || combined.includes("pariaman") || combined.includes("solok") || combined.includes("sumbar") || combined.includes("sumatra barat") || combined.includes("sumatera barat")) {
    return "Sumatera Barat";
  }
  if (combined.includes("palembang") || combined.includes("prabumulih") || combined.includes("lubuklinggau") || combined.includes("sumsel") || combined.includes("sumatra selatan") || combined.includes("sumatera selatan")) {
    return "Sumatera Selatan";
  }
  if (combined.includes("pekanbaru") || combined.includes("dumai") || combined.includes("riau") || combined.includes("batam") || combined.includes("tanjungpinang") || combined.includes("bintan")) {
    return "Riau & Kepulauan Riau";
  }
  if (combined.includes("lampung") || combined.includes("bandar lampung") || combined.includes("metro")) {
    return "Lampung";
  }

  return province || "Indonesia";
}