/**
 * Created by zhaoyadong on 12/11/2017.
 */
const path = require("path");
const ffmpeg = require("ffmpeg");

var ffmpegController = {
    index: function (req, res, next) {
        res.setHeader("Content-type", "text/html;charset=utf-8");
        console.log(10);
        console.log(path.join(__dirname + "../files/tauri.avi"));
        var process = new ffmpeg(path.join(__dirname, "../files/tauri.avi"));
        process.then(
            function (video) {
                // console.log("The video is ready to be processed", video);
                console.log(video.metadata); // Video metadata
                console.log(video.metadata.duration.seconds); // Video 的时长
                // console.log(video.info_configuration); // FFmpeg configuration
                var mp3 = video.fnExtractSoundToMP3(
                    path.join(__dirname, "../files/tauri.mp3")
                );
                mp3.then((audio, a) => {
                    console.log(23, audio);
                    res.send(audio);
                });
                // res.send(video.metadata);
            },
            function (err) {
                console.log("Error: " + err);
            }
        );

        next();
    },
};

module.exports = ffmpegController;
