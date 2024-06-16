CREATE DATABASE IF NOT EXISTS `taskmanagement` DEFAULT CHARACTER SET utf8 COLLATE
utf8_general_ci;

USE `taskmanagement`;

CREATE TABLE accounts (
    username VARCHAR(255) PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    status BOOLEAN NOT NULL
);

select * from accounts;