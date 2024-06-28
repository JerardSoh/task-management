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
INSERT INTO `groups` (`groupname`) VALUES ('projectlead');
INSERT INTO `groups` (`groupname`) VALUES ('projectmanager');

CREATE TABLE `usergroup` (
    `username` VARCHAR(255),
    `groupname` VARCHAR(255),
    PRIMARY KEY (`username`, `groupname`),
    FOREIGN KEY (`username`) REFERENCES `users`(`username`),
    FOREIGN KEY (`groupname`) REFERENCES `groups`(`groupname`)
);

CREATE TABLE App (
    `App_Acronym` VARCHAR(255) PRIMARY KEY,
    `App_Description` TEXT,
    `App_Rnumber` INT NOT NULL CHECK (App_Rnumber > 0),
    `App_startDate` DATE NOT NULL,
    `App_endDate` DATE NOT NULL,
    `App_permit_Create` VARCHAR(255),
    `App_permit_Open` VARCHAR(255),
    `App_permit_toDoList` VARCHAR(255),
    `App_permit_Doing` VARCHAR(255),
    `App_permit_Done` VARCHAR(255),
    CONSTRAINT fk_permit_Create FOREIGN KEY (App_permit_Create) REFERENCES `groups`(`groupname`),
    CONSTRAINT fk_permit_Open FOREIGN KEY (App_permit_Open) REFERENCES `groups`(`groupname`),
    CONSTRAINT fk_permit_toDoList FOREIGN KEY (App_permit_toDoList) REFERENCES `groups`(`groupname`),
    CONSTRAINT fk_permit_Doing FOREIGN KEY (App_permit_Doing) REFERENCES `groups`(`groupname`),
    CONSTRAINT fk_permit_Done FOREIGN KEY (App_permit_Done) REFERENCES `groups`(`groupname`)
);

CREATE TABLE Plan (
    Plan_MVP_Name VARCHAR(255) NOT NULL,
    Plan_startDate DATE NOT NULL,
    Plan_endDate DATE NOT NULL,
    Plan_app_Acronym VARCHAR(255) NOT NULL,
    PRIMARY KEY (Plan_MVP_Name, Plan_app_Acronym),
    FOREIGN KEY (Plan_app_Acronym) REFERENCES App(App_Acronym)
);

CREATE TABLE Task (
    `Task_Name` VARCHAR(255) NOT NULL,
    `Task_description` TEXT,
    `Task_notes` LONGTEXT,
    `Task_id` VARCHAR(255) PRIMARY KEY,
    `Task_plan` VARCHAR(255),
    `Task_app_Acronym` VARCHAR(255) NOT NULL,
    `Task_state` ENUM('open', 'todo', 'doing', 'done', 'closed') NOT NULL,
    `Task_creator` VARCHAR(255) NOT NULL,
    `Task_owner` VARCHAR(255) NOT NULL,
    `Task_createDate` DATE NOT NULL,
    FOREIGN KEY (Task_app_Acronym) REFERENCES App(App_Acronym),
    FOREIGN KEY (Task_creator) REFERENCES users(username),
    FOREIGN KEY (Task_owner) REFERENCES users(username),
    FOREIGN KEY (Task_plan) REFERENCES Plan(Plan_MVP_Name)
);




select * from users;
select * from usergroup;
select * from `groups`;

delete from usergroup where username = 'newUser';
delete from users where username = 'newUser';
delete from usergroup where username = 'asdss';
delete from users where username = 'asdf';

delete from `groups` where groupname = 'xzcv';

SELECT groupname from usergroup 
where username = 'newUser123';
SELECT * from usergroup ;
