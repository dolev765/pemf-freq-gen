// Audio Channel Splitter Utility
// Based on BrowserAudioSplitter - splits stereo audio into left/right channels
// Useful for processing audio streams and routing to different outputs

window.ChannelSplitter = {
	/**
	 * Split a stereo audio stream into separate left and right channel streams
	 * @param {MediaStream} stream - The audio stream to split
	 * @param {AudioContext} audioContext - Optional AudioContext (creates new one if not provided)
	 * @returns {Object} Object with leftStream and rightStream MediaStreams
	 */
	splitStereoStream: function(stream, audioContext) {
		if (!audioContext) {
			audioContext = new (window.AudioContext || window.webkitAudioContext)();
		}
		
		const src = audioContext.createMediaStreamSource(stream);
		
		// Detect channel count if available; fallback to 2
		let channelCount = 2;
		try {
			const track = stream.getAudioTracks()[0];
			if (track && typeof track.getSettings === 'function') {
				const settings = track.getSettings();
				if (settings && settings.channelCount) {
					channelCount = settings.channelCount;
				}
			}
		} catch (e) {
			// ignore
		}
		
		const destLeft = audioContext.createMediaStreamDestination();
		const destRight = audioContext.createMediaStreamDestination();
		const gainLeft = audioContext.createGain();
		const gainRight = audioContext.createGain();
		
		if (channelCount >= 2) {
			// Stereo: use ChannelSplitterNode to separate channels
			const splitter = audioContext.createChannelSplitter(2);
			src.connect(splitter);
			// Channel 0 = left, Channel 1 = right
			splitter.connect(gainLeft, 0);   // Left channel (index 0)
			splitter.connect(gainRight, 1);  // Right channel (index 1)
		} else {
			// Mono source: deliver same mono signal to both outputs
			src.connect(gainLeft);
			src.connect(gainRight);
		}
		
		gainLeft.connect(destLeft);
		gainRight.connect(destRight);
		
		// Ensure AudioContext resumed (autoplay policies)
		if (audioContext.state === 'suspended' && typeof audioContext.resume === 'function') {
			audioContext.resume().catch(() => {});
		}
		
		return {
			leftStream: destLeft.stream,
			rightStream: destRight.stream,
			audioContext: audioContext,
			gainLeft: gainLeft,
			gainRight: gainRight
		};
	},
	
	/**
	 * Split an AudioNode into separate left/right processing chains
	 * @param {AudioNode} sourceNode - The audio node to split
	 * @param {AudioContext} audioContext - The AudioContext
	 * @returns {Object} Object with leftGain, rightGain, and merger nodes
	 */
	splitAudioNode: function(sourceNode, audioContext) {
		if (!audioContext) {
			audioContext = sourceNode.context;
		}
		
		const splitter = audioContext.createChannelSplitter(2);
		const gainLeft = audioContext.createGain();
		const gainRight = audioContext.createGain();
		const merger = audioContext.createChannelMerger(2);
		
		// Connect source to splitter
		sourceNode.connect(splitter);
		
		// Split channels: 0 = left, 1 = right
		splitter.connect(gainLeft, 0);   // Left channel
		splitter.connect(gainRight, 1);  // Right channel
		
		// Merge back to stereo (optional - you can use gainLeft/gainRight separately)
		gainLeft.connect(merger, 0, 0);   // Left gain -> merger input 0 (left)
		gainRight.connect(merger, 0, 1);  // Right gain -> merger input 0 (right)
		
		return {
			splitter: splitter,
			gainLeft: gainLeft,
			gainRight: gainRight,
			merger: merger,
			audioContext: audioContext
		};
	},
	
	/**
	 * Create a channel splitter for processing left/right channels independently
	 * @param {AudioContext} audioContext - The AudioContext
	 * @param {Number} numberOfOutputs - Number of output channels (default: 2 for stereo)
	 * @returns {ChannelSplitterNode} The channel splitter node
	 */
	createSplitter: function(audioContext, numberOfOutputs) {
		numberOfOutputs = numberOfOutputs || 2;
		return audioContext.createChannelSplitter(numberOfOutputs);
	},
	
	/**
	 * Create a channel merger to combine multiple mono channels into stereo
	 * @param {AudioContext} audioContext - The AudioContext
	 * @param {Number} numberOfInputs - Number of input channels (default: 2 for stereo)
	 * @returns {ChannelMergerNode} The channel merger node
	 */
	createMerger: function(audioContext, numberOfInputs) {
		numberOfInputs = numberOfInputs || 2;
		return audioContext.createChannelMerger(numberOfInputs);
	}
};
