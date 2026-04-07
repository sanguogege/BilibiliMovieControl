// utils/frameAnalyzer.ts

let frameCanvas: HTMLCanvasElement;
let frameCtx: CanvasRenderingContext2D | null;
let previousImageData: ImageData | null = null;
let blackFrameCount = 0;
let staticFrameCount = 0;

export function initFrameAnalyzer() {
    frameCanvas = document.createElement('canvas');
    frameCtx = frameCanvas.getContext('2d');
    resetFrameAnalyzer();
}

export function getMainVideo(): HTMLVideoElement | null {
    return document.querySelector('.bpx-player-video video') ||
        document.querySelector('#bilibili-player video') ||
        document.querySelector('video');
}

/**
 * 检测当前帧是否为黑屏（仅当视频在播放时有效）
 */
export function isBlackScreen(video: HTMLVideoElement, threshold = 30): boolean {
    if (!frameCtx || video.videoWidth === 0) return false;
    frameCanvas.width = video.videoWidth;
    frameCanvas.height = video.videoHeight;
    frameCtx.drawImage(video, 0, 0, frameCanvas.width, frameCanvas.height);
    const imageData = frameCtx.getImageData(0, 0, frameCanvas.width, frameCanvas.height);
    const data = imageData.data;
    let totalLuminance = 0;
    const pixelCount = frameCanvas.width * frameCanvas.height;
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        totalLuminance += luminance;
    }
    const avgLuminance = totalLuminance / pixelCount;
    return avgLuminance < threshold;
}

/**
 * 检测当前帧是否与上一帧高度相似（静态画面）
 */
export function isStaticFrame(video: HTMLVideoElement, diffThreshold = 0.05): boolean {
    if (!frameCtx || video.videoWidth === 0) return false;
    frameCanvas.width = video.videoWidth;
    frameCanvas.height = video.videoHeight;
    frameCtx.drawImage(video, 0, 0, frameCanvas.width, frameCanvas.height);
    const currentImageData = frameCtx.getImageData(0, 0, frameCanvas.width, frameCanvas.height);
    if (!previousImageData) {
        previousImageData = currentImageData;
        return false;
    }
    let diffPixels = 0;
    const totalPixels = frameCanvas.width * frameCanvas.height;
    const prevData = previousImageData.data;
    const currData = currentImageData.data;
    for (let i = 0; i < prevData.length; i += 4) {
        if (Math.abs(prevData[i] - currData[i]) > 10 ||
            Math.abs(prevData[i + 1] - currData[i + 1]) > 10 ||
            Math.abs(prevData[i + 2] - currData[i + 2]) > 10) {
            diffPixels++;
        }
    }
    previousImageData = currentImageData;
    const diffRatio = diffPixels / totalPixels;
    return diffRatio < diffThreshold;
}

/**
 * 综合判定是否到达片尾（连续黑屏 或 连续静态帧）
 * @param video 视频元素
 * @param isPlaying 视频是否正在播放（必须为 true 才进行检测）
 */
export function checkEndingByFrame(video: HTMLVideoElement, isPlaying: boolean): boolean {
    // 关键修复：如果视频不在播放状态，直接返回 false，并重置计数器
    if (!isPlaying) {
        resetFrameAnalyzer();
        return false;
    }

    const black = isBlackScreen(video);
    const stat = isStaticFrame(video);
    const BLACK_NEED = 3;    // 连续3帧黑屏
    const STATIC_NEED = 10;  // 连续10帧静态

    if (black) {
        blackFrameCount++;
        staticFrameCount = 0;
    } else {
        blackFrameCount = 0;
    }
    if (stat) {
        staticFrameCount++;
    } else {
        staticFrameCount = 0;
    }

    if (blackFrameCount >= BLACK_NEED || staticFrameCount >= STATIC_NEED) {
        resetFrameAnalyzer();
        return true;
    }
    return false;
}

export function resetFrameAnalyzer() {
    blackFrameCount = 0;
    staticFrameCount = 0;
    previousImageData = null;
}