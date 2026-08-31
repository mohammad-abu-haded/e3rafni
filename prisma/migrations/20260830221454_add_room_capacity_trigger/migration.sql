CREATE TRIGGER `check_room_capacity`
BEFORE INSERT ON `RoomMembers`
FOR EACH ROW
BEGIN
    DECLARE current_members INT;
    DECLARE room_capacity INT;

    SELECT `capacity`
    INTO room_capacity
    FROM `Rooms`
    WHERE `id` = NEW.`roomId`;

    SELECT COUNT(*)
    INTO current_members
    FROM `RoomMembers`
    WHERE `roomId` = NEW.`roomId`;

    IF current_members >= room_capacity THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Room is full';
    END IF;
END;