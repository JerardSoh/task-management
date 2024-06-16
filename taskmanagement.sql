CREATE DATABASE IF NOT EXISTS `taskmanagement` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;

USE `taskmanagement`;

DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `groups`;
DROP TABLE IF EXISTS `usergroup`;

CREATE TABLE `users` (
    `username` VARCHAR(255) PRIMARY KEY,
    `password` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) DEFAULT NULL,
    `status` BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE `groups` (
    `groupname` VARCHAR(255) PRIMARY KEY
);

INSERT INTO `groups` (`groupname`) VALUES ('admin');

CREATE TABLE `usergroup` (
    `username` VARCHAR(255),
    `groupname` VARCHAR(255),
    PRIMARY KEY (`username`, `groupname`),
    FOREIGN KEY (`username`) REFERENCES `users`(`username`),
    FOREIGN KEY (`groupname`) REFERENCES `groups`(`groupname`)
);