"""
Run this script INSTEAD of server.py to debug what the model is predicting.
Place your hand in front of the camera and watch the terminal output.

Usage:
    python debug_model.py
"""

import cv2
import numpy as np
from tensorflow.keras.models import model_from_json
import time

# ── CHANGE THIS PATH if your model is elsewhere ──
MODEL_JSON = "Models/model_new.json"
MODEL_H5   = "Models/model_new.h5"

# Load model
print("Loading model...")
with open(MODEL_JSON, "r") as f:
    model = model_from_json(f.read())
model.load_weights(MODEL_H5)
model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
print("✓ Model loaded")
print(f"  Output shape: {model.output_shape}")  # should be (None, 27)

# Class labels — matches your check_class.py output exactly
CLASS_LABELS = [
    '0(blank)',                                   # index 0
    'A', 'B', 'C', 'D', 'E', 'F', 'G',          # index 1–7
    'H', 'I', 'J', 'K', 'L', 'M', 'N',          # index 8–14
    'O', 'P', 'Q', 'R', 'S', 'T', 'U',          # index 15–21
    'V', 'W', 'X', 'Y', 'Z'                      # index 22–26
]
print(f"  Classes ({len(CLASS_LABELS)}): {CLASS_LABELS}\n")

# Open camera
cap = cv2.VideoCapture(0)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

print("=" * 60)
print("Camera open. Show hand signs. Press Q to quit.")
print("=" * 60)

last_time = 0

while True:
    ok, frame = cap.read()
    if not ok:
        continue

    frame = cv2.flip(frame, 1)

    # Same ROI as server.py
    x1 = int(0.5 * frame.shape[1])
    y1 = 10
    x2 = frame.shape[1] - 10
    y2 = int(0.5 * frame.shape[0])

    cv2.rectangle(frame, (x1-1, y1-1), (x2+1, y2+1), (0, 255, 0), 2)
    roi = frame[y1:y2, x1:x2]

    # ── Same preprocessing as server.py ──
    ycrcb = cv2.cvtColor(roi, cv2.COLOR_BGR2YCrCb)
    skin_mask = cv2.inRange(ycrcb, np.array([0, 133, 77]), np.array([255, 173, 127]))
    kernel = np.ones((3, 3), np.uint8)
    skin_mask = cv2.dilate(skin_mask, kernel, iterations=2)
    skin_mask = cv2.erode(skin_mask, kernel, iterations=1)
    skin_mask = cv2.GaussianBlur(skin_mask, (5, 5), 0)
    skin_only = cv2.bitwise_and(roi, roi, mask=skin_mask)
    gray = cv2.cvtColor(skin_only, cv2.COLOR_BGR2GRAY)
    blur = cv2.GaussianBlur(gray, (5, 5), 2)
    th3 = cv2.adaptiveThreshold(blur, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                 cv2.THRESH_BINARY_INV, 11, 2)
    _, processed = cv2.threshold(th3, 70, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

    # Show the processed image the model actually sees
    processed_display = cv2.resize(processed, (200, 150))
    processed_bgr = cv2.cvtColor(processed_display, cv2.COLOR_GRAY2BGR)
    frame[10:160, 10:210] = processed_bgr
    cv2.putText(frame, "What model sees", (10, 175),
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 1)

    # Predict every 0.3s
    now = time.time()
    if now - last_time > 0.3:
        last_time = now

        inp = cv2.resize(processed, (128, 128))
        inp = inp.reshape(1, 128, 128, 1).astype('float32') / 255.0

        scores = model.predict(inp, verbose=0)[0]

        # Top 5 predictions
        top5_idx = scores.argsort()[-5:][::-1]
        top5 = [(CLASS_LABELS[i], round(float(scores[i]) * 100, 1)) for i in top5_idx]

        best_label = top5[0][0]
        best_conf  = top5[0][1]

        # Print to terminal
        print(f"\nPredicted: [{best_label}]  confidence: {best_conf}%")
        print(f"  Top 5: {top5}")

        # Draw on frame
        cv2.putText(frame, f"Pred: {best_label} ({best_conf}%)", (10, 210),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
        for i, (lbl, conf) in enumerate(top5):
            cv2.putText(frame, f"{lbl}: {conf}%", (10, 240 + i*25),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.55, (200, 200, 200), 1)

        # ── KEY DIAGNOSTIC ──
        # Check if ALL top predictions are always the same few letters
        unique_top = set(lbl for lbl, _ in top5)
        if unique_top <= {'S', 'M', 'K', 'V', 'R', '0(blank)'}:
            print("  ⚠ WARNING: model is stuck on the same few letters!")
            print("  → This means class mapping is wrong OR preprocessing mismatch")

    cv2.imshow("Debug - Sign Recognition", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
print("\nDone.")