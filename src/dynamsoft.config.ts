import { CoreModule } from "dynamsoft-core";
import { LicenseManager } from "dynamsoft-license";
import "dynamsoft-barcode-reader";


// Configures the paths where the .wasm files and other necessary resources for modules are located.
CoreModule.engineResourcePaths.rootDirectory = "https://cdn.jsdelivr.net/npm/";
CoreModule.engineResourcePaths.dbr = "https://cdn.jsdelivr.net/npm/dynamsoft-barcode-reader-iv@10.4.20-iv-202411280000/dist/";
/** LICENSE ALERT - README
 * To use the library, you need to first specify a license key using the API "initLicense()" as shown below.
 */

LicenseManager.initLicense("DLS2eyJoYW5kc2hha2VDb2RlIjoiMTAwMDMzNDcxLVRYbFhaV0pRY205cSIsIm1haW5TZXJ2ZXJVUkwiOiJodHRwczovL21kbHMuZHluYW1zb2Z0b25saW5lLmNvbSIsIm9yZ2FuaXphdGlvbklEIjoiMTAwMDMzNDcxIiwic3RhbmRieVNlcnZlclVSTCI6Imh0dHBzOi8vc2Rscy5keW5hbXNvZnRvbmxpbmUuY29tIiwiY2hlY2tDb2RlIjo5Njk2MzEyMTJ9", {
  executeNow: true,
});

/**
 * You can visit https://www.dynamsoft.com/customer/license/trialLicense?utm_source=samples&product=dbr&package=js to get your own trial license good for 30 days.
 * Note that if you downloaded this sample from Dynamsoft while logged in, the above license key may already be your own 30-day trial license.
 * For more information, see https://www.dynamsoft.com/barcode-reader/docs/web/programming/javascript/user-guide/index.html?ver=10.4.2002&cVer=true#specify-the-license&utm_source=samples or contact support@dynamsoft.com.
 * LICENSE ALERT - THE END
 */

// Optional. Preload "BarcodeReader" module for reading barcodes. It will save time on the initial decoding by skipping the module loading.
CoreModule.loadWasm(["DBR"]);
