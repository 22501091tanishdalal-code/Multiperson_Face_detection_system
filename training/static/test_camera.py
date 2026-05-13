import cv2

print("Opening camera...")

cap = cv2.VideoCapture(0, cv2.CAP_AVFOUNDATION)

if not cap.isOpened():
    print("Camera failed")
    exit()

cv2.namedWindow("Camera Test", cv2.WINDOW_NORMAL)

while True:

    ret, frame = cap.read()

    if not ret:
        print("Frame failed")
        break

    cv2.imshow("Camera Test", frame)

    key = cv2.waitKey(1) & 0xFF

    if key == ord("q"):
        break

cap.release()

cv2.destroyAllWindows()
