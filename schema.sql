-- MySQL Export for Board of Education Supervision System
-- Compatible with PHPMyAdmin and Windows Server / MySQL 8.0+

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `userId` varchar(50) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `fullname` varchar(255) NOT NULL,
  `role` enum('admin','director','teacher') NOT NULL,
  `lastLogin` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`userId`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`userId`, `username`, `password`, `fullname`, `role`) VALUES
('admin_001', 'admin', 'password123', 'Administrator', 'admin');

-- --------------------------------------------------------

--
-- Table structure for table `teachers`
--

CREATE TABLE `teachers` (
  `id` varchar(50) NOT NULL,
  `teacherId` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `subjectGroup` varchar(255) NOT NULL,
  `position` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `userId` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `teacherId` (`teacherId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `evaluation_items`
--

CREATE TABLE `evaluation_items` (
  `itemId` varchar(50) NOT NULL,
  `category` varchar(255) NOT NULL,
  `itemName` text NOT NULL,
  `maxScore` int(11) DEFAULT 5,
  PRIMARY KEY (`itemId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `observations`
--

CREATE TABLE `observations` (
  `id` varchar(50) NOT NULL,
  `teacherId` varchar(50) NOT NULL,
  `teacherName` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `subject` varchar(255) NOT NULL,
  `gradeLevel` varchar(50) NOT NULL,
  `classRoom` varchar(50) NOT NULL,
  `observerId` varchar(50) NOT NULL,
  `observerName` varchar(255) NOT NULL,
  `totalScore` decimal(10,2) NOT NULL,
  `averageScore` decimal(10,2) NOT NULL,
  `evaluationLevel` varchar(100) NOT NULL,
  `academicYear` varchar(10) NOT NULL,
  `semester` varchar(10) NOT NULL,
  `strengths` text,
  `suggestions` text,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `scores`
--

CREATE TABLE `scores` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `observationId` varchar(50) NOT NULL,
  `itemId` varchar(50) NOT NULL,
  `score` int(11) NOT NULL,
  `remark` text,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_observation` FOREIGN KEY (`observationId`) REFERENCES `observations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

COMMIT;
