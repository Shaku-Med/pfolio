const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);

// Set ffmpeg path from the installer
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const resolutionConfig = {
    videoBitrate: '2500k',
    audioBitrate: '192k'
};

/**
 * Converts a media file to HLS format with single resolution
 * @param {Buffer} buffer - The input file buffer
 * @param {string} tempDir - Temporary directory for processing
 * @returns {Promise<string>} - Path to the output directory containing HLS files
 */
async function convertToHLS(buffer, tempDir) {
    // Create unique directory for this conversion
    const timestamp = Date.now();
    const outputDir = path.join(tempDir, `hls_${timestamp}`);
    await mkdirAsync(outputDir, { recursive: true });

    // Write buffer to temporary file
    const inputPath = path.join(tempDir, `input_${timestamp}`);
    await writeFileAsync(inputPath, buffer);

    try {
        const { videoBitrate, audioBitrate } = resolutionConfig;
        const outputFileName = 'stream.m3u8';
        const segmentFileName = 'segment_%03d.ts';
        
        await new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .outputOptions([
                    '-c:v h264',
                    `-b:v ${videoBitrate}`,
                    '-c:a aac',
                    `-b:a ${audioBitrate}`,
                    '-f hls',
                    '-hls_time 10',
                    '-hls_list_size 0',
                    `-hls_segment_filename ${path.join(outputDir, segmentFileName)}`,
                    '-profile:v baseline',
                    '-level 3.0',
                    '-start_number 0',
                    '-ar 44100',
                    '-ac 2',
                    '-pix_fmt yuv420p'
                ])
                .output(path.join(outputDir, outputFileName))
                .on('end', () => resolve())
                .on('error', (err) => reject(err))
                .run();
        });

        // Clean up the temporary input file
        fs.unlinkSync(inputPath);
        
        return outputDir;
    } catch (error) {
        // Clean up the temporary input file
        fs.unlinkSync(inputPath);
        throw error;
    }
}

module.exports = {
    convertToHLS
};
