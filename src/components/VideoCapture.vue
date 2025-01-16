<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, type Ref } from "vue";
import "../dynamsoft.config";
import { CameraEnhancer, CameraView } from "dynamsoft-camera-enhancer";
import { CaptureVisionRouter } from "dynamsoft-capture-vision-router";
import { MultiFrameResultCrossFilter } from "dynamsoft-utility";
import { EnumEnhancedFeatures } from "dynamsoft-barcode-reader-bundle";

const componentDestroyedErrorMsg = "VideoCapture Component Destroyed";

const cameraViewContainer: Ref<HTMLElement | null> = ref(null);
const resultsContainer: Ref<HTMLElement | null> = ref(null);

let resolveInit: () => void;
const pInit: Promise<void> = new Promise(r => { resolveInit = r });
let isDestroyed = false;
const settings = {
  "CaptureVisionTemplates": [
    {
      "Name": "Dotcode",
      "ImageROIProcessingNameArray": [
        "roi_read_dotcode"
      ],
      "Timeout": 700,
      "MaxParallelTasks":0
    }
  ],
  "TargetROIDefOptions": [
    {
      "Name": "roi_read_dotcode",
      "TaskSettingNameArray": [
        "task_read_dotcode"
      ]
    }
  ],
  "BarcodeFormatSpecificationOptions": [
    {
      "Name": "format_specification_read_dotcode",
      "BarcodeFormatIds": [
        "BF_DOTCODE"
      ],
      "MirrorMode": "MM_BOTH"
    }
  ],
  "BarcodeReaderTaskSettingOptions": [
    {
      "Name": "task_read_dotcode",
      "ExpectedBarcodesCount" : 1,
      "BarcodeFormatIds" : [ "BF_DOTCODE" ],
      "LocalizationModes": [
        {
          "Mode" : "LM_STATISTICS_MARKS"
        }
      ],
      "DeblurModes":
      [
        {
          "Mode": "DM_BASED_ON_LOC_BIN"
        },
        {
          "Mode": "DM_THRESHOLD_BINARIZATION"
        },
        {
          "Mode": "DM_DEEP_ANALYSIS"
        }
      ],
      "BarcodeFormatSpecificationNameArray": [
        "format_specification_read_dotcode"
      ],
      "SectionImageParameterArray": [
        {
          "Section": "ST_REGION_PREDETECTION",
          "ImageParameterName": "ip_read_dotcode"
        },
        {
          "Section": "ST_BARCODE_LOCALIZATION",
          "ImageParameterName": "ip_read_dotcode"
        },
        {
          "Section": "ST_BARCODE_DECODING",
          "ImageParameterName": "ip_read_dotcode"
        }
      ]
    }
  ],
  "ImageParameterOptions": [
    {
      "Name": "ip_read_dotcode",
      "BinarizationModes": [
        {
          "Mode": "BM_LOCAL_BLOCK",
          "BlockSizeX": 15,
          "BlockSizeY": 15,
          "EnableFillBinaryVacancy": 0,
          "ThresholdCompensation": 10
        },
        {
          "Mode": "BM_LOCAL_BLOCK",
          "BlockSizeX": 21,
          "BlockSizeY": 21,
          "EnableFillBinaryVacancy": 0,
          "ThresholdCompensation": 10,
          "MorphOperation":"Erode",
          "MorphOperationKernelSizeX":3,
          "MorphOperationKernelSizeY":3,
          "MorphShape":"Ellipse"
        },
        {
          "Mode": "BM_LOCAL_BLOCK",
          "BlockSizeX": 35,
          "BlockSizeY": 35,
          "EnableFillBinaryVacancy": 0,
          "ThresholdCompensation": 10,
          "MorphOperation":"Erode",
          "MorphOperationKernelSizeX":3,
          "MorphOperationKernelSizeY":3,
          "MorphShape":"Ellipse"
        },
        {
          "Mode": "BM_LOCAL_BLOCK",
          "BlockSizeX": 45,
          "BlockSizeY": 45,
          "EnableFillBinaryVacancy": 0,
          "ThresholdCompensation": 25,
          "MorphOperation":"Erode",
          "MorphOperationKernelSizeX":3,
          "MorphOperationKernelSizeY":3,
          "MorphShape":"Ellipse"
        }
      ],
      "GrayscaleEnhancementModes": [
        {
          "Mode": "GEM_GENERAL"
        }
      ],
      "GrayscaleTransformationModes": [
        {
          "Mode": "GTM_INVERTED"
        },
            {
          "Mode": "GTM_ORIGINAL"
        }
      ]
    }
  ]
}
let cvRouter: CaptureVisionRouter;
let cameraEnhancer: CameraEnhancer;
let scanRegion = {
    x: 25,
    y: 25,
    width: 50,
    height: 10,
    isMeasuredInPercentage: true
    };
onMounted(async () => {

  try {
    // Create a `CameraEnhancer` instance for camera control and a `CameraView` instance for UI control.
    const cameraView = await CameraView.createInstance();
    if (isDestroyed) { throw Error(componentDestroyedErrorMsg); } // Check if component is destroyed after every async

    cameraEnhancer = await CameraEnhancer.createInstance(cameraView);
    await cameraEnhancer.enableEnhancedFeatures(EnumEnhancedFeatures.EF_TAP_TO_FOCUS);
    await cameraEnhancer.setResolution({width:1920, height:1080});

    if (isDestroyed) { throw Error(componentDestroyedErrorMsg); }

    // Get default UI and append it to DOM.
    cameraViewContainer.value!.append(cameraView.getUIElement());
    cameraEnhancer.setScanRegion(scanRegion)
    // Create a `CaptureVisionRouter` instance and set `CameraEnhancer` instance as its image source.
    cvRouter = await CaptureVisionRouter.createInstance();
    await cvRouter.initSettings(settings)

    if (isDestroyed) { throw Error(componentDestroyedErrorMsg); }
    cvRouter.setInput(cameraEnhancer);

    // Define a callback for results.
    cvRouter.addResultReceiver({
      onDecodedBarcodesReceived: (result) => {
        if (!result.barcodeResultItems.length) return;

        resultsContainer.value!.textContent = '';
        console.log(result);
        for (let item of result.barcodeResultItems) {
          resultsContainer.value!.textContent += `${item.formatString}: ${item.text}\n\n`;
        }
      }
    });

    // Filter out unchecked and duplicate results.
    const filter = new MultiFrameResultCrossFilter();
    // Filter out unchecked barcodes.
    filter.enableResultCrossVerification("barcode", true);
    // Filter out duplicate barcodes within 3 seconds.
    filter.enableResultDeduplication("barcode", true);
    await cvRouter.addResultFilter(filter);
    if (isDestroyed) { throw Error(componentDestroyedErrorMsg); }

    // Open camera and start scanning single barcode.
    await cameraEnhancer.open();
         cameraEnhancer.setZoom({
    factor: 2
});

    cameraView.setScanLaserVisible(true);
    if (isDestroyed) { throw Error(componentDestroyedErrorMsg); }
    await cvRouter.startCapturing("Dotcode");
    if (isDestroyed) { throw Error(componentDestroyedErrorMsg); }

  } catch (ex: any) {

    if ((ex as Error)?.message === componentDestroyedErrorMsg) {
      console.log(componentDestroyedErrorMsg);
    } else {
      let errMsg = ex.message || ex;
      console.error(errMsg);
      alert(errMsg);
    }
  }

  // Resolve pInit promise once initialization is complete.
  resolveInit!();
});

// dispose cvRouter when it's no longer needed
onBeforeUnmount(async () => {
  isDestroyed = true;
  try {
    await pInit; // Wait for the pInit to complete before disposing resources.
    cvRouter?.dispose();
    cameraEnhancer?.dispose();
  } catch (_) { }
});
</script>

<template>
  <div>
    <div ref="cameraViewContainer" style="width: 100%; height: 70vh; background: #eee;"></div>
    <br />
    Results:
    <div ref="resultsContainer" class="results"></div>
  </div>
</template>

<style scoped>
.results {
  width: 100%;
  height: 10vh;
  overflow: auto;
  white-space: pre-wrap;
}
</style>