/**
 * Spectrum analyzer data adapter - client-side
 * Handles both microphone and WebSocket FFT sources
 */

import type { SpectrumFrame } from '$lib/types/intel';

/**
 * Get FFT data from microphone using WebAudio API
 */
export async function getMicrophoneSpectrum(
	fftSize = 2048
): Promise<{ frame: SpectrumFrame | null; error?: string }> {
	try {
		// Request microphone access
		const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });

		// Create Web Audio context
		const audioContext = new AudioContext();
		const source = audioContext.createMediaStreamSource(stream);
		const analyser = audioContext.createAnalyser();

		analyser.fftSize = fftSize;
		analyser.smoothingTimeConstant = 0.8;
		source.connect(analyser);

		// Get frequency data
		const bufferLength = analyser.frequencyBinCount;
		const dataArray = new Uint8Array(bufferLength);
		analyser.getByteFrequencyData(dataArray);

		// Convert to dB and generate frequency array
		const sampleRate = audioContext.sampleRate;
		const frequencies = Array.from({ length: bufferLength }, (_, i) => {
			return (i * sampleRate) / (2 * bufferLength);
		});
		const magnitudes = Array.from(dataArray, (v) => (v / 255) * 100 - 100); // Convert to dB range

		const frame: SpectrumFrame = {
			frequencies,
			magnitudes,
			timestamp: Date.now(),
			sampleRate,
			fftSize,
			source: 'microphone'
		};

		// Clean up
		stream.getTracks().forEach((track) => track.stop());
		audioContext.close();

		return { frame };
	} catch (error) {
		return {
			frame: null,
			error: `Microphone access denied or unavailable: ${(error as Error).message}`
		};
	}
}

/**
 * Create WebSocket connection for FFT data stream
 */
export function createSpectrumWebSocket(
	url: string,
	onFrame: (frame: SpectrumFrame) => void,
	onError: (error: string) => void
): WebSocket | null {
	try {
		const ws = new WebSocket(url);

		ws.onmessage = (event) => {
			try {
				const frame: SpectrumFrame = JSON.parse(event.data);
				frame.source = 'websocket';
				onFrame(frame);
			} catch (error) {
				onError(`Failed to parse WebSocket frame: ${(error as Error).message}`);
			}
		};

		ws.onerror = () => {
			onError('WebSocket connection error');
		};

		ws.onclose = () => {
			onError('WebSocket connection closed');
		};

		return ws;
	} catch (error) {
		onError(`Failed to create WebSocket: ${(error as Error).message}`);
		return null;
	}
}
