-- =====================================================
-- HỆ THỐNG ĐÁNH GIÁ GIẢNG DẠY - Database Schema
-- =====================================================

CREATE DATABASE IF NOT EXISTS evaluation_system
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE evaluation_system;

-- 1. Quản trị viên (Admin)
CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Sinh viên
CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_code VARCHAR(20) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    password_hash VARCHAR(255) NOT NULL,
    faculty VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Giảng viên
CREATE TABLE instructors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    instructor_code VARCHAR(20) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    password_hash VARCHAR(255) NOT NULL,
    faculty VARCHAR(100),
    academic_rank VARCHAR(50) COMMENT 'Học hàm/học vị: ThS, TS, PGS, GS'
) ENGINE=InnoDB;

-- 4. Môn học
CREATE TABLE subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_code VARCHAR(20) NOT NULL UNIQUE,
    subject_name VARCHAR(150) NOT NULL,
    credits INT NOT NULL DEFAULT 3,
    faculty VARCHAR(100)
) ENGINE=InnoDB;

-- 5. Học kỳ
CREATE TABLE semesters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL
) ENGINE=InnoDB;

-- 6. Lớp học phần
CREATE TABLE classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_code VARCHAR(30) NOT NULL UNIQUE,
    subject_id INT NOT NULL,
    instructor_id INT NOT NULL,
    semester_id INT NOT NULL,
    schedule VARCHAR(100) COMMENT 'Lịch học, VD: T2, tiết 1-3',
    room VARCHAR(30),
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (instructor_id) REFERENCES instructors(id) ON DELETE CASCADE,
    FOREIGN KEY (semester_id) REFERENCES semesters(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Đăng ký học phần
CREATE TABLE enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    class_id INT NOT NULL,
    UNIQUE KEY uq_enrollment (student_id, class_id),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. Đợt đánh giá
CREATE TABLE campaigns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    semester_id INT NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (semester_id) REFERENCES semesters(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 9. Nhóm tiêu chí
CREATE TABLE criteria_groups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campaign_id INT NOT NULL,
    group_name VARCHAR(150) NOT NULL,
    display_order INT DEFAULT 0,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 10. Tiêu chí đánh giá
CREATE TABLE criteria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    content TEXT NOT NULL,
    max_score INT DEFAULT 5,
    display_order INT DEFAULT 0,
    FOREIGN KEY (group_id) REFERENCES criteria_groups(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 11. Phiếu đánh giá (submission)
CREATE TABLE submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    class_id INT NOT NULL,
    campaign_id INT NOT NULL,
    comments TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_submission (student_id, class_id, campaign_id),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 12. Chi tiết chấm điểm
CREATE TABLE submission_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    submission_id INT NOT NULL,
    criteria_id INT NOT NULL,
    score INT NOT NULL CHECK (score >= 1 AND score <= 5),
    UNIQUE KEY uq_detail (submission_id, criteria_id),
    FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
    FOREIGN KEY (criteria_id) REFERENCES criteria(id) ON DELETE CASCADE
) ENGINE=InnoDB;
