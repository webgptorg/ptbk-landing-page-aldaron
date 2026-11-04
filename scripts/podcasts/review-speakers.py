#!/usr/bin/env python3
"""Manual offline acoustic review. Does not contact providers, assign identities or import files.

Requires numpy, onnxruntime and kaldi-native-fbank; see podcasts/README.md.
"""

import argparse
import collections
import hashlib
import json
import subprocess
from pathlib import Path
import numpy as np
import kaldi_native_fbank as knf
import onnxruntime as ort

p = argparse.ArgumentParser(description=__doc__)
p.add_argument("recording_id")
for option in ["model", "reference", "audio", "transcript", "output"]:
    p.add_argument("--" + option, type=Path, required=True)
args = p.parse_args()
model = args.model
if (
    hashlib.sha256(model.read_bytes()).hexdigest()
    != "9fea6516d7ad6bf0a76c7689f5a49b65d330fad6dde96c91bb4435ffbfe056a1"
):
    raise ValueError("The model does not match the reviewed WeSpeaker ONNX artifact.")
options = ort.SessionOptions()
options.intra_op_num_threads = 2
options.inter_op_num_threads = 1
session = ort.InferenceSession(
    str(model), sess_options=options, providers=["CPUExecutionProvider"]
)


def audio(filename):
    result = subprocess.run(
        [
            "ffmpeg",
            "-v",
            "error",
            "-i",
            str(filename),
            "-f",
            "f32le",
            "-ac",
            "1",
            "-ar",
            "16000",
            "pipe:1",
        ],
        capture_output=True,
        check=True,
    )
    return np.frombuffer(result.stdout, dtype="<f4")


def embedding(wav):
    opts = knf.FbankOptions()
    opts.frame_opts.dither = 0
    opts.frame_opts.window_type = "hamming"
    opts.frame_opts.snip_edges = True
    opts.mel_opts.num_bins = 80
    opts.mel_opts.is_librosa = False
    opts.mel_opts.use_slaney_mel_scale = False
    opts.use_energy = False
    bank = knf.OnlineFbank(opts)
    bank.accept_waveform(16000, (wav * 32768).tolist())
    bank.input_finished()
    features = np.stack(
        [bank.get_frame(i) for i in range(bank.num_frames_ready)]
    ).astype(np.float32)
    features -= features.mean(axis=0, keepdims=True)
    vector = session.run(["embs"], {"feats": features[None]})[0][0]
    return vector / np.linalg.norm(vector)


reference = audio(args.reference)
if len(reference) < 39 * 16000:
    raise ValueError(
        "Use the reviewed original reference recording (at least 39 seconds)."
    )
reference_vectors = np.stack(
    [
        embedding(reference[int(a * 16000) : int(b * 16000)])
        for a, b in [(1, 8), (9, 16), (17, 24), (25, 32), (32, 39)]
    ]
)
reference_centroid = reference_vectors.mean(axis=0)
reference_centroid /= np.linalg.norm(reference_centroid)
recording = audio(args.audio)
result = json.loads(args.transcript.read_text())
words = [
    w
    for w in result["words"]
    if w.get("type") == "word"
    and w.get("speaker_id")
    and w.get("end", 0) > w.get("start", 0)
]
turns = []
turn = None
for word in words:
    sid = word["speaker_id"]
    if turn and (sid != turn["speaker"] or word["start"] - turn["end"] > 0.8):
        turns.append(turn)
        turn = None
    if turn is None:
        turn = {
            "speaker": sid,
            "start": word["start"],
            "end": word["end"],
            "text": word["text"],
        }
    else:
        turn["end"] = max(turn["end"], word["end"])
        turn["text"] += " " + word["text"]
if turn:
    turns.append(turn)
by_speaker = collections.defaultdict(list)
for turn in turns:
    if turn["end"] - turn["start"] < 4.3:
        continue
    start = turn["start"] + 0.15
    end = min(turn["end"] - 0.15, start + 9)
    if any(
        w["speaker_id"] != turn["speaker"] and w["start"] < end and w["end"] > start
        for w in words
    ):
        continue
    by_speaker[turn["speaker"]].append(
        {"start": start, "end": end, "text": turn["text"][:180]}
    )
review = []
for sid, segments in sorted(by_speaker.items()):
    chosen = [
        segments[i]
        for i in np.unique(
            np.linspace(0, len(segments) - 1, min(12, len(segments)), dtype=int)
        )
    ]
    vectors = []
    for segment in chosen:
        vector = embedding(
            recording[int(segment["start"] * 16000) : int(segment["end"] * 16000)]
        )
        vectors.append(vector)
        segment["referenceCosine"] = round(float(vector @ reference_centroid), 5)
    centroid = np.stack(vectors).mean(axis=0)
    centroid /= np.linalg.norm(centroid)
    review.append(
        {
            "speakerId": sid,
            "availableCleanSegments": len(segments),
            "centroidCosine": round(float(centroid @ reference_centroid), 5),
            "medianCosine": round(
                float(np.median([s["referenceCosine"] for s in chosen])), 5
            ),
            "segments": chosen,
        }
    )
report = {
    "recordingId": args.recording_id,
    "method": "WeSpeaker ResNet34, original 39.7s voice sample, 16kHz Kaldi/Hamming fbank; cosine is a similarity score, not a probability.",
    "modelSha256": hashlib.sha256(model.read_bytes()).hexdigest(),
    "referenceSha256": hashlib.sha256(args.reference.read_bytes()).hexdigest(),
    "referenceSelfCosines": [
        round(float(x @ reference_centroid), 5) for x in reference_vectors
    ],
    "speakers": review,
}
out = args.output
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
print(
    json.dumps(
        {
            "recordingId": args.recording_id,
            "referenceSelfCosines": report["referenceSelfCosines"],
            "speakers": [
                {k: v for k, v in s.items() if k != "segments"} for s in review
            ],
        },
        ensure_ascii=False,
    ),
    flush=True,
)
