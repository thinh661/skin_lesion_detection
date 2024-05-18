import cv2
import numpy as np
import base64
from io import BytesIO
from PIL import Image

def segment_and_draw_clusters_base64(image_path, k=3, max_iter=100, epsilon=0.85):
    # Đọc ảnh và chuyển sang không gian màu RGB
    image_rgb = read_rgb_image(image_path)

    # Phân đoạn ảnh và vẽ đường phân cụm
    image_with_boundary = segment_and_draw_boundary(image_rgb, k, max_iter, epsilon)

    # Chuyển đổi ảnh thành base64
    buffered = BytesIO()
    image_pil = Image.fromarray(image_with_boundary)
    image_pil.save(buffered, format="JPEG")
    image_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')

    return image_base64

def read_rgb_image(image_path):
    image = cv2.imread(image_path)
    return cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

def segment_and_draw_boundary(image_rgb, k=3, max_iter=100, epsilon=0.85):
    # Phân đoạn ảnh
    segmented_image = segment_image_rgb(image_rgb, k, max_iter, epsilon)

    # Tạo bản sao của ảnh gốc để vẽ đường phân cụm
    image_with_boundary = image_rgb.copy()

    # Tìm ranh giới giữa hai cụm và vẽ lên bản sao của ảnh gốc
    draw_cluster_boundary(segmented_image, image_with_boundary)

    return image_with_boundary

def segment_image_rgb(image_rgb, k=3, max_iter=100, epsilon=0.85):
    # Chuyển ảnh thành mảng 1D các điểm ảnh
    pixel_vals = image_rgb.reshape((-1, 3))
    pixel_vals = np.float32(pixel_vals)

    # Định nghĩa tiêu chí dừng cho thuật toán
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, max_iter, epsilon)

    # Thực hiện phân cụm k-means
    _, labels, centers = cv2.kmeans(pixel_vals, k, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)

    # Reshape nhãn về kích thước ban đầu của ảnh
    labels = labels.reshape(image_rgb.shape[:2])

    # Tạo mask cho mỗi phân cụm
    masks = [(labels == i).astype(np.uint8) * 255 for i in range(k)]

    # Tạo ảnh đã phân cụm
    segmented_image = np.zeros_like(image_rgb)
    for i, mask in enumerate(masks):
        segmented_image[mask > 0] = centers[i]

    return segmented_image

def draw_cluster_boundary(segmented_image, image_with_boundary):
    # Chuyển đổi ảnh phân cụm sang ảnh xám
    gray_segmented_image = cv2.cvtColor(segmented_image, cv2.COLOR_RGB2GRAY)

    # Tìm ranh giới giữa các phân cụm
    edges = cv2.Canny(gray_segmented_image, 100, 200)

    # Vẽ đường phân cụm lên ảnh gốc
    image_with_boundary[edges > 0] = [0, 255, 0]  # Màu xanh đỏ
