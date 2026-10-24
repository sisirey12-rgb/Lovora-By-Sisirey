Placeholder videos: one per occasion and person (24 files).
Replace any file with your real video, KEEPING THE SAME NAME, and push to GitHub.
The surprise plays only the video for the chosen occasion and person.

  birthday/  anniversary/  love-letter/  special-surprise/
    each contains: brother.mp4 sister.mp4 partner.mp4 mom.mp4 dad.mp4 friend.mp4

Tips for fast loading: portrait 9:16 (720x1280), H.264 MP4, up to 15 seconds (longer clips are cut off at 15s), under 3 MB each
(ffmpeg -i in.mp4 -vf scale=720:-2 -c:v libx264 -crf 28 -an -movflags +faststart out.mp4).
