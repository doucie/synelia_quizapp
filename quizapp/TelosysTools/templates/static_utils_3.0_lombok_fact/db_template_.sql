/*
 Navicat Premium Data Transfer

 Source Server         : local
 Source Server Type    : MySQL
 Source Server Version : 80020 (8.0.20)
 Source Host           : localhost:3306
 Source Schema         : db_template

 Target Server Type    : MySQL
 Target Server Version : 80020 (8.0.20)
 File Encoding         : 65001

 Date: 02/04/2025 19:03:09
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for fonctionalite
-- ----------------------------
DROP TABLE IF EXISTS `fonctionalite`;
CREATE TABLE `fonctionalite` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `libelle` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `parent_id` int DEFAULT NULL,
  `is_available_for_user` bit(1) DEFAULT NULL,
  `search_string` varchar(1000) COLLATE utf8_unicode_ci DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `is_deleted` bit(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKgn0l4hvwksflttrmg0prv40sg` (`parent_id`),
  CONSTRAINT `FKgn0l4hvwksflttrmg0prv40sg` FOREIGN KEY (`parent_id`) REFERENCES `fonctionalite` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ----------------------------
-- Table structure for role
-- ----------------------------
DROP TABLE IF EXISTS `role`;
CREATE TABLE `role` (
  `id` int NOT NULL AUTO_INCREMENT,
  `libelle` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `search_string` varchar(1000) COLLATE utf8_unicode_ci DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `is_deleted` bit(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=258 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ----------------------------
-- Table structure for role_fonctionalite
-- ----------------------------
DROP TABLE IF EXISTS `role_fonctionalite`;
CREATE TABLE `role_fonctionalite` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_id` int DEFAULT NULL,
  `fonctionnalite_id` int DEFAULT NULL,
  `search_string` varchar(1000) COLLATE utf8_unicode_ci DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `is_deleted` bit(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK45bj6fmw80tok3ek42hxyro76` (`fonctionnalite_id`),
  KEY `FKnxownt1svte3wp299o0qc3uua` (`role_id`),
  CONSTRAINT `FK45bj6fmw80tok3ek42hxyro76` FOREIGN KEY (`fonctionnalite_id`) REFERENCES `fonctionalite` (`id`),
  CONSTRAINT `FKnxownt1svte3wp299o0qc3uua` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `last_name` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `login` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `telephone` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `role_id` int DEFAULT NULL,
  `fonction` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `is_default_password` bit(1) DEFAULT NULL,
  `is_ldap_user` bit(1) DEFAULT NULL,
  `is_valid_pass_code` bit(1) DEFAULT NULL,
  `last_connection_date` datetime(6) DEFAULT NULL,
  `is_locked` bit(1) DEFAULT NULL,
  `last_lock_date` datetime(6) DEFAULT NULL,
  `otp_code` varchar(50) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `pass_code` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `pass_code_created_at` datetime(6) DEFAULT NULL,
  `pass_code_expire_at` datetime(6) DEFAULT NULL,
  `password` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `token` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `file_path` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `user_key` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `search_string` varchar(10000) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `is_deleted` bit(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKn82ha3ccdebhokx3a8fgdqeyy` (`role_id`),
  CONSTRAINT `FKn82ha3ccdebhokx3a8fgdqeyy` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
