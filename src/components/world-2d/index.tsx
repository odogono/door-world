import { createLog } from '@helpers/log';
import { useEffect, useRef, useState } from 'react';
import './index.css';

const log = createLog('World2D');

interface Room {
  x: number;
  y: number;
  width: number;
  height: number;
  type: RoomType;
  isCentral?: boolean;
}

interface Door {
  room1: Room;
  room2: Room;
  position: { x: number; y: number };
  width: number;
  height: number;
}

enum RoomType {
  NORMAL = 'normal',
  LARGE = 'large',
  SMALL = 'small'
}

const roomToString = (room: Room): string => {
  return `Room(x: ${room.x}, y: ${room.y}, width: ${room.width}, height: ${room.height})`;
};

type RoomSizeRange = [number, number];

const ROOM_SIZE_SMALL: RoomSizeRange = [45, 50];
const ROOM_SIZE_MEDIUM: RoomSizeRange = [50, 80];
const ROOM_SIZE_LARGE: RoomSizeRange = [80, 120];

const ROOM_MIN_SIZE = 10;
const ROOM_MAX_SIZE = 100;
const NUM_ROOMS_PER_CLICK = 3;
const CANVAS_SIZE = 800;
const DOOR_WIDTH = 8;
const DOOR_HEIGHT = 12;

// Pseudo-random number generator
class PRNG {
  private seed: number;
  private readonly a = 1664525;
  private readonly c = 1013904223;
  private readonly m = Math.pow(2, 32);

  constructor(seed: number = Date.now()) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.a * this.seed + this.c) % this.m;
    return this.seed / this.m;
  }

  // Generate a random integer between min (inclusive) and max (inclusive)
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  nextIntRange(range: [number, number]): number {
    return this.nextInt(range[0], range[1]);
  }

  // Generate a random float between min (inclusive) and max (exclusive)
  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  // Shuffle an array using Fisher-Yates algorithm
  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}

// Create a single PRNG instance for the entire application
const prng = new PRNG();

const getRoomSizeForType = (
  type: RoomType
): { width: number; height: number } => {
  switch (type) {
    case RoomType.LARGE:
      return {
        width: prng.nextIntRange(ROOM_SIZE_LARGE),
        height: prng.nextIntRange(ROOM_SIZE_LARGE)
      };
    case RoomType.SMALL:
      return {
        width: prng.nextIntRange(ROOM_SIZE_SMALL),
        height: prng.nextIntRange(ROOM_SIZE_SMALL)
      };
    case RoomType.NORMAL:
    default:
      return {
        width: prng.nextIntRange(ROOM_SIZE_MEDIUM),
        height: prng.nextIntRange(ROOM_SIZE_MEDIUM)
      };
  }
};

const generateRoomAround = (
  targetRoom: Room,
  existingRooms: Room[]
): Room | null => {
  // Randomly select a room type
  const types = Object.values(RoomType);
  const type = types[prng.nextInt(0, types.length - 1)];
  const { width, height } = getRoomSizeForType(type);

  log.debug('Generating room with dimensions', { width, height, type });

  // Try each side in random order
  const sides = prng.shuffle([0, 1, 2, 3]);

  for (const side of sides) {
    let x = 0;
    let y = 0;

    switch (side) {
      case 0: // Top
        x = targetRoom.x;
        y = targetRoom.y - height;
        break;
      case 1: // Right
        x = targetRoom.x + targetRoom.width;
        y = targetRoom.y;
        break;
      case 2: // Bottom
        x = targetRoom.x;
        y = targetRoom.y + targetRoom.height;
        break;
      case 3: // Left
        x = targetRoom.x - width;
        y = targetRoom.y;
        break;
    }

    // Ensure the room stays within canvas bounds
    x = Math.max(0, Math.min(CANVAS_SIZE - width, x));
    y = Math.max(0, Math.min(CANVAS_SIZE - height, y));

    const newRoom = { x, y, width, height, type };

    // Check if this position is valid
    let isValid = true;
    let invalidReason = '';

    // Check if room is touching the target room
    if (!roomsTouch(newRoom, targetRoom)) {
      isValid = false;
      invalidReason = 'Not touching target room';
    }

    log.debug('Candidate room', {
      room: roomToString(newRoom),
      side,
      isValid,
      invalidReason
    });

    // Check for overlaps with all existing rooms
    for (const room of existingRooms) {
      if (roomsOverlap(newRoom, room)) {
        isValid = false;
        invalidReason = `Overlaps with ${roomToString(room)}`;
        log.debug('Room overlap detected', {
          newRoom: roomToString(newRoom),
          existingRoom: roomToString(room)
        });
        break;
      }
    }

    if (isValid) {
      log.debug('Found valid room position', roomToString(newRoom));
      return newRoom;
    }
  }

  return null;
};

const roomsOverlap = (room1: Room, room2: Room): boolean => {
  // Check if rooms overlap (not just touch)
  return (
    room1.x < room2.x + room2.width &&
    room1.x + room1.width > room2.x &&
    room1.y < room2.y + room2.height &&
    room1.y + room1.height > room2.y
  );
};

const roomsTouch = (room1: Room, room2: Room): boolean => {
  // Check if rooms are exactly touching (not overlapping)
  const touchesHorizontally =
    (room1.x + room1.width === room2.x || room2.x + room2.width === room1.x) &&
    !(room1.y + room1.height < room2.y || room2.y + room2.height < room1.y);

  const touchesVertically =
    (room1.y + room1.height === room2.y ||
      room2.y + room2.height === room1.y) &&
    !(room1.x + room1.width < room2.x || room2.x + room2.width < room1.x);

  log.debug('Checking if rooms touch', {
    room1: roomToString(room1),
    room2: roomToString(room2),
    touchesHorizontally,
    touchesVertically
  });

  return touchesHorizontally || touchesVertically;
};

const getRoomCenter = (room: Room): { x: number; y: number } => {
  return {
    x: room.x + room.width / 2,
    y: room.y + room.height / 2
  };
};

const getDistanceBetweenRooms = (room1: Room, room2: Room): number => {
  const center1 = getRoomCenter(room1);
  const center2 = getRoomCenter(room2);
  return Math.sqrt(
    Math.pow(center2.x - center1.x, 2) + Math.pow(center2.y - center1.y, 2)
  );
};

const isPointInRoom = (
  point: { x: number; y: number },
  room: Room
): boolean => {
  return (
    point.x >= room.x &&
    point.x <= room.x + room.width &&
    point.y >= room.y &&
    point.y <= room.y + room.height
  );
};

const generateDungeon = (): Room[] => {
  const rooms: Room[] = [];

  // Create central room
  const centralRoom: Room = {
    x: CANVAS_SIZE / 2 - 50,
    y: CANVAS_SIZE / 2 - 50,
    width: 100,
    height: 100,
    type: RoomType.NORMAL,
    isCentral: true
  };
  rooms.push(centralRoom);

  // Generate multiple rooms around the central room
  let attempts = 0;
  const maxAttempts = 10;
  let roomsGenerated = 0;

  while (attempts < maxAttempts && roomsGenerated < NUM_ROOMS_PER_CLICK) {
    const newRoom = generateRoomAround(centralRoom, rooms);

    if (newRoom) {
      log.debug('Found valid room position', roomToString(newRoom));
      rooms.push(newRoom);
      roomsGenerated++;
    }

    attempts++;
    if (attempts >= maxAttempts) {
      log.debug(
        'Failed to find valid room position after',
        maxAttempts,
        'attempts'
      );
    }
  }

  return rooms;
};

const generateRoomsAround = (rooms: Room[], targetRoom: Room): Room[] => {
  const newRooms: Room[] = [...rooms];

  log.debug('Generating room around', roomToString(targetRoom));

  let attempts = 0;
  const maxAttempts = 10;
  let roomsGenerated = 0;

  while (attempts < maxAttempts && roomsGenerated < NUM_ROOMS_PER_CLICK) {
    const newRoom = generateRoomAround(targetRoom, newRooms);

    if (newRoom) {
      log.debug('Found valid room position', roomToString(newRoom));
      newRooms.push(newRoom);
      roomsGenerated++;
    }

    attempts++;
    if (attempts >= maxAttempts) {
      log.debug(
        'Failed to find valid room position after',
        maxAttempts,
        'attempts'
      );
    }
  }

  log.debug('New rooms array length', newRooms.length);
  return newRooms;
};

const findDoorPosition = (
  room1: Room,
  room2: Room
): { x: number; y: number } | null => {
  // Special case for central room - only allow doors on top edge
  if (room1.isCentral || room2.isCentral) {
    const centralRoom = room1.isCentral ? room1 : room2;
    const otherRoom = room1.isCentral ? room2 : room1;

    // Only allow doors if the other room is touching the top edge of the central room
    if (otherRoom.y + otherRoom.height === centralRoom.y) {
      // Find overlapping x range
      const xOverlap =
        Math.min(
          centralRoom.x + centralRoom.width,
          otherRoom.x + otherRoom.width
        ) - Math.max(centralRoom.x, otherRoom.x);

      if (xOverlap >= DOOR_WIDTH) {
        // Center the door in the overlapping area
        const x =
          Math.max(centralRoom.x, otherRoom.x) + (xOverlap - DOOR_WIDTH) / 2;
        const y = centralRoom.y - DOOR_HEIGHT / 2;
        return { x, y };
      }
    }
    return null;
  }

  // Normal door placement for non-central rooms
  // Check horizontal touching
  if (room1.x + room1.width === room2.x || room2.x + room2.width === room1.x) {
    // Find overlapping y range
    const yOverlap =
      Math.min(room1.y + room1.height, room2.y + room2.height) -
      Math.max(room1.y, room2.y);

    if (yOverlap >= DOOR_HEIGHT) {
      // Center the door in the overlapping area
      const y = Math.max(room1.y, room2.y) + (yOverlap - DOOR_HEIGHT) / 2;
      const x =
        room1.x + room1.width === room2.x
          ? room1.x + room1.width - DOOR_WIDTH / 2
          : room2.x + room2.width - DOOR_WIDTH / 2;

      return { x, y };
    }
  }

  // Check vertical touching
  if (
    room1.y + room1.height === room2.y ||
    room2.y + room2.height === room1.y
  ) {
    // Find overlapping x range
    const xOverlap =
      Math.min(room1.x + room1.width, room2.x + room2.width) -
      Math.max(room1.x, room2.x);

    if (xOverlap >= DOOR_WIDTH) {
      // Center the door in the overlapping area
      const x = Math.max(room1.x, room2.x) + (xOverlap - DOOR_WIDTH) / 2;
      const y =
        room1.y + room1.height === room2.y
          ? room1.y + room1.height - DOOR_HEIGHT / 2
          : room2.y + room2.height - DOOR_HEIGHT / 2;

      return { x, y };
    }
  }

  return null;
};

const findDoors = (rooms: Room[]): Door[] => {
  const doors: Door[] = [];

  for (let i = 0; i < rooms.length; i++) {
    for (let j = i + 1; j < rooms.length; j++) {
      if (roomsTouch(rooms[i], rooms[j])) {
        const position = findDoorPosition(rooms[i], rooms[j]);
        if (position) {
          doors.push({
            room1: rooms[i],
            room2: rooms[j],
            position,
            width: DOOR_WIDTH,
            height: DOOR_HEIGHT
          });
        }
      }
    }
  }

  return doors;
};

export const World2D = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [clickedRoom, setClickedRoom] = useState<Room | null>(null);

  useEffect(() => {
    const initialRooms = generateDungeon();
    log.debug('Initial rooms generated', initialRooms.length);
    setRooms(initialRooms);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;

    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw rooms
    for (const room of rooms) {
      // Draw room fill based on type
      switch (room.type) {
        case RoomType.LARGE:
          ctx.fillStyle = room === clickedRoom ? '#444' : '#222';
          break;
        case RoomType.SMALL:
          ctx.fillStyle = room === clickedRoom ? '#555' : '#333';
          break;
        case RoomType.NORMAL:
        default:
          ctx.fillStyle = room === clickedRoom ? '#666' : '#444';
      }
      ctx.fillRect(room.x, room.y, room.width, room.height);

      // Draw room border
      ctx.strokeStyle = room === clickedRoom ? '#fff' : '#666';
      ctx.lineWidth = room === clickedRoom ? 2 : 1;
      ctx.strokeRect(room.x, room.y, room.width, room.height);

      // Draw room type label
      ctx.fillStyle = '#fff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        room.isCentral ? 'Start' : room.type,
        room.x + room.width / 2,
        room.y + room.height / 2
      );
    }

    // Draw doors
    const doors = findDoors(rooms);
    for (const door of doors) {
      // Draw door frame
      ctx.fillStyle = '#000';
      ctx.fillRect(door.position.x, door.position.y, door.width, door.height);

      // Draw door
      ctx.fillStyle = '#brown';
      ctx.fillRect(
        door.position.x + 1,
        door.position.y + 1,
        door.width - 2,
        door.height - 2
      );
    }

    // Draw touching room indicators
    ctx.strokeStyle = '#00ff00aa';
    ctx.lineWidth = 2;
    for (let i = 0; i < rooms.length; i++) {
      for (let j = i + 1; j < rooms.length; j++) {
        if (roomsTouch(rooms[i], rooms[j])) {
          // Draw a line between touching rooms
          const center1 = getRoomCenter(rooms[i]);
          const center2 = getRoomCenter(rooms[j]);
          ctx.beginPath();
          ctx.moveTo(center1.x, center1.y);
          ctx.lineTo(center2.x, center2.y);
          ctx.stroke();
        }
      }
    }

    // Draw room centers (for debugging)
    ctx.fillStyle = '#f00';
    for (const room of rooms) {
      const center = getRoomCenter(room);
      ctx.beginPath();
      ctx.arc(center.x, center.y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [rooms, clickedRoom]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Find clicked room
    const clickedRoom = rooms.find(room => isPointInRoom({ x, y }, room));
    if (clickedRoom) {
      log.debug('Room clicked', roomToString(clickedRoom));
      setClickedRoom(clickedRoom);

      const newRooms = generateRoomsAround(rooms, clickedRoom);
      log.debug('Setting new rooms', newRooms.length);
      setRooms(newRooms);

      // Reset clicked room after a short delay
      setTimeout(() => {
        setClickedRoom(null);
      }, 200);
    }
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        style={{
          border: '1px solid #666',
          backgroundColor: '#000'
        }}
      />
    </div>
  );
};
