import { useState, useMemo } from "react";

// ══════════════════════════════════════════════════════════════
// IQONIC METRICS DASHBOARD — Built from API data
// Sources: activecounts, refunds (Dec 2025 - Feb 2026), planslist
// ══════════════════════════════════════════════════════════════

const ACTIVE_COUNTS = { "iq-prime-eu-emerging": 75, "iq-prime-elite-emerging": 3, "iq-atlas": 82, "iq-elite": 906, "hotel-event-one": 1, "iq-max-r-a": 14, "kr-10-month-digital": 2, "iq-prime-ascendia-emerging": 664, "iq-max-emerging-a": 3, "kr-pl-basic": 9, "iq-max": 349, "iq-sm-a": 198, "iqsm-p": 16, "iq-sm": 779, "iq-pro": 213, "iq-prime-ascendia-emerging-a": 9, "iq-prime": 443, "kr-regen": 14, "iq-atlas-agent-addon": 4, "kr-10-month-momentum": 1, "iq-basic": 123, "kr-regen-one": 4, "iq-auto": 74, "usevent-ticket": 19, "iq-prime-ascendia": 22, "iq-atlas-addon": 4, "iq-elite-emerging": 22, "kr-charge": 9, "iq-pro-a": 50, "iq-atlas-agent-a": 4, "iq-elite-emerging-a": 6, "iq-elite-a": 211, "iq-prime-emerging": 212, "iq-auto-addon-emerging": 10, "affiliate-marketing-kit": 291, "gift-10001": 1, "iq-max-a": 114, "iq-sm-ad": 2, "iq-basic-a": 38, "iq-prime-a": 237, "iq-prime-emerging-a": 32, "iqsm-p-a": 1, "kr-charge-one": 5, "gift-111": 26, "hotel-event-two": 2, "iq-prime-eu-emerging-a": 17, "iq-atlas-agent": 8, "kr-pl-thrive-pro": 1 };
const TOTAL_ACTIVES = 5348;
const FREE_ACTIVES = 0;
const DATA_DATE = "18-Mar-2026";

const PLANS = { "iq-basic-a": { recurringprice: "134.99", faststart: "25", productname: "IQ Basic", upfrontprice: "194.98" }, "iq-elite": { productname: "IQ ELITE", upfrontprice: "299.99", faststart: "75", recurringprice: "214.99" }, "iq-atlas-agent-a": { faststart: "35", recurringprice: "64.99", productname: "IQ AGENT", upfrontprice: "229.99" }, "kr-pl-basic": { recurringprice: "0", faststart: "22.23", productname: "Prelaunch Basic - KR", upfrontprice: "300000" }, "iq-prime-emerging": { recurringprice: "179.99", faststart: "35", productname: "PRIME EMERGING", upfrontprice: "199.99" }, "iqsm-p-a": { productname: "IQSM Premium", upfrontprice: "1014.99", recurringprice: "190.99", faststart: "250" }, "iq-max": { upfrontprice: "299.99", productname: "IQ MAX", recurringprice: "199.99", faststart: "100" }, "iq-prime-ascendia-emerging-a": { productname: "IQ PRIME ASCENDIA Affiliate", upfrontprice: "265", faststart: "50", recurringprice: "194.99" }, "affiliate-marketing-kit": { faststart: "0", recurringprice: "15", productname: "Affiliate", upfrontprice: "15" }, "iq-atlas": { faststart: "35", recurringprice: "99.99", productname: "IQ ESCAPES", upfrontprice: "199.99" }, "iq-pro": { recurringprice: "149.99", faststart: "35", productname: "IQ PRO", upfrontprice: "199.99" }, "iq-prime-emerging-a": { upfrontprice: "229.98", productname: "IQ Prime Emerging", faststart: "35", recurringprice: "194.99" }, "iq-atlas-agent-addon": { recurringprice: "44.99", faststart: "0", productname: "IQ AGENT Add-on", upfrontprice: "44.99" }, "iq-prime-ascendia-emerging": { recurringprice: "179.99", faststart: "50", productname: "IQ PRIME ASCENDIA", upfrontprice: "235" }, "iq-prime-ascendia": { productname: "IQ PRIME ASCENDIA", upfrontprice: "249.99", recurringprice: "189.99", faststart: "50" }, "iq-basic": { productname: "IQ Basic", upfrontprice: "164.99", recurringprice: "119.99", faststart: "25" }, "iq-elite-a": { faststart: "75", recurringprice: "229.99", productname: "IQ Elite Affiliate", upfrontprice: "329.98" }, "iq-atlas-agent": { recurringprice: "49.99", faststart: "35", productname: "IQ AGENT", upfrontprice: "199.99" }, "iq-pro-a": { faststart: "35", recurringprice: "164.99", upfrontprice: "229.98", productname: "IQ Pro" }, "iq-sm-ad": { upfrontprice: "499.99", productname: "IQSM Advanced", recurringprice: "179.99", faststart: "125" }, "iq-sm-a": { faststart: "50", recurringprice: "194.99", upfrontprice: "265", productname: "IQ SM" }, "iq-elite-emerging": { recurringprice: "199.99", faststart: "50", productname: "IQ ELITE EMERGING", upfrontprice: "249.99" }, "iq-prime-a": { recurringprice: "199.99", faststart: "50", productname: "IQ Prime", upfrontprice: "279.98" }, "iq-atlas-a": { recurringprice: "114.99", faststart: "35", productname: "IQ ESCAPES", upfrontprice: "229.98" }, "iq-max-a": { faststart: "100", recurringprice: "214.99", productname: "IQ Max", upfrontprice: "329.98" }, "iqsm-p": { productname: "IQSM Premium", upfrontprice: "999.99", recurringprice: "179.99", faststart: "250" }, "iq-prime": { productname: "IQ PRIME", upfrontprice: "249.99", recurringprice: "184.99", faststart: "50" }, "iq-sm": { faststart: "50", recurringprice: "179.99", productname: "IQSM", upfrontprice: "235" }, "iq-max-emerging-a": { productname: "IQ Max Emerging", upfrontprice: "279.98", faststart: "50", recurringprice: "204.99" }, "iq-max-r-a": { upfrontprice: "329.98", productname: "IQ Max Special pack", recurringprice: "114.99", faststart: "100" }, "iq-prime-eu-emerging": { recurringprice: "179.99", faststart: "35", productname: "IQ Prime EU Emerging", upfrontprice: "199.99" }, "iq-prime-eu-emerging-a": { recurringprice: "194.99", faststart: "35", productname: "IQ Prime EU Emerging A", upfrontprice: "229.98" }, "iq-elite-emerging-a": { productname: "IQ ELITE EMERGING AFFLIATE", upfrontprice: "279.98", faststart: "50", recurringprice: "214.99" }, "kr-pl-thrive-pro": { productname: "Prelaunch Thrive Pro - KR", upfrontprice: "1500000", faststart: "122.22", recurringprice: "0" }, "kr-10-month-digital": { faststart: "162.96", recurringprice: "0", upfrontprice: "2000000", productname: "10-Month Momentum - C (Digital)" }, "kr-10-month-momentum": { recurringprice: "0", faststart: "162.96", productname: "10-Month Momentum - A", upfrontprice: "2000000" }, "iq-atlas-addon": { productname: "IQ ESCAPES Add-on", upfrontprice: "35", recurringprice: "35", faststart: "0" }, "iq-prime-elite-emerging": { recurringprice: "214.99", faststart: "75", productname: "IQ Prime Elite Emerging", upfrontprice: "299.99" }, "iq-auto-addon-emerging": { recurringprice: "39.99", faststart: "0", productname: "IQ Auto Addon", upfrontprice: "39.99" }, "iq-basic-a": { recurringprice: "134.99", faststart: "25", productname: "IQ Basic A", upfrontprice: "194.98" } };

const REFUNDS_RAW = [
    { id: "91419685", date: "2025-12-10", product: "iq-prime-emerging" },
    { id: "91475880", date: "2026-01-12", product: "usevent-ticket" },
    { id: "91438059", date: "2026-02-01", product: "kr-charge" },
    { id: "91438058", date: "2026-02-01", product: "iq-sync-kr" },
    { id: "91398980", date: "2025-12-29", product: "kr-charge" },
    { id: "91413354", date: "2025-12-06", product: "iq-pro-a" },
    { id: "91405884", date: "2026-01-04", product: "iq-prime-a" },
    { id: "91397083", date: "2025-12-29", product: "iq-max" },
    { id: "91479774", date: "2025-12-16", product: "iq-prime" },
    { id: "91400796", date: "2026-01-01", product: "iq-prime-a" },
    { id: "91427299", date: "2026-01-22", product: "kr-charge" },
    { id: "91433780", date: "2026-01-27", product: "iq-elite" },
    { id: "91419956", date: "2026-01-14", product: "iq-prime-emerging" },
    { id: "91398977", date: "2025-12-29", product: "kr-charge" },
    { id: "91377282", date: "2025-12-02", product: "iq-prime-emerging" },
    { id: "91479771", date: "2026-01-13", product: "iq-prime-a" },
    { id: "91379736", date: "2025-12-01", product: "iq-max" },
    { id: "91416546", date: "2026-01-12", product: "kr-charge" },
    { id: "91405168", date: "2026-01-04", product: "kr-charge" },
    { id: "91412401", date: "2026-01-05", product: "iq-auto" },
    { id: "91411330", date: "2026-01-07", product: "iq-auto" },
    { id: "91389674", date: "2025-12-14", product: "iq-max" },
    { id: "91408286", date: "2026-01-05", product: "kr-fc" },
    { id: "91444016", date: "2026-01-29", product: "iq-elite" },
    { id: "91419722", date: "2026-01-15", product: "iq-prime" },
    { id: "91418005", date: "2026-01-12", product: "iq-sm-a" },
    { id: "91412895", date: "2025-12-22", product: "affiliate-marketing-kit" },
    { id: "91406445", date: "2026-01-04", product: "iq-max" },
    { id: "91379036", date: "2025-12-01", product: "iq-max" },
    { id: "91425871", date: "2026-01-20", product: "kr-charge" },
    { id: "91432116", date: "2026-01-26", product: "prime-kr" },
    { id: "91420333", date: "2026-01-05", product: "iq-auto" },
    { id: "91436098", date: "2026-01-09", product: "usevent-ticket" },
    { id: "91393803", date: "2025-12-18", product: "iq-max" },
    { id: "91434651", date: "2026-01-28", product: "kr-charge" },
    { id: "91382725", date: "2025-12-03", product: "iq-pro" },
    { id: "91389116", date: "2025-12-09", product: "iq-max" },
    { id: "91451373", date: "2025-12-26", product: "usevent-ticket" },
    { id: "91398174", date: "2025-12-29", product: "kr-charge" },
    { id: "91441551", date: "2026-01-18", product: "usevent-ticket" },
    { id: "91415935", date: "2026-01-12", product: "iq-max" },
    { id: "91392484", date: "2025-12-22", product: "iq-sm-a" },
    { id: "91390277", date: "2025-12-16", product: "iq-max" },
    { id: "91449896", date: "2026-02-01", product: "iq-prime-a" },
    { id: "91390867", date: "2025-12-18", product: "iq-max" },
    { id: "91438035", date: "2026-02-01", product: "kr-charge" },
    { id: "91435576", date: "2026-01-29", product: "kr-charge" },
    { id: "91405181", date: "2026-01-04", product: "kr-charge" },
    { id: "91436014", date: "2026-01-06", product: "hotel-event-one" },
    { id: "91441685", date: "2026-02-01", product: "iq-elite-a" },
    { id: "91394406", date: "2025-12-23", product: "kr-charge" },
    { id: "91398103", date: "2025-12-29", product: "kr-charge" },
    { id: "91433197", date: "2026-01-22", product: "iq-max" },
    { id: "91376034", date: "2025-12-01", product: "iq-max" },
    { id: "91392059", date: "2025-12-21", product: "iq-max" },
    { id: "91479770", date: "2025-12-16", product: "iq-prime-a" },
    { id: "91426738", date: "2026-01-21", product: "kr-charge" },
    { id: "91382703", date: "2025-12-08", product: "affiliate-marketing-kit" },
    { id: "91378662", date: "2025-12-03", product: "iq-max-a" },
    { id: "91396764", date: "2025-12-28", product: "kr-charge" },
    { id: "91409080", date: "2026-01-04", product: "iq-prime" },
    { id: "91418631", date: "2026-01-14", product: "iq-prime-emerging" },
    { id: "91449915", date: "2026-02-01", product: "iq-prime" },
    { id: "91400843", date: "2025-12-31", product: "iq-atlas-agent" },
    { id: "91435024", date: "2026-01-26", product: "iq-auto" },
    { id: "91444146", date: "2026-02-01", product: "iq-elite" },
    { id: "91441619", date: "2025-12-27", product: "hotel-event-two" },
    { id: "91435508", date: "2026-01-29", product: "kr-charge" },
    { id: "91420199", date: "2026-01-15", product: "kr-charge" },
    { id: "91434507", date: "2026-01-28", product: "prime-kr" },
    { id: "91377713", date: "2025-12-01", product: "iq-sm" },
    { id: "91390428", date: "2025-12-18", product: "iq-max" },
    { id: "91425158", date: "2026-01-12", product: "giftcode" },
    { id: "91399254", date: "2025-12-30", product: "iq-max" },
    { id: "91389020", date: "2025-12-15", product: "iq-max" },
    { id: "91380979", date: "2025-12-01", product: "iq-max" },
    { id: "91412816", date: "2026-01-03", product: "iq-prime" },
    { id: "91427919", date: "2026-01-18", product: "iq-max" },
    { id: "91410533", date: "2026-01-04", product: "iq-pro" },
    { id: "91383877", date: "2025-12-10", product: "iq-basic" },
    { id: "91433631", date: "2026-01-27", product: "kr-charge" },
    { id: "91398097", date: "2025-12-29", product: "kr-charge" },
    { id: "91424521", date: "2026-01-19", product: "kr-charge" },
    { id: "91418069", date: "2026-01-12", product: "iq-auto" },
    { id: "91425870", date: "2026-01-20", product: "kr-charge" },
    { id: "91434301", date: "2026-01-28", product: "iq-prime-emerging-a" },
    { id: "91426765", date: "2026-01-19", product: "iq-sm" },
    { id: "91436216", date: "2026-01-18", product: "iq-auto" },
    { id: "91417846", date: "2026-01-07", product: "iq-max" },
    { id: "91443287", date: "2026-01-24", product: "affiliate-marketing-kit" },
    { id: "91415693", date: "2026-01-10", product: "iq-max" },
    { id: "91425869", date: "2026-01-20", product: "kr-charge" },
    { id: "91417682", date: "2026-01-04", product: "iq-sm" },
    { id: "91420209", date: "2026-01-15", product: "kr-charge" },
    { id: "91418325", date: "2026-01-13", product: "kr-charge" },
    { id: "91396831", date: "2025-12-28", product: "kr-charge" },
    { id: "91410238", date: "2026-01-06", product: "kr-charge" },
    { id: "91399582", date: "2025-12-29", product: "iq-sm-a" },
    { id: "91400830", date: "2026-01-01", product: "iq-max" },
    { id: "91400792", date: "2025-12-29", product: "iq-prime-emerging" },
    { id: "91449803", date: "2026-02-01", product: "iq-max-a" },
    { id: "91426102", date: "2026-01-16", product: "iq-max-a" },
    { id: "91393906", date: "2025-12-06", product: "iq-pro" },
    { id: "91432709", date: "2026-01-22", product: "iq-max" },
    { id: "91398331", date: "2025-12-29", product: "kr-charge" },
    { id: "91392305", date: "2025-12-22", product: "iq-max-emerging" },
    { id: "91417502", date: "2026-01-08", product: "iq-max-a" },
    { id: "91423608", date: "2026-01-14", product: "iq-max" },
    { id: "91438335", date: "2026-02-01", product: "iq-elite" },
    { id: "91434974", date: "2026-01-26", product: "iq-max" },
    { id: "91398613", date: "2025-12-29", product: "kr-charge" },
    { id: "91410769", date: "2026-01-05", product: "justbv" },
    { id: "91449783", date: "2026-01-26", product: "justbv" },
    { id: "91384703", date: "2025-12-07", product: "iq-basic" },
    { id: "91399575", date: "2025-12-30", product: "iq-max" },
    { id: "91386931", date: "2025-12-12", product: "iq-max" },
    { id: "91389566", date: "2025-12-08", product: "giftcode" },
    { id: "91433838", date: "2026-01-20", product: "affiliate-marketing-kit" },
    { id: "91434731", date: "2025-12-28", product: "iq-pro" },
    { id: "91424510", date: "2026-01-19", product: "kr-charge" },
    { id: "91411987", date: "2026-01-05", product: "iq-max" },
    { id: "91398178", date: "2025-12-29", product: "kr-charge" },
    { id: "91451510", date: "2026-01-19", product: "iq-max" },
    { id: "91394130", date: "2025-12-22", product: "iq-max" },
    { id: "91399636", date: "2025-12-22", product: "affiliate-marketing-kit" },
    { id: "91449887", date: "2026-02-01", product: "iq-max-a" },
    { id: "91384819", date: "2025-12-05", product: "iq-max" },
    { id: "91438057", date: "2026-02-01", product: "kr-charge" },
    { id: "91412944", date: "2026-01-07", product: "iq-max" },
    { id: "91384306", date: "2025-12-05", product: "iq-prime-emerging-a" },
    { id: "91417809", date: "2026-01-05", product: "iq-prime-ascendia-emerging" },
    { id: "91425136", date: "2026-01-12", product: "giftcode" },
    { id: "91436018", date: "2026-01-06", product: "hotel-event-one" },
    { id: "91398978", date: "2025-12-29", product: "kr-charge" },
    { id: "91398979", date: "2025-12-29", product: "kr-charge" },
    { id: "91436019", date: "2026-01-08", product: "hotel-event-two" },
    { id: "91394172", date: "2025-12-15", product: "iq-max" },
    { id: "91398330", date: "2025-12-29", product: "kr-charge" },
    { id: "91377239", date: "2025-12-01", product: "kr-charge" },
    { id: "91417865", date: "2026-01-07", product: "iq-atlas" },
    { id: "91389136", date: "2025-12-13", product: "iq-max" },
    { id: "91377238", date: "2025-12-01", product: "kr-charge" },
    { id: "91398327", date: "2025-12-29", product: "kr-charge" },
    { id: "91441549", date: "2026-01-18", product: "hotel-event-one" },
    { id: "91434352", date: "2026-01-22", product: "iq-prime-ascendia" },
    { id: "91393462", date: "2025-12-22", product: "kr-charge" },
    { id: "91392852", date: "2025-12-22", product: "kr-charge" },
    { id: "91390037", date: "2025-12-18", product: "iq-pro" },
    { id: "91411693", date: "2026-01-04", product: "iq-prime-emerging" },
    { id: "91413283", date: "2026-01-07", product: "iq-max" },
    { id: "91385662", date: "2025-12-12", product: "iq-atlas-a" },
    { id: "91412889", date: "2025-12-12", product: "iq-atlas-agent-a" },
    { id: "91434984", date: "2026-01-19", product: "affiliate-marketing-kit" },
    { id: "91383115", date: "2025-12-08", product: "affiliate-marketing-kit" },
    { id: "91435507", date: "2026-01-29", product: "kr-charge" },
    { id: "91424514", date: "2026-01-19", product: "kr-charge" },
    { id: "91398319", date: "2025-12-29", product: "kr-charge" },
    { id: "91434887", date: "2026-01-27", product: "iq-atlas-a" },
    { id: "91419377", date: "2026-01-15", product: "kr-charge" },
    { id: "91410214", date: "2026-01-06", product: "kr-charge" },
    { id: "91380790", date: "2025-12-08", product: "kr-charge" },
    { id: "91389537", date: "2025-12-17", product: "iq-basic" },
    { id: "91378682", date: "2025-12-03", product: "iq-sm" },
    { id: "91397626", date: "2025-12-22", product: "iq-basic" },
    { id: "91379405", date: "2025-12-04", product: "kr-charge" },
    { id: "91405585", date: "2025-12-29", product: "iq-max" },
    { id: "91384527", date: "2025-12-10", product: "kr-charge" },
    { id: "91399564", date: "2025-12-28", product: "iq-atlas-agent" },
    { id: "91436013", date: "2026-01-09", product: "usevent-ticket" },
    { id: "91398120", date: "2025-12-29", product: "kr-charge" },
    { id: "91420222", date: "2026-01-15", product: "kr-charge" },
    { id: "91420411", date: "2026-01-12", product: "giftcode" },
    { id: "91436012", date: "2026-01-20", product: "hotel-event-one" },
    { id: "91409859", date: "2026-01-06", product: "iq-pro" },
    { id: "91389124", date: "2025-12-08", product: "iq-atlas" },
    { id: "91407169", date: "2026-01-05", product: "affiliate-marketing-kit" },
    { id: "91384772", date: "2025-12-08", product: "affiliate-marketing-kit" },
    { id: "91400125", date: "2025-12-29", product: "iq-prime-ascendia-emerging" },
    { id: "91385414", date: "2025-12-05", product: "iq-max" },
    { id: "91394430", date: "2025-12-23", product: "kr-charge" },
    { id: "91417847", date: "2026-01-09", product: "iq-auto" },
    { id: "91431175", date: "2026-01-26", product: "kr-charge" },
    { id: "91398109", date: "2025-12-29", product: "kr-charge-one" },
    { id: "91378670", date: "2025-12-02", product: "iq-pro" },
    { id: "91379181", date: "2025-12-03", product: "iq-sm" },
    { id: "91396916", date: "2025-12-28", product: "iq-max" },
    { id: "91451130", date: "2026-01-10", product: "hotel-event-one" },
    { id: "91410511", date: "2026-01-06", product: "usevent-ticket" },
    { id: "91426983", date: "2026-01-18", product: "iq-max" },
    { id: "91416100", date: "2026-01-12", product: "iq-max" },
    { id: "91378018", date: "2025-12-01", product: "iq-pro-a" },
    { id: "91394431", date: "2025-12-23", product: "kr-charge" },
    { id: "91435139", date: "2026-01-26", product: "iq-max" },
    { id: "91435138", date: "2026-01-26", product: "iq-max" },
    { id: "91395597", date: "2025-12-22", product: "affiliate-marketing-kit" },
    { id: "91444029", date: "2026-01-30", product: "iq-elite" },
    { id: "91384529", date: "2025-12-10", product: "kr-charge" },
    { id: "91435652", date: "2026-01-25", product: "iq-elite" },
    { id: "91384528", date: "2025-12-10", product: "kr-charge" },
    { id: "91449792", date: "2026-01-26", product: "iq-atlas-a" },
    { id: "91397713", date: "2025-12-28", product: "iq-max" },
    { id: "91384511", date: "2025-12-10", product: "kr-charge-one" },
    { id: "91417851", date: "2026-01-12", product: "iq-sm-a" },
    { id: "91398332", date: "2025-12-29", product: "kr-charge" },
    { id: "91377510", date: "2025-12-01", product: "iq-max" },
    { id: "91451607", date: "2026-02-01", product: "iq-max-a" },
    { id: "91427008", date: "2026-01-21", product: "affiliate-marketing-kit" },
    { id: "91398322", date: "2025-12-29", product: "kr-charge-one" },
    { id: "91384977", date: "2025-12-11", product: "affiliate-marketing-kit" },
    { id: "91409144", date: "2026-01-06", product: "iq-prime" },
    { id: "91398111", date: "2025-12-29", product: "kr-charge" },
    { id: "91401049", date: "2025-12-26", product: "iq-max" },
    { id: "91449985", date: "2026-01-28", product: "iq-elite" },
    { id: "91432608", date: "2026-01-21", product: "iq-max" },
    { id: "91404973", date: "2026-01-04", product: "kr-charge" },
    { id: "91396822", date: "2025-12-28", product: "kr-charge" },
    { id: "91424119", date: "2026-01-19", product: "kr-charge" },
    { id: "91396823", date: "2025-12-28", product: "kr-charge" },
    { id: "91416124", date: "2026-01-05", product: "giftcode" },
    { id: "91439324", date: "2026-01-13", product: "iq-prime" },
    { id: "91415942", date: "2026-01-12", product: "iq-sm-a" },
    { id: "91434982", date: "2026-01-25", product: "iq-elite-a" },
    { id: "91396727", date: "2025-12-28", product: "kr-charge" },
    { id: "91442545", date: "2026-01-15", product: "iq-prime-emerging" },
    { id: "91436208", date: "2026-01-24", product: "iq-elite" },
    { id: "91434175", date: "2026-01-28", product: "iq-max-r-a" },
    { id: "91378339", date: "2025-12-01", product: "iq-prime-a" },
    { id: "91441738", date: "2026-01-12", product: "hotel-event-one" },
    { id: "91388767", date: "2025-12-15", product: "iq-sm-a" },
    { id: "91432653", date: "2026-01-26", product: "iq-elite" },
    { id: "91441531", date: "2026-02-01", product: "iq-pro" },
    { id: "91419688", date: "2026-01-11", product: "iq-prime-emerging" },
    { id: "91408277", date: "2026-01-05", product: "kr-fc" },
    { id: "91420328", date: "2026-01-11", product: "iq-prime" },
    { id: "91435026", date: "2026-01-25", product: "iq-auto" },
    { id: "91406567", date: "2026-01-05", product: "iq-max" },
    { id: "91422325", date: "2026-01-18", product: "kr-charge" },
    { id: "91378871", date: "2025-12-03", product: "kr-charge" },
    { id: "91384772b", date: "2025-12-08", product: "affiliate-marketing-kit" },
    { id: "91387392", date: "2025-12-01", product: "iq-sm" },
    { id: "91383369", date: "2025-12-09", product: "justbv" },
    { id: "91419330", date: "2026-01-14", product: "kr-charge" },
    { id: "91388843", date: "2025-12-12", product: "iq-basic" },
    { id: "91379404", date: "2025-12-04", product: "kr-charge" },
    { id: "91426526", date: "2026-01-16", product: "iq-max" },
    { id: "91398110", date: "2025-12-29", product: "kr-charge" },
    { id: "91398176", date: "2025-12-29", product: "kr-charge" },
    { id: "91385391", date: "2025-12-12", product: "iq-pro" },
    { id: "91398325", date: "2025-12-29", product: "kr-charge" },
    { id: "91433836", date: "2026-01-19", product: "iq-prime-emerging" },
    { id: "91422523", date: "2026-01-18", product: "kr-charge" },
    { id: "91424618", date: "2026-01-19", product: "kr-charge" },
    { id: "91427300", date: "2026-01-22", product: "kr-charge" },
    { id: "91392141", date: "2025-12-22", product: "iq-basic" },
    { id: "91407602", date: "2026-01-05", product: "kr-regen-one" },
    { id: "91395401", date: "2025-12-21", product: "iq-max" },
    { id: "91384531", date: "2025-12-10", product: "kr-charge" },
    { id: "91419376", date: "2026-01-15", product: "kr-charge" },
    { id: "91385020", date: "2025-12-06", product: "giftcode" },
    { id: "91418632", date: "2026-01-14", product: "affiliate-marketing-kit" },
    { id: "91418599", date: "2026-01-09", product: "iq-prime-emerging" },
    { id: "91396729", date: "2025-12-28", product: "kr-charge" },
    { id: "91410590", date: "2025-12-22", product: "affiliate-marketing-kit" },
    { id: "91432666", date: "2026-01-26", product: "iq-max-a" },
    { id: "91396728", date: "2025-12-28", product: "kr-charge" },
    { id: "91386636", date: "2025-12-14", product: "kr-charge" },
    { id: "91413355", date: "2026-01-01", product: "iq-pro-a" },
    { id: "91435506", date: "2026-01-29", product: "kr-charge" },
    { id: "91417475", date: "2026-01-13", product: "iq-sm-a" },
    { id: "91417785", date: "2025-12-18", product: "iq-pro" },
    { id: "91418004", date: "2026-01-12", product: "iq-max" },
    { id: "91434911", date: "2026-01-15", product: "iq-auto" },
    { id: "91396888", date: "2025-12-28", product: "kr-charge" },
    { id: "91398104", date: "2025-12-29", product: "kr-charge" },
    { id: "91441977", date: "2026-02-01", product: "iq-elite" },
    { id: "91436016b", date: "2026-01-02", product: "hotel-event-one" },
    { id: "91411166", date: "2026-01-07", product: "iq-auto" },
    { id: "91475211", date: "2026-01-09", product: "usevent-ticket" },
    { id: "91376087", date: "2025-12-01", product: "iq-basic-a" },
    { id: "91441314", date: "2026-01-31", product: "iq-pro" },
    { id: "91438244", date: "2026-02-01", product: "iq-elite" },
    { id: "91383991", date: "2025-12-10", product: "iq-max" },
    { id: "91449814", date: "2026-02-01", product: "iq-max-a" },
    { id: "91395311", date: "2025-12-26", product: "kr-charge" },
    { id: "91441446", date: "2026-01-08", product: "hotel-event-one" },
    { id: "91449754", date: "2026-02-01", product: "justbv" },
    { id: "91390051", date: "2025-12-15", product: "iq-max" },
    { id: "91408267", date: "2026-01-05", product: "kr-fc" },
    { id: "91383983", date: "2025-12-09", product: "iq-max" },
    { id: "91433105", date: "2026-01-26", product: "iq-elite" },
    { id: "91451614", date: "2026-01-31", product: "iq-max-a" },
    { id: "91469357", date: "2026-01-19", product: "giftcode" },
    { id: "91422882", date: "2026-01-12", product: "iq-prime" },
    { id: "91382491", date: "2025-12-08", product: "kr-charge" },
    { id: "91475208", date: "2026-01-06", product: "usevent-ticket" },
    { id: "91400161", date: "2025-12-31", product: "iq-prime" },
    { id: "91412378", date: "2025-12-29", product: "iq-basic" },
    { id: "91449808", date: "2026-02-01", product: "iq-atlas-agent-a" },
    { id: "91419329", date: "2026-01-14", product: "kr-charge" },
    { id: "91424699", date: "2026-01-19", product: "kr-charge" },
    { id: "91400799", date: "2025-12-01", product: "iq-prime-emerging" },
    { id: "91379585", date: "2025-12-03", product: "iq-max" },
    { id: "91405883", date: "2025-12-07", product: "iq-prime-a" },
    { id: "91383022", date: "2025-12-08", product: "affiliate-marketing-kit" },
    { id: "91398100", date: "2025-12-29", product: "kr-charge" },
    { id: "91385701", date: "2025-12-12", product: "iq-max" },
    { id: "91457718", date: "2026-01-14", product: "usevent-ticket" },
    { id: "91398175", date: "2025-12-29", product: "kr-charge" },
    { id: "91390571", date: "2025-12-15", product: "iq-max" },
    { id: "91397074", date: "2025-12-22", product: "iq-max" },
    { id: "91409456", date: "2026-01-05", product: "affiliate-marketing-kit" },
    { id: "91451129", date: "2026-01-10", product: "hotel-event-one" },
    { id: "91398107", date: "2025-12-29", product: "kr-charge" },
    { id: "91449662", date: "2026-02-01", product: "iq-max-a" },
    { id: "91419658", date: "2026-01-08", product: "iq-max" },
    { id: "91436015", date: "2026-01-07", product: "usevent-ticket" },
    { id: "91435596", date: "2026-01-29", product: "kr-charge" },
    { id: "91423021", date: "2026-01-19", product: "iq-max" },
    { id: "91408250", date: "2026-01-05", product: "kr-fc" },
    { id: "91407602b", date: "2026-01-05", product: "kr-regen-one" },
    { id: "91395401b", date: "2025-12-21", product: "iq-max" },
];

// ══ TIER CLASSIFICATION ══
function getTier(code) {
    if (!code) return "Other";
    const c = code.toLowerCase();
    if (c.startsWith("kr-") || c === "prime-kr" || c === "iq-sync-kr") return "Korean Market";
    if (c.includes("elite")) return "Elite";
    if (c.includes("ascendia")) return "Prime Ascendia";
    if (c.includes("prime")) return "Prime";
    if (c.includes("max")) return "Max";
    if (c.includes("sm") || c.includes("iqsm")) return "SM / Premium";
    if (c.includes("pro")) return "Pro";
    if (c.includes("atlas") || c.includes("agent") || c.includes("escapes")) return "Atlas / Agent";
    if (c.includes("basic")) return "Basic";
    if (c.includes("auto")) return "Auto";
    if (c.includes("affiliate")) return "Affiliate";
    if (c.includes("usevent") || c.includes("hotel") || c.includes("gift")) return "Events / Gifts";
    return "Other";
}

function isAffiliate(code) {
    return code && code.endsWith("-a") && !code.includes("atlas") && !code.includes("ascendia");
}

const TIER_COLORS = {
    "Elite": "#a855f7",
    "Prime Ascendia": "#ec4899",
    "Prime": "#3b82f6",
    "Max": "#f97316",
    "SM / Premium": "#eab308",
    "Pro": "#22d3ee",
    "Atlas / Agent": "#10b981",
    "Basic": "#64748b",
    "Auto": "#06b6d4",
    "Affiliate": "#84cc16",
    "Events / Gifts": "#94a3b8",
    "Korean Market": "#f43f5e",
    "Other": "#6b7280",
};

// ══ STYLES ══
const S = {
    dark: "#0a0a0a",
    card: "#161616",
    card2: "#1e1e1e",
    amber: "#d4a24e",
    white: "#f5f0eb",
    soft: "#c4bdb5",
    gray: "#6b6560",
    green: "#22c55e",
    red: "#ef4444",
    blue: "#3b82f6",
};

const fmt = (n) => n >= 1000000 ? `$${(n / 1000000).toFixed(2)}M` : n >= 1000 ? `$${(n / 1000).toFixed(1)}K` : `$${n.toFixed(2)}`;
const fmtN = (n) => n >= 1000 ? n.toLocaleString() : String(n);

// ══ SHARED UI ══
const MetricCard = ({ label, value, sub, color, small }) => (
    <div style={{ background: S.card, borderRadius: 10, padding: small ? "14px 16px" : "20px 22px", border: `1px solid rgba(212,162,78,0.08)`, flex: 1, minWidth: small ? 140 : 180 }}>
        <div style={{ fontFamily: "JetBrains Mono", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: S.amber, marginBottom: 6 }}>{label}</div>
        <div style={{ fontFamily: "JetBrains Mono", fontSize: small ? 22 : 28, fontWeight: 700, color: color || S.white }}>{value}</div>
        {sub && <div style={{ fontFamily: "DM Sans", fontSize: 12, color: S.soft, marginTop: 4 }}>{sub}</div>}
    </div>
);

const TabBtn = ({ label, active, onClick }) => (
    <button onClick={onClick} style={{ fontFamily: "DM Sans", fontSize: 13, fontWeight: active ? 600 : 400, color: active ? S.amber : S.soft, background: active ? "rgba(212,162,78,0.1)" : "transparent", border: active ? `1px solid rgba(212,162,78,0.3)` : "1px solid transparent", borderRadius: 6, padding: "8px 16px", cursor: "pointer", transition: "all 0.2s" }}>{label}</button>
);

const Badge = ({ text, color }) => (
    <span style={{ fontFamily: "JetBrains Mono", fontSize: 10, color, background: `${color}18`, padding: "3px 8px", borderRadius: 4, letterSpacing: 1 }}>{text}</span>
);

const BarRow = ({ label, value, max, color, sub }) => (
    <div style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
            <span style={{ fontFamily: "DM Sans", fontSize: 13, color: S.white }}>{label}</span>
            <span style={{ fontFamily: "JetBrains Mono", fontSize: 12, color: S.soft }}>{sub || fmtN(value)}</span>
        </div>
        <div style={{ height: 6, background: "#222", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.min((value / max) * 100, 100)}%`, background: color || S.amber, borderRadius: 3, transition: "width 0.5s" }} />
        </div>
    </div>
);

// ══ MAIN ══
export default function AdminMetrixDashboard() {
    const [view, setView] = useState("overview");
    const [refundMonth, setRefundMonth] = useState("all");

    const analytics = useMemo(() => {
        // Package data with revenue
        const packages = Object.entries(ACTIVE_COUNTS).map(([code, count]) => {
            const plan = PLANS[code];
            const recurring = plan ? parseFloat(plan.recurringprice) || 0 : 0;
            const upfront = plan ? parseFloat(plan.upfrontprice) || 0 : 0;
            const faststart = plan ? parseFloat(plan.faststart) || 0 : 0;
            const mrr = count * recurring;
            return { code, count, recurring, upfront, faststart, mrr, tier: getTier(code), name: plan?.productname || code, isAff: isAffiliate(code) };
        }).sort((a, b) => b.count - a.count);

        const totalMRR = packages.reduce((s, p) => s + p.mrr, 0);
        const arr = totalMRR * 12;
        const paidNonAffiliate = packages.filter(p => p.tier !== "Affiliate" && p.tier !== "Events / Gifts" && p.tier !== "Other" && p.tier !== "Korean Market");
        const coreActives = paidNonAffiliate.reduce((s, p) => s + p.count, 0);
        const coreMRR = paidNonAffiliate.reduce((s, p) => s + p.mrr, 0);

        // Tier breakdown
        const tierMap = {};
        packages.forEach(p => {
            if (!tierMap[p.tier]) tierMap[p.tier] = { count: 0, mrr: 0, packages: [] };
            tierMap[p.tier].count += p.count;
            tierMap[p.tier].mrr += p.mrr;
            tierMap[p.tier].packages.push(p);
        });
        const tiers = Object.entries(tierMap).map(([name, d]) => ({ name, ...d })).sort((a, b) => b.count - a.count);

        // Affiliate vs direct
        const affCount = packages.filter(p => p.isAff).reduce((s, p) => s + p.count, 0);
        const directCount = TOTAL_ACTIVES - affCount - (tierMap["Affiliate"]?.count || 0);
        const affMRR = packages.filter(p => p.isAff).reduce((s, p) => s + p.mrr, 0);

        // Refund analytics
        const refunds = REFUNDS_RAW;
        const refundsByMonth = { "Dec 2025": [], "Jan 2026": [], "Feb 2026": [] };
        refunds.forEach(r => {
            if (r.date.startsWith("2025-12")) refundsByMonth["Dec 2025"].push(r);
            else if (r.date.startsWith("2026-01")) refundsByMonth["Jan 2026"].push(r);
            else if (r.date.startsWith("2026-02")) refundsByMonth["Feb 2026"].push(r);
        });

        const refundsByProduct = {};
        refunds.forEach(r => {
            refundsByProduct[r.product] = (refundsByProduct[r.product] || 0) + 1;
        });
        const topRefunded = Object.entries(refundsByProduct).sort((a, b) => b[1] - a[1]).slice(0, 15);

        const refundsByTier = {};
        refunds.forEach(r => {
            const t = getTier(r.product);
            refundsByTier[t] = (refundsByTier[t] || 0) + 1;
        });

        // Top 10 packages by actives
        const top10 = packages.filter(p => p.count > 0).slice(0, 10);
        // Top 10 by MRR
        const top10MRR = [...packages].sort((a, b) => b.mrr - a.mrr).filter(p => p.mrr > 0).slice(0, 10);

        // ARPU
        const arpu = TOTAL_ACTIVES > 0 ? totalMRR / TOTAL_ACTIVES : 0;
        const coreArpu = coreActives > 0 ? coreMRR / coreActives : 0;

        // Vendor Payment: $3/user for packages with recurring > $100, $1/user for the rest
        const vendorTiers = { premium: [], standard: [] };
        packages.filter(p => p.count > 0).forEach(p => {
            if (p.recurring > 100) {
                vendorTiers.premium.push({ ...p, rate: 3, payment: p.count * 3 });
            } else {
                vendorTiers.standard.push({ ...p, rate: 1, payment: p.count * 1 });
            }
        });
        vendorTiers.premium.sort((a, b) => b.payment - a.payment);
        vendorTiers.standard.sort((a, b) => b.payment - a.payment);
        const vendorPremiumTotal = vendorTiers.premium.reduce((s, p) => s + p.payment, 0);
        const vendorStandardTotal = vendorTiers.standard.reduce((s, p) => s + p.payment, 0);
        const vendorPremiumUsers = vendorTiers.premium.reduce((s, p) => s + p.count, 0);
        const vendorStandardUsers = vendorTiers.standard.reduce((s, p) => s + p.count, 0);
        const vendorTotal = vendorPremiumTotal + vendorStandardTotal;

        return { packages, totalMRR, arr, coreActives, coreMRR, tiers, tierMap, affCount, directCount, affMRR, refunds, refundsByMonth, refundsByProduct, topRefunded, refundsByTier, top10, top10MRR, arpu, coreArpu, vendorTiers, vendorPremiumTotal, vendorStandardTotal, vendorPremiumUsers, vendorStandardUsers, vendorTotal };
    }, []);

    const filteredRefunds = useMemo(() => {
        if (refundMonth === "all") return analytics.refunds;
        return analytics.refundsByMonth[refundMonth] || [];
    }, [refundMonth, analytics]);

    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

    return (
        <div style={{ background: S.dark, minHeight: "100vh", color: S.white, fontFamily: "DM Sans", padding: isMobile ? 12 : 28 }}>
            <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />

            {/* HEADER */}
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <div>
                    <div style={{ fontFamily: "JetBrains Mono", fontSize: 10, letterSpacing: 2, color: S.amber, marginBottom: 4 }}>IQONIC / IQ SOCIAL</div>
                    <h1 style={{ fontSize: isMobile ? 22 : 30, fontWeight: 800, margin: 0, color: S.white }}>Platform Metrics Dashboard</h1>
                    <div style={{ fontSize: 13, color: S.gray, marginTop: 4 }}>Data snapshot: {DATA_DATE} | Refunds: Dec 2025 to Feb 2026</div>
                </div>
            </div>

            {/* NAV TABS */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 24 }}>
                {["overview", "packages", "revenue", "tiers", "refunds", "affiliate", "vendor"].map(v => (
                    <TabBtn key={v} label={v === "vendor" ? "Vendor Payment" : v.charAt(0).toUpperCase() + v.slice(1)} active={view === v} onClick={() => setView(v)} />
                ))}
            </div>

            {/* ═══════ OVERVIEW ═══════ */}
            {view === "overview" && (
                <div>
                    {/* KPIs */}
                    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 24 }}>
                        <MetricCard label="Total Actives" value={fmtN(TOTAL_ACTIVES)} sub="All active subscriptions" color={S.green} />
                        <MetricCard label="Free Actives" value={fmtN(FREE_ACTIVES)} sub="0% of base" color={S.gray} />
                        <MetricCard label="Paid Actives" value={fmtN(TOTAL_ACTIVES - FREE_ACTIVES)} sub="100% paid" color={S.amber} />
                        <MetricCard label="Est. MRR" value={fmt(analytics.totalMRR)} sub={`ARR: ${fmt(analytics.arr)}`} color={S.green} />
                    </div>
                    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 24 }}>
                        <MetricCard label="Core MRR" value={fmt(analytics.coreMRR)} sub={`${fmtN(analytics.coreActives)} core subscribers`} color={S.blue} small />
                        <MetricCard label="ARPU (All)" value={`$${analytics.arpu.toFixed(2)}`} sub="Monthly per user" color={S.soft} small />
                        <MetricCard label="ARPU (Core)" value={`$${analytics.coreArpu.toFixed(2)}`} sub="Excl. affiliate, events, KR" color={S.amber} small />
                        <MetricCard label="Unique Packages" value={Object.keys(ACTIVE_COUNTS).length} sub="Active plan codes" color={S.soft} small />
                        <MetricCard label="Refunds (2mo)" value={analytics.refunds.length} sub="Dec 2025 to Feb 2026" color={S.red} small />
                    </div>

                    {/* TIER DONUT + TOP 10 */}
                    <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                        {/* Tier Distribution */}
                        <div style={{ background: S.card, borderRadius: 10, padding: 20, border: `1px solid rgba(212,162,78,0.08)`, flex: 1, minWidth: 300 }}>
                            <div style={{ fontFamily: "JetBrains Mono", fontSize: 10, letterSpacing: 2, color: S.amber, marginBottom: 16 }}>TIER DISTRIBUTION</div>
                            {analytics.tiers.map(t => (
                                <BarRow key={t.name} label={t.name} value={t.count} max={analytics.tiers[0].count} color={TIER_COLORS[t.name]} sub={`${t.count} (${((t.count / TOTAL_ACTIVES) * 100).toFixed(1)}%)`} />
                            ))}
                        </div>

                        {/* Top 10 Packages */}
                        <div style={{ background: S.card, borderRadius: 10, padding: 20, border: `1px solid rgba(212,162,78,0.08)`, flex: 1, minWidth: 300 }}>
                            <div style={{ fontFamily: "JetBrains Mono", fontSize: 10, letterSpacing: 2, color: S.amber, marginBottom: 16 }}>TOP 10 PACKAGES BY SUBSCRIBERS</div>
                            {analytics.top10.map(p => (
                                <BarRow key={p.code} label={p.name || p.code} value={p.count} max={analytics.top10[0].count} color={TIER_COLORS[p.tier]} sub={`${fmtN(p.count)} subs`} />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════ PACKAGES ═══════ */}
            {view === "packages" && (
                <div>
                    <div style={{ fontFamily: "JetBrains Mono", fontSize: 10, letterSpacing: 2, color: S.amber, marginBottom: 16 }}>ALL ACTIVE PACKAGES ({Object.entries(ACTIVE_COUNTS).filter(([, v]) => v > 0).length} with subscribers)</div>
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "DM Sans", fontSize: 13 }}>
                            <thead>
                                <tr style={{ borderBottom: `1px solid ${S.gray}33` }}>
                                    {["Package", "Friendly Name", "Tier", "Actives", "% Share", "Recurring", "MRR", "Upfront", "FastStart"].map(h => (
                                        <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontFamily: "JetBrains Mono", fontSize: 10, letterSpacing: 1, color: S.amber, textTransform: "uppercase" }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {analytics.packages.filter(p => p.count > 0).map(p => (
                                    <tr key={p.code} style={{ borderBottom: `1px solid ${S.gray}15` }}>
                                        <td style={{ padding: "8px 12px", fontFamily: "JetBrains Mono", fontSize: 12, color: S.white }}>{p.code}</td>
                                        <td style={{ padding: "8px 12px", color: S.soft }}>{p.name}</td>
                                        <td style={{ padding: "8px 12px" }}><Badge text={p.tier} color={TIER_COLORS[p.tier]} /></td>
                                        <td style={{ padding: "8px 12px", fontFamily: "JetBrains Mono", fontWeight: 600 }}>{fmtN(p.count)}</td>
                                        <td style={{ padding: "8px 12px", fontFamily: "JetBrains Mono", color: S.soft }}>{((p.count / TOTAL_ACTIVES) * 100).toFixed(1)}%</td>
                                        <td style={{ padding: "8px 12px", fontFamily: "JetBrains Mono", color: S.green }}>${p.recurring}</td>
                                        <td style={{ padding: "8px 12px", fontFamily: "JetBrains Mono", color: S.green, fontWeight: 600 }}>{fmt(p.mrr)}</td>
                                        <td style={{ padding: "8px 12px", fontFamily: "JetBrains Mono", color: S.soft }}>${p.upfront}</td>
                                        <td style={{ padding: "8px 12px", fontFamily: "JetBrains Mono", color: S.amber }}>${p.faststart}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ═══════ REVENUE ═══════ */}
            {view === "revenue" && (
                <div>
                    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 24 }}>
                        <MetricCard label="Estimated MRR" value={fmt(analytics.totalMRR)} sub="Based on recurring × actives" color={S.green} />
                        <MetricCard label="Estimated ARR" value={fmt(analytics.arr)} sub="MRR × 12" color={S.green} />
                        <MetricCard label="ARPU (All)" value={`$${analytics.arpu.toFixed(2)}`} sub="Total MRR / total actives" />
                        <MetricCard label="ARPU (Core)" value={`$${analytics.coreArpu.toFixed(2)}`} sub="Core MRR / core actives" color={S.amber} />
                    </div>

                    <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                        <div style={{ background: S.card, borderRadius: 10, padding: 20, border: `1px solid rgba(212,162,78,0.08)`, flex: 1, minWidth: 300 }}>
                            <div style={{ fontFamily: "JetBrains Mono", fontSize: 10, letterSpacing: 2, color: S.amber, marginBottom: 16 }}>TOP 10 PACKAGES BY MRR</div>
                            {analytics.top10MRR.map(p => (
                                <BarRow key={p.code} label={p.name || p.code} value={p.mrr} max={analytics.top10MRR[0].mrr} color={TIER_COLORS[p.tier]} sub={fmt(p.mrr)} />
                            ))}
                        </div>

                        <div style={{ background: S.card, borderRadius: 10, padding: 20, border: `1px solid rgba(212,162,78,0.08)`, flex: 1, minWidth: 300 }}>
                            <div style={{ fontFamily: "JetBrains Mono", fontSize: 10, letterSpacing: 2, color: S.amber, marginBottom: 16 }}>MRR BY TIER</div>
                            {analytics.tiers.filter(t => t.mrr > 0).sort((a, b) => b.mrr - a.mrr).map(t => (
                                <BarRow key={t.name} label={t.name} value={t.mrr} max={analytics.tiers.sort((a, b) => b.mrr - a.mrr)[0].mrr} color={TIER_COLORS[t.name]} sub={fmt(t.mrr)} />
                            ))}
                        </div>
                    </div>

                    {/* Revenue concentration */}
                    <div style={{ background: S.card, borderRadius: 10, padding: 20, border: `1px solid rgba(212,162,78,0.08)`, marginTop: 20 }}>
                        <div style={{ fontFamily: "JetBrains Mono", fontSize: 10, letterSpacing: 2, color: S.amber, marginBottom: 16 }}>REVENUE CONCENTRATION</div>
                        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                            {(() => {
                                const sorted = [...analytics.packages].sort((a, b) => b.mrr - a.mrr).filter(p => p.mrr > 0);
                                let cumulative = 0;
                                const top5mrr = sorted.slice(0, 5).reduce((s, p) => s + p.mrr, 0);
                                const top10mrr = sorted.slice(0, 10).reduce((s, p) => s + p.mrr, 0);
                                return [
                                    { label: "Top 5 Packages", pct: ((top5mrr / analytics.totalMRR) * 100).toFixed(1), value: fmt(top5mrr) },
                                    { label: "Top 10 Packages", pct: ((top10mrr / analytics.totalMRR) * 100).toFixed(1), value: fmt(top10mrr) },
                                    { label: "IQ Elite (all)", pct: ((analytics.tierMap["Elite"]?.mrr || 0) / analytics.totalMRR * 100).toFixed(1), value: fmt(analytics.tierMap["Elite"]?.mrr || 0) },
                                ].map(d => (
                                    <div key={d.label} style={{ flex: 1, minWidth: 200, padding: 16, background: S.card2, borderRadius: 8 }}>
                                        <div style={{ fontFamily: "JetBrains Mono", fontSize: 10, color: S.amber, letterSpacing: 1, marginBottom: 6 }}>{d.label}</div>
                                        <div style={{ fontFamily: "JetBrains Mono", fontSize: 24, fontWeight: 700, color: S.white }}>{d.pct}%</div>
                                        <div style={{ fontSize: 12, color: S.soft }}>{d.value} of MRR</div>
                                    </div>
                                ));
                            })()}
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════ TIERS ═══════ */}
            {view === "tiers" && (
                <div>
                    <div style={{ fontFamily: "JetBrains Mono", fontSize: 10, letterSpacing: 2, color: S.amber, marginBottom: 16 }}>TIER DEEP DIVE</div>
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
                        {analytics.tiers.map(t => (
                            <div key={t.name} style={{ background: S.card, borderRadius: 10, padding: 18, border: `1px solid rgba(212,162,78,0.08)`, borderLeft: `3px solid ${TIER_COLORS[t.name]}` }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                                    <div style={{ fontFamily: "DM Sans", fontSize: 16, fontWeight: 700, color: S.white }}>{t.name}</div>
                                    <Badge text={`${((t.count / TOTAL_ACTIVES) * 100).toFixed(1)}%`} color={TIER_COLORS[t.name]} />
                                </div>
                                <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
                                    <div>
                                        <div style={{ fontFamily: "JetBrains Mono", fontSize: 10, color: S.gray }}>ACTIVES</div>
                                        <div style={{ fontFamily: "JetBrains Mono", fontSize: 20, fontWeight: 700, color: S.white }}>{fmtN(t.count)}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontFamily: "JetBrains Mono", fontSize: 10, color: S.gray }}>MRR</div>
                                        <div style={{ fontFamily: "JetBrains Mono", fontSize: 20, fontWeight: 700, color: S.green }}>{fmt(t.mrr)}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontFamily: "JetBrains Mono", fontSize: 10, color: S.gray }}>AVG ARPU</div>
                                        <div style={{ fontFamily: "JetBrains Mono", fontSize: 20, fontWeight: 700, color: S.amber }}>{t.count > 0 ? `$${(t.mrr / t.count).toFixed(0)}` : "$0"}</div>
                                    </div>
                                </div>
                                <div style={{ fontSize: 12, color: S.soft }}>
                                    {t.packages.filter(p => p.count > 0).sort((a, b) => b.count - a.count).slice(0, 5).map(p => `${p.code} (${p.count})`).join(", ")}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ═══════ REFUNDS ═══════ */}
            {view === "refunds" && (
                <div>
                    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 24 }}>
                        <MetricCard label="Total Refunds" value={analytics.refunds.length} sub="Dec 2025 to Feb 2026" color={S.red} small />
                        <MetricCard label="Dec 2025" value={analytics.refundsByMonth["Dec 2025"].length} sub={`${((analytics.refundsByMonth["Dec 2025"].length / analytics.refunds.length) * 100).toFixed(0)}%`} color={S.red} small />
                        <MetricCard label="Jan 2026" value={analytics.refundsByMonth["Jan 2026"].length} sub={`${((analytics.refundsByMonth["Jan 2026"].length / analytics.refunds.length) * 100).toFixed(0)}%`} color={S.red} small />
                        <MetricCard label="Feb 2026" value={analytics.refundsByMonth["Feb 2026"].length} sub={`${((analytics.refundsByMonth["Feb 2026"].length / analytics.refunds.length) * 100).toFixed(0)}%`} color={S.red} small />
                        <MetricCard label="Refund Rate" value={`${((analytics.refunds.length / TOTAL_ACTIVES) * 100).toFixed(1)}%`} sub="vs current actives" color={S.red} small />
                    </div>

                    <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 20 }}>
                        {/* By Product */}
                        <div style={{ background: S.card, borderRadius: 10, padding: 20, border: `1px solid rgba(212,162,78,0.08)`, flex: 1, minWidth: 300 }}>
                            <div style={{ fontFamily: "JetBrains Mono", fontSize: 10, letterSpacing: 2, color: S.amber, marginBottom: 16 }}>TOP REFUNDED PRODUCTS</div>
                            {analytics.topRefunded.map(([code, cnt]) => (
                                <BarRow key={code} label={code} value={cnt} max={analytics.topRefunded[0][1]} color={S.red} sub={`${cnt} refunds`} />
                            ))}
                        </div>

                        {/* By Tier */}
                        <div style={{ background: S.card, borderRadius: 10, padding: 20, border: `1px solid rgba(212,162,78,0.08)`, flex: 1, minWidth: 300 }}>
                            <div style={{ fontFamily: "JetBrains Mono", fontSize: 10, letterSpacing: 2, color: S.amber, marginBottom: 16 }}>REFUNDS BY TIER</div>
                            {Object.entries(analytics.refundsByTier).sort((a, b) => b[1] - a[1]).map(([tier, cnt]) => (
                                <BarRow key={tier} label={tier} value={cnt} max={Object.values(analytics.refundsByTier).sort((a, b) => b - a)[0]} color={TIER_COLORS[tier]} sub={`${cnt} (${((cnt / analytics.refunds.length) * 100).toFixed(1)}%)`} />
                            ))}
                        </div>
                    </div>

                    {/* Monthly filter & detail */}
                    <div style={{ background: S.card, borderRadius: 10, padding: 20, border: `1px solid rgba(212,162,78,0.08)` }}>
                        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                            {["all", "Dec 2025", "Jan 2026", "Feb 2026"].map(m => (
                                <TabBtn key={m} label={m === "all" ? "All Months" : m} active={refundMonth === m} onClick={() => setRefundMonth(m)} />
                            ))}
                        </div>
                        <div style={{ fontFamily: "JetBrains Mono", fontSize: 10, color: S.gray, marginBottom: 8 }}>Showing {filteredRefunds.length} refunds</div>
                        <div style={{ maxHeight: 400, overflowY: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                                <thead>
                                    <tr style={{ borderBottom: `1px solid ${S.gray}33` }}>
                                        {["Date", "Product", "Tier"].map(h => (
                                            <th key={h} style={{ textAlign: "left", padding: "8px 10px", fontFamily: "JetBrains Mono", fontSize: 10, color: S.amber, letterSpacing: 1 }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRefunds.slice(0, 100).map((r, i) => (
                                        <tr key={i} style={{ borderBottom: `1px solid ${S.gray}10` }}>
                                            <td style={{ padding: "6px 10px", fontFamily: "JetBrains Mono", color: S.soft }}>{r.date}</td>
                                            <td style={{ padding: "6px 10px", fontFamily: "JetBrains Mono", color: S.white }}>{r.product}</td>
                                            <td style={{ padding: "6px 10px" }}><Badge text={getTier(r.product)} color={TIER_COLORS[getTier(r.product)]} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════ AFFILIATE ═══════ */}
            {view === "affiliate" && (
                <div>
                    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 24 }}>
                        <MetricCard label="Affiliate Subs (kit)" value={fmtN(ACTIVE_COUNTS["affiliate-marketing-kit"] || 0)} sub="$15/mo recurring" color={S.amber} />
                        <MetricCard label="Affiliate-tier Plans" value={fmtN(analytics.affCount)} sub="Plans ending in -a" color={S.blue} />
                        <MetricCard label="Direct Plans" value={fmtN(analytics.directCount)} sub="Non-affiliate, non-kit" color={S.green} />
                        <MetricCard label="Affiliate MRR" value={fmt(analytics.affMRR)} sub="From -a suffix plans" color={S.amber} />
                    </div>

                    <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                        <div style={{ background: S.card, borderRadius: 10, padding: 20, border: `1px solid rgba(212,162,78,0.08)`, flex: 1, minWidth: 300 }}>
                            <div style={{ fontFamily: "JetBrains Mono", fontSize: 10, letterSpacing: 2, color: S.amber, marginBottom: 16 }}>AFFILIATE (-A) PACKAGES</div>
                            {analytics.packages.filter(p => p.isAff && p.count > 0).sort((a, b) => b.count - a.count).map(p => (
                                <BarRow key={p.code} label={p.code} value={p.count} max={analytics.packages.filter(p2 => p2.isAff && p2.count > 0).sort((a, b) => b.count - a.count)[0]?.count || 1} color={S.amber} sub={`${p.count} subs, ${fmt(p.mrr)}/mo`} />
                            ))}
                        </div>

                        <div style={{ background: S.card, borderRadius: 10, padding: 20, border: `1px solid rgba(212,162,78,0.08)`, flex: 1, minWidth: 300 }}>
                            <div style={{ fontFamily: "JetBrains Mono", fontSize: 10, letterSpacing: 2, color: S.amber, marginBottom: 16 }}>DIRECT VS AFFILIATE COMPARISON</div>
                            {(() => {
                                const affKit = ACTIVE_COUNTS["affiliate-marketing-kit"] || 0;
                                const affPlans = analytics.affCount;
                                const direct = TOTAL_ACTIVES - affKit - affPlans;
                                const data = [
                                    { label: "Direct subscribers", count: direct, color: S.green },
                                    { label: "Affiliate-tier plans (-a)", count: affPlans, color: S.amber },
                                    { label: "Affiliate kit ($15)", count: affKit, color: S.blue },
                                ];
                                return data.map(d => (
                                    <div key={d.label} style={{ marginBottom: 16 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                            <span style={{ color: S.white, fontSize: 14 }}>{d.label}</span>
                                            <span style={{ fontFamily: "JetBrains Mono", color: d.color, fontWeight: 600 }}>{fmtN(d.count)} ({((d.count / TOTAL_ACTIVES) * 100).toFixed(1)}%)</span>
                                        </div>
                                        <div style={{ height: 10, background: "#222", borderRadius: 5, overflow: "hidden" }}>
                                            <div style={{ height: "100%", width: `${(d.count / TOTAL_ACTIVES) * 100}%`, background: d.color, borderRadius: 5 }} />
                                        </div>
                                    </div>
                                ));
                            })()}

                            <div style={{ marginTop: 24, padding: 16, background: S.card2, borderRadius: 8 }}>
                                <div style={{ fontFamily: "JetBrains Mono", fontSize: 10, color: S.amber, letterSpacing: 1, marginBottom: 8 }}>FASTSTART COMMISSIONS (POTENTIAL)</div>
                                <div style={{ fontSize: 13, color: S.soft }}>
                                    {(() => {
                                        let totalFS = 0;
                                        analytics.packages.forEach(p => {
                                            if (p.isAff && p.count > 0) totalFS += p.count * p.faststart;
                                        });
                                        const affKitFS = (ACTIVE_COUNTS["affiliate-marketing-kit"] || 0) * 0; // affiliate kit has $0 faststart
                                        return `Estimated FastStart paid on affiliate plans: ${fmt(totalFS)}`;
                                    })()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════ VENDOR PAYMENT ═══════ */}
            {view === "vendor" && (
                <div>
                    {/* KPIs */}
                    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 24 }}>
                        <MetricCard label="Total Owed to BBR" value={`$${fmtN(analytics.vendorTotal)}`} sub="Monthly vendor payment" color={S.green} />
                        <MetricCard label="Premium Users ($3)" value={fmtN(analytics.vendorPremiumUsers)} sub={`Recurring > $100 = $${fmtN(analytics.vendorPremiumTotal)}`} color={S.amber} />
                        <MetricCard label="Standard Users ($1)" value={fmtN(analytics.vendorStandardUsers)} sub={`Recurring ≤ $100 = $${fmtN(analytics.vendorStandardTotal)}`} color={S.blue} />
                        <MetricCard label="Effective Rate" value={`$${(analytics.vendorTotal / TOTAL_ACTIVES).toFixed(2)}`} sub="Blended per-user rate" color={S.soft} />
                    </div>

                    {/* Visual split */}
                    <div style={{ background: S.card, borderRadius: 10, padding: 20, border: `1px solid rgba(212,162,78,0.08)`, marginBottom: 20 }}>
                        <div style={{ fontFamily: "JetBrains Mono", fontSize: 10, letterSpacing: 2, color: S.amber, marginBottom: 16 }}>PAYMENT BREAKDOWN</div>
                        <div style={{ display: "flex", gap: 4, height: 40, borderRadius: 8, overflow: "hidden", marginBottom: 16 }}>
                            <div style={{ width: `${(analytics.vendorPremiumTotal / analytics.vendorTotal) * 100}%`, background: S.amber, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "JetBrains Mono", fontSize: 12, fontWeight: 700, color: S.dark, minWidth: 60 }}>
                                ${fmtN(analytics.vendorPremiumTotal)}
                            </div>
                            <div style={{ width: `${(analytics.vendorStandardTotal / analytics.vendorTotal) * 100}%`, background: S.blue, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "JetBrains Mono", fontSize: 12, fontWeight: 700, color: S.white, minWidth: 60 }}>
                                ${fmtN(analytics.vendorStandardTotal)}
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: 24, fontSize: 13 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <div style={{ width: 10, height: 10, borderRadius: 2, background: S.amber }} />
                                <span style={{ color: S.soft }}>$3/user (recurring &gt; $100): {fmtN(analytics.vendorPremiumUsers)} users = <span style={{ color: S.green, fontFamily: "JetBrains Mono", fontWeight: 600 }}>${fmtN(analytics.vendorPremiumTotal)}</span></span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <div style={{ width: 10, height: 10, borderRadius: 2, background: S.blue }} />
                                <span style={{ color: S.soft }}>$1/user (recurring ≤ $100): {fmtN(analytics.vendorStandardUsers)} users = <span style={{ color: S.green, fontFamily: "JetBrains Mono", fontWeight: 600 }}>${fmtN(analytics.vendorStandardTotal)}</span></span>
                            </div>
                        </div>
                    </div>

                    {/* Annualized */}
                    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 24 }}>
                        <div style={{ background: S.card, borderRadius: 10, padding: 20, border: `1px solid rgba(212,162,78,0.08)`, flex: 1, minWidth: 200 }}>
                            <div style={{ fontFamily: "JetBrains Mono", fontSize: 10, letterSpacing: 2, color: S.amber, marginBottom: 6 }}>MONTHLY</div>
                            <div style={{ fontFamily: "JetBrains Mono", fontSize: 28, fontWeight: 700, color: S.green }}>${fmtN(analytics.vendorTotal)}</div>
                        </div>
                        <div style={{ background: S.card, borderRadius: 10, padding: 20, border: `1px solid rgba(212,162,78,0.08)`, flex: 1, minWidth: 200 }}>
                            <div style={{ fontFamily: "JetBrains Mono", fontSize: 10, letterSpacing: 2, color: S.amber, marginBottom: 6 }}>QUARTERLY</div>
                            <div style={{ fontFamily: "JetBrains Mono", fontSize: 28, fontWeight: 700, color: S.green }}>${fmtN(analytics.vendorTotal * 3)}</div>
                        </div>
                        <div style={{ background: S.card, borderRadius: 10, padding: 20, border: `1px solid rgba(212,162,78,0.08)`, flex: 1, minWidth: 200 }}>
                            <div style={{ fontFamily: "JetBrains Mono", fontSize: 10, letterSpacing: 2, color: S.amber, marginBottom: 6 }}>ANNUAL</div>
                            <div style={{ fontFamily: "JetBrains Mono", fontSize: 28, fontWeight: 700, color: S.green }}>${fmtN(analytics.vendorTotal * 12)}</div>
                        </div>
                        <div style={{ background: S.card, borderRadius: 10, padding: 20, border: `1px solid rgba(212,162,78,0.08)`, flex: 1, minWidth: 200 }}>
                            <div style={{ fontFamily: "JetBrains Mono", fontSize: 10, letterSpacing: 2, color: S.amber, marginBottom: 6 }}>% OF THEIR MRR</div>
                            <div style={{ fontFamily: "JetBrains Mono", fontSize: 28, fontWeight: 700, color: S.white }}>{((analytics.vendorTotal / analytics.totalMRR) * 100).toFixed(2)}%</div>
                            <div style={{ fontSize: 12, color: S.soft, marginTop: 4 }}>We cost them this % of revenue</div>
                        </div>
                    </div>

                    {/* Detail tables */}
                    <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                        {/* $3 tier */}
                        <div style={{ background: S.card, borderRadius: 10, padding: 20, border: `1px solid rgba(212,162,78,0.08)`, flex: 1, minWidth: 340 }}>
                            <div style={{ fontFamily: "JetBrains Mono", fontSize: 10, letterSpacing: 2, color: S.amber, marginBottom: 4 }}>$3/USER PACKAGES (RECURRING &gt; $100)</div>
                            <div style={{ fontFamily: "JetBrains Mono", fontSize: 11, color: S.gray, marginBottom: 14 }}>{analytics.vendorTiers.premium.length} packages, {fmtN(analytics.vendorPremiumUsers)} users</div>
                            <div style={{ overflowX: "auto" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                                    <thead>
                                        <tr style={{ borderBottom: `1px solid ${S.gray}33` }}>
                                            {["Package", "Actives", "Recurring", "Rate", "Payment"].map(h => (
                                                <th key={h} style={{ textAlign: "left", padding: "8px 10px", fontFamily: "JetBrains Mono", fontSize: 10, color: S.amber, letterSpacing: 1 }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {analytics.vendorTiers.premium.map(p => (
                                            <tr key={p.code} style={{ borderBottom: `1px solid ${S.gray}10` }}>
                                                <td style={{ padding: "6px 10px", fontFamily: "JetBrains Mono", color: S.white }}>{p.code}</td>
                                                <td style={{ padding: "6px 10px", fontFamily: "JetBrains Mono", fontWeight: 600 }}>{fmtN(p.count)}</td>
                                                <td style={{ padding: "6px 10px", fontFamily: "JetBrains Mono", color: S.soft }}>${p.recurring}</td>
                                                <td style={{ padding: "6px 10px", fontFamily: "JetBrains Mono", color: S.amber }}>$3</td>
                                                <td style={{ padding: "6px 10px", fontFamily: "JetBrains Mono", color: S.green, fontWeight: 600 }}>${fmtN(p.payment)}</td>
                                            </tr>
                                        ))}
                                        <tr style={{ borderTop: `2px solid ${S.amber}44` }}>
                                            <td style={{ padding: "8px 10px", fontFamily: "JetBrains Mono", fontWeight: 700, color: S.amber }}>SUBTOTAL</td>
                                            <td style={{ padding: "8px 10px", fontFamily: "JetBrains Mono", fontWeight: 700 }}>{fmtN(analytics.vendorPremiumUsers)}</td>
                                            <td style={{ padding: "8px 10px" }}></td>
                                            <td style={{ padding: "8px 10px" }}></td>
                                            <td style={{ padding: "8px 10px", fontFamily: "JetBrains Mono", fontWeight: 700, color: S.green }}>${fmtN(analytics.vendorPremiumTotal)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* $1 tier */}
                        <div style={{ background: S.card, borderRadius: 10, padding: 20, border: `1px solid rgba(212,162,78,0.08)`, flex: 1, minWidth: 340 }}>
                            <div style={{ fontFamily: "JetBrains Mono", fontSize: 10, letterSpacing: 2, color: S.amber, marginBottom: 4 }}>$1/USER PACKAGES (RECURRING ≤ $100)</div>
                            <div style={{ fontFamily: "JetBrains Mono", fontSize: 11, color: S.gray, marginBottom: 14 }}>{analytics.vendorTiers.standard.length} packages, {fmtN(analytics.vendorStandardUsers)} users</div>
                            <div style={{ overflowX: "auto", maxHeight: 500, overflowY: "auto" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                                    <thead>
                                        <tr style={{ borderBottom: `1px solid ${S.gray}33` }}>
                                            {["Package", "Actives", "Recurring", "Rate", "Payment"].map(h => (
                                                <th key={h} style={{ textAlign: "left", padding: "8px 10px", fontFamily: "JetBrains Mono", fontSize: 10, color: S.amber, letterSpacing: 1 }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {analytics.vendorTiers.standard.map(p => (
                                            <tr key={p.code} style={{ borderBottom: `1px solid ${S.gray}10` }}>
                                                <td style={{ padding: "6px 10px", fontFamily: "JetBrains Mono", color: S.white }}>{p.code}</td>
                                                <td style={{ padding: "6px 10px", fontFamily: "JetBrains Mono", fontWeight: 600 }}>{fmtN(p.count)}</td>
                                                <td style={{ padding: "6px 10px", fontFamily: "JetBrains Mono", color: S.soft }}>${p.recurring}</td>
                                                <td style={{ padding: "6px 10px", fontFamily: "JetBrains Mono", color: S.blue }}>$1</td>
                                                <td style={{ padding: "6px 10px", fontFamily: "JetBrains Mono", color: S.green, fontWeight: 600 }}>${fmtN(p.payment)}</td>
                                            </tr>
                                        ))}
                                        <tr style={{ borderTop: `2px solid ${S.amber}44` }}>
                                            <td style={{ padding: "8px 10px", fontFamily: "JetBrains Mono", fontWeight: 700, color: S.amber }}>SUBTOTAL</td>
                                            <td style={{ padding: "8px 10px", fontFamily: "JetBrains Mono", fontWeight: 700 }}>{fmtN(analytics.vendorStandardUsers)}</td>
                                            <td style={{ padding: "8px 10px" }}></td>
                                            <td style={{ padding: "8px 10px" }}></td>
                                            <td style={{ padding: "8px 10px", fontFamily: "JetBrains Mono", fontWeight: 700, color: S.green }}>${fmtN(analytics.vendorStandardTotal)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Grand total callout */}
                    <div style={{ background: "linear-gradient(135deg, #1a2a1a, #161616)", borderRadius: 10, padding: 24, border: `1px solid ${S.green}33`, marginTop: 20, textAlign: "center" }}>
                        <div style={{ fontFamily: "JetBrains Mono", fontSize: 10, letterSpacing: 3, color: S.amber, marginBottom: 8 }}>TOTAL VENDOR PAYMENT DUE</div>
                        <div style={{ fontFamily: "JetBrains Mono", fontSize: 44, fontWeight: 700, color: S.green }}>${fmtN(analytics.vendorTotal)}</div>
                        <div style={{ fontSize: 14, color: S.soft, marginTop: 8 }}>
                            {fmtN(analytics.vendorPremiumUsers)} users × $3 + {fmtN(analytics.vendorStandardUsers)} users × $1 | As of {DATA_DATE}
                        </div>
                    </div>
                </div>
            )}

            {/* FOOTER */}
            <div style={{ marginTop: 32, padding: "16px 0", borderTop: `1px solid ${S.gray}22`, textAlign: "center" }}>
                <span style={{ fontFamily: "JetBrains Mono", fontSize: 10, color: S.gray, letterSpacing: 1 }}>
                    IQONIC ANALYTICS | BUILT BY BBR TEK | DATA AS OF {DATA_DATE}
                </span>
            </div>
        </div>
    );
}
