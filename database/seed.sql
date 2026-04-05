-- =====================================================
-- HỆ THỐNG ĐÁNH GIÁ GIẢNG DẠY - Seed Data
-- =====================================================
-- Mật khẩu mẫu: "123456" (bcrypt hash)

USE evaluation_system;

-- 1. Quản trị viên (Admin - password: 123456)
INSERT INTO admins (username, full_name, password_hash) VALUES
('admin', 'Quản trị viên Hệ thống', '$2a$10$NEHyMq94u21FDnOZFFBYTe2hQyOyWxgPjD3jzI8Wjx8CbJYqTvJm6');

-- 2. Sinh viên (password: 123456)
INSERT INTO students (student_code, full_name, email, password_hash, faculty) VALUES
('2051012345', 'Nguyễn Văn An',   'an.nv@student.edu.vn',   '$2a$10$NEHyMq94u21FDnOZFFBYTe2hQyOyWxgPjD3jzI8Wjx8CbJYqTvJm6', 'Công nghệ thông tin'),
('2051012346', 'Trần Thị Bình',   'binh.tt@student.edu.vn', '$2a$10$NEHyMq94u21FDnOZFFBYTe2hQyOyWxgPjD3jzI8Wjx8CbJYqTvJm6', 'Công nghệ thông tin'),
('2051012347', 'Lê Hoàng Cường',  'cuong.lh@student.edu.vn','$2a$10$NEHyMq94u21FDnOZFFBYTe2hQyOyWxgPjD3jzI8Wjx8CbJYqTvJm6', 'Công nghệ thông tin');

-- 3. Giảng viên (password: 123456)
INSERT INTO instructors (instructor_code, full_name, email, password_hash, faculty, academic_rank) VALUES
('GV001', 'Phạm Minh Đức',    'duc.pm@university.edu.vn',  '$2a$10$NEHyMq94u21FDnOZFFBYTe2hQyOyWxgPjD3jzI8Wjx8CbJYqTvJm6', 'Công nghệ thông tin', 'PGS.TS'),
('GV002', 'Nguyễn Thị Hoa',   'hoa.nt@university.edu.vn',  '$2a$10$NEHyMq94u21FDnOZFFBYTe2hQyOyWxgPjD3jzI8Wjx8CbJYqTvJm6', 'Công nghệ thông tin', 'TS'),
('GV003', 'Trần Văn Khang',   'khang.tv@university.edu.vn','$2a$10$NEHyMq94u21FDnOZFFBYTe2hQyOyWxgPjD3jzI8Wjx8CbJYqTvJm6', 'Công nghệ thông tin', 'ThS'),
('GV004', 'Lê Thị Mai',       'mai.lt@university.edu.vn',  '$2a$10$NEHyMq94u21FDnOZFFBYTe2hQyOyWxgPjD3jzI8Wjx8CbJYqTvJm6', 'Công nghệ thông tin', 'TS'),
('GV005', 'Hoàng Văn Nam',    'nam.hv@university.edu.vn',  '$2a$10$NEHyMq94u21FDnOZFFBYTe2hQyOyWxgPjD3jzI8Wjx8CbJYqTvJm6', 'Công nghệ thông tin', 'PGS.TS');

-- 4. Môn học
INSERT INTO subjects (subject_code, subject_name, credits, faculty) VALUES
('IT001', 'Nhập môn lập trình',           3, 'Công nghệ thông tin'),
('IT002', 'Cấu trúc dữ liệu và giải thuật', 4, 'Công nghệ thông tin'),
('IT003', 'Cơ sở dữ liệu',                3, 'Công nghệ thông tin'),
('IT004', 'Phát triển ứng dụng Web',       3, 'Công nghệ thông tin'),
('IT005', 'Phân tích thiết kế hệ thống',   3, 'Công nghệ thông tin');

-- 5. Học kỳ
INSERT INTO semesters (name, start_date, end_date) VALUES
('HK1 2025-2026', '2025-09-01', '2026-01-15'),
('HK2 2025-2026', '2026-02-01', '2026-06-30');

-- 6. Lớp học phần (HK2 2025-2026)
INSERT INTO classes (class_code, subject_id, instructor_id, semester_id, schedule, room) VALUES
('IT001.P11', 1, 1, 2, 'Thứ 2, tiết 1-3', 'A1.01'),
('IT002.P11', 2, 2, 2, 'Thứ 3, tiết 4-6', 'B2.04'),
('IT003.P11', 3, 3, 2, 'Thứ 4, tiết 7-9', 'A3.02'),
('IT004.P11', 4, 4, 2, 'Thứ 5, tiết 1-3', 'LAB1'),
('IT005.P11', 5, 5, 2, 'Thứ 6, tiết 4-6', 'C1.05');

-- 7. Đăng ký học phần (SV1: 5 lớp, SV2: 4 lớp, SV3: 3 lớp)
INSERT INTO enrollments (student_id, class_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5),
(2, 1), (2, 2), (2, 3), (2, 4),
(3, 1), (3, 3), (3, 5);

-- 8. Đợt đánh giá HK2
INSERT INTO campaigns (name, semester_id, start_date, end_date, is_active) VALUES
('Đợt ĐGGD HK2 2025-2026', 2, '2026-04-01 00:00:00', '2026-05-31 23:59:59', TRUE);

-- 9. Nhóm tiêu chí (5 nhóm)
INSERT INTO criteria_groups (campaign_id, group_name, display_order) VALUES
(1, 'Nội dung giảng dạy',     1),
(1, 'Phương pháp giảng dạy',  2),
(1, 'Thái độ giảng viên',     3),
(1, 'Kiểm tra đánh giá',      4),
(1, 'Đánh giá chung',         5);

-- 10. Tiêu chí đánh giá (15 câu)
INSERT INTO criteria (group_id, content, max_score, display_order) VALUES
-- Nhóm 1: Nội dung giảng dạy
(1, 'Giảng viên trình bày rõ ràng mục tiêu và đề cương môn học', 5, 1),
(1, 'Nội dung bài giảng đầy đủ, chính xác và cập nhật', 5, 2),
(1, 'Giảng viên liên hệ thực tế phù hợp với nội dung môn học', 5, 3),

-- Nhóm 2: Phương pháp giảng dạy
(2, 'Phương pháp giảng dạy sinh động, thu hút và dễ hiểu', 5, 1),
(2, 'Sử dụng công nghệ và phương tiện hỗ trợ giảng dạy hiệu quả', 5, 2),
(2, 'Khuyến khích sinh viên tham gia thảo luận và đặt câu hỏi', 5, 3),

-- Nhóm 3: Thái độ giảng viên
(3, 'Giảng viên nhiệt tình, tận tâm với sinh viên', 5, 1),
(3, 'Đảm bảo đúng giờ lên lớp và đủ thời lượng giảng dạy', 5, 2),
(3, 'Công bằng, khách quan trong đánh giá và xử lý tình huống', 5, 3),

-- Nhóm 4: Kiểm tra đánh giá
(4, 'Đề thi/kiểm tra phù hợp với nội dung đã giảng dạy', 5, 1),
(4, 'Công bố kết quả kiểm tra, thi đúng thời hạn quy định', 5, 2),
(4, 'Giải đáp thắc mắc về điểm một cách thỏa đáng', 5, 3),

-- Nhóm 5: Đánh giá chung
(5, 'Mức độ hài lòng tổng thể với giảng viên', 5, 1),
(5, 'Mức độ hài lòng tổng thể với môn học', 5, 2),
(5, 'Bạn sẵn sàng đăng ký học môn khác với giảng viên này', 5, 3);

-- 11. Tạo sẵn 1 submission mẫu (SV2 đã đánh giá lớp IT001.P11)
INSERT INTO submissions (student_id, class_id, campaign_id, comments) VALUES
(2, 1, 1, 'Thầy dạy rất hay, dễ hiểu');

INSERT INTO submission_details (submission_id, criteria_id, score) VALUES
(1, 1, 5), (1, 2, 4), (1, 3, 5),
(1, 4, 4), (1, 5, 5), (1, 6, 4),
(1, 7, 5), (1, 8, 5), (1, 9, 4),
(1, 10, 4), (1, 11, 5), (1, 12, 4),
(1, 13, 5), (1, 14, 4), (1, 15, 5);
