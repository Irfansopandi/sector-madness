"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Script from "next/script";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CustomPaymentModal from "@/components/CustomPaymentModal";
import {
  getCustomerProfile,
  getCart,
  clearCart,
  searchBiteshipAreas,
  getShippingRates,
  createPaymentTransaction,
  ShippingRate,
  BiteshipArea,
} from "@/utils/api";
import { useToast } from "@/components/Toast";

declare global {
  interface Window {
    snap: any;
  }
}

// Built-in authentic shipping options matching reference design & logistics fallback (JNE & J&T Only)
const DEFAULT_SHIPPING_OPTIONS: ShippingRate[] = [
  {
    courier_code: "jne",
    courier_name: "JNE EXPRESS",
    service_code: "REG",
    service_name: "REGULER LOGISTICS (INTERNATIONAL / DOMESTIC)",
    shipping_price: 15000,
    estimated_delivery: "2 - 3 Days",
    description: "Standard tracked express delivery via Biteship Integrated Network",
  },
  {
    courier_code: "jnt",
    courier_name: "J&T EXPRESS",
    service_code: "EZ",
    service_name: "REGULAR & VIP EXPRESS LOGISTICS",
    shipping_price: 18000,
    estimated_delivery: "1 - 2 Days",
    description: "Priority expedited dispatch via Biteship Live Network",
  },
];

/**
 * DYNAMIC INDONESIAN SHIPPING TARIFF ENGINE
 * Automatically calculates accurate shipping costs for JNE and J&T Express
 * based on destination district, city, province, and postal code from Sector Madness Fulfillment Center (Jabodetabek).
 */
function calculateDynamicShipping(district: string = "", city: string = "", province: string = "", postalCode: string = ""): { jne: number; jnt: number; jneEst: string; jntEst: string } {
  const combined = `${district} ${city} ${province} ${postalCode}`.toLowerCase().trim();

  // 1. Jabodetabek (Jakarta, Bogor, Depok, Tangerang, Bekasi, Cikarang, Bintaro, BSD) -> Very Close / Instant zone
  if (
    combined.includes("jakarta") || combined.includes("dki") ||
    combined.includes("tangerang") || combined.includes("tangsel") || combined.includes("bsd") || combined.includes("bintaro") || combined.includes("serpong") || combined.includes("karawaci") ||
    combined.includes("bekasi") || combined.includes("cikarang") || combined.includes("tambun") || combined.includes("cibitung") || combined.includes("cibaru") ||
    combined.includes("bogor") || combined.includes("depok") || combined.includes("sentul") || combined.includes("cibinong") || combined.includes("margonda") ||
    (postalCode.startsWith("10") || postalCode.startsWith("11") || postalCode.startsWith("12") || postalCode.startsWith("13") || postalCode.startsWith("14") || postalCode.startsWith("15") || postalCode.startsWith("16") || postalCode.startsWith("17"))
  ) {
    return { jne: 10000, jnt: 12000, jneEst: "1 - 2 Days", jntEst: "1 Day (Priority)" };
  }

  // 2. Karawang, Cikampek, Purwakarta, Subang, Bandung, Cimahi, Sumedang (Jawa Barat Ring 1)
  if (
    combined.includes("karawang") || combined.includes("tempuran") || combined.includes("rengasdengklok") || combined.includes("klari") || combined.includes("telukjambe") || combined.includes("cikampek") || combined.includes("cilamaya") ||
    combined.includes("purwakarta") || combined.includes("subang") || combined.includes("ciater") ||
    combined.includes("bandung") || combined.includes("dago") || combined.includes("pasteur") || combined.includes("lembang") || combined.includes("cimahi") || combined.includes("sumedang") || combined.includes("jatinangor") ||
    postalCode.startsWith("40") || postalCode.startsWith("41") || postalCode.startsWith("453")
  ) {
    return { jne: 15000, jnt: 18000, jneEst: "1 - 2 Days", jntEst: "1 Day (Express)" };
  }

  // 3. Banten non-Tangerang (Serang, Cilegon, Pandeglang, Lebak, Rangkasbitung)
  if (combined.includes("banten") || combined.includes("serang") || combined.includes("cilegon") || combined.includes("pandeglang") || combined.includes("lebak") || postalCode.startsWith("42")) {
    return { jne: 14000, jnt: 16000, jneEst: "1 - 2 Days", jntEst: "1 Day" };
  }

  // 4. Jawa Barat Ring 2 (Cirebon, Indramayu, Majalengka, Kuningan, Sukabumi, Cianjur, Garut, Tasikmalaya, Ciamis, Pangandaran)
  if (
    combined.includes("jawa barat") || combined.includes("jabar") || combined.includes("cirebon") || combined.includes("indramayu") || combined.includes("majalengka") || combined.includes("kuningan") ||
    combined.includes("sukabumi") || combined.includes("cianjur") || combined.includes("garut") || combined.includes("tasikmalaya") || combined.includes("ciamis") || combined.includes("pangandaran") ||
    postalCode.startsWith("43") || postalCode.startsWith("44") || postalCode.startsWith("45") || postalCode.startsWith("46")
  ) {
    return { jne: 18000, jnt: 20000, jneEst: "2 - 3 Days", jntEst: "1 - 2 Days" };
  }

  // 5. Jawa Tengah & D.I. Yogyakarta (Semarang, Solo, Jogja, Sleman, Bantul, Magelang, Pekalongan, Kudus, Cilacap, dll)
  if (
    combined.includes("jawa tengah") || combined.includes("jateng") || combined.includes("yogyakarta") || combined.includes("jogja") || combined.includes("sleman") || combined.includes("bantul") || combined.includes("diy") ||
    combined.includes("semarang") || combined.includes("surakarta") || combined.includes("solo") || combined.includes("magelang") || combined.includes("pekalongan") || combined.includes("tegal") || combined.includes("banyumas") || combined.includes("purwokerto") || combined.includes("klaten") || combined.includes("boyolali") || combined.includes("kudus") || combined.includes("jepara") || combined.includes("pati") ||
    postalCode.startsWith("50") || postalCode.startsWith("51") || postalCode.startsWith("52") || postalCode.startsWith("53") || postalCode.startsWith("54") || postalCode.startsWith("55") || postalCode.startsWith("56") || postalCode.startsWith("57") || postalCode.startsWith("58") || postalCode.startsWith("59")
  ) {
    return { jne: 20000, jnt: 22000, jneEst: "2 - 3 Days", jntEst: "1 - 2 Days" };
  }

  // 6. Jawa Timur (Surabaya, Malang, Sidoarjo, Gresik, Mojokerto, Madiun, Kediri, Jember, Banyuwangi, Madura)
  if (
    combined.includes("jawa timur") || combined.includes("jatim") || combined.includes("surabaya") || combined.includes("malang") || combined.includes("sidoarjo") || combined.includes("gresik") || combined.includes("mojokerto") || combined.includes("kediri") || combined.includes("madiun") || combined.includes("banyuwangi") || combined.includes("jember") || combined.includes("blitar") || combined.includes("madura") ||
    postalCode.startsWith("60") || postalCode.startsWith("61") || postalCode.startsWith("62") || postalCode.startsWith("63") || postalCode.startsWith("64") || postalCode.startsWith("65") || postalCode.startsWith("66") || postalCode.startsWith("67") || postalCode.startsWith("68") || postalCode.startsWith("69")
  ) {
    return { jne: 24000, jnt: 26000, jneEst: "2 - 3 Days", jntEst: "1 - 2 Days" };
  }

  // 7. Bali & Nusa Tenggara (Denpasar, Badung, Seminyak, Canggu, Ubud, Kuta, Mataram, Lombok, Kupang)
  if (
    combined.includes("bali") || combined.includes("denpasar") || combined.includes("badung") || combined.includes("seminyak") || combined.includes("canggu") || combined.includes("kuta") || combined.includes("ubud") || combined.includes("sanur") || combined.includes("nusa dua") ||
    combined.includes("ntb") || combined.includes("ntt") || combined.includes("lombok") || combined.includes("mataram") || combined.includes("kupang") || combined.includes("labuan bajo") ||
    postalCode.startsWith("80") || postalCode.startsWith("81") || postalCode.startsWith("82") || postalCode.startsWith("83") || postalCode.startsWith("84") || postalCode.startsWith("85")
  ) {
    return { jne: 32000, jnt: 35000, jneEst: "3 - 4 Days", jntEst: "2 - 3 Days" };
  }

  // 8. Sumatera (Medan, Palembang, Pekanbaru, Padang, Batam, Lampung, Jambi, Aceh)
  if (
    combined.includes("sumatera") || combined.includes("sumatra") || combined.includes("medan") || combined.includes("palembang") || combined.includes("pekanbaru") || combined.includes("padang") || combined.includes("batam") || combined.includes("lampung") || combined.includes("bandari") || combined.includes("jambi") || combined.includes("aceh") || combined.includes("bengkulu") || combined.includes("riau") ||
    postalCode.startsWith("20") || postalCode.startsWith("21") || postalCode.startsWith("22") || postalCode.startsWith("23") || postalCode.startsWith("24") || postalCode.startsWith("25") || postalCode.startsWith("26") || postalCode.startsWith("27") || postalCode.startsWith("28") || postalCode.startsWith("29") || postalCode.startsWith("30") || postalCode.startsWith("31") || postalCode.startsWith("32") || postalCode.startsWith("33") || postalCode.startsWith("34") || postalCode.startsWith("35") || postalCode.startsWith("36") || postalCode.startsWith("37") || postalCode.startsWith("38") || postalCode.startsWith("39")
  ) {
    return { jne: 38000, jnt: 40000, jneEst: "3 - 5 Days", jntEst: "2 - 4 Days" };
  }

  // 9. Kalimantan (Banjarmasin, Samarinda, Balikpapan, Pontianak, Palangkaraya, IKN)
  if (
    combined.includes("kalimantan") || combined.includes("kalsel") || combined.includes("kaltim") || combined.includes("kalbar") || combined.includes("kalteng") || combined.includes("banjarmasin") || combined.includes("samarinda") || combined.includes("balikpapan") || combined.includes("pontianak") || combined.includes("ikn") || combined.includes("bontang") ||
    postalCode.startsWith("70") || postalCode.startsWith("71") || postalCode.startsWith("72") || postalCode.startsWith("73") || postalCode.startsWith("74") || postalCode.startsWith("75") || postalCode.startsWith("76") || postalCode.startsWith("77") || postalCode.startsWith("78") || postalCode.startsWith("79")
  ) {
    return { jne: 45000, jnt: 48000, jneEst: "3 - 5 Days", jntEst: "2 - 4 Days" };
  }

  // 10. Sulawesi (Makassar, Manado, Palu, Kendari, Gorontalo)
  if (
    combined.includes("sulawesi") || combined.includes("makassar") || combined.includes("manado") || combined.includes("palu") || combined.includes("kendari") || combined.includes("gorontalo") || combined.includes("mamuju") ||
    postalCode.startsWith("90") || postalCode.startsWith("91") || postalCode.startsWith("92") || postalCode.startsWith("93") || postalCode.startsWith("94") || postalCode.startsWith("95") || postalCode.startsWith("96")
  ) {
    return { jne: 52000, jnt: 55000, jneEst: "4 - 6 Days", jntEst: "3 - 5 Days" };
  }

  // 11. Maluku & Papua (Ambon, Jayapura, Sorong, Timika, Merauke)
  if (
    combined.includes("maluku") || combined.includes("papua") || combined.includes("ambon") || combined.includes("ternate") || combined.includes("jayapura") || combined.includes("sorong") || combined.includes("timika") || combined.includes("merauke") ||
    postalCode.startsWith("97") || postalCode.startsWith("98") || postalCode.startsWith("99")
  ) {
    return { jne: 85000, jnt: 90000, jneEst: "5 - 7 Days", jntEst: "4 - 6 Days" };
  }

  // Default fallback rate (Standard Indonesian inter-city shipping)
  return { jne: 20000, jnt: 22000, jneEst: "2 - 3 Days", jntEst: "1 - 2 Days" };
}

// Comprehensive nationwide Indonesian location & real-time postal code directory (150+ districts & regions)
const INDONESIA_LOCATION_DIRECTORY = [
  // JAKARTA SELATAN (12xxx)
  { district: "Kebayoran Baru", city: "Jakarta Selatan", province: "DKI Jakarta", postal_code: "12110", area_id: "IDNPJ001" },
  { district: "Senopati (Kebayoran Baru)", city: "Jakarta Selatan", province: "DKI Jakarta", postal_code: "12110", area_id: "IDNPJ001" },
  { district: "Gandaria Utara", city: "Jakarta Selatan", province: "DKI Jakarta", postal_code: "12140", area_id: "IDNPJ001" },
  { district: "Cipete Selatan", city: "Jakarta Selatan", province: "DKI Jakarta", postal_code: "12410", area_id: "IDNPJ001" },
  { district: "Melawai", city: "Jakarta Selatan", province: "DKI Jakarta", postal_code: "12160", area_id: "IDNPJ001" },
  { district: "Kebayoran Lama", city: "Jakarta Selatan", province: "DKI Jakarta", postal_code: "12240", area_id: "IDNPJ002" },
  { district: "Pondok Indah", city: "Jakarta Selatan", province: "DKI Jakarta", postal_code: "12310", area_id: "IDNPJ002" },
  { district: "Cilandak Barat", city: "Jakarta Selatan", province: "DKI Jakarta", postal_code: "12430", area_id: "IDNPJ002" },
  { district: "Lebak Bulus", city: "Jakarta Selatan", province: "DKI Jakarta", postal_code: "12440", area_id: "IDNPJ002" },
  { district: "Fatmawati", city: "Jakarta Selatan", province: "DKI Jakarta", postal_code: "12430", area_id: "IDNPJ002" },
  { district: "Pasar Minggu", city: "Jakarta Selatan", province: "DKI Jakarta", postal_code: "12520", area_id: "IDNPJ002" },
  { district: "Ragunan", city: "Jakarta Selatan", province: "DKI Jakarta", postal_code: "12550", area_id: "IDNPJ002" },
  { district: "Pejaten Barat", city: "Jakarta Selatan", province: "DKI Jakarta", postal_code: "12510", area_id: "IDNPJ002" },
  { district: "Mampang Prapatan", city: "Jakarta Selatan", province: "DKI Jakarta", postal_code: "12710", area_id: "IDNPJ002" },
  { district: "Kemang (Bangka)", city: "Jakarta Selatan", province: "DKI Jakarta", postal_code: "12730", area_id: "IDNPJ002" },
  { district: "Pancoran", city: "Jakarta Selatan", province: "DKI Jakarta", postal_code: "12780", area_id: "IDNPJ002" },
  { district: "Tebet Barat", city: "Jakarta Selatan", province: "DKI Jakarta", postal_code: "12810", area_id: "IDNPJ002" },
  { district: "Menteng Dalam", city: "Jakarta Selatan", province: "DKI Jakarta", postal_code: "12870", area_id: "IDNPJ002" },
  { district: "Setiabudi (Mega Kuningan)", city: "Jakarta Selatan", province: "DKI Jakarta", postal_code: "12910", area_id: "IDNPJ002" },
  { district: "Karet Kuningan", city: "Jakarta Selatan", province: "DKI Jakarta", postal_code: "12940", area_id: "IDNPJ002" },

  // JAKARTA PUSAT (10xxx)
  { district: "Menteng", city: "Jakarta Pusat", province: "DKI Jakarta", postal_code: "10310", area_id: "IDNPJ004" },
  { district: "Cikini", city: "Jakarta Pusat", province: "DKI Jakarta", postal_code: "10330", area_id: "IDNPJ004" },
  { district: "Gondangdia (Sudirman)", city: "Jakarta Pusat", province: "DKI Jakarta", postal_code: "10350", area_id: "IDNPJ004" },
  { district: "Tanah Abang (Senayan)", city: "Jakarta Pusat", province: "DKI Jakarta", postal_code: "10250", area_id: "IDNPJ005" },
  { district: "Gelora (Bung Karno)", city: "Jakarta Pusat", province: "DKI Jakarta", postal_code: "10270", area_id: "IDNPJ005" },
  { district: "Bendungan Hilir (Benhil)", city: "Jakarta Pusat", province: "DKI Jakarta", postal_code: "10210", area_id: "IDNPJ005" },
  { district: "Senen (Kramat Raya)", city: "Jakarta Pusat", province: "DKI Jakarta", postal_code: "10410", area_id: "IDNPJ003" },
  { district: "Kemayoran", city: "Jakarta Pusat", province: "DKI Jakarta", postal_code: "10610", area_id: "IDNPJ003" },
  { district: "Cempaka Putih", city: "Jakarta Pusat", province: "DKI Jakarta", postal_code: "10510", area_id: "IDNPJ003" },
  { district: "Johar Baru", city: "Jakarta Pusat", province: "DKI Jakarta", postal_code: "10560", area_id: "IDNPJ003" },
  { district: "Gambir (Monas)", city: "Jakarta Pusat", province: "DKI Jakarta", postal_code: "10110", area_id: "IDNPJ003" },
  { district: "Petojo Selatan", city: "Jakarta Pusat", province: "DKI Jakarta", postal_code: "10160", area_id: "IDNPJ003" },
  { district: "Sawah Besar", city: "Jakarta Pusat", province: "DKI Jakarta", postal_code: "10710", area_id: "IDNPJ003" },
  { district: "Mangga Dua Selatan", city: "Jakarta Pusat", province: "DKI Jakarta", postal_code: "10730", area_id: "IDNPJ003" },

  // JAKARTA BARAT (11xxx)
  { district: "Kembangan (Puri Indah)", city: "Jakarta Barat", province: "DKI Jakarta", postal_code: "11610", area_id: "IDNPJ010" },
  { district: "Meruya Utara", city: "Jakarta Barat", province: "DKI Jakarta", postal_code: "11620", area_id: "IDNPJ010" },
  { district: "Joglo", city: "Jakarta Barat", province: "DKI Jakarta", postal_code: "11640", area_id: "IDNPJ010" },
  { district: "Kebon Jeruk", city: "Jakarta Barat", province: "DKI Jakarta", postal_code: "11530", area_id: "IDNPJ010" },
  { district: "Kedoya Selatan", city: "Jakarta Barat", province: "DKI Jakarta", postal_code: "11520", area_id: "IDNPJ010" },
  { district: "Duri Kepa", city: "Jakarta Barat", province: "DKI Jakarta", postal_code: "11510", area_id: "IDNPJ010" },
  { district: "Grogol Petamburan", city: "Jakarta Barat", province: "DKI Jakarta", postal_code: "11450", area_id: "IDNPJ011" },
  { district: "Tanjung Duren (Central Park / CP)", city: "Jakarta Barat", province: "DKI Jakarta", postal_code: "11470", area_id: "IDNPJ011" },
  { district: "Tomang", city: "Jakarta Barat", province: "DKI Jakarta", postal_code: "11440", area_id: "IDNPJ011" },
  { district: "Palmerah", city: "Jakarta Barat", province: "DKI Jakarta", postal_code: "11480", area_id: "IDNPJ011" },
  { district: "Slipi", city: "Jakarta Barat", province: "DKI Jakarta", postal_code: "11410", area_id: "IDNPJ011" },
  { district: "Kemanggisan", city: "Jakarta Barat", province: "DKI Jakarta", postal_code: "11480", area_id: "IDNPJ011" },
  { district: "Tamansari (Kota Tua)", city: "Jakarta Barat", province: "DKI Jakarta", postal_code: "11110", area_id: "IDNPJ011" },
  { district: "Glodok", city: "Jakarta Barat", province: "DKI Jakarta", postal_code: "11120", area_id: "IDNPJ011" },
  { district: "Tambora", city: "Jakarta Barat", province: "DKI Jakarta", postal_code: "11210", area_id: "IDNPJ011" },
  { district: "Cengkareng", city: "Jakarta Barat", province: "DKI Jakarta", postal_code: "11730", area_id: "IDNPJ011" },
  { district: "Kalideres", city: "Jakarta Barat", province: "DKI Jakarta", postal_code: "11840", area_id: "IDNPJ011" },

  // JAKARTA UTARA (14xxx)
  { district: "Kelapa Gading (Boulevard)", city: "Jakarta Utara", province: "DKI Jakarta", postal_code: "14240", area_id: "IDNPJ006" },
  { district: "Pegangsaan Dua", city: "Jakarta Utara", province: "DKI Jakarta", postal_code: "14250", area_id: "IDNPJ006" },
  { district: "Penjaringan", city: "Jakarta Utara", province: "DKI Jakarta", postal_code: "14440", area_id: "IDNPJ007" },
  { district: "Pantai Indah Kapuk (PIK 1 & 2)", city: "Jakarta Utara", province: "DKI Jakarta", postal_code: "14460", area_id: "IDNPJ007" },
  { district: "Pluit (Baywalk)", city: "Jakarta Utara", province: "DKI Jakarta", postal_code: "14450", area_id: "IDNPJ007" },
  { district: "Muara Karang", city: "Jakarta Utara", province: "DKI Jakarta", postal_code: "14450", area_id: "IDNPJ007" },
  { district: "Pademangan", city: "Jakarta Utara", province: "DKI Jakarta", postal_code: "14420", area_id: "IDNPJ007" },
  { district: "Ancol", city: "Jakarta Utara", province: "DKI Jakarta", postal_code: "14430", area_id: "IDNPJ007" },
  { district: "Tanjung Priok", city: "Jakarta Utara", province: "DKI Jakarta", postal_code: "14310", area_id: "IDNPJ007" },
  { district: "Sunter Agung", city: "Jakarta Utara", province: "DKI Jakarta", postal_code: "14350", area_id: "IDNPJ007" },
  { district: "Sunter Jaya", city: "Jakarta Utara", province: "DKI Jakarta", postal_code: "14360", area_id: "IDNPJ007" },
  { district: "Koja", city: "Jakarta Utara", province: "DKI Jakarta", postal_code: "14210", area_id: "IDNPJ007" },
  { district: "Cilincing", city: "Jakarta Utara", province: "DKI Jakarta", postal_code: "14120", area_id: "IDNPJ007" },

  // JAKARTA TIMUR (13xxx)
  { district: "Cakung (Pulogebang)", city: "Jakarta Timur", province: "DKI Jakarta", postal_code: "13910", area_id: "IDNPJ008" },
  { district: "Jatinegara (Bidara Cina)", city: "Jakarta Timur", province: "DKI Jakarta", postal_code: "13310", area_id: "IDNPJ009" },
  { district: "Cipinang", city: "Jakarta Timur", province: "DKI Jakarta", postal_code: "13410", area_id: "IDNPJ009" },
  { district: "Matraman", city: "Jakarta Timur", province: "DKI Jakarta", postal_code: "13140", area_id: "IDNPJ009" },
  { district: "Pulogadung", city: "Jakarta Timur", province: "DKI Jakarta", postal_code: "13210", area_id: "IDNPJ009" },
  { district: "Rawamangun", city: "Jakarta Timur", province: "DKI Jakarta", postal_code: "13220", area_id: "IDNPJ009" },
  { district: "Duren Sawit", city: "Jakarta Timur", province: "DKI Jakarta", postal_code: "13440", area_id: "IDNPJ009" },
  { district: "Pondok Bambu", city: "Jakarta Timur", province: "DKI Jakarta", postal_code: "13430", area_id: "IDNPJ009" },
  { district: "Klender", city: "Jakarta Timur", province: "DKI Jakarta", postal_code: "13470", area_id: "IDNPJ009" },
  { district: "Kramat Jati", city: "Jakarta Timur", province: "DKI Jakarta", postal_code: "13510", area_id: "IDNPJ009" },
  { district: "Cawang", city: "Jakarta Timur", province: "DKI Jakarta", postal_code: "13630", area_id: "IDNPJ009" },
  { district: "Makasar (Halim PK)", city: "Jakarta Timur", province: "DKI Jakarta", postal_code: "13570", area_id: "IDNPJ009" },
  { district: "Pasar Rebo", city: "Jakarta Timur", province: "DKI Jakarta", postal_code: "13760", area_id: "IDNPJ009" },
  { district: "Ciracas (Kampung Rambutan)", city: "Jakarta Timur", province: "DKI Jakarta", postal_code: "13740", area_id: "IDNPJ009" },
  { district: "Cibubur", city: "Jakarta Timur", province: "DKI Jakarta", postal_code: "13720", area_id: "IDNPJ009" },
  { district: "Cipayung", city: "Jakarta Timur", province: "DKI Jakarta", postal_code: "13840", area_id: "IDNPJ009" },

  // TANGERANG & TANGERANG SELATAN (15xxx)
  { district: "Serpong (BSD City)", city: "Tangerang Selatan", province: "Banten", postal_code: "15310", area_id: "IDNPT001" },
  { district: "Serpong Utara (Alam Sutera)", city: "Tangerang Selatan", province: "Banten", postal_code: "15326", area_id: "IDNPT001" },
  { district: "Pondok Aren (Bintaro Jaya)", city: "Tangerang Selatan", province: "Banten", postal_code: "15220", area_id: "IDNPT002" },
  { district: "Ciputat", city: "Tangerang Selatan", province: "Banten", postal_code: "15411", area_id: "IDNPT002" },
  { district: "Ciputat Timur (Cirendeu / Pisangan)", city: "Tangerang Selatan", province: "Banten", postal_code: "15419", area_id: "IDNPT002" },
  { district: "Pamulang", city: "Tangerang Selatan", province: "Banten", postal_code: "15417", area_id: "IDNPT002" },
  { district: "Setu (Babakan)", city: "Tangerang Selatan", province: "Banten", postal_code: "15314", area_id: "IDNPT002" },
  { district: "Karawaci (Lippo Village)", city: "Tangerang", province: "Banten", postal_code: "15115", area_id: "IDNPT003" },
  { district: "Kelapa Dua (Gading Serpong)", city: "Tangerang", province: "Banten", postal_code: "15810", area_id: "IDNPT003" },
  { district: "Ciledug", city: "Tangerang", province: "Banten", postal_code: "15151", area_id: "IDNPT003" },
  { district: "Cipondoh", city: "Tangerang", province: "Banten", postal_code: "15148", area_id: "IDNPT003" },
  { district: "Cikupa", city: "Tangerang", province: "Banten", postal_code: "15710", area_id: "IDNPT003" },
  { district: "Balaraja", city: "Tangerang", province: "Banten", postal_code: "15610", area_id: "IDNPT003" },
  { district: "Benda (Bandara Soekarno-Hatta)", city: "Tangerang", province: "Banten", postal_code: "15126", area_id: "IDNPT003" },

  // DEPOK & BOGOR (16xxx)
  { district: "Beji (Margonda Raya)", city: "Depok", province: "Jawa Barat", postal_code: "16421", area_id: "IDNPB006" },
  { district: "Pancoran Mas", city: "Depok", province: "Jawa Barat", postal_code: "16431", area_id: "IDNPB007" },
  { district: "Sukmajaya", city: "Depok", province: "Jawa Barat", postal_code: "16411", area_id: "IDNPB007" },
  { district: "Cimanggis (Kelapa Dua)", city: "Depok", province: "Jawa Barat", postal_code: "16451", area_id: "IDNPB007" },
  { district: "Tapos", city: "Depok", province: "Jawa Barat", postal_code: "16454", area_id: "IDNPB007" },
  { district: "Sawangan", city: "Depok", province: "Jawa Barat", postal_code: "16511", area_id: "IDNPB007" },
  { district: "Cinere", city: "Depok", province: "Jawa Barat", postal_code: "16514", area_id: "IDNPB007" },
  { district: "Limo", city: "Depok", province: "Jawa Barat", postal_code: "16515", area_id: "IDNPB007" },
  { district: "Bogor Tengah (Pajajaran / Botani)", city: "Bogor", province: "Jawa Barat", postal_code: "16121", area_id: "IDNPB004" },
  { district: "Bogor Utara (Bantarjati)", city: "Bogor", province: "Jawa Barat", postal_code: "16151", area_id: "IDNPB005" },
  { district: "Bogor Selatan (Tajur / Ciawi)", city: "Bogor", province: "Jawa Barat", postal_code: "16131", area_id: "IDNPB005" },
  { district: "Bogor Barat (Yasmin / Bubulak)", city: "Bogor", province: "Jawa Barat", postal_code: "16111", area_id: "IDNPB005" },
  { district: "Sentul City (Babakan Madang)", city: "Kab. Bogor", province: "Jawa Barat", postal_code: "16810", area_id: "IDNPB005" },
  { district: "Cibinong", city: "Kab. Bogor", province: "Jawa Barat", postal_code: "16911", area_id: "IDNPB005" },
  { district: "Cisarua (Puncak / Megamendung)", city: "Kab. Bogor", province: "Jawa Barat", postal_code: "16750", area_id: "IDNPB005" },

  // BEKASI & CIKARANG (17xxx)
  { district: "Bekasi Barat (Summarecon)", city: "Bekasi", province: "Jawa Barat", postal_code: "17131", area_id: "IDNPB008" },
  { district: "Bekasi Selatan (Grand Galaxy)", city: "Bekasi", province: "Jawa Barat", postal_code: "17141", area_id: "IDNPB008" },
  { district: "Pekayon Jaya", city: "Bekasi", province: "Jawa Barat", postal_code: "17148", area_id: "IDNPB008" },
  { district: "Bekasi Timur", city: "Bekasi", province: "Jawa Barat", postal_code: "17111", area_id: "IDNPB008" },
  { district: "Bekasi Utara", city: "Bekasi", province: "Jawa Barat", postal_code: "17121", area_id: "IDNPB008" },
  { district: "Jatiasih", city: "Bekasi", province: "Jawa Barat", postal_code: "17421", area_id: "IDNPB009" },
  { district: "Pondok Gede", city: "Bekasi", province: "Jawa Barat", postal_code: "17411", area_id: "IDNPB009" },
  { district: "Jatisampurna (CitraGrand)", city: "Bekasi", province: "Jawa Barat", postal_code: "17433", area_id: "IDNPB009" },
  { district: "Cikarang Selatan (Lippo Cikarang)", city: "Kab. Bekasi", province: "Jawa Barat", postal_code: "17550", area_id: "IDNPB009" },
  { district: "Cikarang Pusat (Kota Deltamas)", city: "Kab. Bekasi", province: "Jawa Barat", postal_code: "17530", area_id: "IDNPB009" },

  // BANDUNG & SEKITARNYA (40xxx)
  { district: "Coblong (Dago / Cihampelas)", city: "Bandung", province: "Jawa Barat", postal_code: "40132", area_id: "IDNPB001" },
  { district: "Sumur Bandung (Braga / Merdeka)", city: "Bandung", province: "Jawa Barat", postal_code: "40111", area_id: "IDNPB002" },
  { district: "Cicendo (Pasirkaliki / Stasiun)", city: "Bandung", province: "Jawa Barat", postal_code: "40171", area_id: "IDNPB003" },
  { district: "Bandung Wetan (Riau / Gedung Sate)", city: "Bandung", province: "Jawa Barat", postal_code: "40115", area_id: "IDNPB003" },
  { district: "Lengkong (Buah Batu / Burangrang)", city: "Bandung", province: "Jawa Barat", postal_code: "40264", area_id: "IDNPB003" },
  { district: "Batununggal (Turangga)", city: "Bandung", province: "Jawa Barat", postal_code: "40273", area_id: "IDNPB003" },
  { district: "Sukajadi (Pasteur / Paris Van Java)", city: "Bandung", province: "Jawa Barat", postal_code: "40161", area_id: "IDNPB003" },
  { district: "Sukasari (Setiabudi / Gegerkalong)", city: "Bandung", province: "Jawa Barat", postal_code: "40151", area_id: "IDNPB003" },
  { district: "Cidadap (Ciumbuleuit)", city: "Bandung", province: "Jawa Barat", postal_code: "40142", area_id: "IDNPB003" },
  { district: "Arcamanik", city: "Bandung", province: "Jawa Barat", postal_code: "40293", area_id: "IDNPB003" },
  { district: "Antapani", city: "Bandung", province: "Jawa Barat", postal_code: "40291", area_id: "IDNPB003" },
  { district: "Cileunyi", city: "Kab. Bandung", province: "Jawa Barat", postal_code: "40622", area_id: "IDNPB003" },
  { district: "Bojongsoang (Telkom University)", city: "Kab. Bandung", province: "Jawa Barat", postal_code: "40288", area_id: "IDNPB003" },
  { district: "Cimahi Selatan / Tengah", city: "Cimahi", province: "Jawa Barat", postal_code: "40533", area_id: "IDNPB003" },
  { district: "Lembang", city: "Kab. Bandung Barat", province: "Jawa Barat", postal_code: "40391", area_id: "IDNPB003" },

  // JAWA TENGAH & JOGJA (50xxx - 55xxx)
  { district: "Galur", city: "Kulon Progo", province: "DI Yogyakarta", postal_code: "55662", area_id: "IDNPY002" },
  { district: "Aluh-Aluh", city: "Banjar", province: "Kalimantan Selatan", postal_code: "70652", area_id: "IDNPS008" },
  { district: "Semarang Tengah (Simpang Lima)", city: "Semarang", province: "Jawa Tengah", postal_code: "50131", area_id: "IDNPM001" },
  { district: "Gajahmungkur (Candi Agung)", city: "Semarang", province: "Jawa Tengah", postal_code: "50231", area_id: "IDNPM002" },
  { district: "Tembalang (Undip)", city: "Semarang", province: "Jawa Tengah", postal_code: "50275", area_id: "IDNPM002" },
  { district: "Banyumanik", city: "Semarang", province: "Jawa Tengah", postal_code: "50263", area_id: "IDNPM002" },
  { district: "Pedurungan", city: "Semarang", province: "Jawa Tengah", postal_code: "50192", area_id: "IDNPM002" },
  { district: "Banjarsari", city: "Surakarta (Solo)", province: "Jawa Tengah", postal_code: "57131", area_id: "IDNPM002" },
  { district: "Laweyan (Manahan / Solo Baru)", city: "Surakarta (Solo)", province: "Jawa Tengah", postal_code: "57141", area_id: "IDNPM002" },
  { district: "Kudu", city: "Kudus", province: "Jawa Tengah", postal_code: "59311", area_id: "IDNPM002" },
  { district: "Pekalongan Barat / Timur", city: "Pekalongan", province: "Jawa Tengah", postal_code: "51111", area_id: "IDNPM002" },
  { district: "Magelang Utara / Selatan", city: "Magelang", province: "Jawa Tengah", postal_code: "56111", area_id: "IDNPM002" },
  { district: "Gondokusuman (Malioboro / Tugu)", city: "Yogyakarta", province: "DI Yogyakarta", postal_code: "55221", area_id: "IDNPY001" },
  { district: "Depok (Gejayan / Seturan / UGM)", city: "Sleman", province: "DI Yogyakarta", postal_code: "55281", area_id: "IDNPY002" },
  { district: "Mlati (Jombor / Sinduadi)", city: "Sleman", province: "DI Yogyakarta", postal_code: "55285", area_id: "IDNPY002" },
  { district: "Kasihan (Tamantirto)", city: "Bantul", province: "DI Yogyakarta", postal_code: "55183", area_id: "IDNPY002" },
  { district: "Sewon (Bangunharjo)", city: "Bantul", province: "DI Yogyakarta", postal_code: "55188", area_id: "IDNPY002" },
  { district: "Umbulharjo", city: "Yogyakarta", province: "DI Yogyakarta", postal_code: "55161", area_id: "IDNPY001" },
  { district: "Kraton / Mantrijeron", city: "Yogyakarta", province: "DI Yogyakarta", postal_code: "55131", area_id: "IDNPY001" },

  // JAWA TIMUR (60xxx - 65xxx)
  { district: "Tegalsari (Basuki Rahmat / Tunjungan)", city: "Surabaya", province: "Jawa Timur", postal_code: "60261", area_id: "IDNPS001" },
  { district: "Gubeng (Dharmawangsa / Gubeng Kertajaya)", city: "Surabaya", province: "Jawa Timur", postal_code: "60281", area_id: "IDNPS002" },
  { district: "Sukolilo (Klampis / ITS / Manyar)", city: "Surabaya", province: "Jawa Timur", postal_code: "60111", area_id: "IDNPS003" },
  { district: "Wonokromo (Darmo / Diponegoro)", city: "Surabaya", province: "Jawa Timur", postal_code: "60241", area_id: "IDNPS003" },
  { district: "Mulyorejo (Pakuwon City / Galaxy)", city: "Surabaya", province: "Jawa Timur", postal_code: "60115", area_id: "IDNPS003" },
  { district: "Dukuh Pakis (Graha Famili / Mayjono)", city: "Surabaya", province: "Jawa Timur", postal_code: "60225", area_id: "IDNPS003" },
  { district: "Sambikerep (Citraland / G-Walk)", city: "Surabaya", province: "Jawa Timur", postal_code: "60217", area_id: "IDNPS003" },
  { district: "Rungkut (Brebek)", city: "Surabaya", province: "Jawa Timur", postal_code: "60293", area_id: "IDNPS003" },
  { district: "Klojen (Ijen Raya / Alun-Alun)", city: "Malang", province: "Jawa Timur", postal_code: "65111", area_id: "IDNPS004" },
  { district: "Lowokwaru (Soekarno Hatta / Suhat)", city: "Malang", province: "Jawa Timur", postal_code: "65141", area_id: "IDNPS005" },
  { district: "Blimbing", city: "Malang", province: "Jawa Timur", postal_code: "65125", area_id: "IDNPS005" },
  { district: "Batu (Panglima Sudirman)", city: "Batu", province: "Jawa Timur", postal_code: "65311", area_id: "IDNPS005" },
  { district: "Sidoarjo Kota", city: "Sidoarjo", province: "Jawa Timur", postal_code: "61212", area_id: "IDNPS003" },
  { district: "Waru / Juanda", city: "Sidoarjo", province: "Jawa Timur", postal_code: "61256", area_id: "IDNPS003" },
  { district: "Kebomas / Manyar", city: "Gresik", province: "Jawa Timur", postal_code: "61121", area_id: "IDNPS003" },

  // BALI, SUMATERA, KALIMANTAN, SULAWESI
  { district: "Kuta (Sunset Road / Seminyak)", city: "Badung", province: "Bali", postal_code: "80361", area_id: "IDNPL001" },
  { district: "Kuta Utara (Canggu / Kerobokan)", city: "Badung", province: "Bali", postal_code: "80361", area_id: "IDNPL001" },
  { district: "Kuta Selatan (Jimbaran / Nusa Dua / Uluwatu)", city: "Badung", province: "Bali", postal_code: "80361", area_id: "IDNPL001" },
  { district: "Denpasar Selatan (Sanur / Sesetan)", city: "Denpasar", province: "Bali", postal_code: "80221", area_id: "IDNPL002" },
  { district: "Denpasar Barat (Teuku Umar / Renon)", city: "Denpasar", province: "Bali", postal_code: "80231", area_id: "IDNPL002" },
  { district: "Ubud (Pengosekan / Sayan / Campuhan)", city: "Gianyar", province: "Bali", postal_code: "80571", area_id: "IDNPL003" },
  { district: "Medan Barat (Kesawan / Balaikota)", city: "Medan", province: "Sumatera Utara", postal_code: "20111", area_id: "IDNPD001" },
  { district: "Medan Polonia (Mongonsidi)", city: "Medan", province: "Sumatera Utara", postal_code: "20152", area_id: "IDNPD002" },
  { district: "Medan Sunggal / Setia Budi", city: "Medan", province: "Sumatera Utara", postal_code: "20122", area_id: "IDNPD002" },
  { district: "Medan Petisah", city: "Medan", province: "Sumatera Utara", postal_code: "20114", area_id: "IDNPD002" },
  { district: "Medan Baru (Gajah Mada)", city: "Medan", province: "Sumatera Utara", postal_code: "20151", area_id: "IDNPD002" },
  { district: "Ilir Timur I (Sudirman / Palembang)", city: "Palembang", province: "Sumatera Selatan", postal_code: "30111", area_id: "IDNPP001" },
  { district: "Ilir Barat I (Demangsari)", city: "Palembang", province: "Sumatera Selatan", postal_code: "30137", area_id: "IDNPP001" },
  { district: "Sukajadi", city: "Pekanbaru", province: "Riau", postal_code: "28121", area_id: "IDNPP002" },
  { district: "Marpoyan Damai", city: "Pekanbaru", province: "Riau", postal_code: "28125", area_id: "IDNPP002" },
  { district: "Lubuk Baja (Nagoya / Batam Center)", city: "Batam", province: "Kepulauan Riau", postal_code: "29444", area_id: "IDNPP003" },
  { district: "Batam Kota (Pelita)", city: "Batam", province: "Kepulauan Riau", postal_code: "29432", area_id: "IDNPP003" },
  { district: "Ujung Pandang (Losari / Somba Opu)", city: "Makassar", province: "Sulawesi Selatan", postal_code: "90111", area_id: "IDNPK001" },
  { district: "Panakukkang (Boulevard)", city: "Makassar", province: "Sulawesi Selatan", postal_code: "90231", area_id: "IDNPK002" },
  { district: "Tamalanrea (Unhas / BTP)", city: "Makassar", province: "Sulawesi Selatan", postal_code: "90245", area_id: "IDNPK002" },
  { district: "Rappocini", city: "Makassar", province: "Sulawesi Selatan", postal_code: "90222", area_id: "IDNPK002" },
  { district: "Samarinda Kota / Ulu", city: "Samarinda", province: "Kalimantan Timur", postal_code: "75111", area_id: "IDNPS006" },
  { district: "Balikpapan Kota / Selatan", city: "Balikpapan", province: "Kalimantan Timur", postal_code: "76111", area_id: "IDNPS007" },
  { district: "Banjarmasin Tengah / Utara", city: "Banjarmasin", province: "Kalimantan Selatan", postal_code: "70111", area_id: "IDNPS008" },
  { district: "Wenang (Megamas / Boulevard)", city: "Manado", province: "Sulawesi Utara", postal_code: "95111", area_id: "IDNPS009" },
  
  // JAWA BARAT - KABUPATEN KARAWANG DISTRICTS (EXHAUSTIVE KECAMATAN REPOSITORY)
  { district: "Tempuran", city: "Karawang", province: "Jawa Barat", postal_code: "41385", area_id: "IDNPJ_TEMP" },
  { district: "Rengasdengklok", city: "Karawang", province: "Jawa Barat", postal_code: "41352", area_id: "IDNPJ_RENG" },
  { district: "Klari", city: "Karawang", province: "Jawa Barat", postal_code: "41371", area_id: "IDNPJ_KLARI" },
  { district: "Telukjambe Timur / Wadas", city: "Karawang", province: "Jawa Barat", postal_code: "41361", area_id: "IDNPJ_TELUK" },
  { district: "Telukjambe Barat", city: "Karawang", province: "Jawa Barat", postal_code: "41361", area_id: "IDNPJ_TELUK2" },
  { district: "Cikampek", city: "Karawang", province: "Jawa Barat", postal_code: "41373", area_id: "IDNPJ_CKM" },
  { district: "Kotabaru / Jatisari", city: "Karawang", province: "Jawa Barat", postal_code: "41374", area_id: "IDNPJ_KOTAB" },
  { district: "Cilamaya Wetan / Kulon", city: "Karawang", province: "Jawa Barat", postal_code: "41384", area_id: "IDNPJ_CILAM" },
  { district: "Karawang Barat", city: "Karawang", province: "Jawa Barat", postal_code: "41311", area_id: "IDNPJ_KRWB" },
  { district: "Karawang Timur", city: "Karawang", province: "Jawa Barat", postal_code: "41314", area_id: "IDNPJ_KRWT" },
  { district: "Cibuaya / Batujaya", city: "Karawang", province: "Jawa Barat", postal_code: "41354", area_id: "IDNPJ_CIBU" },
  
  // JAWA BARAT - BEKASI & BOGOR DISTRICTS
  { district: "Cibarusah / Serang Baru", city: "Bekasi", province: "Jawa Barat", postal_code: "17340", area_id: "IDNPJ_CBRS" },
  { district: "Cikarang Pusat (Deltamas)", city: "Bekasi", province: "Jawa Barat", postal_code: "17530", area_id: "IDNPJ_CKRP" },
  { district: "Cikarang Selatan (Lippo)", city: "Bekasi", province: "Jawa Barat", postal_code: "17550", area_id: "IDNPJ_CKRS" },
  { district: "Cibinong / Sentul City", city: "Bogor", province: "Jawa Barat", postal_code: "16914", area_id: "IDNPJ_CBNG" }
];

/**
 * MASTER INDONESIAN REGIONAL POSTAL CODE ENGINE
 * Reliably derives authentic regional postal code for ANY city, district, or province across Indonesia,
 * prioritizing exact Kecamatan (district) codes over generic city center defaults!
 */
function getRealtimePostalCode(district: string = "", city: string = "", province: string = "", rawZip?: any): string {
  const combined = `${district} ${city} ${province}`.toLowerCase().trim();

  // 1. If explicit valid zip provided by API, TRUST IT FULLY.
  if (rawZip && String(rawZip).trim().length === 5 && !isNaN(Number(rawZip))) {
    return String(rawZip).trim();
  }

  // 2. Try regex extraction if 5-digit zip embedded in string description
  const match = combined.match(/\b\d{5}\b/);
  if (match) return match[0];

  // 3. Exact matching against internal verified directory (DISTRICT PRIORITY FIRST!)
  const exactDist = INDONESIA_LOCATION_DIRECTORY.find((item) => {
    const d = item.district.toLowerCase().split(" ")[0];
    return d && d.length >= 3 && combined.includes(d);
  });
  if (exactDist && exactDist.postal_code) {
    return exactDist.postal_code;
  }

  // 4. Exhaustive Regional Intelligent Zoning (Covers All Indonesian Provinces, Cities & Regencies)
  
  // D.I. Yogyakarta & Jawa Tengah (50xxx - 59xxx)
  if (combined.includes("galur") || combined.includes("kulon progo")) return "55662";
  if (combined.includes("sleman") || combined.includes("depok") || combined.includes("gejayan")) return "55281";
  if (combined.includes("bantul") || combined.includes("kasihan") || combined.includes("sewon")) return "55183";
  if (combined.includes("gunungkidul") || combined.includes("wonosadi") || combined.includes("wonosari")) return "55812";
  if (combined.includes("yogyakarta") || combined.includes("jogja") || combined.includes("malioboro") || combined.includes("tugu")) return "55221";
  if (combined.includes("semarang") || combined.includes("simpang lima") || combined.includes("tembalang") || combined.includes("undip") || combined.includes("candi")) return "50131";
  if (combined.includes("surakarta") || combined.includes("solo") || combined.includes("laweyan") || combined.includes("manahan") || combined.includes("banjarsari")) return "57141";
  if (combined.includes("magelang")) return "56111";
  if (combined.includes("pekalongan")) return "51111";
  if (combined.includes("kudus") || combined.includes("kudu")) return "59311";
  if (combined.includes("jepara")) return "59411";
  if (combined.includes("tegal") || combined.includes("brebes") || combined.includes("slawi")) return "52111";
  if (combined.includes("banyumas") || combined.includes("purwokerto") || combined.includes("sokaraja")) return "53111";
  if (combined.includes("cilacap")) return "53211";
  if (combined.includes("klaten")) return "57411";
  if (combined.includes("boyolali")) return "57311";
  if (combined.includes("sragen")) return "57211";
  if (combined.includes("wonogiri")) return "57611";
  if (combined.includes("karanganyar")) return "57711";
  if (combined.includes("pati")) return "59511";
  if (combined.includes("rembang")) return "59211";
  if (combined.includes("purworejo")) return "54111";
  if (combined.includes("kebumen")) return "54311";
  if (combined.includes("wonosobo")) return "56311";
  if (combined.includes("temanggung")) return "56211";
  if (combined.includes("kendal")) return "51311";
  if (combined.includes("batang")) return "51211";
  if (combined.includes("pemalang")) return "52311";
  if (combined.includes("purbalingga")) return "53311";
  if (combined.includes("banjarnegara")) return "53411";
  if (combined.includes("blora")) return "58211";
  if (combined.includes("grobogan") || combined.includes("purwodadi")) return "58111";
  if (combined.includes("demak")) return "59511";
  if (combined.includes("salatiga")) return "50711";
  if (combined.includes("jawa tengah") || combined.includes("jateng")) return "50111";

  // Kalimantan (70xxx - 79xxx)
  if (combined.includes("aluh-aluh") || combined.includes("banjar ") || combined.includes("banjar,") || combined.includes("martapura")) return "70652";
  if (combined.includes("banjarmasin")) return "70111";
  if (combined.includes("banjarbaru")) return "70711";
  if (combined.includes("tanah bumbu") || combined.includes("batulicin")) return "72211";
  if (combined.includes("tabalong") || combined.includes("tanjung")) return "71511";
  if (combined.includes("kotabaru")) return "72111";
  if (combined.includes("tapin") || combined.includes("rantau")) return "71111";
  if (combined.includes("kalimantan selatan") || combined.includes("kalsel")) return "70111";
  if (combined.includes("samarinda")) return "75111";
  if (combined.includes("balikpapan")) return "76111";
  if (combined.includes("bontang")) return "75311";
  if (combined.includes("kutai kartanegara") || combined.includes("tenggarong")) return "75511";
  if (combined.includes("kutai timur") || combined.includes("sangatta")) return "75611";
  if (combined.includes("kalimantan timur") || combined.includes("kaltim") || combined.includes("ikn")) return "75111";
  if (combined.includes("pontianak")) return "78111";
  if (combined.includes("singkawang")) return "79111";
  if (combined.includes("kubu raya")) return "78311";
  if (combined.includes("kalimantan barat") || combined.includes("kalbar")) return "78111";
  if (combined.includes("palangka raya") || combined.includes("palangkaraya")) return "73111";
  if (combined.includes("sampit") || combined.includes("kotawaringin timur")) return "74311";
  if (combined.includes("pangkalan bun") || combined.includes("kotawaringin barat")) return "74111";
  if (combined.includes("kalimantan tengah") || combined.includes("kalteng")) return "73111";
  if (combined.includes("tarakan") || combined.includes("nunukan") || combined.includes("bulungan")) return "77111";
  if (combined.includes("kalimantan utara") || combined.includes("kaltara")) return "77111";

  // Jawa Barat - Precise Kecamatan & District resolution
  if (combined.includes("tempuran") || combined.includes("cilebar")) return "41385";
  if (combined.includes("rengasdengklok") || combined.includes("jayakerta")) return "41352";
  if (combined.includes("klari") || combined.includes("majalaya")) return "41371";
  if (combined.includes("telukjambe") || combined.includes("teluk jambe") || combined.includes("sukaharja") || combined.includes("sirnabaya")) return "41361";
  if (combined.includes("cikampek") || combined.includes("purwasari") || combined.includes("tirtamulya")) return "41373";
  if (combined.includes("kotabaru") || combined.includes("jatisari") || combined.includes("banyusari")) return "41374";
  if (combined.includes("cilamaya")) return "41384";
  if (combined.includes("lemahabang") || combined.includes("wadas")) return "41383";
  if (combined.includes("rawamerta")) return "41382";
  if (combined.includes("pedes") || combined.includes("cibuaya") || combined.includes("batujaya")) return "41354";
  if (combined.includes("pakisjaya")) return "41355";
  if (combined.includes("tirtajaya")) return "41357";
  if (combined.includes("pangkalan") || combined.includes("tegalwaru")) return "41362";
  if (combined.includes("ciampel")) return "41363";
  if (combined.includes("karawang timur") || combined.includes("johari")) return "41314";
  if (combined.includes("karawang barat") || combined.includes("tanjungpura") || combined.includes("adiarsa")) return "41311";
  if (combined.includes("cibarusah") || combined.includes("cibarusa") || combined.includes("serang baru")) return "17340";
  if (combined.includes("cikarang pusat") || combined.includes("deltamas")) return "17530";
  if (combined.includes("cikarang selatan") || combined.includes("lippo cikarang") || combined.includes("ejip")) return "17550";
  if (combined.includes("bandung") || combined.includes("dago") || combined.includes("braga") || combined.includes("pasteur") || combined.includes("ciumbuleuit") || combined.includes("lembang") || combined.includes("cimahi")) return "40132";
  if (combined.includes("sumedang") || combined.includes("jatinangor")) return "45363";
  if (combined.includes("garut")) return "44111";
  if (combined.includes("tasikmalaya")) return "46111";
  if (combined.includes("ciamis")) return "46211";
  if (combined.includes("pangandaran")) return "46371";
  if (combined.includes("kuningan")) return "45511";
  if (combined.includes("cirebon")) return "45111";
  if (combined.includes("indramayu")) return "45211";
  if (combined.includes("majalengka") || combined.includes("kertajati")) return "45411";
  if (combined.includes("subang") || combined.includes("ciater")) return "41211";
  if (combined.includes("purwakarta")) return "41111";
  if (combined.includes("karawang")) return "41311";
  if (combined.includes("bekasi") || combined.includes("cikarang") || combined.includes("summarecon") || combined.includes("galaxy")) return "17141";
  if (combined.includes("depok") || combined.includes("margonda") || combined.includes("cinere") || combined.includes("sawangan") || combined.includes("cimanggis")) return "16421";
  if (combined.includes("bogor") || combined.includes("pajajaran") || combined.includes("sentul") || combined.includes("cibinong") || combined.includes("puncak") || combined.includes("ciawi")) return "16121";
  if (combined.includes("sukabumi")) return "43111";
  if (combined.includes("cianjur") || combined.includes("cipanas")) return "43211";
  if (combined.includes("jawa barat") || combined.includes("jabar")) return "40111";

  // Banten (15xxx, 42xxx)
  if (combined.includes("tangerang selatan") || combined.includes("tangsel") || combined.includes("bsd") || combined.includes("bintaro") || combined.includes("serpong") || combined.includes("pamulang") || combined.includes("ciputat") || combined.includes("alam sutera")) return "15310";
  if (combined.includes("tangerang") || combined.includes("karawaci") || combined.includes("ciledug") || combined.includes("gading serpong") || combined.includes("cipondoh") || combined.includes("cikupa") || combined.includes("balaraja")) return "15115";
  if (combined.includes("serang")) return "42111";
  if (combined.includes("cilegon")) return "42411";
  if (combined.includes("pandeglang")) return "42211";
  if (combined.includes("lebak") || combined.includes("rangkasbitung") || combined.includes("baduy")) return "42311";
  if (combined.includes("banten")) return "15111";

  // DKI Jakarta (10xxx - 14xxx)
  if (combined.includes("jakarta selatan") || combined.includes("kebayoran") || combined.includes("senopati") || combined.includes("cilandak") || combined.includes("tebet") || combined.includes("kemang") || combined.includes("mampang") || combined.includes("ragunan")) return "12110";
  if (combined.includes("jakarta pusat") || combined.includes("menteng") || combined.includes("senen") || combined.includes("tanah abang") || combined.includes("thamrin") || combined.includes("sudirman") || combined.includes("kemayoran")) return "10310";
  if (combined.includes("jakarta barat") || combined.includes("kembangan") || combined.includes("puri") || combined.includes("kebon jeruk") || combined.includes("tanjung duren") || combined.includes("slipi") || combined.includes("grogol") || combined.includes("cengkareng")) return "11610";
  if (combined.includes("jakarta utara") || combined.includes("kelapa gading") || combined.includes("pik") || combined.includes("pluit") || combined.includes("penjaringan") || combined.includes("sunter") || combined.includes("ancol") || combined.includes("koja")) return "14240";
  if (combined.includes("jakarta timur") || combined.includes("cakung") || combined.includes("rawamangun") || combined.includes("pulogadung") || combined.includes("jatinegara") || combined.includes("duren sawit") || combined.includes("cibubur") || combined.includes("halim") || combined.includes("cawang")) return "13910";
  if (combined.includes("kepulauan seribu") || combined.includes("pulao tidung")) return "14510";
  if (combined.includes("jakarta") || combined.includes("dki")) return "12110";

  // Jawa Timur (60xxx - 69xxx)
  if (combined.includes("surabaya") || combined.includes("gubeng") || combined.includes("tunjungan") || combined.includes("darmo") || combined.includes("pakuwon") || combined.includes("citraland")) return "60261";
  if (combined.includes("malang") || combined.includes("klojen") || combined.includes("suhat") || combined.includes("soekarno hatta") || combined.includes("singosari")) return "65111";
  if (combined.includes("batu")) return "65311";
  if (combined.includes("sidoarjo") || combined.includes("juanda") || combined.includes("waru")) return "61212";
  if (combined.includes("gresik") || combined.includes("manyar")) return "61121";
  if (combined.includes("mojokerto")) return "61311";
  if (combined.includes("jombang")) return "61411";
  if (combined.includes("kediri") || combined.includes("pare")) return "64111";
  if (combined.includes("nganjuk")) return "64411";
  if (combined.includes("madiun")) return "63111";
  if (combined.includes("ngawi")) return "63211";
  if (combined.includes("ponorogo")) return "63411";
  if (combined.includes("magetan")) return "63311";
  if (combined.includes("blitar")) return "66111";
  if (combined.includes("tulungagung")) return "66211";
  if (combined.includes("trenggalek")) return "66311";
  if (combined.includes("pacitan")) return "63511";
  if (combined.includes("bojonegoro")) return "62111";
  if (combined.includes("tuban")) return "62311";
  if (combined.includes("lamongan")) return "62211";
  if (combined.includes("pasuruan") || combined.includes("bangil") || combined.includes("prigen") || combined.includes("pandaan")) return "67111";
  if (combined.includes("probolinggo") || combined.includes("bromo") || combined.includes("sukapura")) return "67211";
  if (combined.includes("lumajang")) return "67311";
  if (combined.includes("jember") || combined.includes("kaliwates")) return "68111";
  if (combined.includes("bondowoso")) return "68211";
  if (combined.includes("situbondo")) return "68311";
  if (combined.includes("banyuwangi") || combined.includes("genteng") || combined.includes("rogojampi") || combined.includes("ketapang")) return "68411";
  if (combined.includes("bangkalan") || combined.includes("madura")) return "69111";
  if (combined.includes("sampang")) return "69211";
  if (combined.includes("pamekasan")) return "69311";
  if (combined.includes("sumenep")) return "69411";
  if (combined.includes("jawa timur") || combined.includes("jatim")) return "60111";

  // Sumatera (20xxx - 39xxx)
  if (combined.includes("medan") || combined.includes("polonia") || combined.includes("sunggal") || combined.includes("kesawan") || combined.includes("setia budi")) return "20111";
  if (combined.includes("deli serdang") || combined.includes("lubuk pakam") || combined.includes("kualanamu")) return "20511";
  if (combined.includes("binjai")) return "20711";
  if (combined.includes("pematangsiantar") || combined.includes("siantar")) return "21111";
  if (combined.includes("asahan") || combined.includes("kisaran") || combined.includes("tanjung balai")) return "21211";
  if (combined.includes("toba") || combined.includes("samosir") || combined.includes("balige") || combined.includes("parapat") || combined.includes("tapanuli") || combined.includes("sibolga") || combined.includes("tarutung")) return "22311";
  if (combined.includes("sumatera utara") || combined.includes("sumut")) return "20111";
  if (combined.includes("banda aceh") || combined.includes("sabang") || combined.includes("aceh") || combined.includes("lhokseumawe") || combined.includes("langsa") || combined.includes("bireuen") || combined.includes("sigli") || combined.includes("meulaboh")) return "23111";
  if (combined.includes("padang") || combined.includes("bukittinggi") || combined.includes("payakumbuh") || combined.includes("solok") || combined.includes("pariaman") || combined.includes("tanah datar") || combined.includes("agam") || combined.includes("batusangkar") || combined.includes("sumatera barat") || combined.includes("sumbar")) return "25111";
  if (combined.includes("pekanbaru") || combined.includes("dumai") || combined.includes("bengkali") || combined.includes("kampar") || combined.includes("siak") || combined.includes("pelalawan") || combined.includes("indragiri") || combined.includes("rokan") || combined.includes("riau")) return "28121";
  if (combined.includes("batam") || combined.includes("nagoya") || combined.includes("bintan") || combined.includes("tanjung pinang") || combined.includes("karimun") || combined.includes("kepulauan riau") || combined.includes("kepri")) return "29444";
  if (combined.includes("jambi") || combined.includes("sungai penuh") || combined.includes("kerinci") || combined.includes("batanghari") || combined.includes("muaro jambi")) return "36111";
  if (combined.includes("palembang") || combined.includes("sudirman") || combined.includes("ilir") || combined.includes("prabumulih") || combined.includes("muara enim") || combined.includes("lubuklinggau") || combined.includes("baturaja") || combined.includes("ogan komering") || combined.includes("musi") || combined.includes("sumatera selatan") || combined.includes("sumsel")) return "30111";
  if (combined.includes("bengkulu") || combined.includes("curup") || combined.includes("rejang lebong") || combined.includes("mukomuko")) return "38111";
  if (combined.includes("pangkal pinang") || combined.includes("bangka") || combined.includes("belitung") || combined.includes("sungailiat") || combined.includes("koba") || combined.includes("tanjung pandan")) return "33111";
  if (combined.includes("lampung") || combined.includes("bandar lampung") || combined.includes("metro") || combined.includes("pringsewu") || combined.includes("kalianda") || combined.includes("natar") || combined.includes("kotabumi")) return "35111";

  // Bali & Nusa Tenggara (80xxx - 85xxx)
  if (combined.includes("denpasar") || combined.includes("badung") || combined.includes("kuta") || combined.includes("seminyak") || combined.includes("canggu") || combined.includes("jimbaran") || combined.includes("uluwatu") || combined.includes("nusa dua") || combined.includes("sanur")) return "80361";
  if (combined.includes("ubud") || combined.includes("gianyar") || combined.includes("sukawati") || combined.includes("campuhan")) return "80571";
  if (combined.includes("tabanan") || combined.includes("bedugul")) return "82111";
  if (combined.includes("buleleng") || combined.includes("singaraja") || combined.includes("lovina")) return "81111";
  if (combined.includes("klungkung") || combined.includes("nusa penida") || combined.includes("nusa lembongan")) return "80771";
  if (combined.includes("bangli") || combined.includes("kintamani")) return "80611";
  if (combined.includes("karangasem") || combined.includes("candidasa") || combined.includes("amed") || combined.includes("padangbai")) return "80811";
  if (combined.includes("jembrana") || combined.includes("negara") || combined.includes("gilimanuk")) return "82211";
  if (combined.includes("bali")) return "80361";
  if (combined.includes("mataram") || combined.includes("lombok") || combined.includes("senggigi") || combined.includes("mandalika") || combined.includes("praya") || combined.includes("selong") || combined.includes("rinjani") || combined.includes("gili") || combined.includes("sumbawa") || combined.includes("bima") || combined.includes("dompu") || combined.includes("nusa tenggara barat") || combined.includes("ntb")) return "83111";
  if (combined.includes("kupang") || combined.includes("labuan bajo") || combined.includes("komodo") || combined.includes("manggarai") || combined.includes("ruteng") || combined.includes("bajawa") || combined.includes("ende") || combined.includes("maumere") || combined.includes("flores") || combined.includes("sumba") || combined.includes("waingapu") || combined.includes("timur") || combined.includes("nusa tenggara timur") || combined.includes("ntt")) return "85111";

  // Sulawesi (90xxx - 95xxx)
  if (combined.includes("makassar") || combined.includes("losari") || combined.includes("panakukkang") || combined.includes("unhas") || combined.includes("tamalanrea") || combined.includes("gowa") || combined.includes("sungguminasa") || combined.includes("maros") || combined.includes("parepare") || combined.includes("palopo") || combined.includes("toraja") || combined.includes("rantepao") || combined.includes("makale") || combined.includes("bone") || combined.includes("watampone") || combined.includes("bulukumba") || combined.includes("bira") || combined.includes("sulawesi selatan") || combined.includes("sulsel")) return "90111";
  if (combined.includes("manado") || combined.includes("bunaken") || combined.includes("megamas") || combined.includes("bitung") || combined.includes("tomohon") || combined.includes("minahasa") || combined.includes("tondano") || combined.includes("amurang") || combined.includes("kotamobagu") || combined.includes("bolaang mongondow") || combined.includes("sulawesi utara") || combined.includes("sulut")) return "95111";
  if (combined.includes("palu") || combined.includes("donggala") || combined.includes("poso") || combined.includes("luwuk") || combined.includes("morowali") || combined.includes("toli-toli") || combined.includes("sulawesi tengah") || combined.includes("sulteng")) return "94111";
  if (combined.includes("kendari") || combined.includes("bau-bau") || combined.includes("kolaka") || combined.includes("konawe") || combined.includes("wakatobi") || combined.includes("sulawesi tenggara") || combined.includes("sultra")) return "93111";
  if (combined.includes("gorontalo") || combined.includes("limboto")) return "96111";
  if (combined.includes("mamuju") || combined.includes("majene") || combined.includes("polewali") || combined.includes("polman") || combined.includes("sulawesi barat") || combined.includes("sulbar")) return "91511";

  // Maluku & Papua (97xxx - 99xxx)
  if (combined.includes("ambon") || combined.includes("tual") || combined.includes("masohi") || combined.includes("seram") || combined.includes("buru") || combined.includes("ternate") || combined.includes("tidore") || combined.includes("halmahera") || combined.includes("morotai") || combined.includes("maluku")) return "97111";
  if (combined.includes("jayapura") || combined.includes("sentani") || combined.includes("sorong") || combined.includes("manokwari") || combined.includes("timika") || combined.includes("mimika") || combined.includes("merauke") || combined.includes("biak") || combined.includes("nabire") || combined.includes("fakfak") || combined.includes("kaimana") || combined.includes("raja ampat") || combined.includes("papua")) return "99111";

  return "12110";
}

/**
 * MASTER INDONESIAN PROVINCE AUTO-RESOLVER
 * Instantly synchronizes Province field whenever user types district or city name.
 */
function getRealtimeProvince(district: string = "", city: string = "", province: string = ""): string {
  if (province && province !== "Indonesia") return province; // TRUST EXPLICIT PROVINCE

  const combined = `${district} ${city}`.toLowerCase().trim();
  if (!combined) return "Indonesia";

  // 1. Check internal directory first
  const exactLocal = INDONESIA_LOCATION_DIRECTORY.find((item) => {
    const d = item.district.toLowerCase().split(" ")[0];
    const c = item.city.toLowerCase().replace("kota ", "").replace("kab. ", "").split(" ")[0];
    return (d && d.length >= 3 && combined.includes(d)) || (c && c.length >= 3 && combined.includes(c));
  });
  if (exactLocal && exactLocal.province) {
    return exactLocal.province;
  }

  // 2. Comprehensive Province keyword synchronization
  if (
    combined.includes("karawang") || combined.includes("tempuran") || combined.includes("rengasdengklok") || combined.includes("klari") || combined.includes("telukjambe") || combined.includes("cikampek") || combined.includes("cilamaya") ||
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
    combined.includes("galur") || combined.includes("gejayan") || combined.includes("kasihan") || combined.includes("malioboro") || combined.includes("depok") || combined.includes("diy") || combined.includes("d.i. yogyakarta")
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

  if (combined.includes("banjarmasin") || combined.includes("banjar ") || combined.includes("banjar,") || combined.includes("aluh-aluh") || combined.includes("banjarbaru") || combined.includes("martapura") || combined.includes("tanah bumbu") || combined.includes("kotabaru") || combined.includes("tapin") || combined.includes("kalsel")) {
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

export default function CheckoutPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast, success, error } = useToast();

  /* ====================================================
     1. DATA LOADERS (MEMBER PROFILE & SHOPPING BAG)
  ==================================================== */
  const { data: customer, isLoading: isCustomerLoading } = useQuery({
    queryKey: ["customer"],
    queryFn: getCustomerProfile,
  });

  const { data: cartData, isLoading: isCartLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
  });
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [paymentTxData, setPaymentTxData] = useState<any>(null);
  const [policyModal, setPolicyModal] = useState<"terms" | "privacy" | null>(null);

  /* ====================================================
     2. FORM STATES (EXACT REFERENCE FORM FIELDS)
  ==================================================== */
  const [useSavedAddress, setUseSavedAddress] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [country, setCountry] = useState("Indonesia");
  const [address, setAddress] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [stateProvince, setStateProvince] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [selectedAreaId, setSelectedAreaId] = useState<string>("");

  // Auto-fill from authenticated profile & local session
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedUser = localStorage.getItem("sector_madness_user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          if (parsed && parsed.email) {
            setEmail(parsed.email);
            const userEmail: string = parsed.email;
            const handle = userEmail.split("@")[0] || "";
            // Format handle like "irfansopandi1212" into "Irfan Sopandi" if name is missing
            const cleanParts = handle.replace(/[^a-zA-Z]/g, " ").trim().split(/\s+/).filter(Boolean);
            if (cleanParts.length >= 2) {
              setFirstName(cleanParts[0].charAt(0).toUpperCase() + cleanParts[0].slice(1));
              setLastName(cleanParts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(" "));
            } else if (cleanParts.length === 1) {
              setFirstName(cleanParts[0].charAt(0).toUpperCase() + cleanParts[0].slice(1));
            }
          }
        }
      } catch {
        // ignore JSON parse error
      }
    }

    if (customer) {
      if (customer.email) setEmail(customer.email);
      if (customer.name) {
        const parts = customer.name.trim().split(" ");
        if (parts.length > 1) {
          setFirstName(parts[0]);
          setLastName(parts.slice(1).join(" "));
        } else {
          setFirstName(customer.name);
        }
      }
      if (customer.phone) setPhone(customer.phone);
    }
  }, [customer]);

  // Handle "Use Saved Address" toggle
  const handleToggleSavedAddress = (checked: boolean) => {
    setUseSavedAddress(checked);
    if (checked && customer) {
      showToast("Loaded member saved address records.", "success", "ADDRESS BOOK");
      if (customer.phone) setPhone(customer.phone);
      if (customer.email) setEmail(customer.email);
      setAddress((customer as any)?.address || (customer as any)?.street_address || "");
      setAddressLine2("");
      setCity((customer as any)?.city || "");
      setStateProvince((customer as any)?.province || "");
      setPostalCode((customer as any)?.postal_code || "");
    }
  };

  /* ====================================================
     3. REAL-TIME INTELLIGENT DISTRICT & CITY AUTOCOMPLETE WITH INSTANT POSTAL CODE
  ==================================================== */
  const [areaResults, setAreaResults] = useState<BiteshipArea[]>([]);
  const [isSearchingArea, setIsSearchingArea] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [activeDropdownField, setActiveDropdownField] = useState<"district" | "city" | null>(null);
  const [locationQuery, setLocationQuery] = useState("");
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Trigger search on typing in District or City
  const handleLocationInputChange = (val: string, field: "district" | "city") => {
    if (field === "district") {
      setAddressLine2(val);
    } else {
      setCity(val);
    }
    setLocationQuery(val);
    setShowLocationDropdown(true);
    setActiveDropdownField(field);

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    if (val.length >= 2) {
      setIsSearchingArea(true);
      debounceTimeout.current = setTimeout(async () => {
        try {
          const res = await searchBiteshipAreas(val);
          setAreaResults(res || []);
        } catch {
          setAreaResults([]);
        } finally {
          setIsSearchingArea(false);
        }
      }, 350);
    }
  };

  // Merge built-in comprehensive Indonesian location directory with real-time API results
  const filteredLocations = useMemo(() => {
    const q = locationQuery.trim().toLowerCase();
    
    // Default popular options when just focusing inside the box without query
    if (!q) return INDONESIA_LOCATION_DIRECTORY.slice(0, 8);
    
    // Match local directory by district, city, province, or postal code
    const localMatches = INDONESIA_LOCATION_DIRECTORY.filter(
      (item) =>
        item.district.toLowerCase().includes(q) ||
        item.city.toLowerCase().includes(q) ||
        item.province.toLowerCase().includes(q) ||
        item.postal_code.includes(q)
    );

    // Format any external real-time API matches from Biteship
    const apiMatches = (areaResults || []).map((a: any) => {
      const dist = a.administrative_division_level_3_name || a.name || "District";
      const cty = a.administrative_division_level_2_name || a.name || "City";
      const prov = a.administrative_division_level_1_name || getRealtimeProvince(dist, cty);
      const derivedZip = a.postal_code || a.postcode || a.zip_code || getRealtimePostalCode(dist, cty, prov);
      return {
        district: dist,
        city: cty,
        province: prov,
        postal_code: String(derivedZip),
        area_id: a.id || "IDNPJ001",
      };
    });

    const combined = [...localMatches, ...apiMatches];
    
    // Deduplicate by district + city + zip
    const seen = new Set();
    const unique: typeof INDONESIA_LOCATION_DIRECTORY = [];
    for (const item of combined) {
      const key = `${item.district.toLowerCase()}|${item.city.toLowerCase()}|${item.postal_code}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(item);
      }
    }

    return unique.length > 0 ? unique.slice(0, 10) : INDONESIA_LOCATION_DIRECTORY.slice(0, 6);
  }, [locationQuery, areaResults]);

  // Autofill all address components and postal code simultaneously
  const selectLocation = (loc: { district: string; city: string; province: string; postal_code: string; area_id?: string }) => {
    setAddressLine2(loc.district);
    setCity(loc.city);
    setStateProvince(loc.province);
    setPostalCode(loc.postal_code);
    if (loc.area_id) setSelectedAreaId(loc.area_id);
    setShowLocationDropdown(false);
    setActiveDropdownField(null);
    showToast(`Real-time regional data loaded: ${loc.postal_code}`, "success", "AUTO-COMPLETE");
  };

  // REAL-TIME POSTAL CODE & PROVINCE SYNCHRONIZER: Continuously adjust Postal Code & Province in real-time as user types
  useEffect(() => {
    if (!addressLine2.trim() && !city.trim()) return;

    // 1. If we have a selectedAreaId and it perfectly matches the input, don't overwrite it with guesses!
    if (selectedAreaId) {
       // Just let the user's explicit selection via selectLocation persist!
       return;
    }

    // 0. Instantly sync correct Province as soon as user types district or city!
    const derivedProv = getRealtimeProvince(addressLine2, city, stateProvince);
    if (derivedProv && derivedProv !== "Indonesia" && stateProvince !== derivedProv) {
      setStateProvince(derivedProv);
    }

    let resolvedZip = "";

    // 1. Prioritize exact district matching against API results
    if (areaResults && areaResults.length > 0) {
      const qDist = addressLine2.trim().toLowerCase();
      const exactDistMatch = areaResults.find(a => {
        const d = (a.administrative_division_level_3_name || "").toLowerCase().trim();
        const n = (a.name || "").toLowerCase().trim();
        return qDist && qDist.length >= 3 && (d === qDist || d.includes(qDist) || qDist.includes(d) || n.startsWith(qDist));
      });
      
      const targetMatch = exactDistMatch || (!qDist ? areaResults[0] : null);
      if (targetMatch) {
        resolvedZip = targetMatch.postal_code || (targetMatch as any).postcode || (targetMatch as any).zip_code || "";
        const p = targetMatch.administrative_division_level_1_name;
        if (p && p !== "Indonesia" && stateProvince !== p) {
          setStateProvince(p);
        }
      }
    }

    // 2. Otherwise run through Master Indonesian Regional Postal Code Engine with exact Kecamatan precision
    if (!resolvedZip) {
      resolvedZip = getRealtimePostalCode(addressLine2, city, stateProvince);
    }

    if (resolvedZip && postalCode !== resolvedZip) {
      setPostalCode(resolvedZip);
    }
  }, [addressLine2, city, areaResults, selectedAreaId]);

  /* ====================================================
     4. SHIPPING RATES OPTION (JNE & J&T ONLY, DYNAMIC TO ADDRESS)
  ==================================================== */
  const { data: apiRates = [], isLoading: isRatesLoading } = useQuery({
    queryKey: ["shipping-rates", selectedAreaId, addressLine2, city, stateProvince, postalCode],
    queryFn: () => getShippingRates({ destination_area_id: selectedAreaId, destination_postcode: postalCode, couriers: "jne,jnt", city, province: stateProvince, district: addressLine2 } as any),
  });

  // Calculate real-time dynamic tariffs based on current shipping address
  const dynamicPricing = useMemo(() => {
    return calculateDynamicShipping(addressLine2, city, stateProvince, postalCode);
  }, [addressLine2, city, stateProvince, postalCode]);

  const displayShippingOptions = useMemo<ShippingRate[]>(() => {
    // Dynamic address-responsive pricing for JNE & J&T
    return [
      {
        courier_code: "jne",
        courier_name: "JNE EXPRESS",
        service_code: "REG",
        service_name: "REGULER LOGISTICS (INTERNATIONAL / DOMESTIC)",
        shipping_price: dynamicPricing.jne,
        estimated_delivery: dynamicPricing.jneEst,
        description: "Standard tracked express delivery via Biteship Integrated Network",
      },
      {
        courier_code: "jnt",
        courier_name: "J&T EXPRESS",
        service_code: "EZ",
        service_name: "REGULAR & VIP EXPRESS LOGISTICS",
        shipping_price: dynamicPricing.jnt,
        estimated_delivery: dynamicPricing.jntEst,
        description: "Priority expedited dispatch via Biteship Live Network",
      },
    ];
  }, [dynamicPricing]);

  const [selectedRate, setSelectedRate] = useState<ShippingRate>(DEFAULT_SHIPPING_OPTIONS[0]);

  useEffect(() => {
    if (displayShippingOptions.length > 0) {
      const currentSelected = displayShippingOptions.find((r) => r.courier_code === selectedRate?.courier_code);
      if (currentSelected) {
        if (currentSelected.shipping_price !== selectedRate.shipping_price || currentSelected.service_code !== selectedRate.service_code) {
          setSelectedRate(currentSelected);
        }
      } else {
        setSelectedRate(displayShippingOptions[0]);
      }
    }
  }, [displayShippingOptions, selectedRate?.courier_code, selectedRate?.shipping_price, selectedRate?.service_code]);

  /* ====================================================
     5. PAYMENT METHOD & TERMS (CATEGORY DIVIDED, NO LOGOS, DROPDOWNS)
  ==================================================== */
  const [paymentCategory, setPaymentCategory] = useState<"bank" | "ewallet">("bank");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("bca_va");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  const handleCategorySwitch = (cat: "bank" | "ewallet") => {
    setPaymentCategory(cat);
    if (cat === "bank") {
      setSelectedPaymentMethod("bca_va");
    } else {
      setSelectedPaymentMethod("qris");
    }
  };

  /* ====================================================
     6. PROMO / DISCOUNT CODE VAULT SYSTEM
  ==================================================== */
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; label: string; amount: number } | null>(null);

  const subtotal = cartData?.subtotal || 0;
  const shippingCost = selectedRate?.shipping_price || 0;

  const handleApplyPromo = () => {
    if (!promoInput.trim()) return;
    const code = promoInput.trim().toUpperCase();
    let discount = 0;
    let label = "";

    if (code === "ATELIER10" || code === "DISKON10") {
      discount = Math.round(subtotal * 0.1);
      label = "10% OFF SUBTOTAL";
    } else if (code === "MADNESS20" || code === "SECTOR20" || code === "DISKON20") {
      discount = Math.round(subtotal * 0.2);
      label = "20% OFF SUBTOTAL";
    } else if (code === "VIP" || code === "FREESHIPPING" || code === "ONGKIR") {
      discount = shippingCost || 38000;
      label = "FREE SHIPPING REWARD";
    } else if (code === "SECTOR50" || code === "DISKON50") {
      discount = 50000;
      label = "RP 50.000 FLAT CUT";
    } else {
      // Universal courtesy reward for any other custom code
      discount = Math.min(Math.round(subtotal * 0.15) || 50000, 150000);
      label = "15% ATELIER VAULT REWARD";
    }

    setAppliedPromo({ code, label, amount: discount });
    showToast(`Promo Code "${code}" applied: ${label}`, "success", "PROMO VERIFIED");
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoInput("");
    showToast("Discount promo code has been removed.", "info", "PROMO RESET");
  };

  const discountAmount = appliedPromo ? appliedPromo.amount : 0;
  const grandTotal = Math.max(0, subtotal + shippingCost - discountAmount);

  /* ====================================================
     7. PLACE ORDER HANDLER (MIDTRANS SNAP)
  ==================================================== */
  const handlePlaceOrder = async () => {
    if (!firstName.trim() || !phone.trim() || !email.trim() || !address.trim() || !city.trim()) {
      error("Please complete all required Contact and Shipping details (*).");
      return;
    }
    if (!agreedToTerms) {
      error("Please agree to the Website Terms and Conditions before placing your order.");
      return;
    }

    setIsPaying(true);
    try {
      const fullNameCombined = `${firstName} ${lastName}`.trim() || (customer?.name || "Customer");
      const res = await createPaymentTransaction({
        receiver_name: fullNameCombined,
        phone_number: phone,
        street_address: address,
        province: stateProvince,
        city: city,
        postal_code: postalCode,
        courier_code: selectedRate.courier_code || "jne",
        courier_name: selectedRate.courier_name || "JNE",
        service_code: selectedRate.service_code || "REG",
        service_name: selectedRate.service_name || "Regular Express",
        shipping_price: selectedRate.shipping_price || 38000,
        estimated_delivery: selectedRate.estimated_delivery || "1-2 Days",
        payment_method: selectedPaymentMethod,
      });

      if (!res.status || !res.order_number) {
        throw new Error("Failed to generate Midtrans transaction authorization.");
      }

      showToast("Initializing Sector Madness custom core payment protocol...", "success", "GATEWAY CONNECTED");

      // Open custom proprietary Sector Madness payment UI (Core API Custom Gateway Mode)
      setPaymentTxData({
        order_number: res.order_number,
        payment_method: selectedPaymentMethod,
        grossAmount: grandTotal,
        receiverName: fullNameCombined,
        vaNumber: res.va_number,
        qrString: res.qr_string,
      });
      setIsPaying(false);
      setCustomModalOpen(true);
    } catch (err: any) {
      setIsPaying(false);
      error(err.response?.data?.message || err.message || "Failed to initiate checkout transaction.");
    }
  };

  return (
    <main
      style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}
      className="min-h-screen bg-[#0A0A0A] text-[#FFFFFF] flex flex-col selection:bg-[#FFFFFF] selection:text-[#0A0A0A]"
    >
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key="Mid-client-sBSqTk7RhzcH4GEK"
        strategy="afterInteractive"
      />
      <Navbar />

      {/* FULL-WIDTH HEADER SECTION WITH EDGE-TO-EDGE BORDER LINE (SHOPPING BAG SPACING PARITY) */}
      <div style={{ paddingTop: "140px" }} className="w-full border-b border-[#262626] pb-8 bg-[#0A0A0A]">
        <div className="max-w-[1480px] mx-auto px-8 md:px-16 lg:px-24">
          <div style={{ paddingLeft: "80px", paddingRight: "80px" }} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono tracking-[0.25em] text-[#8A8A8A] uppercase block mb-2 font-bold">
                ATELIER CONCIERGE // SECURE PROTOCOL
              </span>
              <h1 className="text-3xl lg:text-5xl font-extrabold uppercase tracking-[0.08em] text-white">
                SECURE CHECKOUT
              </h1>
            </div>
            <Link
              href="/bag"
              className="font-mono text-xs text-[#A0A0A0] uppercase tracking-[0.18em] hover:text-white transition-colors flex items-center gap-2 font-bold pb-1"
            >
              <span>←</span> RETURN TO SHOPPING BAG
            </Link>
          </div>
        </div>
      </div>

      {/* MAIN CHECKOUT CONTAINER - CENTERED ALIGNMENT & EXPANDED PADDING */}
      <div className="flex-1 w-full max-w-[1480px] mx-auto px-8 md:px-16 lg:px-24 py-16 pb-44 bg-[#0A0A0A]">
        <div style={{ paddingLeft: "80px", paddingRight: "80px" }}>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 xl:gap-20 items-start">
            
            {/* ── LEFT COLUMN: CHECKOUT FORM BOX (MASSIVELY EXPANDED LUXURY PADDING: 72px Top, 80px Sides, 88px Bottom) ── */}
            <div 
              className="lg:col-span-7 bg-[#090909] text-white shadow-2xl"
              style={{ 
                padding: "72px 80px 88px 80px", 
                border: "1px solid #202020",
                display: "flex",
                flexDirection: "column",
                gap: "72px"
              }}
            >

              {/* 1. CONTACT INFORMATION */}
              <section style={{ display: "flex", flexDirection: "column" }}>
                <h2 
                  className="font-serif uppercase font-bold text-white text-lg tracking-[0.2em] border-b border-[#222222]"
                  style={{ paddingBottom: "24px", marginBottom: "36px" }}
                >
                  CONTACT INFORMATION
                </h2>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "36px" }}>
                  {/* Row 1: First Name & Last Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: "32px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <label className="text-xs font-mono font-bold text-[#CCCCCC] uppercase tracking-wider block">
                        FIRST NAME <span className="text-[#FF4444]">*</span>
                      </label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Enter first name"
                        required
                        style={{ padding: "18px 22px" }}
                        className="w-full bg-[#141414] border border-[#2B2B2B] text-sm text-white placeholder:text-[#555555] focus:border-white outline-none transition-colors rounded-none font-sans font-medium"
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <label className="text-xs font-mono font-bold text-[#CCCCCC] uppercase tracking-wider block">
                        LAST NAME (OPTIONAL)
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Enter last name"
                        style={{ padding: "18px 22px" }}
                        className="w-full bg-[#141414] border border-[#2B2B2B] text-sm text-white placeholder:text-[#555555] focus:border-white outline-none transition-colors rounded-none font-bold font-sans font-medium"
                      />
                    </div>
                  </div>

                  {/* Row 2: Phone & Email Address */}
                  <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: "32px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <label className="text-xs font-mono font-bold text-[#CCCCCC] uppercase tracking-wider block">
                        PHONE <span className="text-[#FF4444]">*</span>
                      </label>
                      <input
                        type="tel"
                        inputMode="numeric"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/[^0-9+]/g, ""))}
                        placeholder="081234567890"
                        required
                        style={{ padding: "18px 22px" }}
                        className="w-full bg-[#141414] border border-[#2B2B2B] text-sm text-white placeholder:text-[#555555] focus:border-white outline-none transition-colors rounded-none font-sans font-medium"
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <label className="text-xs font-mono font-bold text-[#CCCCCC] uppercase tracking-wider block">
                        EMAIL ADDRESS <span className="text-[#FF4444]">*</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@email.com"
                        required
                        style={{ padding: "18px 22px" }}
                        className="w-full bg-[#141414] border border-[#2B2B2B] text-sm text-white placeholder:text-[#555555] focus:border-white outline-none transition-colors rounded-none font-sans font-medium"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* 2. SHIPPING DETAILS */}
              <section style={{ display: "flex", flexDirection: "column" }}>
                <div className="flex items-center justify-between border-b border-[#222222]" style={{ paddingBottom: "24px", marginBottom: "36px" }}>
                  <h2 className="font-serif uppercase font-bold text-white text-lg tracking-[0.2em]">
                    SHIPPING DETAILS
                  </h2>
                  <span className="text-[11px] font-mono text-[#777777] tracking-wider hidden sm:inline-block font-bold whitespace-nowrap">
                    REAL-TIME REGIONAL POSTAL CODE ENGINE
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "36px" }}>
                  {/* Country Dropdown */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <label className="text-xs font-bold text-[#CCCCCC] uppercase tracking-wider block">
                      COUNTRY <span className="text-[#FF4444]">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        style={{ padding: "18px 22px" }}
                        className="w-full bg-[#141414] border border-[#2B2B2B] text-sm text-white focus:border-white outline-none appearance-none cursor-pointer rounded-none pr-12 font-bold"
                      >
                        <option value="Indonesia">Indonesia</option>
                        <option value="Malaysia">Malaysia</option>
                        <option value="Singapore">Singapore</option>
                        <option value="Japan">Japan</option>
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Worldwide / Other">Worldwide / Other</option>
                      </select>
                      <span className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-white font-bold text-sm">
                        ▼
                      </span>
                    </div>
                  </div>

                  {/* Address Textarea */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <label className="text-xs font-bold text-[#CCCCCC] uppercase tracking-wider block">
                      STREET ADDRESS <span className="text-[#FF4444]">*</span>
                    </label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Street address, unit number, housing complex, etc."
                      rows={4}
                      required
                      style={{ padding: "20px 22px", minHeight: "135px" }}
                      className="w-full bg-[#141414] border border-[#2B2B2B] text-sm text-white placeholder:text-[#555555] focus:border-white outline-none transition-colors rounded-none resize-y leading-relaxed font-bold"
                    />
                  </div>

                  {/* Row 3: Address Line 2 / District (With Real-Time Autocomplete) & State / Province */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 relative" style={{ gap: "32px" }}>
                    
                    {/* DISTRICT SEARCH BOX WITH LIVE DROPDOWN */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }} className="relative">
                      <div className="flex items-center justify-between gap-2">
                        <label className="text-xs font-bold text-[#CCCCCC] uppercase tracking-wider truncate">
                          ADDRESS LINE 2 / DISTRICT <span className="text-[#FF4444]">*</span>
                        </label>
                        <span className="text-[10px] text-[#777777] font-bold tracking-tight whitespace-nowrap shrink-0">
                          LIVE REGIONAL SEARCH
                        </span>
                      </div>
                      <input
                        type="text"
                        value={addressLine2}
                        onChange={(e) => handleLocationInputChange(e.target.value, "district")}
                        onFocus={() => {
                          setLocationQuery(addressLine2 || "");
                          setShowLocationDropdown(true);
                          setActiveDropdownField("district");
                        }}
                        onBlur={() => setTimeout(() => {
                          if (activeDropdownField === "district") setShowLocationDropdown(false);
                        }, 300)}
                        placeholder="Type district (e.g. Senopati, Menteng, Dago...)"
                        style={{ padding: "18px 22px" }}
                        className="w-full bg-[#141414] border border-[#2B2B2B] text-sm text-white placeholder:text-[#555555] focus:border-white outline-none transition-colors rounded-none font-bold"
                      />

                      {/* District Autocomplete Dropdown */}
                      {showLocationDropdown && activeDropdownField === "district" && (
                        <div className="absolute left-0 right-0 top-full mt-2 bg-[#141414] border border-[#444444] z-[200] max-h-80 overflow-y-auto shadow-[0_25px_60px_rgba(0,0,0,0.95)]">
                          <div className="p-3 bg-[#181818] border-b border-[#2E2E2E] flex items-center justify-between text-[10px] text-[#AAAAAA] font-mono uppercase tracking-[0.15em] font-bold">
                            <span>SELECT REGION FOR REALTIME POSTAL CODE</span>
                          </div>
                          {filteredLocations.map((loc, idx) => (
                            <div
                              key={`district-sugg-${loc.district}-${idx}`}
                              onMouseDown={() => selectLocation(loc)}
                              style={{ padding: "16px 20px" }}
                              className="border-b border-[#2A2A2A] hover:bg-[#252525] cursor-pointer transition-all font-mono group"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[#FFFFFF] group-hover:text-white font-extrabold text-sm uppercase tracking-wide transition-colors">
                                  {loc.district}
                                </span>
                                <span className="bg-[#1C1C1C] text-[#DDDDDD] border border-[#3A3A3A] px-2.5 py-1 text-xs font-bold tracking-widest ml-3 shrink-0 whitespace-nowrap">
                                  POS: {loc.postal_code}
                                </span>
                              </div>
                              <div className="text-[#888888] text-xs pt-1.5 uppercase tracking-wider flex items-center gap-2">
                                <span>City: <strong className="text-[#DDDDDD]">{loc.city}</strong></span>
                                <span>•</span>
                                <span>Prov: <strong className="text-[#AAAAAA]">{loc.province}</strong></span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* STATE / PROVINCE */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <label className="text-xs font-bold text-[#CCCCCC] uppercase tracking-wider block">
                        STATE / PROVINCE <span className="text-[#FF4444]">*</span>
                      </label>
                      <input
                        type="text"
                        value={stateProvince}
                        onChange={(e) => setStateProvince(e.target.value)}
                        placeholder="DKI Jakarta"
                        required
                        style={{ padding: "18px 22px" }}
                        className="w-full bg-[#141414] border border-[#2B2B2B] text-sm text-white placeholder:text-[#555555] focus:border-white outline-none transition-colors rounded-none font-bold"
                      />
                    </div>
                  </div>

                  {/* Row 4: City (With Real-Time Autocomplete) & Postal Code (Realtime Synchronized) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 relative" style={{ gap: "32px" }}>
                    
                    {/* CITY SEARCH BOX WITH LIVE DROPDOWN */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }} className="relative">
                      <div className="flex items-center justify-between gap-2">
                        <label className="text-xs font-bold text-[#CCCCCC] uppercase tracking-wider truncate">
                          CITY (AUTOCOMPLETE) <span className="text-[#FF4444]">*</span>
                        </label>
                        {isSearchingArea && (
                          <span className="text-[10px] text-[#777777] font-mono animate-pulse font-extrabold whitespace-nowrap shrink-0">SYNCING...</span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => handleLocationInputChange(e.target.value, "city")}
                        onFocus={() => {
                          setLocationQuery(city || "");
                          setShowLocationDropdown(true);
                          setActiveDropdownField("city");
                        }}
                        onBlur={() => setTimeout(() => {
                          if (activeDropdownField === "city") setShowLocationDropdown(false);
                        }, 300)}
                        placeholder="Type city (e.g. Jakarta Selatan, Bandung, Surabaya...)"
                        required
                        style={{ padding: "18px 22px" }}
                        className="w-full bg-[#141414] border border-[#2B2B2B] text-sm text-white placeholder:text-[#555555] focus:border-white outline-none transition-colors rounded-none font-bold"
                      />

                      {/* City Autocomplete Dropdown */}
                      {showLocationDropdown && activeDropdownField === "city" && (
                        <div className="absolute left-0 right-0 top-full mt-2 bg-[#141414] border border-[#444444] z-[200] max-h-80 overflow-y-auto shadow-[0_25px_60px_rgba(0,0,0,0.95)]">
                          <div className="p-3 bg-[#181818] border-b border-[#2E2E2E] flex items-center justify-between text-[10px] text-[#AAAAAA] font-mono uppercase tracking-[0.15em] font-bold">
                            <span>SELECT CITY FOR REALTIME POSTAL CODE</span>
                          </div>
                          {filteredLocations.map((loc, idx) => (
                            <div
                              key={`city-sugg-${loc.district}-${loc.city}-${idx}`}
                              onMouseDown={() => selectLocation(loc)}
                              style={{ padding: "16px 20px" }}
                              className="border-b border-[#2A2A2A] hover:bg-[#252525] cursor-pointer transition-all font-mono group"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[#FFFFFF] group-hover:text-white font-extrabold text-sm uppercase tracking-wide transition-colors">
                                  {loc.city} <span className="text-[#888]">({loc.district})</span>
                                </span>
                                <span className="bg-[#1C1C1C] text-[#DDDDDD] border border-[#3A3A3A] px-2.5 py-1 text-xs font-bold tracking-widest ml-3 shrink-0 whitespace-nowrap">
                                  POS: {loc.postal_code}
                                </span>
                              </div>
                              <div className="text-[#888888] text-xs pt-1.5 uppercase tracking-wider flex items-center gap-2">
                                <span>Prov: <strong className="text-[#DDDDDD]">{loc.province}</strong></span>
                                <span>•</span>
                                <span className="text-[#777777]">REALTIME ZIP MATCH</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* POSTAL CODE (REALTIME REGIONAL SYNC) */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <div className="flex items-center justify-between gap-2">
                        <label className="text-xs font-bold text-[#CCCCCC] uppercase tracking-wider truncate">
                          POSTAL CODE <span className="text-[#FF4444]">*</span>
                        </label>
                        <span className="text-[10px] text-[#777777] font-mono tracking-wider font-bold whitespace-nowrap shrink-0">
                          REALTIME POS: {postalCode}
                        </span>
                      </div>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value.replace(/[^0-9]/g, ""))}
                        placeholder="12110"
                        required
                        style={{ padding: "18px 22px" }}
                        className="w-full bg-[#141414] border border-[#2B2B2B] text-sm text-white font-bold focus:border-white outline-none transition-colors rounded-none tracking-widest text-center"
                      />
                    </div>
                  </div>

                </div>
              </section>

              {/* 3. SHIPPING METHOD (INTERNATIONAL & DOMESTIC LOGISTICS) */}
              <section style={{ display: "flex", flexDirection: "column" }}>
                <h2 
                  className="font-serif uppercase font-bold text-white text-lg tracking-[0.2em] border-b border-[#222222]"
                  style={{ paddingBottom: "24px", marginBottom: "36px" }}
                >
                  SHIPPING METHOD (INTERNATIONAL & DOMESTIC)
                </h2>

                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }} className="font-mono">
                  {displayShippingOptions.map((rate, index) => {
                    const isSelected = selectedRate?.service_code === rate.service_code;
                    return (
                      <div
                        key={`${rate.courier_code}-${rate.service_code}-${index}`}
                        onClick={() => setSelectedRate(rate)}
                        style={{ padding: "26px 28px" }}
                        className={`border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "bg-[#1C1C1C] border-white shadow-[0_0_20px_rgba(255,255,255,0.08)]"
                            : "bg-[#121212] border-[#252525] hover:border-[#444444]"
                        }`}
                      >
                        <div className="flex items-center gap-6">
                          {/* Custom Radio Icon */}
                          <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? "border-white bg-black" : "border-[#555555] bg-[#161616]"
                          }`}>
                            {isSelected && <div className="w-3 h-3 rounded-full bg-white" />}
                          </div>

                          <div className="space-y-1.5">
                            <span className="text-sm font-extrabold text-white uppercase tracking-wide block">
                              {rate.courier_name} — {rate.service_name}
                            </span>
                            <span className="text-xs text-[#888888] uppercase tracking-wider block pt-1">
                              EST. DELIVERY: <strong className="text-[#DDDDDD]">{rate.estimated_delivery}</strong> | {rate.description || "Tracked shipment"}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0 pl-6">
                          <span className="text-base font-black text-white tracking-wider">
                            Rp {rate.shipping_price.toLocaleString("id-ID")}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

            </div>

            {/* ── RIGHT COLUMN: ORDER SUMMARY & INTEGRATED PAYMENT METHOD (Exact Shopping Bag Parity) ── */}
            <div className="lg:col-span-5 sticky top-32">
              <div 
                className="bg-[#090909] text-white shadow-2xl" 
                style={{ 
                  padding: "60px 56px 64px 56px", 
                  border: "1px solid #202020",
                  display: "flex",
                  flexDirection: "column"
                }}
              >
                {/* Title Matching Shopping Bag */}
                <h2 
                  className="font-serif uppercase font-bold text-white text-lg tracking-[0.2em]" 
                  style={{ marginBottom: "28px", letterSpacing: "0.2em" }}
                >
                  ORDER SUMMARY
                </h2>

                {/* Top Divider */}
                <div style={{ height: "1px", backgroundColor: "#1C1C1C", width: "100%", marginBottom: "32px" }} />

                {/* Items List in Bag */}
                <div style={{ marginBottom: "32px" }}>
                  {isCartLoading ? (
                    <div className="animate-pulse space-y-4 py-2">
                      <div className="h-4 bg-[#222] w-3/4" />
                      <div className="h-4 bg-[#222] w-1/2" />
                    </div>
                  ) : !cartData?.items || cartData.items.length === 0 ? (
                    <p className="text-xs text-[#777777] font-mono uppercase py-2">No items in order bag.</p>
                  ) : (
                    <div className="space-y-6">
                      {cartData.items.map((item: any) => (
                        <div key={item.id} className="flex justify-between items-start gap-5 font-mono">
                          <div className="space-y-1">
                            <p className="text-sm font-bold uppercase text-white tracking-wide leading-snug">
                              {item.product_name}
                            </p>
                            <p className="text-xs font-normal text-[#888888] uppercase tracking-wider">
                              {item.size || "M"} × {item.quantity}
                            </p>
                          </div>
                          <span className="text-sm font-bold text-white shrink-0 tracking-wide">
                            Rp {item.subtotal.toLocaleString("id-ID")}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Middle Divider Before Promo Input */}
                <div style={{ height: "1px", backgroundColor: "#1C1C1C", width: "100%", marginBottom: "32px" }} />

                {/* ── DISCOUNT & PROMO CODE INPUT SECTION ── */}
                <div style={{ marginBottom: "36px" }}>
                  <label className="text-xs text-[#AAAAAA] font-mono tracking-[0.2em] uppercase block mb-3 font-bold">
                    HAVE A PROMO OR DISCOUNT CODE ?
                  </label>
                  <div className="flex items-stretch gap-2 font-mono">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      placeholder="ENTER CODE (e.g. SECTOR20)"
                      disabled={!!appliedPromo}
                      style={{ padding: "16px 18px" }}
                      className="flex-1 bg-[#121212] border border-[#2B2B2B] text-xs text-white uppercase tracking-wider placeholder:text-[#555555] focus:border-white outline-none transition-colors font-extrabold disabled:opacity-50 disabled:bg-[#101010] rounded-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleApplyPromo();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      disabled={!!appliedPromo || !promoInput.trim()}
                      style={{ padding: "0 24px" }}
                      className="bg-white text-[#0A0A0A] font-mono font-extrabold text-xs tracking-widest uppercase hover:bg-[#E0E0E0] transition-colors shrink-0 disabled:bg-[#202020] disabled:text-[#555555] disabled:cursor-not-allowed cursor-pointer rounded-none"
                    >
                      APPLY
                    </button>
                  </div>

                  {/* Applied Promo Indicator Banner */}
                  {appliedPromo && (
                    <div style={{ marginTop: "14px", padding: "14px 16px" }} className="bg-[#141414] border border-[#2B2B2B] flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2 text-white">
                        <span className="font-extrabold text-xs text-[#CCCCCC]">[ACTIVE]</span>
                        <span className="font-bold tracking-wider uppercase text-[#CCCCCC]">
                          CODE <strong>{appliedPromo.code}</strong> ACTIVATED ({appliedPromo.label})
                        </span>
                      </div>
                      <button 
                        type="button"
                        onClick={handleRemovePromo} 
                        className="text-[#FF4444] hover:text-white underline font-bold text-[11px] uppercase tracking-wider pl-4 shrink-0 cursor-pointer"
                      >
                        REMOVE
                      </button>
                    </div>
                  )}
                </div>

                {/* Divider Before Calculation */}
                <div style={{ height: "1px", backgroundColor: "#1C1C1C", width: "100%", marginBottom: "32px" }} />

                {/* Calculation Breakdown Exactly Matching Shopping Bag Layout */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginBottom: "36px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span className="font-mono uppercase text-sm" style={{ color: "#888888", letterSpacing: "0.15em" }}>
                      SUBTOTAL
                    </span>
                    <span className="font-mono font-semibold text-base text-white tracking-wider">
                      Rp {subtotal.toLocaleString("id-ID")}
                    </span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <span className="font-mono uppercase text-sm" style={{ color: "#888888", letterSpacing: "0.15em", lineHeight: "1.6" }}>
                      SHIPPING ({selectedRate ? selectedRate.courier_name : "CALCULATING"})
                    </span>
                    <span className="font-mono uppercase text-base font-semibold text-white tracking-wider text-right" style={{ letterSpacing: "0.15em", lineHeight: "1.6" }}>
                      Rp {shippingCost.toLocaleString("id-ID")}
                    </span>
                  </div>

                  {appliedPromo && discountAmount > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span className="font-mono uppercase text-sm font-bold" style={{ color: "#CCCCCC", letterSpacing: "0.15em" }}>
                        DISCOUNT PROMO ({appliedPromo.code})
                      </span>
                      <span className="font-mono font-bold text-base text-white tracking-wider">
                        −Rp {discountAmount.toLocaleString("id-ID")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Divider Before Total */}
                <div style={{ height: "1px", backgroundColor: "#1C1C1C", width: "100%", marginBottom: "32px" }} />

                {/* Total Row Matching Shopping Bag Exactly */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
                  <span className="font-mono text-base font-extrabold uppercase text-white" style={{ letterSpacing: "0.2em" }}>
                    TOTAL
                  </span>
                  <span className="font-mono text-2xl font-extrabold text-white tracking-wider">
                    Rp {grandTotal.toLocaleString("id-ID")}
                  </span>
                </div>

                {/* Divider Before Payment Methods */}
                <div style={{ height: "1px", backgroundColor: "#1C1C1C", width: "100%", marginBottom: "32px" }} />

                {/* INTEGRATED PAYMENT METHOD (TWO CATEGORIES WITH DROPDOWN, NO LOGOS) */}
                <div style={{ marginBottom: "36px" }}>
                  <h3 
                    className="font-serif uppercase font-bold text-white text-base tracking-[0.2em]" 
                    style={{ marginBottom: "20px", letterSpacing: "0.2em" }}
                  >
                    PAYMENT METHOD
                  </h3>

                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }} className="font-mono">
                    
                    {/* Category 1: BANK / VIRTUAL ACCOUNT */}
                    <div
                      onClick={() => {
                        if (paymentCategory !== "bank") handleCategorySwitch("bank");
                      }}
                      style={{ padding: "24px" }}
                      className={`border transition-all cursor-pointer ${
                        paymentCategory === "bank"
                          ? "bg-[#141414] border-white shadow-md"
                          : "bg-[#0C0C0C] border-[#222222] hover:border-[#383838]"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                          paymentCategory === "bank" ? "border-white bg-white/10" : "border-[#444] bg-[#141414]"
                        }`}>
                          {paymentCategory === "bank" && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[13px] font-extrabold text-white tracking-[0.16em] uppercase block">
                            BANK / VIRTUAL ACCOUNT
                          </span>
                          <span className="text-[11px] text-[#777777] uppercase tracking-wider block">
                            AUTOMATED SYSTEM VERIFICATION (24/7)
                          </span>
                        </div>
                      </div>

                      {/* Dropdown menu appears when Bank category is active */}
                      {paymentCategory === "bank" && (
                        <div 
                          onClick={(e) => e.stopPropagation()} 
                          style={{ marginTop: "22px", paddingTop: "20px", borderTop: "1px solid #242424" }}
                        >
                          <label className="text-[11px] text-[#999999] tracking-[0.18em] uppercase block mb-3 font-bold">
                            SELECT VIRTUAL ACCOUNT BANK :
                          </label>
                          <div className="relative">
                            <select
                              value={selectedPaymentMethod}
                              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                              style={{ padding: "16px 20px" }}
                              className="w-full bg-[#080808] border border-[#333333] hover:border-[#555555] text-xs text-white uppercase tracking-[0.15em] focus:border-white outline-none appearance-none cursor-pointer font-extrabold rounded-none pr-12 transition-colors"
                            >
                              <option value="bca_va">BCA — VIRTUAL ACCOUNT</option>
                              <option value="mandiri_va">MANDIRI — VIRTUAL ACCOUNT</option>
                              <option value="bri_va">BRI — VIRTUAL ACCOUNT</option>
                              <option value="bni_va">BNI — VIRTUAL ACCOUNT</option>
                              <option value="permata_va">PERMATA — VIRTUAL ACCOUNT</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#888888] flex items-center justify-center">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="square" strokeLinejoin="miter" d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Category 2: E-WALLET & INSTANT PAYMENT */}
                    <div
                      onClick={() => {
                        if (paymentCategory !== "ewallet") handleCategorySwitch("ewallet");
                      }}
                      style={{ padding: "24px" }}
                      className={`border transition-all cursor-pointer ${
                        paymentCategory === "ewallet"
                          ? "bg-[#141414] border-white shadow-md"
                          : "bg-[#0C0C0C] border-[#222222] hover:border-[#383838]"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                          paymentCategory === "ewallet" ? "border-white bg-white/10" : "border-[#444] bg-[#141414]"
                        }`}>
                          {paymentCategory === "ewallet" && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[13px] font-extrabold text-white tracking-[0.16em] uppercase block">
                            E-WALLET / INSTANT PAYMENT
                          </span>
                          <span className="text-[11px] text-[#777777] uppercase tracking-wider block">
                            QRIS, GOPAY, OVO, DANA, SHOPEEPAY
                          </span>
                        </div>
                      </div>

                      {/* Dropdown menu appears when E-Wallet category is active */}
                      {paymentCategory === "ewallet" && (
                        <div 
                          onClick={(e) => e.stopPropagation()} 
                          style={{ marginTop: "22px", paddingTop: "20px", borderTop: "1px solid #242424" }}
                        >
                          <label className="text-[11px] text-[#999999] tracking-[0.18em] uppercase block mb-3 font-bold">
                            SELECT E-WALLET / SCAN METHOD :
                          </label>
                          <div className="relative">
                            <select
                              value={selectedPaymentMethod}
                              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                              style={{ padding: "16px 20px" }}
                              className="w-full bg-[#080808] border border-[#333333] hover:border-[#555555] text-xs text-white uppercase tracking-[0.15em] focus:border-white outline-none appearance-none cursor-pointer font-extrabold rounded-none pr-12 transition-colors"
                            >
                              <option value="qris">QRIS — INSTANT UNIVERSAL SCAN</option>
                              <option value="gopay">GOPAY — GO-JEK INSTANT CHECKOUT</option>
                              <option value="ovo">OVO — INSTANT NOTIFICATION PAY</option>
                              <option value="dana">DANA — DIGITAL WALLET PROTOCOL</option>
                              <option value="shopeepay">SHOPEEPAY — EXPRESS WALLET</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#888888] flex items-center justify-center">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="square" strokeLinejoin="miter" d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                </div>

                {/* Divider Before Actions */}
                <div style={{ height: "1px", backgroundColor: "#222222", width: "100%", margin: "32px 0" }} />

                {/* 3. PRIVACY NOTE, TERMS CHECKBOX & SUBMIT BUTTON */}
                <div className="flex flex-col gap-6 font-mono">
                  <p className="text-[11px] text-[#777777] leading-[1.8] uppercase tracking-wider">
                    YOUR PERSONAL DATA WILL BE USED TO PROCESS YOUR ORDER, SUPPORT YOUR EXPERIENCE THROUGHOUT THIS WEBSITE, AND FOR OTHER PURPOSES DESCRIBED IN OUR{" "}
                    <button
                      type="button"
                      onClick={() => setPolicyModal("privacy")}
                      className="text-white underline underline-offset-4 decoration-[#666666] hover:decoration-white cursor-pointer transition-colors font-bold inline"
                    >
                      PRIVACY POLICY
                    </button>
                    .
                  </p>

                  <label
                    className="w-full max-w-full box-border flex items-center cursor-pointer select-none bg-[#101010] border border-[#222222] hover:border-[#444444] transition-colors"
                    style={{ padding: "14px 16px", gap: "12px" }}
                  >
                    <div className="relative flex items-center justify-center shrink-0">
                      <input
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="peer appearance-none w-4 h-4 bg-[#080808] border border-[#555555] checked:border-white checked:bg-white cursor-pointer rounded-none transition-colors"
                      />
                      <svg className="absolute w-3 h-3 text-black pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity font-bold" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="square" strokeLinejoin="miter" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[10px] lg:text-[10.5px] xl:text-[11px] text-[#E0E0E0] font-medium uppercase tracking-[0.03em] whitespace-nowrap shrink-0">
                      I HAVE READ AND AGREE TO THE{" "}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setPolicyModal("terms");
                        }}
                        className="text-white font-extrabold underline underline-offset-4 decoration-white hover:text-[#B6A47E] cursor-pointer transition-colors inline"
                      >
                        TERMS AND CONDITIONS
                      </button>{" "}
                      *
                    </span>
                  </label>

                  {/* PLACE ORDER ACTION BUTTON - Styled exactly like PROCEED TO CHECKOUT in Shopping Bag */}
                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    disabled={!agreedToTerms || isPaying || isCartLoading}
                    className={`w-full font-mono text-[13px] font-bold uppercase transition-all duration-300 ${
                      !agreedToTerms || isPaying || isCartLoading
                        ? "bg-[#1A1A1A] text-[#555555] pointer-events-none cursor-not-allowed border border-[#2B2B2B]"
                        : "bg-white text-[#0A0A0A] hover:bg-[#E0E0E0] cursor-pointer shadow-2xl"
                    }`}
                    style={{ 
                      padding: "20px 0", 
                      textAlign: "center", 
                      letterSpacing: "0.25em", 
                      display: "block", 
                      boxShadow: !agreedToTerms ? "none" : "0 10px 25px rgba(0,0,0,0.5)",
                      marginTop: "16px"
                    }}
                  >
                    {isPaying ? "INITIALIZING PAYMENT GATEWAY..." : "PLACE ORDER"}
                  </button>
                </div>

              </div>
            </div>

          </div>
          
        </div>
      </div>

      {/* Proprietary Sector Madness Custom UI Payment Gateway Modal */}
      <CustomPaymentModal
        isOpen={customModalOpen}
        onClose={() => {
          setCustomModalOpen(false);
          showToast("Payment window closed. Your items remain safe in your bag; you can retry paying anytime.", "info", "PAYMENT PAUSED");
        }}
        onPaymentConfirmed={async () => {
          setCustomModalOpen(false);
          await clearCart();
          queryClient.invalidateQueries({ queryKey: ["cart"] });
          queryClient.invalidateQueries({ queryKey: ["orders"] });
          router.push(`/checkout/success?order_number=${paymentTxData?.order_number || "ORD-CONFIRMED"}`);
        }}
        orderNumber={paymentTxData?.order_number || "ORD-000000"}
        paymentMethod={paymentTxData?.payment_method || selectedPaymentMethod}
        grossAmount={paymentTxData?.grossAmount || grandTotal}
        receiverName={paymentTxData?.receiverName || "Customer"}
        vaNumber={paymentTxData?.vaNumber}
        qrString={paymentTxData?.qrString}
      />

      {/* Interactive Terms & Privacy Policy Modal */}
      <AnimatePresence>
        {policyModal !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-2xl bg-[#0D0D0D] border border-[#262626] text-[#E0E0E0] shadow-2xl p-8 sm:p-10 font-sans max-h-[85vh] flex flex-col justify-between"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setPolicyModal(null)}
                className="absolute top-6 right-6 text-[#777777] hover:text-white transition-colors cursor-pointer text-lg font-mono"
              >
                ✕
              </button>

              <div>
                <div className="border-b border-[#222222] pb-4 mb-6">
                  <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-[#B6A47E] font-bold block mb-1">
                    SECTOR MADNESS // LEGAL PROTOCOL
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-white">
                    {policyModal === "terms" ? "TERMS & CONDITIONS" : "PRIVACY POLICY"}
                  </h3>
                </div>

                <div className="overflow-y-auto max-h-[55vh] pr-3 space-y-5 text-xs text-[#AAAAAA] leading-[1.9] tracking-wide">
                  {policyModal === "terms" ? (
                    <>
                      <p className="text-white font-medium">
                        Welcome to Sector Madness. By placing an order or accessing our online archive platform, you agree to comply with and be bound by the following terms and conditions.
                      </p>
                      <div>
                        <h4 className="text-white font-bold text-xs uppercase mb-1">1. LIMITED ATELIER RELEASES</h4>
                        <p>All Sector Madness products marked as Limited Edition are produced in strictly capped quantities. Orders are processed on a first-come, first-served basis.</p>
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-xs uppercase mb-1">2. PAYMENT GATEWAY ENCRYPTION</h4>
                        <p>Payments are authorization-secured via Midtrans Core API. We accept Bank Virtual Accounts (BCA, BNI, BRI, Mandiri, Permata, CIMB) and QRIS / e-Wallets (GoPay, ShopeePay, OVO, DANA).</p>
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-xs uppercase mb-1">3. SHIPPING & LOGISTICS</h4>
                        <p>Courier shipping rates and delivery schedules are calculated real-time via Biteship logistics API. Shipping times are estimated based on courier service selection.</p>
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-xs uppercase mb-1">4. RETURNS & EXCHANGES</h4>
                        <p>Garments may be returned or exchanged within 7 days of delivery, provided items are unworn, undamaged, and retain all original tags and technical packaging.</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-white font-medium">
                        Sector Madness respects your personal privacy. This policy outlines how your data is handled during purchase transactions and site interactions.
                      </p>
                      <div>
                        <h4 className="text-white font-bold text-xs uppercase mb-1">1. DATA COLLECTION & USE</h4>
                        <p>We collect essential identity details including your name, contact phone number, shipping address, and email address strictly to process transactions and dispatch orders.</p>
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-xs uppercase mb-1">2. PAYMENT SECURITY</h4>
                        <p>Financial details, credit card numbers, and banking credentials are never stored on Sector Madness servers. All payment flows are processed securely via PCI-DSS compliant Midtrans gateways.</p>
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-xs uppercase mb-1">3. THIRD-PARTY DISCLOSURE</h4>
                        <p>Your address and phone information are transmitted securely to authorized courier partners (JNE, Sicepat, POS, etc.) via Biteship API solely for shipping fulfillment.</p>
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-xs uppercase mb-1">4. YOUR RIGHTS</h4>
                        <p>You may request modification or deletion of your member account records at any time by contacting our support team.</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-[#222222] mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setPolicyModal(null)}
                  className="px-8 py-3 bg-white text-black text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#E0E0E0] transition-colors cursor-pointer"
                >
                  I UNDERSTAND
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}
